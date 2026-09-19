// Behaviour shared by index.html and menu.html: nav rendering, the
// "Arabic — coming soon" note, and the fade-in-on-scroll effect.
import { NAV_LINKS } from './data.js';

export function renderNav(navEl, footerNavEl, page) {
  const key = page === 'menu' ? 'menu' : 'home';
  const linksHtml = NAV_LINKS.map(n => `<a href="${n[key]}">${n.label}</a>`).join('');
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
  if (!('IntersectionObserver' in window)) {
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
