import { validateCalendar } from './storage.js';

const REPO = 'Jubitwo/klassenmomente-adventskalender';
const API = `https://api.github.com/repos/${REPO}`;
const FILE = '/contents/calendar-data.json';
const MAX_BYTES = 8 * 1024 * 1024;

function encode(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > MAX_BYTES) throw new Error('Kalenderdatei zu groß: maximal 8 MB. Bitte Bilder verkleinern oder Bild-URLs verwenden.');
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}

// Token nur im Arbeitsspeicher, nie in localStorage, URLs, Exporten oder Logs.
// GitHub erzwingt die Rechte; das Kalenderpasswort ist keine GitHub-Anmeldung.
export class GitHubPublisher {
  #token = '';
  #sha = '';
  #generation = 0;

  get connected() { return Boolean(this.#token && this.#sha); }
  disconnect() { this.#token = ''; this.#sha = ''; this.#generation++; }

  async #request(path, options = {}) {
    if (!this.#token) throw new Error('Bitte zuerst mit GitHub verbinden.');
    let response;
    try {
      response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          Accept: path.startsWith(FILE) && options.method !== 'PUT' ? 'application/vnd.github.object+json' : 'application/vnd.github+json',
          Authorization: `Bearer ${this.#token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          ...(options.body ? { 'Content-Type': 'application/json' } : {})
        },
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(20000)
      });
    } catch {
      throw new Error('GitHub ist nicht erreichbar oder die Anfrage dauerte zu lange. Bei einer Veröffentlichung bitte zuerst den Repository-Stand prüfen; der Commit könnte bereits erfolgt sein.');
    }
    if (!response.ok) {
      const messages = {
        401: 'GitHub hat das Token abgelehnt. Bitte neu verbinden.',
        403: 'GitHub verweigert den Zugriff. Token-Rechte, Ablaufdatum und API-Limit prüfen.',
        404: 'Repository oder Kalenderdatei nicht zugänglich. Die Repository-Auswahl des Tokens prüfen.',
        409: 'Konflikt: Der GitHub-Stand wurde geändert. Lokal exportieren, GitHub-Stand laden und Änderungen erneut einarbeiten.',
        422: 'GitHub hat den Commit abgelehnt. Schreibrechte und Branch-Regeln prüfen.'
      };
      throw new Error(messages[response.status] || `GitHub-Anfrage fehlgeschlagen (HTTP ${response.status}).`);
    }
    return response.json();
  }

  async #snapshot() {
    const file = await this.#request(`${FILE}?ref=main`);
    if (file.type !== 'file' || typeof file.sha !== 'string' || !/^[a-f0-9]{40}$/.test(file.sha) || file.size > MAX_BYTES) {
      throw new Error('GitHub-Kalenderdatei ungültig oder größer als 8 MB.');
    }
    const blob = file.encoding === 'base64' ? file : await this.#request(`/git/blobs/${file.sha}`);
    if (blob.encoding !== 'base64' || typeof blob.content !== 'string') throw new Error('GitHub hat keine lesbaren Kalenderdaten geliefert.');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(blob.content.replace(/\s/g, '')), char => char.charCodeAt(0)));
    return { sha: file.sha, calendar: validateCalendar(JSON.parse(text)) };
  }

  async connect(token) {
    this.disconnect();
    if (!/^[A-Za-z0-9_]{20,255}$/.test(token.trim())) throw new Error('Bitte ein gültiges GitHub-Zugriffstoken eingeben.');
    this.#token = token.trim();
    const generation = this.#generation;
    try {
      const snapshot = await this.#snapshot();
      if (generation !== this.#generation) throw new Error('GitHub-Verbindung wurde beendet.');
      this.#sha = snapshot.sha;
    } catch (error) { this.disconnect(); throw error; }
  }

  async loadCalendar() {
    if (!this.connected) throw new Error('Bitte zuerst mit GitHub verbinden.');
    const generation = this.#generation;
    const snapshot = await this.#snapshot();
    if (generation !== this.#generation) throw new Error('GitHub-Verbindung wurde beendet.');
    this.#sha = snapshot.sha;
    return snapshot.calendar;
  }

  async publish(data) {
    if (!this.connected) throw new Error('Bitte zuerst mit GitHub verbinden.');
    const content = encode(`${JSON.stringify(validateCalendar(data), null, 2)}\n`);
    const generation = this.#generation;
    const latest = await this.#request(`${FILE}?ref=main`);
    if (generation !== this.#generation) throw new Error('GitHub-Verbindung wurde beendet.');
    if (latest.sha !== this.#sha) throw new Error('Konflikt: Seit dem Verbinden oder Laden hat sich die Kalenderdatei auf GitHub geändert. Sichere deinen lokalen Stand per Export und lade den GitHub-Stand neu.');
    const result = await this.#request(FILE, {
      method: 'PUT',
      body: JSON.stringify({
        message: 'content: update classroom advent calendar',
        branch: 'main',
        sha: this.#sha,
        content
      })
    });
    if (!result.content?.sha || !result.commit?.sha) throw new Error('GitHub hat den Commit nicht bestätigt. Bitte den Repository-Stand prüfen, bevor du erneut veröffentlichst.');
    if (generation === this.#generation) this.#sha = result.content.sha;
    return `https://github.com/${REPO}/commit/${result.commit.sha}`;
  }
}
