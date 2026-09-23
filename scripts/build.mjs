// Renders the site into dist/: English at the root, Arabic under /ar/.
// Usage: node scripts/build.mjs   (no dependencies; Node 18+)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTACT, HERO, SIGNATURE, GALLERY, MENU, itemsOf, findItem } from '../js/data.js';
import { STRINGS } from '../js/i18n.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'dist');
const { siteUrl } = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const SITE = siteUrl.replace(/\/?$/, '/');
const BASE_PATH = new URL(SITE).pathname;
const LANGS = { en: '', ar: 'ar/' };
const STATIC = ['css', 'js', 'img', 'assets', 'favicon.ico', 'site.webmanifest'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (ctx, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ctx);

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

// With `sizes`, photos that have a 480px thumbnail get a responsive srcset.
function pic(base, name, alt, attrs = '', sizes = '') {
  const w = WIDTHS[name];
  const responsive = sizes && w > 480;
  const set = ext => responsive ? `${base}img/${name}-480.${ext} 480w, ${base}img/${name}.${ext} ${w}w` : `${base}img/${name}.${ext}`;
  const sz = responsive ? ` sizes="${sizes}"` : '';
  return `<picture><source type="image/webp" srcset="${set('webp')}"${sz}><img src="${base}img/${name}.jpg"${responsive ? ` srcset="${set('jpg')}"${sz}` : ''} alt="${esc(alt)}"${attrs ? ' ' + attrs : ''}></picture>`;
}

const priceHtml = (p, t) => `${p} ${esc(t.lyd)}`;

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
  return HERO.map((name, i) => i === 0
    ? `<picture><source type="image/webp" srcset="${base}img/${name}.webp"><img class="hero-slide is-active" src="${base}img/${name}.jpg" alt="" width="1280" height="720" fetchpriority="high" decoding="async" data-hero-slide></picture>`
    : `<picture><source type="image/webp" data-srcset="${base}img/${name}.webp"><img class="hero-slide" data-src="${base}img/${name}.jpg" alt="" width="1280" height="720" decoding="async" data-hero-slide></picture>`
  ).join('\n  ');
}

const heroDots = t => HERO.map((_, i) =>
  `<button type="button" class="hero-dot${i === 0 ? ' is-active' : ''}" aria-label="${esc(t.showSlide)} ${i + 1}" data-dot="${i}"></button>`).join('');

const trust = t => t.trust.map(s => `<span>${esc(s)}</span>`).join('<span aria-hidden="true">·</span>');

function signatureCards(lang, t, base) {
  return SIGNATURE.map((s, k) => {
    const item = findItem(s.ref);
    const name = (lang === 'en' && s.en) || item[lang];
    const desc = lang === 'en' ? item.den : item.dar;
    return `<article class="dish-card${k === 0 ? ' featured' : ''}">
      <div class="dish-frame"><div class="dish-photo">${pic(base, s.img, name, `loading="lazy" decoding="async"${s.pos ? ` style="object-position:${s.pos}"` : ''}`, k === 0 ? '(min-width: 860px) 62vw, 100vw' : '(min-width: 860px) 31vw, 100vw')}<span class="dish-num" aria-hidden="true">${ROMAN[k]}</span></div></div>
      <div class="dish-body">
        <div class="dish-title-row"><h3 class="serif dish-name">${esc(name)}</h3><span class="dish-leader" aria-hidden="true"></span><span class="dish-price">${priceHtml(item.price, t)}</span></div>
        <p class="dish-desc">${esc(desc)}</p>
      </div>
    </article>`;
  }).join('\n    ');
}

function stats(t) {
  const food = MENU.filter(c => !c.drinks).reduce((n, c) => n + itemsOf(c).length, 0);
  const cells = [[String(MENU.length), t.statCategories], [`${Math.floor(food / 10) * 10}+`, t.statDishes], [t.statKidsBig, t.statKids]];
  return cells.map(([big, label]) => `<div class="stat-card"><div class="stat-big"><bdi>${esc(big)}</bdi></div><div class="stat-label">${esc(label)}</div></div>`).join('\n    ');
}

