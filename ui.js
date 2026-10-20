import { safeURL } from './storage.js';

const MOTIFS = [
  '<path d="m40 9 7 21 22 1-17 14 6 22-18-13-18 13 6-22L11 31l22-1Z"/>',
  '<path d="M23 28h34v35H23zM18 23h44v10H18zM40 23v40"/><path d="M40 23c-26 0-16-24-5-10l5 10c26 0 16-24 5-10Z"/>',
  '<path d="m40 12-16 21h9L20 48h12L18 64h44L48 48h12L47 33h9ZM40 64v8"/>',
  '<circle cx="40" cy="44" r="23"/><path d="M33 20v-8h14v8M40 12V3M24 39q16-12 32 0M23 49q17-12 34 0"/>',
  '<path d="M40 10v60M14 25l52 30M14 55l52-30M32 16l8 8 8-8M32 64l8-8 8 8M16 35l11-3-3-11M56 59l-3-11 11-3M24 59l3-11-11-3M64 35l-11-3 3-11"/>',
  '<path d="M28 53h24V29H28ZM24 53h32v9H24ZM40 29c-16-6-1-18 0-23 10 10 10 19 0 23ZM25 67h30"/>'
];

export function motif(day) {
  return `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MOTIFS[(day - 1) % MOTIFS.length]}</svg>`;
}

export function setupDialog() {
  const dialog = document.querySelector('#door-dialog');
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => document.querySelector('#door-content').replaceChildren());
  return dialog;
}

function textElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function videoContent(value) {
  const url = new URL(safeURL(value));
  const host = url.hostname.toLowerCase();
  let embed = '';
  const youtubeHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];
  if (youtubeHosts.includes(host) || host === 'youtu.be') {
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
    if (id && /^[\w-]{11}$/.test(id)) embed = `https://www.youtube-nocookie.com/embed/${id}`;
  } else if (['vimeo.com', 'www.vimeo.com'].includes(host)) {
    const id = url.pathname.match(/^\/(\d+)$/)?.[1];
    if (id) embed = `https://player.vimeo.com/video/${id}`;
  }
  const container = document.createElement('div');
  container.className = 'video-consent';
  container.append(textElement('p', 'Externe Medien können Daten an den Anbieter übertragen. Erst mit deinem Klick wird das Video geladen.', 'small muted'));
  if (embed || /\.(mp4|webm)$/i.test(url.pathname)) {
    const button = textElement('button', 'Video laden & ansehen', 'button');
    button.type = 'button';
    button.addEventListener('click', () => {
      const media = document.createElement(embed ? 'iframe' : 'video');
      media.src = embed || url.href;
      if (embed) {
        media.title = 'Video zum Türchen';
        media.allow = 'fullscreen; picture-in-picture';
        media.referrerPolicy = 'no-referrer';
        media.setAttribute('allowfullscreen', '');
      } else { media.controls = true; media.preload = 'metadata'; }
      container.replaceChildren(media);
    });
    container.append(button);
  } else {
    const link = textElement('a', 'Video auf externer Website ansehen ↗', 'button');
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    container.append(link);
  }
  return container;
}

export function showDoor(dialog, door, { celebration = false, preview = false } = {}) {
  const content = document.querySelector('#door-content');
  content.replaceChildren();
  content.append(textElement('div', `${preview ? 'VORSCHAU · ' : ''}TÜRCHEN ${String(door.day).padStart(2, '0')}`, 'eyebrow'));
  const ornament = document.createElement('div');
  ornament.className = `modal-motif ${door.theme}`;
  ornament.innerHTML = motif(door.day);
  content.append(ornament);
  const title = textElement('h2', door.title);
  title.id = 'door-title';
  content.append(title);
  if (door.text) content.append(textElement('p', door.text, 'door-text'));
  if (door.image) {
    const image = document.createElement('img');
    image.src = safeURL(door.image, { image: true });
    image.alt = door.imageAlt || '';
    image.className = 'door-image';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => {
      image.replaceWith(textElement('p', 'Das Bild konnte nicht geladen werden.', 'notice error'));
    }, { once: true });
    content.append(image);
  }
  if (door.task) {
    const box = document.createElement('section');
    box.className = 'task-box';
    box.append(textElement('h3', 'Dein kleiner Adventsmoment'), textElement('p', door.task));
    content.append(box);
  }
  if (door.answer) {
    const details = document.createElement('details');
    details.className = 'answer-box';
    details.append(textElement('summary', 'Lösung entdecken'), textElement('p', door.answer));
    content.append(details);
  }
  if (door.video) content.append(videoContent(door.video));
  if (door.link) {
    const link = textElement('a', `${door.buttonText || 'Überraschung entdecken'} ↗`, 'button primary content-link');
    link.href = safeURL(door.link);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    content.append(link);
  }
  if (!dialog.open) dialog.showModal();
  if (celebration && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const stars = document.createElement('div');
    stars.className = 'celebration';
    stars.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 14; i++) {
      const star = textElement('span', '✦');
      star.style.setProperty('--x', `${(Math.random() - 0.5) * 420}px`);
      star.style.setProperty('--y', `${-60 - Math.random() * 240}px`);
      star.style.setProperty('--rotation', `${Math.random() * 180}deg`);
      stars.append(star);
    }
    content.append(stars);
    setTimeout(() => stars.remove(), 1600);
  }
}

export function setupAtmosphere(status) {
  const snow = document.querySelector('.snow');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  for (let i = 0; i < 26; i++) {
    const flake = document.createElement('span');
    flake.style.cssText = `--left:${Math.random() * 100}%;--duration:${15 + Math.random() * 20}s;--delay:${-Math.random() * 35}s;--size:${2 + Math.random() * 3}px`;
    snow.append(flake);
  }
  let snowEnabled = !reduced.matches;
  const snowButton = document.querySelector('#snow-toggle');
  const updateSnow = () => {
    snow.hidden = !snowEnabled;
    snowButton.setAttribute('aria-pressed', String(snowEnabled));
    snowButton.setAttribute('aria-label', `Schneefall ${snowEnabled ? 'ausschalten' : 'einschalten'}`);
  };
  updateSnow();
  snowButton.addEventListener('click', () => { snowEnabled = !snowEnabled; updateSnow(); });
  const musicButton = document.querySelector('#music-toggle');
  let audio = null;
  let timer = null;
  let noteIndex = 0;
  const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66, 261.63, 392, 329.63, 261.63];
  function playNote() {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = notes[noteIndex++ % notes.length];
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, audio.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1.7);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 1.8);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  async function stopMusic() {
    clearInterval(timer);
    timer = null;
    if (audio) { await audio.close(); audio = null; }
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.setAttribute('aria-label', 'Wintermelodie einschalten');
  }
  musicButton.addEventListener('click', async () => {
    try {
      if (audio) { await stopMusic(); return; }
      audio = new AudioContext();
      await audio.resume();
      playNote();
      timer = setInterval(playNote, 1100);
      musicButton.setAttribute('aria-pressed', 'true');
      musicButton.setAttribute('aria-label', 'Wintermelodie ausschalten');
    } catch (error) {
      await stopMusic();
      console.error(error);
      status.textContent = 'Die Wintermelodie konnte in diesem Browser nicht gestartet werden.';
      status.classList.add('error');
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && audio) stopMusic().catch(error => { console.error(error); status.textContent = 'Die Musik konnte nicht ordnungsgemäß beendet werden.'; }); });
}
