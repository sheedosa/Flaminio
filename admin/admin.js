// Flaminio admin: edits content/*.json and photos in the website's GitHub repository.
// Every "حفظ ونشر" is one commit; GitHub Pages rebuilds the site within about a minute.
const cfg = window.FLAMINIO_ADMIN;
const API = 'https://api.github.com';
const TOKEN_KEY = 'flaminio-admin-token';
const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const state = {
  token: null, remember: true,
  branch: null,            // { id, ar, en, placeAr }
  head: null, treeSha: null,
  files: {},               // path -> { sha, text }
  info: null, menu: null,  // live editable data
  origInfo: '', origItems: new Map(), origCats: '',
  pending: new Map(),      // path -> Blob (photos to upload)
  previews: new Map(),     // path -> object URL
  removed: new Set(),      // photo paths to delete
  tab: 'info', catUid: null, busy: false, status: null,
};
let uidSeq = 1;
const uid = () => 'u' + (uidSeq++);

/* ---------- GitHub API ---------- */
async function gh(path, opts = {}) {
  const res = await fetch(API + path, {
    method: opts.method || 'GET',
    headers: {
      Authorization: `Bearer ${state.token}`,
      Accept: 'application/vnd.github+json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).message || ''; } catch (e) { /* ignore */ }
    const err = new Error(detail || `GitHub ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}
const b64ToText = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)));
function bytesToB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const textToB64 = text => bytesToB64(new TextEncoder().encode(text));
const blobToB64 = blob => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1]);
  r.onerror = reject;
  r.readAsDataURL(blob);
});

/* ---------- helpers ---------- */
function toast(msg, isError = false, ms = 3200) {
  const el = $('#toast');
  el.textContent = msg; el.classList.toggle('is-error', isError); el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, ms);
}
const digits = s => String(s || '').replace(/\D/g, '');
const localNumber = s => digits(s).replace(/^00/, '').replace(/^218/, '').replace(/^0/, '');
const displayNumber = s => { const l = localNumber(s); return l ? `0${l.slice(0, 2)}-${l.slice(2)}` : ''; };
const slug = s => String(s || '').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stamp = () => Date.now().toString(36);
const itemsOf = cat => cat.items || cat.groups.flatMap(g => g.items);
const serializeItem = it => JSON.stringify(cleanItem(it));
function cleanItem(it) {
  const o = { id: it.id, en: it.en, ar: it.ar, price: it.price, den: it.den || '', dar: it.dar || '' };
  if (it.isNew) o.isNew = true;
  if (it.hidden) o.hidden = true;
  if (it.img) o.img = it.img;
  return o;
}
function cleanMenu(menu) {
  return menu.map(c => ({
    id: c.id, en: c.en, ar: c.ar, img: c.img || null,
    ...(c.drinks ? { drinks: true } : {}),
    ...(c.groups ? { groups: c.groups.map(g => ({ en: g.en, ar: g.ar, items: g.items.map(cleanItem) })) } : { items: c.items.map(cleanItem) }),
  }));
}
const catSignature = menu => JSON.stringify(menu.map(c => [c.id, c.en, c.ar, c.img || null, c.groups ? c.groups.map(g => [g.en, g.ar]) : null]));
function previewSrc(img) {
  if (!img) return '';
  if (state.previews.has(img)) return state.previews.get(img);
  // The admin lives at <site>/admin/, so site files are one level up.
  return img.startsWith('content/') ? `../${img}` : `../img/${img}.jpg`;
}
function findByUid(u) {
  for (const c of state.menu) {
    if (c._uid === u) return { cat: c };
    for (const it of itemsOf(c)) if (it._uid === u) return { cat: c, item: it };
    if (c.groups) for (const g of c.groups) if (g._uid === u) return { cat: c, group: g };
  }
  return {};
}
function listOf(cat, groupUid) {
  if (!cat.groups) return cat.items;
  return (cat.groups.find(g => g._uid === groupUid) || cat.groups[0]).items;
}

/* ---------- change tracking ---------- */
function changes() {
  const list = [];
  if (JSON.stringify(state.info) !== state.origInfo) list.push('معلومات الفرع');
  if (catSignature(state.menu) !== state.origCats) list.push('الأقسام');
  const seen = new Set();
  for (const c of state.menu) for (const it of itemsOf(c)) {
    seen.add(it._uid);
    const before = state.origItems.get(it._uid);
    if (before === undefined) list.push(`إضافة «${it.ar || it.en}»`);
    else if (before !== serializeItem(it)) list.push(`تعديل «${it.ar || it.en}»`);
  }
  for (const u of state.origItems.keys()) if (!seen.has(u)) list.push('حذف طبق');
  return list;
}
function updateSaveBar() {
  const bar = $('#savebar'), st = $('#save-status'), btn = $('#save-btn'), discard = $('#discard-btn');
  if (!state.branch || !state.menu) { bar.hidden = true; return; }
  bar.hidden = false;
  if (state.busy) return;
  const n = changes().length;
  st.className = 'savebar-status';
  if (state.status) { st.className += ' ' + state.status.cls; st.innerHTML = state.status.html; }
  else st.textContent = n ? `${n} ${n === 1 ? 'تغيير غير محفوظ' : n === 2 ? 'تغييران غير محفوظين' : 'تغييرات غير محفوظة'}` : 'لا توجد تغييرات';
  if (n && state.status) { st.className = 'savebar-status'; st.textContent = `${n} ${n === 1 ? 'تغيير غير محفوظ' : 'تغييرات غير محفوظة'}`; }
  btn.disabled = !n;
  discard.hidden = !n;
}
window.addEventListener('beforeunload', e => { if (state.menu && changes().length && !state.busy) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- login ---------- */
function renderLogin(error = '') {
  $('#top-branch').textContent = '';
  $('#top-actions').innerHTML = '';
  $('#savebar').hidden = true;
  $('#app').innerHTML = `
  <section class="login">
    <img class="logo" src="../img/logo-burgundy.png" alt="">
    <h1>لوحة تحكم فلامينيو</h1>
    <p class="muted">من هنا تُعدَّل قائمة الطعام والأسعار ومعلومات كل فرع، وتظهر التغييرات على الموقع خلال دقيقة.</p>
    <form class="card" id="login-form" style="margin-top:18px">
      <div class="field">
        <label for="token">مفتاح الدخول</label>
        <input id="token" name="token" type="password" autocomplete="off" dir="ltr" placeholder="github_pat_…" required>
        <span class="hint">المفتاح موجود في دليل المالك. لا تشاركه مع أحد.</span>
      </div>
      <label class="check"><input type="checkbox" id="remember" checked> <span>تذكرني على هذا الجهاز</span></label>
      ${error ? `<p class="error">${esc(error)}</p>` : ''}
      <button class="btn btn-primary btn-lg" type="submit">دخول</button>
    </form>
  </section>`;
  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const token = $('#token').value.trim();
    state.remember = $('#remember').checked;
    if (!token) return;
    const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'جارٍ التحقق…';
    state.token = token;
    try {
      const repo = await gh(`/repos/${cfg.repo}`);
      if (!repo.permissions || !repo.permissions.push) throw new Error('المفتاح صحيح لكنه لا يملك صلاحية الكتابة على الموقع.');
      (state.remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
      renderPicker();
    } catch (err) {
      state.token = null;
      renderLogin(err.status === 401 ? 'المفتاح غير صحيح أو منتهي الصلاحية.' : err.status === 404 ? 'المفتاح لا يصل إلى موقع فلامينيو. تأكد من اختيار المستودع الصحيح عند إنشائه.' : (err.message || 'تعذّر الاتصال. تحقق من الإنترنت.'));
    }
  });
}
function logout() {
  localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY);
  state.token = null; state.branch = null; state.menu = null;
  renderLogin();
}

/* ---------- branch picker ---------- */
function renderPicker() {
  state.branch = null; state.menu = null; state.status = null;
  $('#top-branch').textContent = '';
  $('#top-actions').innerHTML = `<button class="btn btn-ghost" id="logout-btn" type="button">تسجيل الخروج</button>`;
  $('#logout-btn').addEventListener('click', logout);
  updateSaveBar();
  $('#app').innerHTML = `
  <h1>أي فرع تريد تعديله؟</h1>
  <div class="picker">
    ${cfg.branches.map(b => `<button class="pick" type="button" data-branch="${b.id}">${esc(b.ar)}<small>${esc(b.placeAr)}</small></button>`).join('')}
  </div>
  <p class="notice">التغييرات تُحفظ لكل فرع على حدة. بعد الضغط على «حفظ ونشر» يتحدّث موقع الفرع خلال دقيقة تقريباً.</p>`;
  document.querySelectorAll('[data-branch]').forEach(btn => btn.addEventListener('click', () => loadBranch(btn.dataset.branch)));
}

/* ---------- loading content ---------- */
async function loadBranch(id) {
  state.branch = cfg.branches.find(b => b.id === id);
  $('#app').innerHTML = '<p class="loading">جارٍ تحميل بيانات الفرع…</p>';
  $('#top-branch').textContent = `فرع ${state.branch.ar}`;
  $('#top-actions').innerHTML = `<button class="btn btn-ghost" id="switch-btn" type="button">تغيير الفرع</button><button class="btn btn-ghost" id="logout-btn" type="button">خروج</button>`;
  $('#switch-btn').addEventListener('click', () => { if (!changes().length || confirm('لديك تغييرات غير محفوظة. هل تريد تركها والانتقال إلى فرع آخر؟')) renderPicker(); });
  $('#logout-btn').addEventListener('click', () => { if (!changes().length || confirm('لديك تغييرات غير محفوظة. هل تريد الخروج دون حفظ؟')) logout(); });
  try {
    const ref = await gh(`/repos/${cfg.repo}/git/ref/heads/${cfg.branch}`);
    state.head = ref.object.sha;
    const commit = await gh(`/repos/${cfg.repo}/git/commits/${state.head}`);
    state.treeSha = commit.tree.sha;
    const paths = ['content/branches.json', `content/menu-${id}.json`];
    for (const p of paths) {
      const f = await gh(`/repos/${cfg.repo}/contents/${p}?ref=${state.head}`);
      state.files[p] = { sha: f.sha, text: b64ToText(f.content) };
    }
    state.allInfo = JSON.parse(state.files['content/branches.json'].text);
    state.info = state.allInfo[id];
    if (!state.info) throw new Error('لا توجد بيانات لهذا الفرع في الموقع.');
    state.menu = JSON.parse(state.files[`content/menu-${id}.json`].text);
    for (const c of state.menu) {
      c._uid = uid();
      if (c.groups) for (const g of c.groups) { g._uid = uid(); for (const it of g.items) it._uid = uid(); }
      else for (const it of c.items) it._uid = uid();
    }
    state.origInfo = JSON.stringify(state.info);
    state.origCats = catSignature(state.menu);
    state.origItems = new Map(state.menu.flatMap(c => itemsOf(c).map(it => [it._uid, serializeItem(it)])));
    state.pending.clear(); state.removed.clear(); state.status = null;
    state.tab = 'info'; state.catUid = state.menu[0] && state.menu[0]._uid;
    renderEditor();
  } catch (err) {
    $('#app').innerHTML = `<div class="card"><h2>تعذّر التحميل</h2><p>${esc(err.message)}</p><button class="btn" id="retry" type="button">إعادة المحاولة</button></div>`;
    $('#retry').addEventListener('click', () => loadBranch(id));
  }
}

/* ---------- editor ---------- */
function renderEditor() {
  $('#app').innerHTML = `
  <div class="tabs" role="tablist">
    <button class="tab${state.tab === 'info' ? ' is-active' : ''}" type="button" data-tab="info" role="tab">معلومات الفرع</button>
    <button class="tab${state.tab === 'menu' ? ' is-active' : ''}" type="button" data-tab="menu" role="tab">قائمة الطعام</button>
  </div>
  <div id="panel"></div>`;
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; renderEditor(); }));
  if (state.tab === 'info') renderInfo(); else renderMenu();
  updateSaveBar();
}

function field(label, name, value, { hint = '', dir = '', textarea = false, type = 'text', placeholder = '' } = {}) {
  const attrs = `id="f-${name}" name="${name}" data-info="${name}"${dir ? ` dir="${dir}"` : ''}${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}`;
  return `<div class="field"><label for="f-${name}">${label}</label>${textarea
    ? `<textarea ${attrs}>${esc(value)}</textarea>`
    : `<input type="${type}" ${attrs} value="${esc(value)}">`}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
}
function renderInfo() {
  const i = state.info;
  $('#panel').innerHTML = `
  <div class="card">
    <h2>الهاتف وواتساب</h2>
    ${field('رقم الهاتف', 'phone', i.phone, { dir: 'ltr', type: 'tel', placeholder: '0910181666', hint: `يظهر على الموقع كـ <span class="preview-number" id="phone-preview">${esc(displayNumber(i.phone))}</span>` })}
    ${field('رقم واتساب (اتركه فارغاً إذا كان نفس رقم الهاتف)', 'whatsapp', i.whatsapp || '', { dir: 'ltr', type: 'tel', placeholder: '0910181666', hint: 'طلبات الحجز من الموقع تصل إلى هذا الرقم.' })}
  </div>
  <div class="card">
    <h2>العنوان</h2>
    <div class="grid-2">
      ${field('العنوان القصير (عربي)', 'findTitle.ar', i.findTitle.ar, { hint: 'يظهر بخط كبير في بطاقة «موقعنا».' })}
      ${field('Short address (English)', 'findTitle.en', i.findTitle.en, { dir: 'ltr' })}
      ${field('سطر تحت العنوان (عربي)', 'findSub.ar', i.findSub.ar, { hint: 'مثل: قرب منتجع أصايل · بنغازي' })}
      ${field('Line under the address (English)', 'findSub.en', i.findSub.en, { dir: 'ltr' })}
      ${field('العنوان الكامل (عربي)', 'address.ar', i.address.ar, { textarea: true })}
      ${field('Full address (English)', 'address.en', i.address.en, { textarea: true, dir: 'ltr' })}
    </div>
    ${field('رابط خرائط جوجل', 'maps', i.maps || '', { dir: 'ltr', type: 'url', placeholder: 'https://maps.app.goo.gl/…', hint: 'افتح موقع المطعم في خرائط جوجل، اضغط «مشاركة» وانسخ الرابط.' })}
  </div>
  <div class="card">
    <h2>ساعات العمل</h2>
    <div class="grid-2">
      ${field('ساعات العمل (عربي)', 'hours.ar', (i.hours && i.hours.ar) || '', { textarea: true, placeholder: 'يومياً من 12 ظهراً إلى 12 منتصف الليل' })}
      ${field('Opening hours (English)', 'hours.en', (i.hours && i.hours.en) || '', { textarea: true, dir: 'ltr', placeholder: 'Daily 12:00 – 00:00' })}
    </div>
  </div>
  <div class="card">
    <h2>الشيف</h2>
    ${field('اسم الشيف التنفيذي (اختياري، يظهر أعلى القائمة)', 'chef', i.chef || '', { dir: 'ltr' })}
  </div>`;
  $('#panel').addEventListener('input', e => {
    const el = e.target.closest('[data-info]'); if (!el) return;
    const [a, b] = el.dataset.info.split('.');
    if (b) { if (!state.info[a]) state.info[a] = {}; state.info[a][b] = el.value; } else state.info[a] = el.value.trim();
    if (a === 'phone') $('#phone-preview').textContent = displayNumber(el.value);
    updateSaveBar();
  });
}

function renderMenu() {
  const cat = state.menu.find(c => c._uid === state.catUid) || state.menu[0];
  if (cat) state.catUid = cat._uid;
  const idx = state.menu.indexOf(cat);
  $('#panel').innerHTML = `
  <div class="card cat-head">
    <h2>الأقسام</h2>
    <div class="chips">
      ${state.menu.map(c => `<button class="chip${c === cat ? ' is-active' : ''}" type="button" data-cat="${c._uid}">${esc(c.ar)}</button>`).join('')}
      <button class="chip chip-add" type="button" data-act="add-cat">+ إضافة قسم</button>
    </div>
  </div>
  ${cat ? `
  <div class="card">
    <div class="grid-2">
      <div class="field"><label for="cat-ar">اسم القسم (عربي)</label><input id="cat-ar" data-cat-field="ar" value="${esc(cat.ar)}"></div>
      <div class="field"><label for="cat-en">Category name (English)</label><input id="cat-en" data-cat-field="en" dir="ltr" value="${esc(cat.en)}"></div>
    </div>
    <div class="field"><label>صورة القسم (تظهر بجانب القائمة)</label>${dropZone(cat, 'cat')}</div>
    <div class="cat-tools">
      <span class="order"><button class="icon-btn" type="button" data-act="cat-up" ${idx === 0 ? 'disabled' : ''} title="تقديم القسم">▲</button><button class="icon-btn" type="button" data-act="cat-down" ${idx === state.menu.length - 1 ? 'disabled' : ''} title="تأخير القسم">▼</button></span>
      <span class="spacer"></span>
      <button class="btn btn-sm btn-danger" type="button" data-act="del-cat">حذف القسم</button>
    </div>
  </div>
  ${cat.groups
    ? cat.groups.map(g => `<div class="group-head"><input data-group="${g._uid}" data-group-field="ar" value="${esc(g.ar)}" aria-label="اسم المجموعة بالعربية"><input data-group="${g._uid}" data-group-field="en" dir="ltr" value="${esc(g.en)}" aria-label="Group name in English"></div>
      <div class="items">${g.items.map((it, i) => itemCard(it, i, g.items.length)).join('') || '<p class="empty">لا توجد أطباق في هذه المجموعة.</p>'}</div>
      <button class="btn" type="button" data-act="add-item" data-group="${g._uid}">+ إضافة طبق إلى «${esc(g.ar)}»</button>`).join('')
    : `<div class="items">${cat.items.map((it, i) => itemCard(it, i, cat.items.length)).join('') || '<p class="empty">لا توجد أطباق بعد. اضغط «إضافة طبق».</p>'}</div>
      <button class="btn btn-lg" type="button" data-act="add-item">+ إضافة طبق</button>`}
  ` : '<p class="empty">لا توجد أقسام بعد.</p>'}`;

  const panel = $('#panel');
  panel.addEventListener('click', onMenuClick);
  panel.addEventListener('input', onMenuInput);
  panel.addEventListener('change', onMenuInput);
  initDropZones(panel);
}

function itemCard(it, i, n) {
  return `<div class="item${it.hidden ? ' is-hidden' : ''}" data-item="${it._uid}">
    ${dropZone(it, 'item')}
    <div class="item-main">
      <div class="item-fields">
        <input name="ar" value="${esc(it.ar)}" placeholder="اسم الطبق (عربي)" aria-label="اسم الطبق بالعربية">
        <input name="en" value="${esc(it.en)}" placeholder="Dish name (English)" aria-label="Dish name in English">
        <input name="price" inputmode="decimal" value="${it.price == null ? '' : it.price}" placeholder="السعر" aria-label="السعر بالدينار">
      </div>
      <div class="item-row">
        <label class="switch"><input type="checkbox" name="isNew" ${it.isNew ? 'checked' : ''}> <span>جديد</span></label>
        <label class="switch"><input type="checkbox" name="hidden" ${it.hidden ? 'checked' : ''}> <span>إخفاء من القائمة</span></label>
        <span class="order"><button class="icon-btn" type="button" data-act="item-up" ${i === 0 ? 'disabled' : ''} title="تقديم">▲</button><button class="icon-btn" type="button" data-act="item-down" ${i === n - 1 ? 'disabled' : ''} title="تأخير">▼</button><button class="icon-btn" type="button" data-act="del-item" title="حذف الطبق">🗑</button></span>
      </div>
      <details class="desc">
        <summary>الوصف (اختياري)</summary>
        <textarea name="dar" placeholder="وصف الطبق بالعربية">${esc(it.dar)}</textarea>
        <textarea name="den" dir="ltr" placeholder="Description in English">${esc(it.den)}</textarea>
      </details>
    </div>
  </div>`;
}
function dropZone(obj, kind) {
  const src = previewSrc(obj.img);
  return `<div class="drop${obj.img ? ' has-photo' : ''}${kind === 'cat' ? ' drop-lg' : ''}" data-drop="${obj._uid}" data-kind="${kind}" role="button" tabindex="0" aria-label="${obj.img ? 'تغيير الصورة' : 'إضافة صورة'}">
    ${obj.img ? `<img src="${esc(src)}" alt=""><button class="remove" type="button" data-act="remove-photo" title="إزالة الصورة">×</button>` : `<span class="drop-label">اسحب صورة هنا<br>أو اضغط للاختيار</span><span class="drop-label-short">+ صورة</span>`}
  </div>`;
}

function onMenuInput(e) {
  const el = e.target;
  if (el.dataset.catField) { const { cat } = findByUid(state.catUid); cat[el.dataset.catField] = el.value; if (el.dataset.catField === 'ar') { const chip = $(`.chip[data-cat="${cat._uid}"]`); if (chip) chip.textContent = el.value || '…'; } }
  else if (el.dataset.group) { const { group } = findByUid(el.dataset.group); group[el.dataset.groupField] = el.value; }
  else {
    const card = el.closest('[data-item]'); if (!card) return;
    const { item } = findByUid(card.dataset.item);
    if (el.name === 'price') { const v = el.value.trim().replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)); item.price = v === '' ? null : Number(v); if (Number.isNaN(item.price)) item.price = null; }
    else if (el.type === 'checkbox') { item[el.name] = el.checked; if (el.name === 'hidden') card.classList.toggle('is-hidden', el.checked); }
    else item[el.name] = el.value;
  }
  updateSaveBar();
}

function onMenuClick(e) {
  const chip = e.target.closest('[data-cat]');
  if (chip) { state.catUid = chip.dataset.cat; renderMenu(); return; }
  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const act = btn.dataset.act;
  const { cat } = findByUid(state.catUid);
  const card = btn.closest('[data-item]');
  if (act === 'add-cat') {
    const c = { _uid: uid(), id: `c-${stamp()}`, en: 'New category', ar: 'قسم جديد', img: null, items: [] };
    state.menu.push(c); state.catUid = c._uid; renderMenu(); $('#cat-ar').focus(); $('#cat-ar').select();
  } else if (act === 'del-cat') {
    if (!confirm(`حذف قسم «${cat.ar}» وكل أطباقه (${itemsOf(cat).length})؟`)) return;
    state.menu.splice(state.menu.indexOf(cat), 1); state.catUid = state.menu[0] && state.menu[0]._uid; renderMenu();
  } else if (act === 'cat-up' || act === 'cat-down') {
    const i = state.menu.indexOf(cat), j = act === 'cat-up' ? i - 1 : i + 1;
    if (j < 0 || j >= state.menu.length) return;
    [state.menu[i], state.menu[j]] = [state.menu[j], state.menu[i]]; renderMenu();
  } else if (act === 'add-item') {
    const list = listOf(cat, btn.dataset.group);
    list.push({ _uid: uid(), id: `d-${stamp()}`, en: '', ar: '', price: null, den: '', dar: '' });
    renderMenu();
    const cards = document.querySelectorAll('[data-item]'); const last = cards[cards.length - 1];
    last.scrollIntoView({ block: 'center', behavior: 'smooth' }); last.querySelector('input[name="ar"]').focus();
  } else if (card) {
    const { item } = findByUid(card.dataset.item);
    const list = cat.groups ? cat.groups.find(g => g.items.includes(item)).items : cat.items;
    const i = list.indexOf(item);
    if (act === 'del-item') {
      if (!confirm(`حذف «${item.ar || item.en || 'هذا الطبق'}»؟`)) return;
      if (item.img && item.img.startsWith('content/')) forgetPhoto(item.img);
      list.splice(i, 1); renderMenu();
    } else if (act === 'item-up' || act === 'item-down') {
      const j = act === 'item-up' ? i - 1 : i + 1;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]]; renderMenu();
    } else if (act === 'remove-photo') {
      e.stopPropagation();
      if (item.img && item.img.startsWith('content/')) forgetPhoto(item.img);
      item.img = null; renderMenu();
    }
  } else if (act === 'remove-photo') {
    e.stopPropagation();
    if (cat.img && cat.img.startsWith('content/')) forgetPhoto(cat.img);
    cat.img = null; renderMenu();
  }
  updateSaveBar();
}
function forgetPhoto(p) {
  if (state.pending.has(p)) { state.pending.delete(p); state.pending.delete(thumbPath(p)); }
  else { state.removed.add(p); state.removed.add(thumbPath(p)); }
}
const thumbPath = p => p.replace(/(\.[a-z0-9]+)$/i, '-thumb$1');