const whyCards = t => t.why.map(([title, desc], i) =>
  `<div class="why-card"><div class="why-num" aria-hidden="true">${ROMAN[i]}</div><h3 class="serif">${esc(title)}</h3><p>${esc(desc)}</p></div>`).join('\n      ');

const gallery = (lang, t, base) => GALLERY.map((g, i) =>
  `<figure class="gallery-figure" data-index="${i}" role="button" tabindex="0" aria-label="${esc(t.viewPhoto + ' ' + g[lang])}">${pic(base, g.img, '', 'loading="lazy" decoding="async"', i % 8 === 0 ? '(min-width: 720px) 50vw, 50vw' : '(min-width: 720px) 25vw, 50vw')}<figcaption>${esc(g[lang])}</figcaption></figure>`).join('\n      ');

const menuTabs = lang => MENU.map(c => `<a class="menu-tab" href="#${c.id}" data-cat="${c.id}">${esc(c[lang])}</a>`).join('');

function menuItems(items, lang, t, level) {
  const alt = otherLang(lang);
  return `<div class="menu-items">${items.map(it => {
    const desc = lang === 'en' ? it.den : it.dar;
    return `<div class="menu-item">
          <div class="menu-item-row"><h${level} class="serif menu-item-name">${esc(it[lang])}</h${level}><span class="menu-item-leader" aria-hidden="true"></span><span class="menu-item-price">${priceHtml(it.price, t)}</span></div>
          <div class="menu-item-alt" lang="${alt}" dir="${STRINGS[alt].dir}">${esc(it[alt])}</div>${desc ? `\n          <p class="menu-item-desc">${esc(desc)}</p>` : ''}
        </div>`;
  }).join('\n        ')}</div>`;
}

