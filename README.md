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
css/style.css       all styles
js/data.js          all content — copy, prices, photo paths, full menu
js/common.js        nav, language note, fade-in on scroll
js/home.js          hero carousel, gallery grid + lightbox, reservation form
js/menu.js          menu category tabs
img/                photography and logo variants
assets/             downloadable menu PDF
```

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
