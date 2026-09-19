import { GALLERY } from './data.js';
import { renderNav, initLangNote, initReveal } from './common.js';

renderNav(document.getElementById('site-nav'), document.getElementById('footer-nav'), 'home');
initLangNote();
initReveal();

/* ---------- hero carousel ---------- */
const slides = document.querySelectorAll('[data-hero-slide]');
const dotsEl = document.getElementById('hero-dots');
let slide = 0;
let heroTimer;

dotsEl.innerHTML = slides.length
  ? Array.from(slides).map((_, i) => `<button type="button" class="hero-dot" aria-label="Slide ${i + 1}" data-dot="${i}"></button>`).join('')
  : '';
const dots = dotsEl.querySelectorAll('[data-dot]');

function showSlide(i) {
  slide = (i + slides.length) % slides.length;
  slides.forEach((el, idx) => el.classList.toggle('is-active', idx === slide));
  dots.forEach((el, idx) => el.classList.toggle('is-active', idx === slide));
}
function restartAutoplay() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => showSlide(slide + 1), 6000);
}
dots.forEach(el => el.addEventListener('click', () => { showSlide(Number(el.dataset.dot)); restartAutoplay(); }));
document.querySelector('[data-hero-prev]').addEventListener('click', () => { showSlide(slide - 1); restartAutoplay(); });
document.querySelector('[data-hero-next]').addEventListener('click', () => { showSlide(slide + 1); restartAutoplay(); });
showSlide(0);
restartAutoplay();

/* ---------- gallery: editorial dense grid + view all/less + lightbox ---------- */
const PREVIEW_COUNT = 8;
const galleryGrid = document.getElementById('gallery-grid');
const galleryToggle = document.getElementById('gallery-toggle');
let galleryAll = false;
let currentList = [];

function desktopCols() {
  return window.matchMedia('(min-width: 720px)').matches ? 4 : 2;
}

function renderGallery() {
  const list = galleryAll ? GALLERY : GALLERY.slice(0, PREVIEW_COUNT);
  currentList = list;
  const cols = desktopCols();
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
    return `<figure class="gallery-figure" data-index="${i}" style="grid-column:span ${cs};grid-row:span ${rs}">
      <img src="${g.img}" alt="${g.cap}" loading="lazy">
      <figcaption>${g.cap}</figcaption>
    </figure>`;
  }).join('');
  galleryToggle.textContent = galleryAll ? 'Show less' : 'View all';
  galleryGrid.querySelectorAll('.gallery-figure').forEach(fig => {
    fig.addEventListener('click', () => openLightbox(Number(fig.dataset.index)));
  });
}
galleryToggle.addEventListener('click', () => { galleryAll = !galleryAll; renderGallery(); });
window.addEventListener('resize', debounce(renderGallery, 150));
renderGallery();

/* ---------- lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCap = document.getElementById('lightbox-cap');
let lightboxIndex = -1;

function openLightbox(i) {
  lightboxIndex = i;
  updateLightbox();
  lightbox.classList.add('is-open');
}
function updateLightbox() {
  const g = currentList[lightboxIndex];
  if (!g) return;
  lightboxImg.src = g.img;
  lightboxImg.alt = g.cap;
  lightboxCap.textContent = g.cap;
}
function stepLightbox(d) {
  lightboxIndex = (lightboxIndex + d + currentList.length) % currentList.length;
  updateLightbox();
}
function closeLightbox() { lightbox.classList.remove('is-open'); }

lightbox.addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', e => { e.stopPropagation(); stepLightbox(-1); });
document.getElementById('lightbox-next').addEventListener('click', e => { e.stopPropagation(); stepLightbox(1); });
document.getElementById('lightbox-close').addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
document.querySelector('.lightbox-figure').addEventListener('click', e => e.stopPropagation());
window.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') stepLightbox(1);
  if (e.key === 'ArrowLeft') stepLightbox(-1);
});

/* ---------- reservation form ---------- */
const form = document.getElementById('reservation-form');
const sentMsg = document.getElementById('reservation-sent');
form.addEventListener('submit', e => {
  e.preventDefault();
  form.hidden = true;
  sentMsg.hidden = false;
});

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
