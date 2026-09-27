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

The two branches share the design, copy and gallery; each has its own menu, contact
details and signature dishes.

```
content/             EDITED IN THE ADMIN PAGE (/admin/): branches.json (phone, WhatsApp,
                     address, hours, chef per branch), menu-<branch>.json (categories and
                     dishes with prices, EN + AR names/descriptions, "new"/hidden flags,
                     photo paths) and photos/ (dish and category photos uploaded there)
admin/               the owner's editor: Arabic, one shared access key, saves straight into
                     this repository through the GitHub API (one commit per save)
js/data.js           code-owned content: hero and gallery photos, Facebook link, BRANCHES
                     (ids, names, front-page labels, signature dish refs)
js/i18n.js           interface copy in English and Arabic
src/*.html           page templates ({{token}} placeholders) + shared head/header/footer;
                     gate.html is the language + branch chooser at /
scripts/build.mjs    merges content/ with data.js and renders dist/ — the gate at /, then
                     /<branch>/ and /<branch>/ar/, /admin/, redirects, sitemap and robots.txt
scripts/migrate-content.mjs  the one-time export that created content/ (kept for reference)
site.config.json     the public site URL (change this when the custom domain goes live)
css/style.css        all styles; logical properties so Arabic mirrors automatically
js/home.js, menu.js  interaction only: carousel, gallery, lightbox, WhatsApp booking, menu tabs
img/                 photos (JPEG + WebP, full size and -480 thumbnails), logos, og-image.jpg
assets/              downloadable menu PDF
```

## Editing content

- **Prices, dishes, photos, branch details:** use the admin page at `/admin/` (Arabic,
  needs the owner's access key). It edits `content/*.json` and `content/photos/` and commits
  to `main`; GitHub Pages republishes within about a minute. The same files can be edited by
  hand in a pull request: price is a number in LYD or `null` for "—", `isNew` shows the badge,
  `hidden` keeps a dish off the site, `img` is a bundled photo name or a `content/photos/…`
  path (with a matching `-thumb.jpg`). Item `id`s are stable keys; never change them.
- **Signature dishes:** `BRANCHES[].signature` in `js/data.js` references dishes by
  `'category-id/item-id'`; a hidden or removed dish is skipped with a build warning.
- **Branches:** `BRANCHES` in `js/data.js` (ids, names, front-page labels, signature dishes)
  plus an entry per branch in `content/branches.json`. Adding a branch to both builds a full
  site for it.
- **Category photo:** `img` on the category; `null` shows the branded burgundy panel.
- **New photo:** add `img/<name>.jpg` and `img/<name>.webp` (plus `-480` versions and an entry
  in `img/widths.json` for responsive loading).
- **Interface copy:** `js/i18n.js`.

## The admin page

`/admin/` is a static page that talks to the GitHub API from the browser. Day to day it opens
with a **password**. Behind it is a fine-grained personal access token limited to this
repository (**Contents: read and write**, **Actions: read**), stored only in encrypted form in
`content/admin-lock.json` (PBKDF2-SHA256 with 1,000,000 rounds → AES-256-GCM). To set or
reset the password, open `/admin/#setup`, paste the token and choose a password (three words
or 14+ characters are required). Deleting the token on GitHub locks everyone out at once.
`site.config.json` holds the repository and branch it writes to. The page is excluded from
the sitemap and blocked in robots.txt.

`tests/admin-e2e.mjs` drives the admin against the real GitHub API (setup, password login,
edits, photo upload, save, read-back). It is meant to run from a throwaway branch with a
workflow that serves `dist/` and targets a disposable branch; it never writes to `main`.

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

- Contact details are per branch (`BRANCHES[].contact` in `js/data.js`): Markabaat 091-0181666,
  Downtown 093-5433335 on Venezia Street. Still needed for Downtown: the exact Google Maps pin
  (the map currently searches "Venezia Street, Benghazi"), opening hours, a menu PDF, a price for
  the Burrata pizza, descriptions for the new dishes, and desserts/drinks if they are served.

- Real opening hours and the Google Maps pin for the restaurant (the site currently asks
  guests to call for hours and searches for "Asayel Resort").
- Native-speaker review of all Arabic copy on `/ar/`.
- Photos still needed: mixed grill, desserts, coffee and drinks (those categories use the branded
  panel), and ideally an exterior/entrance shot.
