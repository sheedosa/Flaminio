import { MENU } from './data.js';
import { renderNav, initLangNote } from './common.js';

renderNav(document.getElementById('site-nav'), document.getElementById('footer-nav'), 'menu');
initLangNote();

const tabsEl = document.getElementById('menu-tabs');
const titleEl = document.getElementById('menu-cat-title');
const itemsEl = document.getElementById('menu-items');
const imgEl = document.getElementById('menu-cat-img');
const captionEl = document.getElementById('menu-cat-caption');

let activeIndex = 0;

tabsEl.innerHTML = MENU.map((cat, i) =>
  `<button type="button" role="tab" class="menu-tab" data-index="${i}">${cat.label}</button>`
).join('');
const tabs = tabsEl.querySelectorAll('.menu-tab');
tabs.forEach(tab => tab.addEventListener('click', () => selectCategory(Number(tab.dataset.index))));

function selectCategory(i) {
  activeIndex = i;
  const cat = MENU[i];
  tabs.forEach((tab, idx) => tab.classList.toggle('is-active', idx === i));
  titleEl.textContent = cat.label;
  imgEl.src = cat.img;
  imgEl.alt = cat.label;
  captionEl.textContent = cat.label;
  itemsEl.innerHTML = cat.items.map(it => `
    <div class="menu-item">
      <div class="menu-item-row">
        <h3 class="serif menu-item-name">${it.name}</h3>
        <span class="menu-item-leader" aria-hidden="true"></span>
        <span class="menu-item-price">${it.price == null ? '—' : it.price + ' LYD'}</span>
      </div>
      ${it.desc ? `<p class="menu-item-desc">${it.desc}</p>` : ''}
    </div>
  `).join('');
  itemsEl.closest('.menu-list-wrap').style.animation = 'none';
  void itemsEl.offsetWidth;
  itemsEl.closest('.menu-list-wrap').style.animation = '';
}

selectCategory(0);
