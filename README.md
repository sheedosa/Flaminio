# Flaminio Italian Restaurant

Website for Flaminio Italian Restaurant — Al-Hawari, Benghazi, Libya.

**Live site:** https://sheedosa.github.io/Flaminio/

## Pages

- `index.html` — home: hero carousel, signature dishes, our story, why Flaminio, gallery with lightbox, location & contact, reservation request
- `menu.html` — full menu across 15 categories with a downloadable PDF

## Stack

Plain HTML, CSS and vanilla JavaScript (ES modules). No framework, no build step.

```
index.html          home page
menu.html           menu page
404.html            branded not-found page (served by GitHub Pages)
css/style.css       all styles
js/data.js          all content — copy, prices, photo paths, full menu
js/common.js        nav, language note, fade-in on scroll, swipe helper
js/home.js          hero carousel, gallery grid + lightbox, reservation form
js/menu.js          menu category tabs
img/                photography (JPEG + WebP), logo variants, og-image.jpg
img/icons/          favicons and app icons generated from the logo mark
assets/             downloadable menu PDF
robots.txt, sitemap.xml, site.webmanifest, favicon.ico
```

## Performance and SEO

- Every photo ships as WebP with a JPEG fallback via `<picture>`; only the first hero slide loads up front, the rest are fetched just before they show.
- Below-the-fold images are lazy-loaded; logos carry width/height to avoid layout shift.
- Each page has a canonical URL, Open Graph and Twitter Card tags (sharing uses `img/og-image.jpg`), and JSON-LD structured data (`Restaurant` on the home page).
- Mobile: compact sticky header, 16px form inputs (no iOS zoom-on-focus), swipe on the carousel and lightbox, 24px+ tap targets, `prefers-reduced-motion` respected.

## Editing content

Copy, prices and photo assignments all live in `js/data.js` — edit there and both
pages update. Menu items use `price: null` to render "—" (price on request).

## Running locally

The pages load JavaScript as ES modules, so they need to be served over HTTP
rather than opened directly from the filesystem:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Notes

- The language toggle shows an "Arabic — coming soon" note; Arabic copy is not yet wired up.
- The reservation form confirms in the browser only — it does not send anything to a server yet.
- Opening hours and the map panel are placeholders pending final details.
