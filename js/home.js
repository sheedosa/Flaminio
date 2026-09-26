import { t, rtl, initReveal, initLangSwitch, onSwipe, reducedMotion } from './common.js';

initReveal();
initLangSwitch();

/* ---------- hero carousel ---------- */
const hero = document.getElementById('hero');
const slides = hero.querySelectorAll('[data-hero-slide]');
const dots = hero.querySelectorAll('[data-dot]');
let slide = 0;
let heroTimer;

// Only the first slide ships with a src; the rest load just before they show.
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
  if (!reducedMotion) heroTimer = setInterval(() => showSlide(slide + 1), 6000);
}
const go = i => { showSlide(i); restartAutoplay(); };
dots.forEach(el => el.addEventListener('click', () => go(Number(el.dataset.dot))));
hero.querySelector('[data-hero-prev]').addEventListener('click', () => go(slide - 1));
hero.querySelector('[data-hero-next]').addEventListener('click', () => go(slide + 1));
onSwipe(hero, d => go(slide + d));
showSlide(0);
restartAutoplay();
window.addEventListener('load', () => loadSlide(1), { once: true });

/* ---------- gallery: editorial dense grid + view all/less ---------- */
const PREVIEW_COUNT = 8;
const galleryGrid = document.getElementById('gallery-grid');
const galleryToggle = document.getElementById('gallery-toggle');
const figures = [...galleryGrid.querySelectorAll('.gallery-figure')];
let galleryAll = false;
let visible = [];
let layoutCols = 0;

const columns = () => (window.matchMedia('(min-width: 720px)').matches ? 4 : 2);

// Spans keep every row full: each block of 8 opens with a 2×2 tile and ends
// with a 2-wide tile; a short final block stretches its last tile.
function layoutGallery() {
  visible = galleryAll ? figures : figures.slice(0, PREVIEW_COUNT);
  const cols = layoutCols = columns();
  const n = visible.length;
  figures.forEach(f => { f.hidden = !visible.includes(f); });
  visible.forEach((fig, i) => {
    let cs = 1, rs = 1;
    if (cols === 4) {
      const s = i - (i % 8), len = Math.min(8, n - s), gi = i % 8;
      if (len === 8) { if (gi === 0) { cs = 2; rs = 2; } else if (gi === 7) cs = 2; }
      else if (gi === len - 1 && len % 4) cs = 4 - (len % 4) + 1;
    } else if (n % 2 && i === n - 1) {
      cs = 2;
    }
    fig.style.gridColumn = `span ${cs}`;
    fig.style.gridRow = `span ${rs}`;
  });
  galleryToggle.textContent = galleryAll ? galleryToggle.dataset.less : galleryToggle.dataset.more;
  galleryToggle.setAttribute('aria-expanded', String(galleryAll));
}
galleryToggle.addEventListener('click', () => { galleryAll = !galleryAll; layoutGallery(); });
// Mobile browsers fire resize as the URL bar collapses; only re-layout on a column change.
window.addEventListener('resize', debounce(() => { if (columns() !== layoutCols) layoutGallery(); }, 150));
layoutGallery();

/* ---------- lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxSrc = document.getElementById('lightbox-src');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCap = document.getElementById('lightbox-cap');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const lightboxControls = [lightboxClose, lightboxPrev, lightboxNext];
let lightboxIndex = -1;
let lightboxOpener = null;

function showInLightbox() {
  const fig = visible[lightboxIndex];
  const img = fig.querySelector('img');
  lightboxSrc.srcset = fig.querySelector('source').srcset;
  lightboxImg.src = img.getAttribute('src');
  lightboxImg.alt = fig.querySelector('figcaption').textContent;
  lightboxCap.textContent = lightboxImg.alt;
}
function openLightbox(fig) {
  lightboxIndex = visible.indexOf(fig);
  lightboxOpener = fig;
  showInLightbox();
  lightbox.classList.add('is-open');
  document.body.classList.add('no-scroll');
  lightboxClose.focus();
}
function stepLightbox(d) {
  lightboxIndex = (lightboxIndex + d + visible.length) % visible.length;
  showInLightbox();
}
function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  if (lightboxOpener) lightboxOpener.focus();
}

figures.forEach(fig => {
  fig.addEventListener('click', () => openLightbox(fig));
  fig.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(fig); }
  });
});
lightbox.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', e => { e.stopPropagation(); stepLightbox(-1); });
lightboxNext.addEventListener('click', e => { e.stopPropagation(); stepLightbox(1); });
lightboxClose.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
lightbox.querySelector('.lightbox-figure').addEventListener('click', e => e.stopPropagation());
onSwipe(lightbox, stepLightbox);
window.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Tab') {
    e.preventDefault();
    const i = lightboxControls.indexOf(document.activeElement);
    lightboxControls[(i + (e.shiftKey ? -1 : 1) + lightboxControls.length) % lightboxControls.length].focus();
  }
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') stepLightbox(rtl ? -1 : 1);
  if (e.key === 'ArrowLeft') stepLightbox(rtl ? 1 : -1);
});

/* ---------- reservation form: hand off to WhatsApp ---------- */
const form = document.getElementById('reservation-form');
const sentMsg = document.getElementById('reservation-sent');
const dateInput = document.getElementById('res-date');
const today = new Date();
dateInput.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');

function reservationMessage(data) {
  const [y, m, d] = data.get('date').split('-').map(Number);
  const date = new Intl.DateTimeFormat(t.dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn' })
    .format(new Date(y, m - 1, d));
  const branchName = document.documentElement.dataset.branchName || '';
  return [
    t.waHello,
    '',
    ...(branchName ? [`${t.branchLabel}: ${branchName}`] : []),
    `${t.fName}: ${data.get('name').trim()}`,
    `${t.fPhone}: ${data.get('phone').trim()}`,
    `${t.fDate}: ${date}`,
    `${t.fTime}: ${data.get('time')}`,
    `${t.fGuests}: ${data.get('guests')}`,
  ].join('\n');
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const url = `${document.documentElement.dataset.whatsapp}?text=${encodeURIComponent(reservationMessage(new FormData(form)))}`;
  document.getElementById('reservation-link').href = url;
  sentMsg.hidden = false;
  const win = window.open(url, '_blank');
  if (win) win.opener = null;
  else window.location.href = url;
});

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
