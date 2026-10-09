// Renders the site into dist/:
//   /                      language + branch chooser (the "gate")
//   /<branch>/             English site for that branch, /<branch>/ar/ Arabic
//   /admin/                the owner's editor (menus, branch details, photos)
//   /menu.html, /ar/…      redirects for links shared before branches existed
// Content: menus and branch details come from content/*.json (edited in /admin/);
// hero/gallery photos, signature dishes and branch names from js/data.js.
// Usage: node scripts/build.mjs   (no dependencies; Node 18+)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTACT, HERO, GALLERY, BRANCHES } from '../js/data.js';
import { STRINGS } from '../js/i18n.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'dist');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const SITE = CONFIG.siteUrl.replace(/\/?$/, '/');
const BASE_PATH = new URL(SITE).pathname;
const LANGS = { en: '', ar: 'ar/' };
const STATIC = ['css', 'js', 'img', 'assets', 'favicon.ico', 'site.webmanifest'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (ctx, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ctx);
// "{branch}"-style placeholders in interface strings.
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
const branchUrl = (branch, lang) => SITE + branch.id + '/' + LANGS[lang];

// ---------- content (edited in /admin/, stored in content/) ----------
const readJson = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));
// Site-wide content edited in the admin's «الموقع» section: hero photos, the story block, the gallery
// and social links. Anything missing there falls back to the code-owned defaults in js/data.js.
const SITE_CONTENT = fs.existsSync(path.join(ROOT, 'content/site.json')) ? readJson('site.json') : {};
const heroList = (SITE_CONTENT.hero || []).filter(Boolean).length ? SITE_CONTENT.hero.filter(Boolean) : HERO;
const galleryList = (SITE_CONTENT.gallery || []).filter(g => g && g.img).length ? SITE_CONTENT.gallery.filter(g => g && g.img) : GALLERY;
const story = SITE_CONTENT.story || {};
const social = { ...CONTACT, ...Object.fromEntries(Object.entries(SITE_CONTENT.social || {}).filter(([, v]) => v)) };
const sameAs = [social.facebook, social.instagram].filter(Boolean);
const itemsOf = cat => cat.items || cat.groups.flatMap(g => g.items);
const localNumber = s => String(s || '').replace(/\D/g, '').replace(/^00/, '').replace(/^218/, '').replace(/^0/, '');
// Phone digits as typed in the admin (e.g. 0935433335) → display, tel: and wa.me forms.
function contactFor(info) {
  const local = localNumber(info.phone), wa = localNumber(info.whatsapp) || local;
  return {
    ...social,
    phoneDisplay: local ? `0${local.slice(0, 2)}-${local.slice(2)}` : '',
    phoneTel: local ? `+218${local}` : '',
    whatsapp: wa ? `https://wa.me/218${wa}` : '',
    maps: info.maps || '',
  };
}
const onlyVisible = cat => cat.groups
  ? { ...cat, groups: cat.groups.map(g => ({ ...g, items: g.items.filter(it => !it.hidden) })) }
  : { ...cat, items: cat.items.filter(it => !it.hidden) };
const branchInfo = readJson('branches.json');
const branches = BRANCHES.map(b => {
  const info = branchInfo[b.id];
  if (!info) throw new Error(`content/branches.json has no entry for ${b.id}`);
  const menu = readJson(`menu-${b.id}.json`).map(onlyVisible);
  for (const c of menu) {
    const ids = itemsOf(c).map(it => it.id);
    if (new Set(ids).size !== ids.length) throw new Error(`${b.id}/${c.id}: duplicate item ids`);
    for (const it of itemsOf(c)) if (it.price !== null && typeof it.price !== 'number') throw new Error(`${b.id}/${c.id}/${it.id}: price must be a number or null`);
  }
  return { ...b, info, menu, contact: contactFor(info), pdf: info.pdf || null, chef: info.chef || '' };
});
function findItem(ref, menu) {
  const [catId, itemId] = ref.split('/');
  const cat = menu.find(c => c.id === catId);
  return cat && itemsOf(cat).find(it => it.id === itemId);
}

