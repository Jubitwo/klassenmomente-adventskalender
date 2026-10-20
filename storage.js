const CALENDAR_KEY = 'klassenmomente.calendar.v1';
const PROGRESS_KEY = 'klassenmomente.progress.v1';
const THEMES = ['pine', 'berry', 'gold', 'frost'];
const RELEASES = ['date', 'open', 'locked'];
const LIMITS = { title: 160, text: 12000, image: 1500000, imageAlt: 300, link: 2048, video: 2048, task: 6000, answer: 6000, buttonText: 80 };

export function safeURL(value, { image = false } = {}) {
  if (!value) return '';
  if (image && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(value)) return value;
  const url = new URL(value, location.href);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Nur HTTP- oder HTTPS-Links sind erlaubt.');
  if (url.username || url.password) throw new Error('Links mit eingebetteten Zugangsdaten sind nicht erlaubt.');
  return url.href;
}

export function validateCalendar(input) {
  if (!input || input.version !== 1 || !Number.isInteger(input.year) || input.year < 2020 || input.year > 2100 || !Array.isArray(input.doors) || input.doors.length !== 24) {
    throw new Error('Ungültige Kalenderdatei: Version 1, Jahr 2020–2100 und genau 24 Türchen erforderlich.');
  }
  const days = new Set();
  const doors = input.doors.map(source => {
    if (!source || !Number.isInteger(source.day) || source.day < 1 || source.day > 24 || days.has(source.day)) throw new Error('Jede Türchennummer von 1 bis 24 muss genau einmal vorkommen.');
    days.add(source.day);
    const door = { day: source.day };
    for (const [field, limit] of Object.entries(LIMITS)) {
      const value = source[field] ?? '';
      if (typeof value !== 'string' || value.length > limit) throw new Error(`Türchen ${source.day}: Feld ${field} ist ungültig oder zu lang.`);
      door[field] = value.trim();
    }
    if (!door.title) throw new Error(`Türchen ${source.day}: Ein Titel ist erforderlich.`);
    door.theme = source.theme ?? 'pine';
    door.release = source.release ?? 'date';
    if (!THEMES.includes(door.theme) || !RELEASES.includes(door.release)) throw new Error(`Türchen ${source.day}: Unbekannte Farbe oder Verfügbarkeit.`);
    for (const field of ['image', 'link', 'video']) if (door[field]) safeURL(door[field], { image: field === 'image' });
    return door;
  }).sort((a, b) => a.day - b.day);
  const order = input.order ?? doors.map(door => door.day);
  if (!Array.isArray(order) || order.length !== 24 || new Set(order).size !== 24 || order.some(day => !Number.isInteger(day) || day < 1 || day > 24)) {
    throw new Error('Die Türchenanordnung muss jede Nummer von 1 bis 24 genau einmal enthalten.');
  }
  return { version: 1, year: input.year, doors, order: [...order] };
}

// Austauschpunkt für Firebase, Supabase oder eine eigene API:
// Diese asynchronen Methoden durch Serveraufrufe ersetzen. Authentifizierung,
// Schreibrechte und ggf. Datumsfreigabe serverseitig prüfen. Keine Secrets im JS.
export class CalendarStorage {
  async loadDefaults() {
    const response = await fetch(new URL('./calendar-data.json', import.meta.url), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Standardkalender konnte nicht geladen werden (HTTP ${response.status}).`);
    return validateCalendar(await response.json());
  }
  async loadCalendar() {
    const raw = localStorage.getItem(CALENDAR_KEY);
    return raw === null ? this.loadDefaults() : validateCalendar(JSON.parse(raw));
  }
  async saveCalendar(data) {
    const calendar = validateCalendar(data);
    try {
      localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendar));
    } catch (error) {
      throw new Error('Speichern fehlgeschlagen: Browserspeicher nicht verfügbar oder voll. Bilder verkleinern, Bild-URLs nutzen oder Daten exportieren.', { cause: error });
    }
    window.dispatchEvent(new CustomEvent('calendar-updated'));
    return calendar;
  }
  async getDoor(day) {
    const calendar = await this.loadCalendar();
    const door = calendar.doors.find(item => item.day === day);
    if (!door) throw new Error('Türchen nicht gefunden.');
    return door;
  }
  async saveDoor(day, data) {
    const calendar = await this.loadCalendar();
    const index = calendar.doors.findIndex(door => door.day === day);
    if (index < 0) throw new Error('Türchen nicht gefunden.');
    calendar.doors[index] = { ...data, day };
    return this.saveCalendar(calendar);
  }
  async shuffleDoorOrder() {
    const calendar = await this.loadCalendar();
    for (let i = calendar.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [calendar.order[i], calendar.order[j]] = [calendar.order[j], calendar.order[i]];
    }
    return this.saveCalendar(calendar);
  }
  async resetCalendar() {
    const defaults = await this.loadDefaults();
    localStorage.removeItem(CALENDAR_KEY);
    window.dispatchEvent(new CustomEvent('calendar-updated'));
    return defaults;
  }
  async exportCalendar() {
    return JSON.stringify(await this.loadCalendar(), null, 2);
  }
  async importCalendar(text) {
    let data;
    try { data = JSON.parse(text); }
    catch (error) { throw new Error('Die Datei enthält kein gültiges JSON.', { cause: error }); }
    return this.saveCalendar(validateCalendar(data));
  }
}

export function isAvailable(door, year, now = new Date()) {
  if (door.release === 'locked') return false;
  return door.release === 'open' || now >= new Date(year, 11, door.day);
}

export function loadProgress(year) {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (raw === null) return new Set();
  const data = JSON.parse(raw);
  if (!data || typeof data !== 'object' || !Array.isArray(data.days) || !Number.isInteger(data.year) || data.days.some(day => !Number.isInteger(day) || day < 1 || day > 24)) {
    throw new Error('Der gespeicherte Lesefortschritt ist beschädigt.');
  }
  return new Set(data.year === year ? data.days : []);
}

export function saveProgress(year, days) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ year, days: [...days] }));
}

export function downloadFile(text, name, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function reportError(element, error) {
  console.error(error);
  element.textContent = error.message || 'Ein unerwarteter Fehler ist aufgetreten.';
  element.classList.add('error');
}
