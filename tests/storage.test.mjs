import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';

const root = new URL('../', import.meta.url);
const defaults = JSON.parse(await readFile(new URL('calendar-data.json', root), 'utf8'));
const local = new Map();
const session = new Map();
const memoryStorage = map => ({
  getItem: key => map.get(key) ?? null,
  setItem: (key, value) => map.set(key, value),
  removeItem: key => map.delete(key)
});
globalThis.localStorage = memoryStorage(local);
globalThis.sessionStorage = memoryStorage(session);
globalThis.location = { href: 'https://example.org/kalender/index.html' };
globalThis.window = new EventTarget();
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
let fetchFails = false;
globalThis.fetch = async () => ({ ok: !fetchFails, status: fetchFails ? 404 : 200, json: async () => structuredClone(defaults) });
const moduleURL = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const storageSource = (await readFile(new URL('storage.js', root), 'utf8')).replace("new URL('./calendar-data.json', import.meta.url)", "'https://example.org/kalender/calendar-data.json'");
const { CalendarStorage, validateCalendar, isAvailable, safeURL, loadProgress, saveProgress } = await import(moduleURL(storageSource));
const storage = new CalendarStorage();
let checks = 0;
function check(fn) { fn(); checks++; }
async function asyncCheck(fn) { await fn(); checks++; }
check(() => assert.equal(validateCalendar(defaults).doors.length, 24));
check(() => assert.deepEqual(validateCalendar(defaults).doors.map(d => d.day), Array.from({ length: 24 }, (_, i) => i + 1)));
check(() => assert.throws(() => validateCalendar({ ...defaults, year: '2026' })));
check(() => assert.throws(() => validateCalendar({ ...defaults, doors: defaults.doors.slice(1) })));
check(() => assert.throws(() => validateCalendar({ ...defaults, doors: defaults.doors.map(() => defaults.doors[0]) })));
check(() => assert.throws(() => validateCalendar({ ...defaults, doors: defaults.doors.map(d => ({ ...d, title: '' })) })));
check(() => assert.throws(() => validateCalendar({ ...defaults, doors: defaults.doors.map(d => ({ ...d, release: 'admin' })) })));
for (const url of ['javascript:alert(1)', 'data:text/html;base64,PHNjcmlwdD4=', 'data:image/svg+xml;base64,PHN2Zz4=', 'ftp://example.org', 'https://user:pass@example.org']) {
  check(() => assert.throws(() => safeURL(url, { image: true })));
}
check(() => assert.equal(safeURL('./assets/winter.svg', { image: true }), 'https://example.org/kalender/assets/winter.svg'));
check(() => assert.equal(safeURL('data:image/png;base64,aGVsbG8=', { image: true }), 'data:image/png;base64,aGVsbG8='));
const door = validateCalendar(defaults).doors[5];
check(() => assert.equal(isAvailable(door, 2026, new Date(2026, 11, 5, 23, 59)), false));
check(() => assert.equal(isAvailable(door, 2026, new Date(2026, 11, 6)), true));
check(() => assert.equal(isAvailable(door, 2026, new Date(2027, 0, 1)), true));
check(() => assert.equal(isAvailable(door, 2026, new Date(2026, 9, 7)), false));
check(() => assert.equal(isAvailable({ ...door, release: 'open' }, 2026, new Date(2026, 9, 7)), true));
check(() => assert.equal(isAvailable({ ...door, release: 'locked' }, 2026, new Date(2027, 0, 1)), false));
let events = 0;
window.addEventListener('calendar-updated', () => events++);
await asyncCheck(async () => assert.equal((await storage.loadCalendar()).doors.length, 24));
await storage.saveDoor(6, { ...door, title: 'Geändert', release: 'open' });
await asyncCheck(async () => assert.equal((await storage.getDoor(6)).title, 'Geändert'));
check(() => assert.equal(events, 1));
const exported = await storage.exportCalendar();
check(() => assert.equal(JSON.parse(exported).doors[5].title, 'Geändert'));
await storage.resetCalendar();
await storage.importCalendar(exported);
await asyncCheck(async () => assert.equal((await storage.getDoor(6)).release, 'open'));
await asyncCheck(async () => assert.rejects(() => storage.importCalendar('{broken'), /gültiges JSON/));
await asyncCheck(async () => assert.rejects(() => storage.importCalendar('{"version":99}')));
await asyncCheck(async () => assert.rejects(() => storage.getDoor(25)));
saveProgress(2026, new Set([1, 2, 3]));
check(() => assert.equal(loadProgress(2026).size, 3));
check(() => assert.equal(loadProgress(2027).size, 0));
local.set('klassenmomente.progress.v1', '{"year":2026,"days":[99]}');
check(() => assert.throws(() => loadProgress(2026)));
local.set('klassenmomente.calendar.v1', '{}');
await asyncCheck(async () => assert.rejects(() => storage.loadCalendar()));
local.delete('klassenmomente.calendar.v1');
fetchFails = true;
await asyncCheck(async () => assert.rejects(() => storage.loadDefaults(), /404/));
fetchFails = false;
const originalSet = localStorage.setItem;
localStorage.setItem = () => { throw new Error('quota'); };
await asyncCheck(async () => assert.rejects(() => storage.saveCalendar(defaults), /Speichern fehlgeschlagen/));
localStorage.setItem = originalSet;
const configURL = moduleURL(await readFile(new URL('auth-config.js', root), 'utf8'));
const authSource = (await readFile(new URL('auth.js', root), 'utf8')).replace("'./auth-config.js'", JSON.stringify(configURL));
const { Auth } = await import(moduleURL(authSource));
await asyncCheck(async () => assert.equal(await Auth.verify('winterzauber-2026'), true));
await asyncCheck(async () => assert.equal(await Auth.verify('falsch'), false));
await asyncCheck(async () => assert.rejects(() => Auth.login('falsch')));
await Auth.login('winterzauber-2026');
check(() => assert.equal(Auth.isLoggedIn(), true));
await asyncCheck(async () => assert.rejects(() => Auth.changePassword('winterzauber-2026', 'kurz')));
const newConfig = await Auth.changePassword('winterzauber-2026', 'ein-neues-passwort-2026');
check(() => assert.equal(Auth.isLoggedIn(), false));
check(() => assert.equal(newConfig.includes('ein-neues-passwort-2026'), false));
await asyncCheck(async () => assert.equal(await Auth.verify('ein-neues-passwort-2026'), true));
await asyncCheck(async () => assert.equal(await Auth.verify('winterzauber-2026'), false));
console.log(`${checks} Prüfungen erfolgreich: Schema, URLs, Datumsgrenzen, Speicherung, Import/Export, Fehlerfälle und PBKDF2.`);
