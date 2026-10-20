import { CalendarStorage, isAvailable, loadProgress, saveProgress, reportError } from './storage.js';
import { motif, setupDialog, showDoor, setupAtmosphere } from './ui.js';

const storage = new CalendarStorage();
const grid = document.querySelector('#calendar-grid');
const status = document.querySelector('#app-status');
const dialog = setupDialog();
let calendar;
let opened = new Set();
let lastOpenedDay = null;
setupAtmosphere(status);
dialog.addEventListener('close', () => {
  // Aktualisierungen ersetzen Buttons; Fokus auf das aktuelle Element zurückgeben.
  if (lastOpenedDay) grid.querySelector(`[data-day="${lastOpenedDay}"]`)?.focus();
});

function render() {
  const now = new Date();
  document.querySelector('#current-date').textContent = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  document.querySelector('#season-label').textContent = `ADVENT ${calendar.year}`;
  const before = now < new Date(calendar.year, 11, 1);
  document.querySelector('#availability-note').textContent = before ? `Vorfreude zählt: Wir starten am 1. Dezember ${calendar.year}.` : 'Eine kleine Überraschung nach der anderen.';
  document.querySelector('#progress-label').textContent = `${opened.size} von 24 Türchen geöffnet`;
  document.querySelector('#progress').value = opened.size;
  const activeDay = document.activeElement?.dataset.day;
  grid.replaceChildren();
  for (const door of calendar.doors) {
    const available = isAvailable(door, calendar.year, now);
    const today = now.getFullYear() === calendar.year && now.getMonth() === 11 && now.getDate() === door.day;
    const visited = opened.has(door.day);
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.day = door.day;
    button.className = `door ${door.theme}${available ? ' available' : ' locked'}${today ? ' today' : ''}${visited ? ' visited' : ''}`;
    button.setAttribute('aria-disabled', String(!available));
    button.setAttribute('aria-label', `Türchen ${door.day}${today ? ', heute' : ''}, ${available ? visited ? 'bereits angesehen' : 'verfügbar' : 'verschlossen'}`);
    const state = today ? 'HEUTE' : visited && available ? 'ANGESEHEN' : available ? 'ENTDECKEN' : door.release === 'locked' ? 'GESPERRT' : `AB ${door.day}. DEZ.`;
    button.innerHTML = `<span class="door-top"><span class="door-day">${String(door.day).padStart(2, '0')}</span><span class="door-indicator" aria-hidden="true">${visited && available ? '✓' : available ? '✧' : '⌑'}</span></span><span class="door-motif">${motif(door.day)}</span><span class="door-bottom">${state}<span aria-hidden="true">${available ? '↗' : '—'}</span></span>`;
    button.addEventListener('click', () => {
      if (!isAvailable(door, calendar.year)) {
        status.textContent = door.release === 'locked' ? `Türchen ${door.day} ist von der Lehrkraft noch nicht freigegeben.` : `Ein bisschen Vorfreude: Türchen ${door.day} öffnet am ${door.day}. Dezember ${calendar.year}.`;
        status.classList.remove('error');
        return;
      }
      const first = !opened.has(door.day);
      lastOpenedDay = door.day;
      showDoor(dialog, door, { celebration: first });
      if (first) {
        const next = new Set(opened).add(door.day);
        try {
          saveProgress(calendar.year, next);
          opened = next;
          render();
        } catch (error) { reportError(status, error); }
      }
    });
    grid.append(button);
  }
  grid.setAttribute('aria-busy', 'false');
  if (!dialog.open && activeDay) grid.querySelector(`[data-day="${activeDay}"]`)?.focus();
}

async function refresh() {
  try {
    calendar = await storage.loadCalendar();
    opened = loadProgress(calendar.year);
    render();
  } catch (error) {
    grid.setAttribute('aria-busy', 'false');
    reportError(status, error);
  }
}
window.addEventListener('storage', refresh);
window.addEventListener('calendar-updated', refresh);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
setInterval(() => { if (calendar && !dialog.open) render(); }, 60000);
refresh();
