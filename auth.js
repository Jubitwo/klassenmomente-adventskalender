import { AUTH_CONFIG } from './auth-config.js';

const KEY = 'klassenmomente.auth.v1';
const SESSION_KEY = 'klassenmomente.admin-session';
const hex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');

function getConfig() {
  const raw = localStorage.getItem(KEY);
  const config = raw ? JSON.parse(raw) : AUTH_CONFIG;
  if (!/^[a-f0-9]{32}$/.test(config.salt) || !/^[a-f0-9]{64}$/.test(config.hash) || config.iterations !== 210000) throw new Error('Die lokale Passwortkonfiguration ist beschädigt.');
  return config;
}

async function derive(password, config) {
  if (!crypto.subtle) throw new Error('Die Passwortprüfung benötigt HTTPS oder localhost und einen aktuellen Browser.');
  const salt = Uint8Array.from(config.salt.match(/../g), byte => parseInt(byte, 16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: config.iterations, hash: 'SHA-256' }, key, 256)));
}

// Sitzungsmarker ist lediglich UI-Komfort und kann manipuliert werden.
// Weder CalendarStorage noch öffentliche JSON-Dateien sind dadurch geschützt.
export const Auth = {
  async verify(password) {
    const config = getConfig();
    return await derive(password, config) === config.hash;
  },
  async login(password) {
    if (!await this.verify(password)) throw new Error('Das Passwort stimmt nicht.');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ hash: getConfig().hash, expires: Date.now() + 3600000 }));
  },
  isLoggedIn() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session.hash === getConfig().hash && session.expires > Date.now();
  },
  logout() { sessionStorage.removeItem(SESSION_KEY); },
  async changePassword(current, next) {
    if (!await this.verify(current)) throw new Error('Das aktuelle Passwort stimmt nicht.');
    if (next.length < 12 || next.length > 256) throw new Error('Das neue Passwort muss 12 bis 256 Zeichen lang sein.');
    const config = { salt: hex(crypto.getRandomValues(new Uint8Array(16))), iterations: 210000 };
    config.hash = await derive(next, config);
    localStorage.setItem(KEY, JSON.stringify(config));
    this.logout();
    return `// Öffentliche, umgehbare UI-Sperre. Echte Rechte serverseitig prüfen.\nexport const AUTH_CONFIG = Object.freeze(${JSON.stringify(config, null, 2)});\n`;
  }
};