/* ---------- photos ---------- */
function initDropZones(root) {
  root.querySelectorAll('[data-drop]').forEach(zone => {
    const pick = () => { const inp = $('#file-input'); inp.value = ''; inp.onchange = () => inp.files[0] && acceptPhoto(zone, inp.files[0]); inp.click(); };
    zone.addEventListener('click', e => { if (!e.target.closest('[data-act]')) pick(); });
    zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('is-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('is-over'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) acceptPhoto(zone, f); });
  });
}
async function acceptPhoto(zone, file) {
  if (!/^image\//.test(file.type)) { toast('الملف ليس صورة. اختر صورة JPG أو PNG.', true); return; }
  const found = findByUid(zone.dataset.drop);
  const target = zone.dataset.kind === 'cat' ? found.cat : found.item;
  if (!target) return;
  try {
    zone.innerHTML = '<span>جارٍ تجهيز الصورة…</span>';
    const key = zone.dataset.kind === 'cat' ? `cat-${target.id}` : target.id;
    const base = `content/photos/${state.branch.id}/${key}-${stamp()}`;
    const [full, thumb] = await Promise.all([resizeImage(file, 1200, false), resizeImage(file, 400, true)]);
    if (target.img && target.img.startsWith('content/')) forgetPhoto(target.img);
    state.pending.set(`${base}.jpg`, full);
    state.pending.set(`${base}-thumb.jpg`, thumb);
    state.previews.set(`${base}.jpg`, URL.createObjectURL(full));
    target.img = `${base}.jpg`;
    renderMenu();
    updateSaveBar();
  } catch (err) {
    toast('تعذّر قراءة الصورة. جرّب صورة أخرى.', true);
    renderMenu();
  }
}
// Shrinks a photo in the browser: longest side ≤ max (or a centred square crop for thumbnails), JPEG.
async function resizeImage(file, max, square) {
  const bitmap = await createImageBitmap(file).catch(() => loadViaImg(file));
  let sw = bitmap.width, sh = bitmap.height, sx = 0, sy = 0;
  if (square) { const s = Math.min(sw, sh); sx = (sw - s) / 2; sy = (sh - s) / 2; sw = sh = s; }
  const scale = Math.min(1, max / Math.max(sw, sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale); canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('encode')), 'image/jpeg', 0.82));
}
const loadViaImg = file => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = URL.createObjectURL(file); });

