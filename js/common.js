// Behaviour shared by the home and menu pages.
import { STRINGS } from './i18n.js';

export const lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
export const t = STRINGS[lang];
export const rtl = t.dir === 'rtl';
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// Keep the visitor on the same section (e.g. a menu category) when switching language.
export function initLangSwitch() {
  const link = document.querySelector('[data-lang-switch]');
  if (link) link.addEventListener('click', () => { if (location.hash) link.hash = location.hash; });
}

// Calls handler(1) for "next" and handler(-1) for "previous", mirrored in RTL.
export function onSwipe(el, handler, threshold = 40) {
  let startX = null, startY = null;
  el.addEventListener('touchstart', e => {
    const p = e.changedTouches[0];
    startX = p.clientX;
    startY = p.clientY;
  }, { passive: true });
  el.addEventListener('touchend', e => {
    if (startX === null) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - startX, dy = p.clientY - startY;
    startX = startY = null;
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) handler((dx < 0) !== rtl ? 1 : -1);
  }, { passive: true });
}
