# Flaminio Italian Restaurant

Website for Flaminio Italian Restaurant — Al-Hawari, Benghazi, Libya. English and Arabic.

**Live site:** https://sheedosa.github.io/Flaminio/ · Arabic: https://sheedosa.github.io/Flaminio/ar/

## How it works

Static HTML, CSS and vanilla JavaScript. A zero-dependency Node script renders every
page from the content files, so menu, prices and copy live in exactly one place.
GitHub Actions runs the build and publishes `dist/` to GitHub Pages on every push to `main`.

```
js/data.js           ALL content: menu (prices, EN + AR names/descriptions), signature dishes,
                     gallery captions, hero photos, contact details
js/i18n.js           interface copy in English and Arabic
src/*.html           page templates ({{token}} placeholders) + shared head/header/footer
scripts/build.mjs    renders dist/ — English at /, Arabic at /ar/, plus sitemap and robots.txt
site.config.json     the public site URL (change this when the custom domain goes live)
css/style.css        all styles; logical properties so Arabic mirrors automatically
js/home.js, menu.js  interaction only: carousel, gallery, lightbox, WhatsApp booking, menu tabs
img/                 photos (JPEG + WebP, full size and -480 thumbnails), logos, og-image.jpg
assets/              downloadable menu PDF
```

## Editing content

- **Prices, dishes, descriptions:** `js/data.js` → `MENU`. Price is a number, `[small, large]`
  for two sizes, or `null` for "—". Each item has English (`en`, `den`) and Arabic (`ar`, `dar`).
- **Signature dishes:** `SIGNATURE` references menu items (`'category/item-id'`), so their
  names and prices always match the menu.
- **Category photo:** `img` on the category; `null` shows the branded burgundy panel.
- **New photo:** add `img/<name>.jpg` and `img/<name>.webp` (plus `-480` versions and an entry
  in `img/widths.json` for responsive loading).
- **Interface copy:** `js/i18n.js`.

## Running locally

```bash
node scripts/build.mjs
python3 -m http.server 8000 -d dist
```

Then open http://localhost:8000 (English) or http://localhost:8000/ar/ (Arabic).

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

- Real opening hours and the Google Maps pin for the restaurant (the site currently asks
  guests to call for hours and searches for "Asayel Resort").
- Native-speaker review of all Arabic copy on `/ar/`.
- Photos still needed: mixed grill, desserts, coffee and drinks (those categories use the branded
  panel), and ideally an exterior/entrance shot.