const partials = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, 'src/partials.html'), 'utf8')
    .split(/^<!-- @(\w+) -->\n/m).slice(1)
    .reduce((acc, part, i, arr) => (i % 2 ? acc : [...acc, [part, arr[i + 1].trimEnd()]]), [])
);

function render(tpl, ctx, name) {
  const out = tpl
    .replace(/\{\{> (\w+)\}\}/g, (_, p) => { if (!(p in partials)) throw new Error(`${name}: unknown partial ${p}`); return partials[p]; })
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, k) => { const v = get(ctx, k); if (v === undefined) throw new Error(`${name}: missing {{{${k}}}}`); return v; })
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => { const v = get(ctx, k); if (v === undefined) throw new Error(`${name}: missing {{${k}}}`); return esc(v); });
  if (/\{\{/.test(out)) throw new Error(`${name}: unrendered token left`);
  return out;
}

const WIDTHS = JSON.parse(fs.readFileSync(path.join(ROOT, 'img/widths.json'), 'utf8'));

// Bundled photo (img/<name>.jpg + .webp). With `sizes`, photos that have a 480px thumbnail get a responsive srcset.
function pic(base, name, alt, attrs = '', sizes = '') {
  const w = WIDTHS[name];
  const responsive = sizes && w > 480;
  const set = ext => responsive ? `${base}img/${name}-480.${ext} 480w, ${base}img/${name}.${ext} ${w}w` : `${base}img/${name}.${ext}`;
  const sz = responsive ? ` sizes="${sizes}"` : '';
  return `<picture><source type="image/webp" srcset="${set('webp')}"${sz}><img src="${base}img/${name}.jpg"${responsive ? ` srcset="${set('jpg')}"${sz}` : ''} alt="${esc(alt)}"${attrs ? ' ' + attrs : ''}></picture>`;
}
// Photo uploaded in the admin (content/photos/…) or a bundled photo name.
const isUpload = name => String(name).startsWith('content/');
const thumbPath = p => p.replace(/(\.[a-z0-9]+)$/i, '-thumb$1');
const photo = (base, name, alt, attrs = '', sizes = '') => isUpload(name)
  ? `<img src="${base}${name}" alt="${esc(alt)}"${attrs ? ' ' + attrs : ''}>`
  : pic(base, name, alt, attrs, sizes);

const priceHtml = (p, t) => p == null
  ? `<span class="price-tbc" title="${esc(t.priceTbc)}">—<span class="visually-hidden"> ${esc(t.priceTbc)}</span></span>`
  : `${p} ${esc(t.lyd)}`;

const divider = base => `<div class="section-divider" aria-hidden="true"><span class="line"></span>${pic(base, 'logo-gold', '', 'width="56" height="40" loading="lazy" decoding="async"').replace('logo-gold.jpg', 'logo-gold.png')}<span class="line"></span></div>`;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const otherLang = lang => (lang === 'en' ? 'ar' : 'en');

function nav(t, page) {
  const hrefs = page === 'menu'
    ? ['index.html#about', 'menu.html', 'index.html#gallery', 'index.html#contact', 'index.html#reserve']
    : ['#about', 'menu.html', '#gallery', '#contact', '#reserve'];
  return t.nav.map((label, i) => `<a href="${hrefs[i]}"${page === 'menu' && i === 1 ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
}

function heroSlides(base) {
  return heroList.map((name, i) => {
    if (isUpload(name)) return i === 0
      ? `<img class="hero-slide is-active" src="${base}${name}" alt="" width="1280" height="720" fetchpriority="high" decoding="async" data-hero-slide>`
      : `<img class="hero-slide" data-src="${base}${name}" alt="" width="1280" height="720" decoding="async" data-hero-slide>`;
    return i === 0
      ? `<picture><source type="image/webp" srcset="${base}img/${name}.webp"><img class="hero-slide is-active" src="${base}img/${name}.jpg" alt="" width="1280" height="720" fetchpriority="high" decoding="async" data-hero-slide></picture>`
      : `<picture><source type="image/webp" data-srcset="${base}img/${name}.webp"><img class="hero-slide" data-src="${base}img/${name}.jpg" alt="" width="1280" height="720" decoding="async" data-hero-slide></picture>`;
  }).join('\n  ');
}
const heroPreload = base => isUpload(heroList[0])
  ? `<link rel="preload" as="image" href="${base}${heroList[0]}" fetchpriority="high">`
  : `<link rel="preload" as="image" href="${base}img/${heroList[0]}.webp" type="image/webp" fetchpriority="high">`;
// The «Our story» block: photo and copy come from content/site.json when set there.
const aboutPhoto = (base, t) => photo(base, story.img || 'interior-booth', t.aboutAlt, 'loading="lazy" decoding="async"');
const storyText = (lang, t) => ({ title: (story.title && story.title[lang]) || t.storyTitle, text: (story.text && story.text[lang]) || t.story });
const socialLinks = t => [
  `<a href="${esc(social.facebook)}" target="_blank" rel="noopener" aria-label="${esc(t.facebook)}" class="social-btn">f</a>`,
  social.instagram ? `<a href="${esc(social.instagram)}" target="_blank" rel="noopener" aria-label="${esc(t.instagram)}" class="social-btn social-btn--ig"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>` : '',
].join('\n    ');

const heroDots = t => heroList.map((_, i) =>
  `<button type="button" class="hero-dot${i === 0 ? ' is-active' : ''}" aria-label="${esc(t.showSlide)} ${i + 1}" data-dot="${i}"></button>`).join('');

const trust = t => t.trust.map(s => `<span>${esc(s)}</span>`).join('<span aria-hidden="true">·</span>');

function signatureCards(branch, lang, t, base) {
  const cards = branch.signature.map(s => ({ s, item: findItem(s.ref, branch.menu) })).filter(({ s, item }) => {
    if (!item) console.warn(`  ${branch.id}: signature dish ${s.ref} is not on the menu (hidden or removed), skipped`);
    return item;
  });
  return cards.map(({ s, item }, k) => {
    const name = item[lang];
    const desc = lang === 'en' ? item.den : item.dar;
    const img = item.img && isUpload(item.img) ? item.img : s.img;
    return `<article class="dish-card${k === 0 ? ' featured' : ''}">
      <div class="dish-frame"><div class="dish-photo">${photo(base, img, name, `loading="lazy" decoding="async"${s.pos && img === s.img ? ` style="object-position:${s.pos}"` : ''}`, k === 0 ? '(min-width: 860px) 62vw, 100vw' : '(min-width: 860px) 31vw, 100vw')}<span class="dish-num" aria-hidden="true">${ROMAN[k]}</span></div></div>
      <div class="dish-body">
        <div class="dish-title-row"><h3 class="serif dish-name">${esc(name)}</h3><span class="dish-leader" aria-hidden="true"></span><span class="dish-price">${priceHtml(item.price, t)}</span></div>
        <p class="dish-desc">${esc(desc || '')}</p>
      </div>
    </article>`;
  }).join('\n    ');
}

function stats(branch, t) {
  const menu = branch.menu;
  const food = menu.filter(c => !c.drinks).reduce((n, c) => n + itemsOf(c).length, 0);
  const cells = [[String(menu.length), t.statCategories], [`${Math.floor(food / 10) * 10}+`, t.statDishes], [t.statKidsBig, t.statKids]];
  return cells.map(([big, label]) => `<div class="stat-card"><div class="stat-big"><bdi>${esc(big)}</bdi></div><div class="stat-label">${esc(label)}</div></div>`).join('\n    ');
}

const whyCards = t => t.why.map(([title, desc], i) =>
  `<div class="why-card"><div class="why-num" aria-hidden="true">${ROMAN[i]}</div><h3 class="serif">${esc(title)}</h3><p>${esc(desc)}</p></div>`).join('\n      ');

const gallery = (lang, t, base) => galleryList.map((g, i) =>
  `<figure class="gallery-figure" data-index="${i}" role="button" tabindex="0" aria-label="${esc(t.viewPhoto + ' ' + (g[lang] || g[otherLang(lang)] || ''))}">${photo(base, g.img, '', 'loading="lazy" decoding="async"', i % 8 === 0 ? '(min-width: 720px) 50vw, 50vw' : '(min-width: 720px) 25vw, 50vw')}<figcaption>${esc(g[lang] || g[otherLang(lang)] || '')}</figcaption></figure>`).join('\n      ');

const menuTabs = (menu, lang) => menu.map(c => `<a class="menu-tab" href="#${c.id}" data-cat="${c.id}">${esc(c[lang])}</a>`).join('');

function menuItems(items, lang, t, level) {
  const alt = otherLang(lang);
  return `<div class="menu-items">${items.map(it => {
    const desc = lang === 'en' ? it.den : it.dar;
    const badge = it.isNew ? ` <span class="menu-badge">${esc(t.newBadge)}</span>` : '';
    const full = it.img ? (isUpload(it.img) ? it.img : `img/${it.img}.jpg`) : '';
    const thumb = it.img ? (isUpload(it.img) ? thumbPath(it.img) : `img/${it.img}.jpg`) : '';
    const photoBtn = it.img ? `<button type="button" class="menu-thumb" data-full="${base_(full)}" aria-label="${esc(t.viewPhoto)} ${esc(it[lang])}"><img src="${base_(thumb)}" alt="" width="72" height="72" loading="lazy" decoding="async"></button>` : '';
    return `<div class="menu-item${it.img ? ' menu-item--photo' : ''}">${photoBtn}<div class="menu-item-body">
          <div class="menu-item-row"><h${level} class="serif menu-item-name">${esc(it[lang])}${badge}</h${level}><span class="menu-item-leader" aria-hidden="true"></span><span class="menu-item-price">${priceHtml(it.price, t)}</span></div>
          <div class="menu-item-alt" lang="${alt}" dir="${STRINGS[alt].dir}">${esc(it[alt])}</div>${desc ? `\n          <p class="menu-item-desc">${esc(desc)}</p>` : ''}
        </div></div>`;
  }).join('\n        ')}</div>`;
}
let base_ = p => p; // set per page so menuItems can prefix relative photo paths

function menuPanels(menu, lang, t, base) {
  const alt = otherLang(lang);
  base_ = p => base + p;
  return menu.map(c => {
    const name = c[lang];
    const body = c.groups
      ? c.groups.map(g => `<h3 class="menu-group">${esc(g[lang])} <span lang="${alt}" dir="${STRINGS[alt].dir}">${esc(g[alt])}</span></h3>\n      ${menuItems(g.items, lang, t, 4)}`).join('\n      ')
      : menuItems(c.items, lang, t, 3);
    const figure = c.img
      ? `<figure class="menu-figure">${photo(base, c.img, name, 'loading="lazy" decoding="async"', '(min-width: 761px) 32vw, 100vw')}<figcaption>${esc(name)}</figcaption></figure>`
      : `<figure class="menu-figure menu-figure--brand" aria-hidden="true"><div class="menu-brand">${pic(base, 'logo-cream', '', 'loading="lazy" decoding="async"').replace('logo-cream.jpg', 'logo-cream.png')}<span class="serif">${esc(name)}</span></div></figure>`;
    return `<section class="menu-panel" id="${c.id}" aria-labelledby="h-${c.id}">
    <div class="menu-list-wrap">
      <div class="menu-cat-head"><h2 class="serif menu-cat-title" id="h-${c.id}">${esc(name)}</h2><span class="menu-cat-alt" lang="${alt}" dir="${STRINGS[alt].dir}">${esc(c[alt])}</span></div>
      ${body}
    </div>
    ${figure}
  </section>`;
  }).join('\n  ');
}

const json = o => JSON.stringify(o).replace(/</g, '\\u003c');

function restaurantLd(branch, lang) {
  const c = branch.contact;
  return json({
    '@context': 'https://schema.org', '@type': 'Restaurant',
    name: `${STRINGS.en.siteName} — ${branch.en}`, alternateName: `${STRINGS.ar.siteName} — ${branch.ar}`,
    url: branchUrl(branch, lang), image: SITE + 'img/og-image.jpg', logo: SITE + 'img/logo-burgundy.png',
    telephone: c.phoneTel, servesCuisine: 'Italian', priceRange: '$$', acceptsReservations: 'True',
    hasMenu: branchUrl(branch, lang) + 'menu.html',
    address: { '@type': 'PostalAddress', streetAddress: branch.info.findTitle.en, addressLocality: 'Benghazi', addressCountry: 'LY' },
    sameAs,
  });
}

function menuLd(branch, lang, t) {
  const offer = p => ({ '@type': 'Offer', price: p, priceCurrency: 'LYD' });
  return json({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Menu', name: `${t.menuHeading} — ${branch[lang]}`, inLanguage: lang, url: branchUrl(branch, lang) + 'menu.html',
        hasMenuSection: branch.menu.map(c => ({
          '@type': 'MenuSection', name: c[lang],
          hasMenuItem: itemsOf(c).map(it => ({
            '@type': 'MenuItem', name: it[lang],
            ...((lang === 'en' ? it.den : it.dar) ? { description: lang === 'en' ? it.den : it.dar } : {}),
            ...(it.img && isUpload(it.img) ? { image: SITE + it.img } : {}),
            ...(it.price == null ? {} : { offers: offer(it.price) }),
          })),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.homeIcon, item: branchUrl(branch, lang) },
          { '@type': 'ListItem', position: 2, name: t.menuHeading, item: branchUrl(branch, lang) + 'menu.html' },
        ],
      },
    ],
  });
}

const fontsHref = lang => lang === 'ar'
  ? 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@500;600&family=Tajawal:wght@400;500;700&display=swap'
  : 'https://fonts.googleapis.com/css2?family=Lustria&family=Montserrat:wght@400;500;600&family=Tajawal:wght@400;500&display=swap';

function pageContext(branch, lang, page) {
  const t = STRINGS[lang];
  const base = lang === 'en' ? '../' : '../../';
  const file = page === 'menu' ? 'menu.html' : '';
  const url = l => branchUrl(branch, l) + file;
  const isMenu = page === 'menu';
  const vars = { branch: branch[lang] };
  const other = branches.find(b => b.id !== branch.id);
  const catNames = branch.menu.map(c => c[lang]).join(lang === 'ar' ? '، ' : ', ');
  const info = branch.info;
  const contact = {
    ...branch.contact,
    address: info.address[lang], findTitle: info.findTitle[lang], findSub: info.findSub[lang],
    hours: (info.hours && info.hours[lang]) || t.hours, area: (info.area && info.area[lang]) || info.findTitle[lang],
  };
  const pdfSize = branch.pdf ? `${(fs.statSync(path.join(ROOT, 'assets', branch.pdf)).size / 1024 / 1024).toFixed(1)} MB` : '';
  return {
    lang, t, base, contact, branch, branchName: branch[lang],
    title: fill(isMenu ? t.menuTitle : t.homeTitle, vars),
    description: isMenu ? `${fill(t.menuDescLead, vars)}${catNames}.` : fill(t.homeDesc, { area: contact.area, phone: contact.phoneDisplay }),
    ogTitle: fill(isMenu ? t.menuOgTitle : t.homeTitle, vars),
    ogDescription: isMenu ? t.menuOgDesc : t.homeOgDesc,
    canonical: url(lang), ogImage: SITE + 'img/og-image.jpg', altLocale: STRINGS[otherLang(lang)].locale,
    hreflang: [`<link rel="alternate" hreflang="en" href="${url('en')}">`, `<link rel="alternate" hreflang="ar" href="${url('ar')}">`, `<link rel="alternate" hreflang="x-default" href="${url('en')}">`].join('\n'),
    preload: isMenu ? '' : heroPreload(base),
    aboutPhoto: aboutPhoto(base, t), storyTitle: storyText(lang, t).title, storyText: storyText(lang, t).text, socialLinks: socialLinks(t),
    fontsHref: fontsHref(lang),
    jsonLd: isMenu ? menuLd(branch, lang, t) : restaurantLd(branch, lang),
    nav: nav(t, page),
    iconMenuHref: isMenu ? 'index.html' : 'menu.html', iconMenuLabel: isMenu ? t.homeIcon : t.menuIcon,
    homeHref: isMenu ? 'index.html' : '',
    logoHref: isMenu ? 'index.html' : '#top', logoLabel: isMenu ? t.logoToHome : t.logoHome,
    switchHref: (lang === 'en' ? 'ar/' : '../') + file,
    arrowPrev: t.dir === 'rtl' ? '›' : '‹', arrowNext: t.dir === 'rtl' ? '‹' : '›',
    divider: divider(base),
    heroSlides: heroSlides(base), heroDots: heroDots(t), trust: trust(t),
    heroKicker: `<p class="hero-kicker"><span>${esc(fill(t.branchOf, vars))}</span><a href="${base}#${lang}">${esc(t.switchBranch)}</a></p>`,
    signatureCards: signatureCards(branch, lang, t, base), stats: stats(branch, t), whyCards: whyCards(t),
    gallery: gallery(lang, t, base),
    sent: t.sentHtml.replace('{wa}', esc(contact.whatsapp)).replace('{tel}', esc(contact.phoneTel)).replace('{phone}', esc(contact.phoneDisplay)),
    menuTabs: menuTabs(branch.menu, lang), menuPanels: menuPanels(branch.menu, lang, t, base),
    menuBranch: `<p class="menu-branch">${esc(fill(t.menuBranchNote, vars))} <a href="${base}${other.id}/${LANGS[lang]}menu.html">${esc(fill(t.menuOtherBranch, { branch: other[lang] }))}</a></p>`,
    chefLine: branch.chef ? `<p class="menu-chef">${esc(t.chefLine).replace('{chef}', `<bdi dir="ltr">${esc(branch.chef)}</bdi>`)}</p>` : '',
    pdfButton: branch.pdf ? `<a href="${base}assets/${branch.pdf}" download="${branch.pdf}" class="btn btn-sm btn-outline-gold menu-pdf">↓ ${esc(t.pdf)} <span class="visually-hidden">(${pdfSize} ${esc(t.download)})</span></a>` : '',
    footerBranches: `<div class="footer-branches">${esc(t.branchesLabel)}: ${branches.map(b => b.id === branch.id ? `<strong>${esc(b[lang])}</strong>` : `<a href="${base}${b.id}/${LANGS[lang]}${file}">${esc(b[lang])}</a>`).join(' <span aria-hidden="true">·</span> ')}</div>`,
  };
}

// The root page: pick a language, then a branch. Works without JavaScript (CSS :target).
function gateContext() {
  const en = STRINGS.en, ar = STRINGS.ar;
  const choices = lang => branches.map(b =>
    `<a href="${b.id}/${LANGS[lang]}" class="gate-choice gate-choice--branch" hreflang="${lang}"><span class="serif">${esc(b[lang])}</span><small>${esc(lang === 'en' ? b.placeEn : b.placeAr)}</small></a>`).join('\n      ');
  return {
    en, ar, title: en.gateTitle, description: en.gateDesc, canonical: SITE, ogImage: SITE + 'img/og-image.jpg',
    jsonLd: json({
      '@context': 'https://schema.org', '@type': 'Restaurant',
      name: en.siteName, alternateName: ar.siteName, url: SITE, image: SITE + 'img/og-image.jpg', logo: SITE + 'img/logo-burgundy.png',
      servesCuisine: 'Italian', priceRange: '$$', sameAs,
    }),
    branchesEn: choices('en'), branchesAr: choices('ar'),
  };
}

// Old URLs (before branches) keep working: they land on the Markabaat pages.
const redirect = to => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${to}"><title>Flaminio</title>
<script>location.replace(${JSON.stringify(to)} + location.hash)</script></head>
<body><a href="${to}">${to}</a></body></html>
`;

function copy(src, dest) {
  const s = fs.statSync(src);
  if (s.isDirectory()) { fs.mkdirSync(dest, { recursive: true }); for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dest, f)); }
  else fs.copyFileSync(src, dest);
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const url = (loc, priority, alternates = '') => `  <url>
    <loc>${loc}</loc>
${alternates}    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`;
  const entries = [url(SITE, '1.0')];
  for (const b of branches) for (const [file, priority] of [['', '0.9'], ['menu.html', '0.9']]) for (const lang of Object.keys(LANGS)) {
    const alternates = Object.keys(LANGS).map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${branchUrl(b, l) + file}"/>\n`).join('')
      + `    <xhtml:link rel="alternate" hreflang="x-default" href="${branchUrl(b, 'en') + file}"/>\n`;
    entries.push(url(branchUrl(b, lang) + file, priority, alternates));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const item of STATIC) copy(path.join(ROOT, item), path.join(OUT, item));
if (fs.existsSync(path.join(ROOT, 'content/photos'))) copy(path.join(ROOT, 'content/photos'), path.join(OUT, 'content/photos'));
// The admin's password lock is public data (encrypted key); publish it so the admin can read it from the site itself too.
if (fs.existsSync(path.join(ROOT, 'content/admin-lock.json'))) { fs.mkdirSync(path.join(OUT, 'content'), { recursive: true }); fs.copyFileSync(path.join(ROOT, 'content/admin-lock.json'), path.join(OUT, 'content/admin-lock.json')); }
const tpl = name => fs.readFileSync(path.join(ROOT, `src/${name}.html`), 'utf8');
for (const branch of branches) {
  for (const lang of Object.keys(LANGS)) {
    const dir = path.join(OUT, branch.id, LANGS[lang]);
    fs.mkdirSync(dir, { recursive: true });
    for (const page of ['index', 'menu']) {
      fs.writeFileSync(path.join(dir, `${page}.html`), render(tpl(page), pageContext(branch, lang, page), `${branch.id}/${lang}/${page}`));
    }
  }
}
fs.writeFileSync(path.join(OUT, 'index.html'), render(tpl('gate'), gateContext(), 'gate'));
fs.writeFileSync(path.join(OUT, 'menu.html'), redirect('markabaat/menu.html'));
fs.mkdirSync(path.join(OUT, 'ar'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'ar', 'index.html'), redirect('../markabaat/ar/'));
fs.writeFileSync(path.join(OUT, 'ar', 'menu.html'), redirect('../markabaat/ar/menu.html'));
fs.writeFileSync(path.join(OUT, '404.html'), render(tpl('404'), {
  basePath: BASE_PATH,
  linksEn: [`<a class="a" href="${BASE_PATH}">Home</a>`, ...branches.map(b => `<a class="b" href="${BASE_PATH}${b.id}/menu.html">${esc(b.en)} menu</a>`)].join('\n      '),
  linksAr: [`<a class="a" href="${BASE_PATH}#ar">الرئيسية</a>`, ...branches.map(b => `<a class="b" href="${BASE_PATH}${b.id}/ar/menu.html">قائمة فرع ${esc(b.ar)}</a>`)].join('\n      '),
}, '404'));
// The admin page: static files plus a small config with the repository to write to.
copy(path.join(ROOT, 'admin'), path.join(OUT, 'admin'));
fs.writeFileSync(path.join(OUT, 'admin', 'config.js'), `window.FLAMINIO_ADMIN = ${json({
  repo: CONFIG.repo, branch: CONFIG.branch || 'main', siteUrl: SITE,
  branches: branches.map(b => ({ id: b.id, en: b.en, ar: b.ar, placeAr: b.placeAr, placeEn: b.placeEn })),
})};\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: ${BASE_PATH}admin/\n\nSitemap: ${SITE}sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap());
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`Built ${SITE} → dist/ (${branches.map(b => b.id).join(', ')} × ${Object.keys(LANGS).join(', ')} + admin)`);
