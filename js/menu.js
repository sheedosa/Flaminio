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
