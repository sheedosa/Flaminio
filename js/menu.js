import { MENU } from './data.js';
import { renderNav, initLangNote, webp } from './common.js';

renderNav(document.getElementById('site-nav'), document.getElementById('footer-nav'), 'menu');
initLangNote();

const tabsEl = document.getElementById('menu-tabs');
const titleEl = document.getElementById('menu-cat-title');
const itemsEl = document.getElementById('menu-items');
const srcEl = document.getElementById('menu-cat-src');
const imgEl = document.getElementById('menu-cat-img');
const captionEl = document.getElementById('menu-cat-caption');

tabsEl.innerHTML = MENU.map((cat, i) =>
  `<button type="button" role="tab" class="menu-tab" id="tab-${cat.id}" aria-controls="menu-items" aria-selected="false" data-index="${i}">${cat.label}</button>`
).join('');
const tabs = tabsEl.querySelectorAll('.menu-tab');
tabs.forEach(tab => tab.addEventListener('click', () => selectCategory(Number(tab.dataset.index))));

function selectCategory(i) {
  const cat = MENU[i];
  tabs.forEach((tab, idx) => {
    tab.classList.toggle('is-active', idx === i);
    tab.setAttribute('aria-selected', String(idx === i));
  });
  titleEl.textContent = cat.label;
  itemsEl.setAttribute('aria-labelledby', `tab-${cat.id}`);
  srcEl.srcset = webp(cat.img);
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
  const wrap = itemsEl.closest('.menu-list-wrap');
  wrap.style.animation = 'none';
  void wrap.offsetWidth;
  wrap.style.animation = '';
}

selectCategory(0);
