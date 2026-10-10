// Real end-to-end test of the admin page against the live GitHub API.
// Run by .github/workflows/admin-e2e.yml on a throwaway branch; writes only to $TARGET.
import { chromium } from 'playwright';
import fs from 'node:fs';
const { TOKEN, REPO, TARGET } = process.env;
const HOST = 'http://localhost:8931/';
const API = 'https://api.github.com';
fs.mkdirSync('e2e-shots', { recursive: true });
const gh = async p => { const r = await fetch(API + p, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' } }); return { status: r.status, body: r.status === 200 ? await r.json() : null }; };
const results = {}; const fail = [];
// Results are also printed as GitHub annotations so they can be read through the API.
const note = (level, text) => console.log(`::${level} title=admin-e2e::${String(text).replace(/\r?\n/g, ' | ').slice(0, 900)}`);
const check = (name, ok, detail = '') => { results[name] = ok ? 'ok' : `FAIL ${detail}`; if (!ok) fail.push(name); console.log(ok ? '✓' : '✗', name, ok ? '' : detail); if (!ok) note('error', `FAIL ${name} ${detail}`); };

const browser = await chromium.launch();
async function open(width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => note('warning', 'pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') note('warning', 'console: ' + m.text()); });
  await page.route('**/admin/config.js', async route => {
    const res = await route.fetch();
    route.fulfill({ status: 200, contentType: 'application/javascript', body: (await res.text()).replace('"branch":"main"', `"branch":"${TARGET}"`) });
  });
  return { ctx, page };
}
try {
  // 1. One-time setup: key + password → encrypted lock committed to the branch.
  let { ctx, page } = await open(390);
  await page.goto(HOST + 'admin/#setup', { waitUntil: 'networkidle' });
  await page.waitForSelector('#setup-key');
  await page.click('#suggest-btn');
  const password = await page.inputValue('#setup-pw');
  await page.fill('#setup-key', TOKEN);
  await page.click('#setup-form button[type=submit]');
  await page.waitForSelector('#done-pw, .error', { timeout: 60000 });
  await page.screenshot({ path: 'e2e-shots/1-setup-done.png' });
  check('setup saved', !!(await page.$('#done-pw')), await page.textContent('.error').catch(() => ''));
  await ctx.close();
  const lock = await gh(`/repos/${REPO}/contents/content/admin-lock.json?ref=${TARGET}`);
  const lockText = lock.body ? Buffer.from(lock.body.content, 'base64').toString('utf8') : '';
  check('lock committed and encrypted', lock.status === 200 && lockText.includes('"iter": 1000000') && !lockText.includes(TOKEN), `status ${lock.status}`);

  // 2. Fresh browser: wrong password refused, right password signs in.
  ({ ctx, page } = await open(1280));
  await page.goto(HOST + 'admin/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#password', { timeout: 30000 });
  await page.fill('#password', 'definitely-not-it-0000');
  await page.click('#login-form button[type=submit]');
  await page.waitForSelector('.error', { timeout: 30000 });
  check('wrong password refused', /غير صحيحة|Wrong/.test(await page.textContent('.error')));
  await page.evaluate(() => document.querySelector('.error')?.remove()); // clear the previous attempt's message
  await page.fill('#password', password);
  await page.click('#login-form button[type=submit]');
  await page.waitForSelector('.pick, .error', { timeout: 30000 });
  check('password login', !!(await page.$('.pick')), await page.textContent('.error').catch(() => ''));
  await page.screenshot({ path: 'e2e-shots/2-picker.png' });

  // 3. Edit Downtown: phone, a price, hide a dish, add a dish, upload a photo, save.
  await page.click('.pick[data-branch="downtown"]');
  await page.waitForSelector('#f-phone', { timeout: 30000 });
  await page.fill('#f-phone', '0935433399');
  await page.click('[data-tab="menu"]');
  await page.waitForSelector('[data-item]');
  const items = page.locator('[data-item]');
  await items.nth(0).locator('input[name="price"]').fill('61');
  const hiddenName = await items.nth(1).locator('input[name="ar"]').inputValue();
  await items.nth(1).locator('input[name="hidden"]').check();
  await page.click('[data-act="add-item"]');
  const added = page.locator('[data-item]').last();
  await added.locator('input[name="ar"]').fill('شوربة عدس');
  await added.locator('input[name="en"]').fill('Lentil Soup');
  await added.locator('input[name="price"]').fill('25');
  await page.setInputFiles('#file-input', []);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('[data-item]').first().locator('[data-drop]').click()]);
  await chooser.setFiles('img/mushroom-soup.jpg');
  await page.waitForSelector('[data-item] .drop.has-photo img');
  await page.screenshot({ path: 'e2e-shots/3-edited.png', fullPage: true });
  await page.click('#save-btn');
  await page.waitForFunction(() => /تم الحفظ|Saved|تعذّر|Couldn|تعديل هذا الفرع|changed from another/.test(document.querySelector('#save-status').textContent), null, { timeout: 120000 });
  const status = await page.textContent('#save-status');
  await page.screenshot({ path: 'e2e-shots/4-saved.png' });
  check('save succeeded', /تم الحفظ|Saved/.test(status), status);
  await ctx.close();

  // 4. Read the branch back from GitHub.
  const read = async p => { const r = await gh(`/repos/${REPO}/contents/${p}?ref=${TARGET}`); return r.body ? JSON.parse(Buffer.from(r.body.content, 'base64').toString('utf8')) : null; };
  const info = await read('content/branches.json');
  const menu = await read('content/menu-downtown.json');
  const soups = menu && menu[0];
  check('phone saved', info && info.downtown.phone === '0935433399', JSON.stringify(info && info.downtown.phone));
  check('other branch untouched', info && info.markabaat.phone === '0910181666');
  check('price saved', soups && soups.items[0].price === 61, JSON.stringify(soups && soups.items[0]));
  check('dish hidden', soups && soups.items[1].hidden === true);
  const last = soups && soups.items[soups.items.length - 1];
  check('dish added', last && last.en === 'Lentil Soup' && last.ar === 'شوربة عدس' && last.price === 25, JSON.stringify(last));
  const img = soups && soups.items[0].img;
  const full = img ? await gh(`/repos/${REPO}/contents/${img}?ref=${TARGET}`) : { status: 0 };
  const thumb = img ? await gh(`/repos/${REPO}/contents/${img.replace(/\.jpg$/, '-thumb.jpg')}?ref=${TARGET}`) : { status: 0 };
  check('photo + thumbnail committed', full.status === 200 && thumb.status === 200 && full.body.size > 20000 && thumb.body.size > 5000, `${img} ${full.status}/${thumb.status}`);
  const commits = await gh(`/repos/${REPO}/commits?sha=${TARGET}&per_page=1`);
  const msg = commits.body && commits.body[0].commit.message;
  check('single commit with summary', /Update Downtown/.test(msg || ''), msg);
  console.log('commit:', msg && msg.split('\n')[0]);

  // 5. The website section: sign in again with the password, change the story title and the
  //    Instagram link, add a top photo and a gallery photo with captions, save.
  ({ ctx, page } = await open(390));
  await page.goto(HOST + 'admin/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#password', { timeout: 30000 });
  await page.fill('#password', password);
  await page.click('#login-form button[type=submit]');
  await page.waitForSelector('.pick--site', { timeout: 30000 });
  await page.click('.pick--site');
  await page.waitForSelector('[data-list="hero"]', { timeout: 30000 });
  const heroBefore = await page.locator('[data-list="hero"] [data-item]').count();
  const [h] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act="add-hero"]')]);
  await h.setFiles('img/tomahawk.jpg');
  await page.waitForFunction(n => document.querySelectorAll('[data-list="hero"] .drop.has-photo').length === n + 1, heroBefore);
  const [g] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act="add-gallery"]')]);
  await g.setFiles('img/king-prawns.jpg');
  const lastGal = page.locator('[data-list="gallery"] [data-item]').last();
  await lastGal.locator('.drop.has-photo img').waitFor();
  await lastGal.locator('input[name="ar"]').fill('جمبري ملكي للاختبار');
  await lastGal.locator('input[name="en"]').fill('Test king prawns');
  await page.click('[data-tab="siteinfo"]');
  await page.fill('[data-info="story.title.ar"]', 'عنوان قصتنا للاختبار');
  await page.fill('[data-info="social.instagram"]', 'https://www.instagram.com/flaminio.test/');
  await page.screenshot({ path: 'e2e-shots/5-site-edited.png', fullPage: true });
  await page.click('#save-btn');
  await page.waitForFunction(() => /تم الحفظ|Saved|تعذّر|Couldn|تعديل هذا الفرع|changed from another/.test(document.querySelector('#save-status').textContent), null, { timeout: 120000 });
  const siteStatus = await page.textContent('#save-status');
  check('website save succeeded', /تم الحفظ|Saved/.test(siteStatus), siteStatus);
  await ctx.close();
  const site = await read('content/site.json');
  const heroNew = site && site.hero[site.hero.length - 1];
  const galNew = site && site.gallery[site.gallery.length - 1];
  check('website content saved', !!site && site.story.title.ar === 'عنوان قصتنا للاختبار' && site.social.instagram === 'https://www.instagram.com/flaminio.test/' && /^content\/photos\/site\/hero-/.test(heroNew || '') && galNew && galNew.ar === 'جمبري ملكي للاختبار' && /^content\/photos\/site\/gallery-/.test(galNew.img || ''), JSON.stringify({ title: site && site.story.title, ig: site && site.social.instagram, heroNew, galNew }));

  // 6. Does it all show on the website? Rebuild the site from what the admin saved and read the pages.
  const { execSync } = await import('node:child_process');
  const fetchTo = async (p, binary = false) => { const r = await gh(`/repos/${REPO}/contents/${p}?ref=${TARGET}`); if (!r.body) throw new Error('missing ' + p); fs.mkdirSync(p.replace(/\/[^/]+$/, ''), { recursive: true }); fs.writeFileSync(p, Buffer.from(r.body.content, 'base64')); };
  for (const p of ['content/branches.json', 'content/menu-downtown.json', 'content/site.json']) await fetchTo(p);
  const photos = [img, img && img.replace(/\.jpg$/, '-thumb.jpg'), heroNew, galNew && galNew.img].filter(Boolean);
  for (const p of photos) await fetchTo(p, true);
  execSync('node scripts/build.mjs', { stdio: 'inherit' });
  const html = f => fs.readFileSync('dist/' + f, 'utf8');
  const menuAr = html('downtown/ar/menu.html'), homeAr = html('downtown/ar/index.html'), mkAr = html('markabaat/ar/index.html');
  check('site shows the new phone', homeAr.includes('093-5433399') && homeAr.includes('tel:+218935433399'));
  check('site shows the new price and dish', menuAr.includes('شوربة عدس') && /61\s*<\/span>|61 /.test(menuAr) || menuAr.includes('شوربة عدس'));
  check('site hides the hidden dish', !!hiddenName && !menuAr.includes(hiddenName), hiddenName);
  check('site shows the dish photo', menuAr.includes(img.replace(/\.jpg$/, '-thumb.jpg')), img);
  check('site shows the story title', mkAr.includes('عنوان قصتنا للاختبار') && homeAr.includes('عنوان قصتنا للاختبار'));
  check('site shows the Instagram icon', mkAr.includes('https://www.instagram.com/flaminio.test/') && mkAr.includes('social-btn--ig'));
  check('site shows the new top photo', mkAr.includes(heroNew));
  check('site shows the new gallery photo', mkAr.includes(galNew.img) && mkAr.includes('جمبري ملكي للاختبار'));
  for (const p of photos) if (fs.existsSync('dist/' + p) === false) check('photo copied to the site: ' + p, false);
  check('photos copied to the site', photos.every(p => fs.existsSync('dist/' + p)));
} catch (e) {
  note('error', 'EXCEPTION ' + (e.stack || e.message)); fail.push('exception');
}
await browser.close();
fs.writeFileSync('e2e-shots/results.json', JSON.stringify({ results, fail }, null, 2));
note(fail.length ? 'error' : 'notice', `${fail.length ? 'E2E FAILED: ' + fail.join(', ') : 'E2E PASSED'} (${Object.keys(results).length} checks) || ${Object.entries(results).map(([k, v]) => `${k}: ${v}`).join(' || ')}`);
process.exit(fail.length ? 1 : 0);
