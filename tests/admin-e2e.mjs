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
const check = (name, ok, detail = '') => { results[name] = ok ? 'ok' : `FAIL ${detail}`; if (!ok) fail.push(name); console.log(ok ? '✓' : '✗', name, ok ? '' : detail); };

const browser = await chromium.launch();
async function open(width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('pageerror:', e.message));
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
} catch (e) {
  console.log('ERROR', e.stack || e.message); fail.push('exception');
}
await browser.close();
fs.writeFileSync('e2e-shots/results.json', JSON.stringify({ results, fail }, null, 2));
console.log(fail.length ? `E2E FAILED: ${fail.join(', ')}` : 'E2E PASSED');
process.exit(fail.length ? 1 : 0);
