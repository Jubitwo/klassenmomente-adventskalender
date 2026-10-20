import { CalendarStorage, validateCalendar, isAvailable, downloadFile, reportError } from './storage.js';
import { Auth } from './auth.js';
import { setupDialog, showDoor } from './ui.js';

const storage = new CalendarStorage();
const status = document.querySelector('#admin-status');
const form = document.querySelector('#door-form');
const dialog = setupDialog();
let calendar;
let selectedDay = 1;
let uploadedImage = '';
let dirty = false;
let testMode = false;

function message(text) {
  status.textContent = text;
  status.classList.remove('error');
}
function setDirty(value) {
  dirty = value;
  document.querySelector('#save-state').textContent = value ? 'Ungespeicherte Änderungen' : 'Gespeichert';
}
function requireSession() {
  if (!Auth.isLoggedIn()) {
    showLogin();
    throw new Error('Die Sitzung ist abgelaufen. Bitte erneut anmelden.');
  }
}
function on(id, event, action, { protectedAction = true } = {}) {
  document.querySelector(id).addEventListener(event, async e => {
    e.preventDefault();
    try {
      if (protectedAction) requireSession();
      await action(e);
    } catch (error) { reportError(status, error); }
  });
}
function confirmDiscard() {
  return !dirty || confirm('Ungespeicherte Änderungen verwerfen?');
}
function showLogin() {
  document.querySelector('#admin-panel').hidden = true;
  document.querySelector('#login-panel').hidden = false;
  document.querySelector('#password').value = '';
  document.querySelector('#password').focus();
}
function renderPicker() {
  const grid = document.querySelector('#admin-grid');
  grid.replaceChildren();
  for (const door of calendar.doors) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(door.day).padStart(2, '0');
    button.className = `picker-button${door.day === selectedDay ? ' selected' : ''}${door.text || door.task || door.image || door.video || door.link ? ' filled' : ''}`;
    button.setAttribute('aria-label', `Türchen ${door.day} bearbeiten`);
    button.setAttribute('aria-pressed', String(door.day === selectedDay));
    button.addEventListener('click', () => {
      try {
        requireSession();
        if (door.day === selectedDay || !confirmDiscard()) return;
        selectDoor(door.day);
        document.querySelector('#door-title-input').focus();
      } catch (error) { reportError(status, error); }
    });
    grid.append(button);
  }
}
function updateImagePreview() {
  const value = uploadedImage || form.elements.image.value.trim();
  const preview = document.querySelector('#image-preview');
  preview.hidden = !value;
  const image = preview.querySelector('img');
  if (value) image.src = value;
  else image.removeAttribute('src');
}
document.querySelector('#image-preview img').addEventListener('error', () => message('Das Vorschaubild konnte nicht geladen werden. Prüfe die Bild-URL.'));
function selectDoor(day) {
  selectedDay = day;
  const door = calendar.doors.find(item => item.day === day);
  document.querySelector('#editor-heading').textContent = `Türchen ${day}`;
  for (const field of ['title', 'text', 'imageAlt', 'link', 'buttonText', 'video', 'task', 'answer', 'release', 'theme']) form.elements[field].value = door[field];
  uploadedImage = door.image.startsWith('data:') ? door.image : '';
  form.elements.image.value = uploadedImage ? '' : door.image;
  document.querySelector('#image-file').value = '';
  updateImagePreview();
  setDirty(false);
  renderPicker();
}
function readDoor() {
  const data = Object.fromEntries(new FormData(form));
  data.day = selectedDay;
  data.image = uploadedImage || data.image;
  return validateCalendar({ ...calendar, doors: calendar.doors.map(door => door.day === selectedDay ? data : door) }).doors[selectedDay - 1];
}
async function showAdmin() {
  calendar = await storage.loadCalendar();
  document.querySelector('#calendar-year').value = calendar.year;
  document.querySelector('#login-panel').hidden = true;
  document.querySelector('#admin-panel').hidden = false;
  selectDoor(selectedDay);
}
on('#login-form', 'submit', async () => {
  const button = document.querySelector('#login-form button');
  button.disabled = true;
  try {
    await Auth.login(document.querySelector('#password').value);
    document.querySelector('#password').value = '';
    await showAdmin();
    message('Willkommen im Lehrerbereich.');
  } finally { button.disabled = false; }
}, { protectedAction: false });
on('#logout', 'click', () => {
  if (!confirmDiscard()) return;
  setDirty(false);
  Auth.logout();
  showLogin();
  message('Du bist abgemeldet.');
});
form.addEventListener('input', () => setDirty(true));
on('#door-form', 'submit', async () => {
  const door = readDoor();
  calendar = await storage.saveDoor(selectedDay, door);
  setDirty(false);
  renderPicker();
  message(`Türchen ${selectedDay} wurde gespeichert. Der Kalender in diesem Browser ist aktualisiert.`);
});
on('#door-image', 'change', () => {
  uploadedImage = '';
  // Erst nach Schema-/URL-Prüfung laden, auch im Editor keine beliebigen Protokolle.
  readDoor();
  updateImagePreview();
});
on('#image-file', 'change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 1024 * 1024) {
    e.target.value = '';
    throw new Error('Bitte ein PNG-, JPEG-, WebP- oder GIF-Bild mit maximal 1 MB auswählen.');
  }
  const value = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Die Bilddatei konnte nicht gelesen werden.'));
    reader.readAsDataURL(file);
  });
  uploadedImage = value;
  form.elements.image.value = '';
  updateImagePreview();
  setDirty(true);
});
on('#remove-image', 'click', () => {
  uploadedImage = '';
  form.elements.image.value = '';
  document.querySelector('#image-file').value = '';
  updateImagePreview();
  setDirty(true);
});
on('#preview-mode', 'change', e => { testMode = e.target.checked; });
on('#preview-door', 'click', () => {
  if (!form.reportValidity()) return;
  const door = readDoor();
  if (!testMode && !isAvailable(door, calendar.year)) throw new Error('Dieses Türchen ist noch verschlossen. Aktiviere den Vorschau-/Testmodus, um es hier zu testen.');
  showDoor(dialog, door, { preview: true });
});
on('#save-settings', 'click', async () => {
  const input = document.querySelector('#calendar-year');
  if (!input.reportValidity()) return;
  const current = await storage.loadCalendar();
  calendar = await storage.saveCalendar({ ...current, year: Number(input.value) });
  message(`Kalenderjahr ${calendar.year} gespeichert.`);
});
on('#reset-door', 'click', async () => {
  if (!confirm(`Türchen ${selectedDay} auf den veröffentlichten Standardinhalt zurücksetzen? Ungespeicherte Änderungen gehen verloren.`)) return;
  const defaults = await storage.loadDefaults();
  calendar = await storage.saveDoor(selectedDay, defaults.doors[selectedDay - 1]);
  selectDoor(selectedDay);
  message(`Türchen ${selectedDay} wurde zurückgesetzt.`);
});
on('#export', 'click', async () => {
  if (dirty && !confirm('Nur gespeicherte Inhalte exportieren? Die aktuellen ungespeicherten Änderungen sind nicht enthalten.')) return;
  downloadFile(await storage.exportCalendar(), 'calendar-data.json');
  message('Export erstellt. Ersetze calendar-data.json im Repository, um diese Inhalte für alle Geräte zu veröffentlichen.');
});
on('#import', 'change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 8 * 1024 * 1024) throw new Error('Die Importdatei darf höchstens 8 MB groß sein.');
    if (!confirm('Alle lokalen Kalenderinhalte durch diese Datei ersetzen? Auch ungespeicherte Änderungen gehen verloren.')) return;
    calendar = await storage.importCalendar(await file.text());
    document.querySelector('#calendar-year').value = calendar.year;
    selectDoor(selectedDay);
    message('Kalender importiert und lokal gespeichert.');
  } finally { e.target.value = ''; }
});
on('#reset-all', 'click', async () => {
  if (!confirm('Alle lokalen Inhalte und ungespeicherten Änderungen verwerfen und den veröffentlichten Standardkalender laden? Vorher bei Bedarf exportieren.')) return;
  calendar = await storage.resetCalendar();
  document.querySelector('#calendar-year').value = calendar.year;
  selectDoor(1);
  message('Der veröffentlichte Standardkalender wurde wiederhergestellt.');
});
on('#password-form', 'submit', async e => {
  const data = new FormData(e.target);
  if (data.get('newPassword') !== data.get('confirmPassword')) throw new Error('Die neuen Passwörter stimmen nicht überein.');
  if (!confirmDiscard()) return;
  const config = await Auth.changePassword(data.get('currentPassword'), data.get('newPassword'));
  downloadFile(config, 'auth-config.js', 'text/javascript');
  e.target.reset();
  setDirty(false);
  showLogin();
  message('Passwort lokal geändert. Für die Veröffentlichung auth-config.js im Repository ersetzen. Bitte mit dem neuen Passwort anmelden.');
});
window.addEventListener('beforeunload', event => {
  if (dirty) { event.preventDefault(); event.returnValue = ''; }
});
window.addEventListener('storage', async event => {
  if (!event.key?.startsWith('klassenmomente.')) return;
  try {
    if (!Auth.isLoggedIn()) { showLogin(); return; }
    if (dirty) message('Die Daten wurden in einem anderen Tab geändert. Sichere deine Änderungen bewusst oder lade diese Seite neu.');
    else await showAdmin();
  } catch (error) { reportError(status, error); }
});
try { if (Auth.isLoggedIn()) await showAdmin(); }
catch (error) { reportError(status, error); }
