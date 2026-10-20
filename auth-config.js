// Nur eine clientseitige UI-Sperre: Hash und Prüfung sind öffentlich und umgehbar.
// Echte Authentifizierung und Zugriffsrechte müssen auf einem Server geprüft werden.
// Kein Klartextpasswort hier. Demo-Zugang und Veröffentlichungsablauf: README.md.
export const AUTH_CONFIG = Object.freeze({
  salt: '7e398e834d61b758cb359ad59cf40a13',
  hash: '60a62c9d5c595d907807a694d8f427b9874c6b6d4e65e2ba005a0b88be6dd82e',
  iterations: 210000
});
