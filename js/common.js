// Behaviour shared by index.html and menu.html: nav rendering, the
// "Arabic — coming soon" note, fade-in on scroll, and small helpers.
import { NAV_LINKS } from './data.js';

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const webp = src => src.replace(/\.(jpe?g|png)$/i, '.webp');

export function renderNav(navEl, footerNavEl, page) {
  const key = page === 'menu' ? 'menu' : 'home';
  const linksHtml = NAV_LINKS.map(n => {
    const current = page === 'menu' && n.label === 'Menu' ? ' aria-current="page"' : '';
    return `<a href="${n[key]}"${current}>${n.label}</a>`;
  }).join('');
  if (navEl) navEl.innerHTML = linksHtml;
  if (footerNavEl) footerNavEl.innerHTML = linksHtml;
}

export function initLangNote() {
  const btn = document.querySelector('[data-lang-toggle]');
  const note = document.querySelector('[data-lang-note]');
  if (!btn || !note) return;
  let timer;
  btn.addEventListener('click', () => {
    note.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => note.classList.remove('show'), 2400);
  });
}

export function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.setAttribute('data-reveal', 'in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.setAttribute('data-reveal', 'in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => io.observe(el));
}

// Calls handler(1) on a leftward swipe and handler(-1) on a rightward one.
export function onSwipe(el, handler, threshold = 40) {
  let startX = null, startY = null;
  el.addEventListener('touchstart', e => {
    const t = e.changedTouches[0];
    startX = t.clientX;
    startY = t.clientY;
  }, { passive: true });
  el.addEventListener('touchend', e => {
    if (startX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX, dy = t.clientY - startY;
    startX = startY = null;
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) handler(dx < 0 ? 1 : -1);
  }, { passive: true });
}
