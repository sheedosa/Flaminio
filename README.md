# Flaminio Italian Restaurant

Website for Flaminio Italian Restaurant, Benghazi, Libya. Two branches, English and Arabic.

**Live site:** https://sheedosa.github.io/Flaminio/ — the front page asks for a language, then a branch.

| | English | Arabic |
|---|---|---|
| Markabaat (Al-Hawari) | `/markabaat/` · `/markabaat/menu.html` | `/markabaat/ar/` · `/markabaat/ar/menu.html` |
| Downtown | `/downtown/` · `/downtown/menu.html` | `/downtown/ar/` · `/downtown/ar/menu.html` |

Older links (`/menu.html`, `/ar/`, `/ar/menu.html`) redirect to the Markabaat pages.

## How it works

Static HTML, CSS and vanilla JavaScript. A zero-dependency Node script renders every
page from the content files, so menus, prices and copy live in exactly one place.
GitHub Actions runs the build and publishes `dist/` to GitHub Pages on every push to `main`.

The two branches share everything (design, copy, photos, contact details) except the
menu and the signature dishes on the home page.

```
js/data.js           ALL content: MENU (Markabaat) and MENU_DOWNTOWN with prices and EN + AR
                     names/descriptions, signature dishes per branch, gallery captions, hero
                     photos, contact details, and BRANCHES (names, menu, PDF, chef)
js/i18n.js           interface copy in English and Arabic
src/*.html           page templates ({{token}} placeholders) + shared head/header/footer;
                     gate.html is the language + branch chooser at /
scripts/build.mjs    renders dist/ — the gate at /, then /<branch>/ and /<branch>/ar/ for each
                     branch, redirects for the old URLs, sitemap and robots.txt
site.config.json     the public site URL (change this when the custom domain goes live)
css/style.css        all styles; logical properties so Arabic mirrors automatically
js/home.js, menu.js  interaction only: carousel, gallery, lightbox, WhatsApp booking, menu tabs
img/                 photos (JPEG + WebP, full size and -480 thumbnails), logos, og-image.jpg
assets/              downloadable menu PDF
```

## Editing content

- **Prices, dishes, descriptions:** `js/data.js` → `MENU` (Markabaat) and `MENU_DOWNTOWN`.
  Price is a number in LYD, or `null` for "—" (price on request). Names and descriptions
  follow the restaurant's own menus word for word. Each item has English (`en`, `den`) and
  Arabic (`ar`, `dar`). Wrap an item in `NEW(...)` to show a "New" badge. Downtown items
  created with `from('markabaat-ref', ...)` reuse the Markabaat description of the same dish.
- **Signature dishes:** `SIGNATURE` / `SIGNATURE_DOWNTOWN` reference menu items
  (`'category/item-id'`), so their names and prices always match the menu.
- **Branches:** `BRANCHES` — names in both languages, the menu and signature list, the PDF
  file in `assets/` (or `null` for no PDF button), the executive chef line, and the postal
  address used in structured data. Adding a branch there builds a full site for it.
- **Category photo:** `img` on the category; `null` shows the branded burgundy panel.
- **New photo:** add `img/<name>.jpg` and `img/<name>.webp` (plus `-480` versions and an entry
  in `img/widths.json` for responsive loading).
- **Interface copy:** `js/i18n.js`.

## Running locally

```bash
node scripts/build.mjs
python3 -m http.server 8000 -d dist
```

Then open http://localhost:8000 and pick a language and branch.

## Switching to the custom domain

1. Set `siteUrl` in `site.config.json` to the new address (e.g. `https://example.ly/`) and push.
   Canonical URLs, hreflang, Open Graph, JSON-LD, sitemap, robots.txt and the 404 page all follow.
2. At the domain registrar, add DNS records: four `A` records for the apex pointing to
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a
   `CNAME` for `www` pointing to `sheedosa.github.io`.
3. In the repo: **Settings → Pages → Custom domain**, enter the domain, save, then tick
   **Enforce HTTPS** once the certificate is issued (can take up to an hour).

## Performance, SEO and accessibility

- WebP with JPEG fallback, responsive thumbnails, lazy loading below the fold; only the first
  hero slide loads up front.
- Canonical + hreflang (en / ar / x-default), Open Graph and Twitter cards, `Restaurant` and
  `Menu` JSON-LD with prices in LYD, sitemap with language alternates.
- The full menu is plain HTML: readable without JavaScript and by any crawler. Categories are
  linkable, e.g. `menu.html#pizza`.
- Skip link, visible form labels, keyboard-operable gallery and lightbox, reduced-motion support.

## Open items before launch

- Downtown branch: address, phone/WhatsApp, Google Maps pin and opening hours (the site
  currently shows the Markabaat contact details on both branches), a menu PDF, a price for
  the Burrata pizza, descriptions for the new dishes, and desserts/drinks if they are served.

- Real opening hours and the Google Maps pin for the restaurant (the site currently asks
  guests to call for hours and searches for "Asayel Resort").
- Native-speaker review of all Arabic copy on `/ar/`.
- Photos still needed: mixed grill, desserts, coffee and drinks (those categories use the branded
  panel), and ideally an exterior/entrance shot.
