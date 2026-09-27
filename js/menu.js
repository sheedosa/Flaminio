import { initLangSwitch } from './common.js';

initLangSwitch();

// Every category is already in the HTML (readable without JavaScript, where the
// tabs act as in-page links). Here we show one category at a time instead.
const tabs = [...document.querySelectorAll('.menu-tab')];
const panels = [...document.querySelectorAll('.menu-panel')];
const ids = panels.map(p => p.id);

function select(id, { updateUrl = false } = {}) {
  if (!ids.includes(id)) id = ids[0];
  panels.forEach(p => p.classList.toggle('is-active', p.id === id));
  tabs.forEach(tab => {
    const on = tab.dataset.cat === id;
    tab.classList.toggle('is-active', on);
    if (on) tab.setAttribute('aria-current', 'true'); else tab.removeAttribute('aria-current');
  });
  if (updateUrl) history.replaceState(null, '', `#${id}`);
}

tabs.forEach(tab => tab.addEventListener('click', e => {
  e.preventDefault();
  select(tab.dataset.cat, { updateUrl: true });
}));
window.addEventListener('hashchange', () => select(location.hash.slice(1)));
select(location.hash.slice(1));

/* ---------- dish photos ---------- */
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-cap');
  const closeBtn = document.getElementById('lightbox-close');
  let opener = null;
  const close = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (opener) opener.focus();
  };
  document.querySelectorAll('.menu-thumb').forEach(btn => btn.addEventListener('click', () => {
    opener = btn;
    img.src = btn.dataset.full;
    const name = btn.closest('.menu-item').querySelector('.menu-item-name');
    cap.textContent = [...name.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    img.alt = cap.textContent;
    lightbox.classList.add('is-open');
    document.body.classList.add('no-scroll');
    closeBtn.focus();
  }));
  lightbox.addEventListener('click', close);
  closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });
  lightbox.querySelector('.lightbox-figure').addEventListener('click', e => e.stopPropagation());
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close(); });
}
