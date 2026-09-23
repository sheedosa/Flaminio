import { GALLERY, WHATSAPP } from './data.js';
import { renderNav, initLangNote, initReveal, onSwipe, reducedMotion, webp } from './common.js';

renderNav(document.getElementById('site-nav'), document.getElementById('footer-nav'), 'home');
initLangNote();
initReveal();

/* ---------- hero carousel ---------- */
const hero = document.getElementById('hero');
const slides = document.querySelectorAll('[data-hero-slide]');
const dotsEl = document.getElementById('hero-dots');
let slide = 0;
let heroTimer;

dotsEl.innerHTML = Array.from(slides).map((_, i) =>
  `<button type="button" class="hero-dot" aria-label="Show slide ${i + 1}" data-dot="${i}"></button>`
).join('');
const dots = dotsEl.querySelectorAll('[data-dot]');

// Only the first slide ships with a src; the rest are fetched just before they
// are needed so the initial page load stays light.
function loadSlide(i) {
  const img = slides[(i + slides.length) % slides.length];
  if (!img.dataset.src) return;
  const source = img.previousElementSibling;
  if (source && source.dataset.srcset) {
    source.srcset = source.dataset.srcset;
    delete source.dataset.srcset;
  }
  img.src = img.dataset.src;
  delete img.dataset.src;
}

function showSlide(i) {
  slide = (i + slides.length) % slides.length;
  loadSlide(slide);
  loadSlide(slide + 1);
  slides.forEach((el, idx) => el.classList.toggle('is-active', idx === slide));
  dots.forEach((el, idx) => {
    el.classList.toggle('is-active', idx === slide);
    if (idx === slide) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
  });
}
function restartAutoplay() {
  clearInterval(heroTimer);
  if (reducedMotion) return;
  heroTimer = setInterval(() => showSlide(slide + 1), 6000);
}
dots.forEach(el => el.addEventListener('click', () => { showSlide(Number(el.dataset.dot)); restartAutoplay(); }));
document.querySelector('[data-hero-prev]').addEventListener('click', () => { showSlide(slide - 1); restartAutoplay(); });
document.querySelector('[data-hero-next]').addEventListener('click', () => { showSlide(slide + 1); restartAutoplay(); });
onSwipe(hero, dir => { showSlide(slide + dir); restartAutoplay(); });
showSlide(0);
restartAutoplay();
window.addEventListener('load', () => loadSlide(1), { once: true });

/* ---------- gallery: editorial dense grid + view all/less + lightbox ---------- */
const PREVIEW_COUNT = 8;
const galleryGrid = document.getElementById('gallery-grid');
const galleryToggle = document.getElementById('gallery-toggle');
let galleryAll = false;
let currentList = [];
let renderedCols = 0;

function desktopCols() {
  return window.matchMedia('(min-width: 720px)').matches ? 4 : 2;
}

function renderGallery() {
  const list = galleryAll ? GALLERY : GALLERY.slice(0, PREVIEW_COUNT);
  currentList = list;
  const cols = desktopCols();
  renderedCols = cols;
  const n = list.length;
  galleryGrid.innerHTML = list.map((g, i) => {
    let cs = 1, rs = 1;
    if (cols === 4) {
      const s = i - (i % 8), len = Math.min(8, n - s), gi = i % 8;
      if (len === 8) { if (gi === 0) { cs = 2; rs = 2; } else if (gi === 7) cs = 2; }
      else if (gi === len - 1 && len % 4) cs = 4 - (len % 4) + 1;
    } else if (n % 2 && i === n - 1) {
      cs = 2;
    }
    return `<figure class="gallery-figure" data-index="${i}" role="button" tabindex="0" aria-label="View photo: ${g.cap}" style="grid-column:span ${cs};grid-row:span ${rs}">
      <picture>
        <source type="image/webp" srcset="${webp(g.img)}">
        <img src="${g.img}" alt="" loading="lazy" decoding="async">
      </picture>
      <figcaption>${g.cap}</figcaption>
    </figure>`;
  }).join('');
  galleryToggle.textContent = galleryAll ? 'Show less' : 'View all';
  galleryToggle.setAttribute('aria-expanded', String(galleryAll));
  galleryGrid.querySelectorAll('.gallery-figure').forEach(fig => {
    const open = () => openLightbox(Number(fig.dataset.index), fig);
    fig.addEventListener('click', open);
    fig.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}
galleryToggle.addEventListener('click', () => { galleryAll = !galleryAll; renderGallery(); });
// Mobile browsers fire resize when the URL bar collapses mid-scroll; only
// rebuild the grid when the column count actually changes.
window.addEventListener('resize', debounce(() => { if (desktopCols() !== renderedCols) renderGallery(); }, 150));
renderGallery();

/* ---------- lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxSrc = document.getElementById('lightbox-src');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCap = document.getElementById('lightbox-cap');
const lightboxClose = document.getElementById('lightbox-close');
let lightboxIndex = -1;
let lightboxOpener = null;

function openLightbox(i, opener) {
  lightboxIndex = i;
  lightboxOpener = opener || document.activeElement;
  updateLightbox();
  lightbox.classList.add('is-open');
  document.body.classList.add('no-scroll');
  lightboxClose.focus();
}
function updateLightbox() {
  const g = currentList[lightboxIndex];
  if (!g) return;
  lightboxSrc.srcset = webp(g.img);
  lightboxImg.src = g.img;
  lightboxImg.alt = g.cap;
  lightboxCap.textContent = g.cap;
}
function stepLightbox(d) {
  lightboxIndex = (lightboxIndex + d + currentList.length) % currentList.length;
  updateLightbox();
}
function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  if (lightboxOpener && document.contains(lightboxOpener)) lightboxOpener.focus();
}

lightbox.addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', e => { e.stopPropagation(); stepLightbox(-1); });
document.getElementById('lightbox-next').addEventListener('click', e => { e.stopPropagation(); stepLightbox(1); });
lightboxClose.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
document.querySelector('.lightbox-figure').addEventListener('click', e => e.stopPropagation());
onSwipe(lightbox, stepLightbox);
const lightboxControls = [lightboxClose, document.getElementById('lightbox-prev'), document.getElementById('lightbox-next')];
window.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Tab') {
    e.preventDefault();
    const i = lightboxControls.indexOf(document.activeElement);
    lightboxControls[(i + (e.shiftKey ? -1 : 1) + lightboxControls.length) % lightboxControls.length].focus();
  }
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') stepLightbox(1);
  if (e.key === 'ArrowLeft') stepLightbox(-1);
});

/* ---------- reservation form: hand off to WhatsApp ---------- */
const form = document.getElementById('reservation-form');
const sentMsg = document.getElementById('reservation-sent');
const sentLink = document.getElementById('reservation-link');
const dateInput = form.querySelector('input[type="date"]');
const today = new Date();
dateInput.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');

function reservationMessage(data) {
  const [y, m, d] = data.get('date').split('-').map(Number);
  const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, d));
  return [
    "Hello Flaminio, I'd like to request a table.",
    '',
    `Name: ${data.get('name').trim()}`,
    `Phone: ${data.get('phone').trim()}`,
    `Date: ${date}`,
    `Time: ${data.get('time')}`,
    `Guests: ${data.get('guests')}`,
  ].join('\n');
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const url = `${WHATSAPP}?text=${encodeURIComponent(reservationMessage(new FormData(form)))}`;
  sentLink.href = url;
  sentMsg.hidden = false;
  const win = window.open(url, '_blank');
  if (win) win.opener = null;
  else window.location.href = url;
});

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
