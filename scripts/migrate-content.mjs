// One-time migration: writes content/*.json from the menus and branch details that
// used to live in js/data.js. Kept for reference; the admin page and the build now
// work from content/ directly. Usage: node scripts/migrate-content.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data = await import('../js/data.js');
const { STRINGS } = await import('../js/i18n.js');
const out = path.join(ROOT, 'content');
fs.mkdirSync(path.join(out, 'photos'), { recursive: true });

const item = it => {
  const o = { id: it.id, en: it.en, ar: it.ar, price: it.price, den: it.den || '', dar: it.dar || '' };
  if (it.isNew) o.isNew = true;
  return o;
};
const category = c => ({
  id: c.id, en: c.en, ar: c.ar, img: c.img || null,
  ...(c.drinks ? { drinks: true } : {}),
  ...(c.groups ? { groups: c.groups.map(g => ({ en: g.en, ar: g.ar, items: g.items.map(item) })) } : { items: c.items.map(item) }),
});

const digits = s => s.replace(/\D/g, '');
const branches = {};
for (const b of data.BRANCHES) {
  const c = b.contact;
  const phone = '0' + digits(c.phoneTel).replace(/^218/, '');
  const wa = '0' + digits(c.whatsapp).replace(/^218/, '');
  branches[b.id] = {
    phone, whatsapp: wa === phone ? '' : wa,
    maps: c.maps,
    address: { en: c.en.address, ar: c.ar.address },
    findTitle: { en: c.en.findTitle, ar: c.ar.findTitle },
    findSub: { en: c.en.findSub, ar: c.ar.findSub },
    area: { en: c.en.area, ar: c.ar.area },
    hours: { en: STRINGS.en.hours, ar: STRINGS.ar.hours },
    chef: b.chef || '',
    pdf: b.pdf || '',
  };
  fs.writeFileSync(path.join(out, `menu-${b.id}.json`), JSON.stringify(b.menu.map(category), null, 2) + '\n');
}
fs.writeFileSync(path.join(out, 'branches.json'), JSON.stringify(branches, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'photos', '.gitkeep'), '');
console.log('content/ written:', fs.readdirSync(out).join(', '));