/* ---------- save & publish ---------- */
async function save() {
  const list = changes();
  if (!list.length || state.busy) return;
  // Every dish needs at least one name.
  for (const c of state.menu) for (const it of itemsOf(c)) if (!it.ar.trim() && !it.en.trim()) { toast('يوجد طبق بدون اسم. اكتب اسمه أو احذفه.', true); return; }
  state.busy = true;
  const st = $('#save-status'), btn = $('#save-btn'); btn.disabled = true; $('#discard-btn').hidden = true;
  const setStatus = (html, cls) => { st.className = 'savebar-status ' + cls; st.innerHTML = html; };
  try {
    setStatus('جارٍ الحفظ…', 'is-busy');
    // Someone else may have saved since we loaded: accept if our files are unchanged, otherwise ask to reload.
    const ref = await gh(`/repos/${cfg.repo}/git/ref/heads/${cfg.branch}`);
    if (ref.object.sha !== state.head) {
      for (const p of Object.keys(state.files)) {
        const f = await gh(`/repos/${cfg.repo}/contents/${p}?ref=${ref.object.sha}`);
        if (f.sha !== state.files[p].sha) throw new Error('تم تعديل هذا الفرع من جهاز آخر. أعد تحميل الصفحة ثم كرّر تعديلاتك.');
      }
      state.head = ref.object.sha;
      state.treeSha = (await gh(`/repos/${cfg.repo}/git/commits/${state.head}`)).tree.sha;
    }
    const tree = [];
    const put = async (path, b64) => { const blob = await gh(`/repos/${cfg.repo}/git/blobs`, { method: 'POST', body: { content: b64, encoding: 'base64' } }); tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha }); };
    state.allInfo[state.branch.id] = state.info;
    const infoText = JSON.stringify(state.allInfo, null, 2) + '\n';
    if (infoText !== state.files['content/branches.json'].text) await put('content/branches.json', textToB64(infoText));
    const menuPath = `content/menu-${state.branch.id}.json`;
    const menuText = JSON.stringify(cleanMenu(state.menu), null, 2) + '\n';
    if (menuText !== state.files[menuPath].text) await put(menuPath, textToB64(menuText));
    let n = 0;
    for (const [path, blob] of state.pending) { n++; setStatus(`جارٍ رفع الصور… (${n}/${state.pending.size})`, 'is-busy'); await put(path, await blobToB64(blob)); }
    for (const path of state.removed) if (!state.pending.has(path)) tree.push({ path, mode: '100644', type: 'blob', sha: null });
    if (!tree.length) throw new Error('لا يوجد ما يُحفظ.');
    setStatus('جارٍ النشر…', 'is-busy');
    const newTree = await gh(`/repos/${cfg.repo}/git/trees`, { method: 'POST', body: { base_tree: state.treeSha, tree } });
    const message = `تحديث فرع ${state.branch.ar} (${list.length} ${list.length === 1 ? 'تعديل' : 'تعديلات'})\n\n${list.slice(0, 20).map(s => '- ' + s).join('\n')}`;
    const commit = await gh(`/repos/${cfg.repo}/git/commits`, { method: 'POST', body: { message, tree: newTree.sha, parents: [state.head] } });
    await gh(`/repos/${cfg.repo}/git/refs/heads/${cfg.branch}`, { method: 'PATCH', body: { sha: commit.sha } });
    // Saved. Refresh our baseline so the next save builds on this commit.
    state.head = commit.sha; state.treeSha = newTree.sha;
    state.files['content/branches.json'].text = infoText;
    state.files[menuPath].text = menuText;
    for (const p of Object.keys(state.files)) { const f = await gh(`/repos/${cfg.repo}/contents/${p}?ref=${commit.sha}`); state.files[p].sha = f.sha; }
    state.origInfo = JSON.stringify(state.info); state.origCats = catSignature(state.menu);
    state.origItems = new Map(state.menu.flatMap(c => itemsOf(c).map(it => [it._uid, serializeItem(it)])));
    state.pending.clear(); state.removed.clear();
    state.busy = false;
    const siteLink = `${cfg.siteUrl}${state.branch.id}/ar/${state.tab === 'menu' ? 'menu.html' : ''}`;
    state.status = { cls: 'is-busy', html: 'تم الحفظ ✓ جارٍ تحديث الموقع… (نحو دقيقة)' };
    updateSaveBar();
    toast('تم الحفظ. الموقع يتحدث خلال دقيقة تقريباً.');
    watchDeploy(commit.sha, siteLink);
  } catch (err) {
    state.busy = false;
    state.status = { cls: 'is-error', html: esc(err.message || 'تعذّر الحفظ. حاول مرة أخرى.') };
    updateSaveBar();
    toast(err.message || 'تعذّر الحفظ.', true, 6000);
  }
}
async function watchDeploy(sha, siteLink) {
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, i < 3 ? 6000 : 9000));
    if (state.head !== sha) return; // a newer save is being watched
    try {
      const runs = await gh(`/repos/${cfg.repo}/actions/runs?head_sha=${sha}&per_page=1`);
      const run = runs.workflow_runs && runs.workflow_runs[0];
      if (run && run.status === 'completed') {
        state.status = run.conclusion === 'success'
          ? { cls: 'is-ok', html: `أصبح مباشراً على الموقع ✓ <a href="${esc(siteLink)}?v=${Date.now()}" target="_blank" rel="noopener">افتح الصفحة</a>` }
          : { cls: 'is-error', html: 'تم الحفظ لكن النشر تعثّر. أعد المحاولة أو تواصل مع مسؤول الموقع.' };
        updateSaveBar();
        return;
      }
    } catch (e) { /* keep polling */ }
  }
  state.status = { cls: 'is-ok', html: `تم الحفظ ✓ <a href="${esc(siteLink)}" target="_blank" rel="noopener">افتح الصفحة</a>` };
  updateSaveBar();
}

/* ---------- boot ---------- */
$('#save-btn').addEventListener('click', save);
$('#discard-btn').addEventListener('click', () => { if (confirm('التراجع عن كل التغييرات غير المحفوظة؟')) loadBranch(state.branch.id); });
state.token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
if (state.token) {
  gh(`/repos/${cfg.repo}`).then(repo => (repo.permissions && repo.permissions.push ? renderPicker() : logout())).catch(err => { if (err.status === 401 || err.status === 404) logout(); else { renderPicker(); toast('تعذّر التحقق من الاتصال. تحقق من الإنترنت.', true); } });
} else renderLogin();