function menuPanels(lang, t, base) {
  const alt = otherLang(lang);
  return MENU.map(c => {
    const name = c[lang];
    const body = c.groups
      ? c.groups.map(g => `<h3 class="menu-group">${esc(g[lang])} <span lang="${alt}" dir="${STRINGS[alt].dir}">${esc(g[alt])}</span></h3>\n      ${menuItems(g.items, lang, t, 4)}`).join('\n      ')
      : menuItems(c.items, lang, t, 3);
    const figure = c.img
      ? `<figure class="menu-figure">${pic(base, c.img, name, 'loading="lazy" decoding="async"', '(min-width: 761px) 32vw, 100vw')}<figcaption>${esc(name)}</figcaption></figure>`
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

function restaurantLd(lang) {
  return json({
    '@context': 'https://schema.org', '@type': 'Restaurant',
    name: STRINGS.en.siteName, alternateName: STRINGS.ar.siteName,
    url: SITE + LANGS[lang], image: SITE + 'img/og-image.jpg', logo: SITE + 'img/logo-burgundy.png',
    telephone: CONTACT.phoneTel, servesCuisine: 'Italian', priceRange: '$$', acceptsReservations: 'True',
    hasMenu: SITE + LANGS[lang] + 'menu.html',
    address: { '@type': 'PostalAddress', streetAddress: 'Al-Markabat Street, Al-Hawari, near Asayel Resort', addressLocality: 'Benghazi', addressCountry: 'LY' },
    sameAs: [CONTACT.facebook],
  });
}

function menuLd(lang, t) {
  const offer = p => ({ '@type': 'Offer', price: p, priceCurrency: 'LYD' });
  return json({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Menu', name: t.menuHeading, inLanguage: lang, url: SITE + LANGS[lang] + 'menu.html',
        hasMenuSection: MENU.map(c => ({
          '@type': 'MenuSection', name: c[lang],
          hasMenuItem: itemsOf(c).map(it => ({
            '@type': 'MenuItem', name: it[lang],
            ...((lang === 'en' ? it.den : it.dar) ? { description: lang === 'en' ? it.den : it.dar } : {}),
            ...(it.price == null ? {} : { offers: offer(it.price) }),
          })),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.homeIcon, item: SITE + LANGS[lang] },
          { '@type': 'ListItem', position: 2, name: t.menuHeading, item: SITE + LANGS[lang] + 'menu.html' },
        ],
      },
    ],
  });
}

const fontsHref = lang => lang === 'ar'
  ? 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700&display=swap'
  : 'https://fonts.googleapis.com/css2?family=Lustria&family=Montserrat:wght@400;500;600&family=Tajawal:wght@400;500&display=swap';

function pageContext(lang, page) {
  const t = STRINGS[lang];
  const base = lang === 'en' ? '' : '../';
  const file = page === 'menu' ? 'menu.html' : '';
  const url = l => SITE + LANGS[l] + file;
  const isMenu = page === 'menu';
  const pdfBytes = fs.statSync(path.join(ROOT, 'assets/Flaminio-Menu.pdf')).size;
  return {
    lang, t, base, contact: CONTACT,
    title: isMenu ? t.menuTitle : t.homeTitle,
    description: isMenu ? t.menuDesc : t.homeDesc,
    ogTitle: isMenu ? t.menuOgTitle : t.homeTitle,
    ogDescription: isMenu ? t.menuOgDesc : t.homeOgDesc,
    canonical: url(lang), ogImage: SITE + 'img/og-image.jpg', altLocale: STRINGS[otherLang(lang)].locale,
    hreflang: [`<link rel="alternate" hreflang="en" href="${url('en')}">`, `<link rel="alternate" hreflang="ar" href="${url('ar')}">`, `<link rel="alternate" hreflang="x-default" href="${url('en')}">`].join('\n'),
    preload: isMenu ? '' : `<link rel="preload" as="image" href="${base}img/${HERO[0]}.webp" type="image/webp" fetchpriority="high">`,
    fontsHref: fontsHref(lang),
    jsonLd: isMenu ? menuLd(lang, t) : restaurantLd(lang),
    nav: nav(t, page),
    iconMenuHref: isMenu ? 'index.html' : 'menu.html', iconMenuLabel: isMenu ? t.homeIcon : t.menuIcon,
    homeHref: isMenu ? 'index.html' : '',
    logoHref: isMenu ? 'index.html' : '#top', logoLabel: isMenu ? t.logoToHome : t.logoHome,
    switchHref: (lang === 'en' ? 'ar/' : '../') + file,
    arrowPrev: t.dir === 'rtl' ? '›' : '‹', arrowNext: t.dir === 'rtl' ? '‹' : '›',
    divider: divider(base),
    heroSlides: heroSlides(base), heroDots: heroDots(t), trust: trust(t),
    signatureCards: signatureCards(lang, t, base), stats: stats(t), whyCards: whyCards(t),
    gallery: gallery(lang, t, base),
    sent: t.sentHtml.replace('{wa}', esc(CONTACT.whatsapp)).replace('{tel}', esc(CONTACT.phoneTel)).replace('{phone}', esc(CONTACT.phoneDisplay)),
    menuTabs: menuTabs(lang), menuPanels: menuPanels(lang, t, base),
    pdfSize: `${(pdfBytes / 1024 / 1024).toFixed(1)} MB`,
  };
}

function copy(src, dest) {
  const s = fs.statSync(src);
  if (s.isDirectory()) { fs.mkdirSync(dest, { recursive: true }); for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dest, f)); }
  else fs.copyFileSync(src, dest);
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const entry = (file, priority) => Object.keys(LANGS).map(lang => `  <url>
    <loc>${SITE + LANGS[lang] + file}</loc>
${Object.keys(LANGS).map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE + LANGS[l] + file}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE + file}"/>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry('', '1.0')}
${entry('menu.html', '0.9')}
</urlset>
`;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const item of STATIC) copy(path.join(ROOT, item), path.join(OUT, item));
for (const lang of Object.keys(LANGS)) {
  fs.mkdirSync(path.join(OUT, LANGS[lang]), { recursive: true });
  for (const page of ['index', 'menu']) {
    const tpl = fs.readFileSync(path.join(ROOT, `src/${page}.html`), 'utf8');
    fs.writeFileSync(path.join(OUT, LANGS[lang], `${page}.html`), render(tpl, pageContext(lang, page), `${lang}/${page}`));
  }
}
fs.writeFileSync(path.join(OUT, '404.html'), render(fs.readFileSync(path.join(ROOT, 'src/404.html'), 'utf8'), { basePath: BASE_PATH }, '404'));
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap());
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`Built ${SITE} → dist/ (${Object.keys(LANGS).join(', ')})`);
