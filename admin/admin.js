// Flaminio admin: edits content/*.json and photos in the website's GitHub repository.
// Every "Save & publish" (حفظ ونشر) is one commit; GitHub Pages rebuilds the site within about a minute.
const cfg = window.FLAMINIO_ADMIN;
const API = 'https://api.github.com';
const TOKEN_KEY = 'flaminio-admin-token';
const DRAFT_KEY = id => `flaminio-admin-draft-${id}`;
const HINT_KEY = 'flaminio-admin-home-hint';
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
  tab: 'info', catUid: null, busy: false, status: null, screen: null,
};
let uidSeq = 1;
const uid = () => 'u' + (uidSeq++);

/* ---------- interface language ---------- */
const LANG_KEY = 'flaminio-admin-lang';
const L = {
  ar: {
    dir: 'rtl', toggle: 'English', toggleTitle: 'Switch to English',
    title: 'لوحة تحكم فلامينيو', dashboard: 'لوحة التحكم', loading: 'جارٍ التحميل…', siteLink: 'الموقع',
    loginLead: 'من هنا تُعدَّل قائمة الطعام والأسعار ومعلومات كل فرع، وتظهر التغييرات على الموقع خلال دقيقة.',
    keyLabel: 'مفتاح الدخول', keyHint: 'المفتاح موجود في دليل المالك. لا تشاركه مع أحد.', remember: 'تذكرني على هذا الجهاز',
    login: 'دخول', checking: 'جارٍ التحقق…',
    errNoPush: 'المفتاح لا يملك صلاحية الحفظ. فعّل للمفتاح على GitHub صلاحية Contents: Read and write، ثم اضغط «حفظ ونشر» مرة أخرى. تعديلاتك باقية في الصفحة.', err401: 'المفتاح غير صحيح أو منتهي الصلاحية.',
    err404: 'المفتاح لا يصل إلى موقع فلامينيو. تأكد من اختيار المستودع الصحيح عند إنشائه.', errNet: 'تعذّر الاتصال. تحقق من الإنترنت.',
    logout: 'تسجيل الخروج', logoutShort: 'خروج', switchBranch: 'تغيير الفرع',
    pickTitle: 'أي فرع تريد تعديله؟', pickNote: 'التغييرات تُحفظ لكل فرع على حدة. بعد الضغط على «حفظ ونشر» يتحدّث موقع الفرع خلال دقيقة تقريباً.',
    branchOf: 'فرع {b}', loadingBranch: 'جارٍ تحميل بيانات الفرع…', loadFailed: 'تعذّر التحميل', retry: 'إعادة المحاولة', noBranchData: 'لا توجد بيانات لهذا الفرع في الموقع.',
    confirmSwitch: 'لديك تغييرات غير محفوظة. هل تريد تركها والانتقال إلى فرع آخر؟', confirmLogout: 'لديك تغييرات غير محفوظة. هل تريد الخروج دون حفظ؟',
    tabInfo: 'معلومات الفرع', tabMenu: 'قائمة الطعام',
    phoneCard: 'الهاتف وواتساب', phone: 'رقم الهاتف', phoneShows: 'يظهر على الموقع كـ', whatsapp: 'رقم واتساب (اتركه فارغاً إذا كان نفس رقم الهاتف)', whatsappHint: 'طلبات الحجز من الموقع تصل إلى هذا الرقم.',
    addressCard: 'العنوان', findTitleAr: 'العنوان القصير (عربي)', findTitleEn: 'العنوان القصير (إنجليزي)', findTitleHint: 'يظهر بخط كبير في بطاقة «موقعنا».',
    findSubAr: 'سطر تحت العنوان (عربي)', findSubEn: 'سطر تحت العنوان (إنجليزي)', findSubHint: 'مثل: قرب منتجع أصايل · بنغازي',
    addressAr: 'العنوان الكامل (عربي)', addressEn: 'العنوان الكامل (إنجليزي)', maps: 'رابط خرائط جوجل', mapsHint: 'افتح موقع المطعم في خرائط جوجل، اضغط «مشاركة» وانسخ الرابط.',
    hoursCard: 'ساعات العمل', hoursAr: 'ساعات العمل (عربي)', hoursEn: 'ساعات العمل (إنجليزي)', chefCard: 'الشيف', chef: 'اسم الشيف التنفيذي (اختياري، يظهر أعلى القائمة)',
    cats: 'الأقسام', addCat: '+ إضافة قسم', catAr: 'اسم القسم (عربي)', catEn: 'اسم القسم (إنجليزي)', catPhoto: 'صورة القسم (تظهر بجانب القائمة)',
    catUp: 'تقديم القسم', catDown: 'تأخير القسم', delCat: 'حذف القسم', newCatAr: 'قسم جديد', groupAr: 'اسم المجموعة (عربي)', groupEn: 'اسم المجموعة (إنجليزي)',
    noItemsGroup: 'لا توجد أطباق في هذه المجموعة.', addToGroup: '+ إضافة طبق إلى «{g}»', noItems: 'لا توجد أطباق بعد. اضغط «إضافة طبق».', addItem: '+ إضافة طبق', noCats: 'لا توجد أقسام بعد.',
    dishAr: 'اسم الطبق (عربي)', dishEn: 'اسم الطبق (إنجليزي)', price: 'السعر', priceLabel: 'السعر بالدينار', isNew: 'جديد', hide: 'إخفاء من القائمة',
    up: 'تقديم', down: 'تأخير', delItem: 'حذف الطبق', desc: 'الوصف (اختياري)', descAr: 'وصف الطبق بالعربية', descEn: 'وصف الطبق بالإنجليزية',
    changePhoto: 'تغيير الصورة', addPhoto: 'إضافة صورة', removePhoto: 'إزالة الصورة', dropHere: 'اسحب صورة هنا<br>أو اضغط للاختيار', dropShort: '+ صورة', preparing: 'جارٍ تجهيز الصورة…',
    notImage: 'الملف ليس صورة. اختر صورة JPG أو PNG.', badImage: 'تعذّر قراءة الصورة. جرّب صورة أخرى.',
    confirmDelCat: 'حذف قسم «{c}» وكل أطباقه ({n})؟', confirmDelItem: 'حذف «{d}»؟', thisDish: 'هذا الطبق',
    chInfo: 'معلومات الفرع', chCats: 'الأقسام', chAdd: 'إضافة «{d}»', chEdit: 'تعديل «{d}»', chDel: 'حذف طبق',
    none: 'لا توجد تغييرات', unsaved1: 'تغيير واحد غير محفوظ', unsaved2: 'تغييران غير محفوظين', unsavedN: '{n} تغييرات غير محفوظة',
    discard: 'تراجع', save: 'حفظ ونشر', confirmDiscard: 'التراجع عن كل التغييرات غير المحفوظة؟',
    noName: 'يوجد طبق بدون اسم. اكتب اسمه أو احذفه.', saving: 'جارٍ الحفظ…', uploading: 'جارٍ رفع الصور… ({i}/{n})', publishing: 'جارٍ النشر…',
    conflict: 'تم تعديل هذا الفرع من جهاز آخر. أعد تحميل الصفحة ثم كرّر تعديلاتك.', nothing: 'لا يوجد ما يُحفظ.',
    savedBuilding: 'تم الحفظ ✓ جارٍ تحديث الموقع… (نحو دقيقة)', savedToast: 'تم الحفظ. الموقع يتحدث خلال دقيقة تقريباً.',
    live: 'أصبح مباشراً على الموقع ✓', openPage: 'افتح الصفحة', deployFailed: 'تم الحفظ لكن النشر تعثّر. أعد المحاولة أو تواصل مع مسؤول الموقع.',
    saved: 'تم الحفظ ✓', saveFailed: 'تعذّر الحفظ. حاول مرة أخرى.', netCheck: 'تعذّر التحقق من الاتصال. تحقق من الإنترنت.',
    pwLabel: 'كلمة المرور', pwLogin: 'دخول', pwWrong: 'كلمة المرور غير صحيحة.', pwUnlocking: 'جارٍ فتح القفل…',
    useKey: 'الدخول بمفتاح GitHub بدلاً من ذلك', usePw: 'الدخول بكلمة المرور', noLock: 'لم تُعيَّن كلمة مرور بعد. ادخل بمفتاح GitHub ثم اضغط «كلمة المرور» لتعيينها.',
    firstTitle: 'الإعداد لأول مرة', firstLead: 'لم تُعيَّن كلمة مرور للوحة بعد. مرة واحدة فقط: يلصق المالك مفتاح GitHub (موجود في دليل المالك) ويختار كلمة المرور. بعد ذلك يكفي الرابط وكلمة المرور للدخول من أي هاتف.',
    firstBtn: 'ابدأ الإعداد', keyOnly: 'الدخول بمفتاح GitHub فقط (بدون كلمة مرور)', pwPlaceholder: 'مثال: Admin123 أو كلمة أقوى',
    keyStale: 'كلمة المرور صحيحة، لكن مفتاح GitHub المرتبط بها انتهى أو حُذف. الصق مفتاحاً جديداً هنا، وتبقى كلمة المرور كما هي للجميع.',
    diagOwner: 'هذا المفتاح من حساب GitHub آخر ({u}). الموقع في حساب {o}، لذلك يجب إنشاء المفتاح وأنت داخل بحساب {o}.',
    diagRepo: 'المفتاح لا يصل إلى مستودع Flaminio. عند إنشاء المفتاح، في «Repository access» اختر «Only select repositories» ثم Flaminio. الخيار الافتراضي «Public repositories» يسمح بالقراءة فقط.',
    diagContents: 'المفتاح لا يستطيع الحفظ. في «Repository permissions» اجعل Contents = Read and write، وتأكد أن «Repository access» = «Only select repositories» مع اختيار Flaminio. ثم اضغط Update أو أنشئ مفتاحاً جديداً.',
    diagBlocked: 'رفض GitHub الحفظ: {m}',
    keyHow: 'إنشاء المفتاح: افتح الرابط وأنت داخل بحساب {o}. في «Repository access» اختر «Only select repositories» ثم Flaminio، وتأكد أن Contents = Read and write، ثم اضغط Generate token وانسخه.', keyLink: 'افتح صفحة إنشاء المفتاح',
    newKey: 'مفتاح GitHub الجديد', rekey: 'حفظ المفتاح الجديد', rekeying: 'جارٍ الحفظ…', keyUpdated: 'تم تحديث المفتاح ✓ كلمة المرور لم تتغير.',
    quickTitle: 'عيّن كلمة مرور اللوحة (مرة واحدة)', quickLead: 'بعدها يدخل أي شخص تعطيه الرابط وكلمة المرور، دون مفتاح GitHub. لن يُطلب هذا مرة أخرى.', quickSave: 'حفظ كلمة المرور', quickDone: 'تم تعيين كلمة المرور ✓ أعطِ الرابط وكلمة المرور لمن سيعدّل القائمة.',
    homeHint: 'لتبقى مسجّلاً على الآيفون: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»، وافتح اللوحة من أيقونتها.', ok: 'حسناً',
    draftRestored: 'تم استرجاع تعديلاتك غير المحفوظة.', draftDropped: 'تغيّر هذا الفرع من جهاز آخر، فلم تُسترجع تعديلاتك القديمة غير المحفوظة.',
    pwMenu: 'كلمة المرور', setupTitle: 'إعداد كلمة المرور', setupLead: 'مرة واحدة: الصق مفتاح GitHub واختر كلمة مرور. بعدها يكفي الرابط وكلمة المرور للدخول من أي جهاز.',
    changeTitle: 'تغيير كلمة المرور', changeLead: 'اختر كلمة مرور جديدة. كلمة المرور القديمة تتوقف عن العمل فوراً على كل الأجهزة.',
    setupKey: 'مفتاح GitHub (يبدأ بـ github_pat_)', newPw: 'كلمة المرور الجديدة', suggest: 'اقتراح آخر',
    pwRule: 'ثلاث كلمات على الأقل أو 14 حرفاً. الاقتراح سهل الكتابة وقوي بما يكفي.', pwWeak: 'كلمة المرور قصيرة أو سهلة التخمين. استخدم ثلاث كلمات على الأقل أو 14 حرفاً.',
    weakOk: 'استخدام كلمة مرور ضعيفة على مسؤوليتي (يمكن تخمينها، والأفضل تغييرها لاحقاً)', pwWeakTick: 'كلمة المرور ضعيفة. للاستمرار بها ضع علامة على «على مسؤوليتي».',
    setupSave: 'حفظ كلمة المرور', setupSaving: 'جارٍ التشفير والحفظ…', setupDone: 'تم تعيين كلمة المرور ✓', setupDoneLead: 'سلّم هذين للمسؤول عن القائمة:',
    linkLabel: 'الرابط', continue: 'متابعة إلى لوحة التحكم', copy: 'نسخ', copied: 'تم النسخ ✓', back: 'رجوع',
  },
  en: {
    dir: 'ltr', toggle: 'عربي', toggleTitle: 'التبديل إلى العربية',
    title: 'Flaminio Admin', dashboard: 'Admin', loading: 'Loading…', siteLink: 'Website',
    loginLead: 'Edit the menu, prices and each branch’s details here. Changes appear on the website within about a minute.',
    keyLabel: 'Access key', keyHint: 'The key is in the owner’s guide. Don’t share it with anyone.', remember: 'Remember me on this device',
    login: 'Sign in', checking: 'Checking…',
    errNoPush: 'This key can’t save. On GitHub, give the key Contents: Read and write, then press “Save & publish” again. Your edits are still here.', err401: 'The key is wrong or has expired.',
    err404: 'The key can’t reach the Flaminio website. Make sure you picked the right repository when creating it.', errNet: 'Couldn’t connect. Check your internet.',
    logout: 'Sign out', logoutShort: 'Sign out', switchBranch: 'Switch branch',
    pickTitle: 'Which branch do you want to edit?', pickNote: 'Each branch is saved separately. After “Save & publish”, that branch’s site updates within about a minute.',
    branchOf: '{b} branch', loadingBranch: 'Loading branch details…', loadFailed: 'Couldn’t load', retry: 'Try again', noBranchData: 'There is no data for this branch on the website.',
    confirmSwitch: 'You have unsaved changes. Leave them and switch branch?', confirmLogout: 'You have unsaved changes. Sign out without saving?',
    tabInfo: 'Branch details', tabMenu: 'Menu',
    phoneCard: 'Phone & WhatsApp', phone: 'Phone number', phoneShows: 'Shown on the website as', whatsapp: 'WhatsApp number (leave empty if same as phone)', whatsappHint: 'Booking requests from the website go to this number.',
    addressCard: 'Address', findTitleAr: 'Short address (Arabic)', findTitleEn: 'Short address (English)', findTitleHint: 'Shown large on the “Find us” card.',
    findSubAr: 'Line under the address (Arabic)', findSubEn: 'Line under the address (English)', findSubHint: 'For example: Near Asayel Resort · Benghazi',
    addressAr: 'Full address (Arabic)', addressEn: 'Full address (English)', maps: 'Google Maps link', mapsHint: 'Open the restaurant in Google Maps, tap “Share” and copy the link.',
    hoursCard: 'Opening hours', hoursAr: 'Opening hours (Arabic)', hoursEn: 'Opening hours (English)', chefCard: 'Chef', chef: 'Executive chef’s name (optional, shown above the menu)',
    cats: 'Categories', addCat: '+ Add category', catAr: 'Category name (Arabic)', catEn: 'Category name (English)', catPhoto: 'Category photo (shown beside the menu)',
    catUp: 'Move category up', catDown: 'Move category down', delCat: 'Delete category', newCatAr: 'قسم جديد', groupAr: 'Group name (Arabic)', groupEn: 'Group name (English)',
    noItemsGroup: 'No dishes in this group yet.', addToGroup: '+ Add dish to “{g}”', noItems: 'No dishes yet. Tap “Add dish”.', addItem: '+ Add dish', noCats: 'No categories yet.',
    dishAr: 'Dish name (Arabic)', dishEn: 'Dish name (English)', price: 'Price', priceLabel: 'Price in LYD', isNew: 'New', hide: 'Hide from menu',
    up: 'Move up', down: 'Move down', delItem: 'Delete dish', desc: 'Description (optional)', descAr: 'Description in Arabic', descEn: 'Description in English',
    changePhoto: 'Change photo', addPhoto: 'Add photo', removePhoto: 'Remove photo', dropHere: 'Drop a photo here<br>or tap to choose', dropShort: '+ Photo', preparing: 'Preparing photo…',
    notImage: 'That file isn’t a photo. Choose a JPG or PNG.', badImage: 'Couldn’t read that photo. Try another one.',
    confirmDelCat: 'Delete the “{c}” category and all its dishes ({n})?', confirmDelItem: 'Delete “{d}”?', thisDish: 'this dish',
    chInfo: 'branch details', chCats: 'categories', chAdd: 'added “{d}”', chEdit: 'edited “{d}”', chDel: 'deleted a dish',
    none: 'No changes', unsaved1: '1 unsaved change', unsaved2: '2 unsaved changes', unsavedN: '{n} unsaved changes',
    discard: 'Undo', save: 'Save & publish', confirmDiscard: 'Undo all unsaved changes?',
    noName: 'A dish has no name. Add a name or delete it.', saving: 'Saving…', uploading: 'Uploading photos… ({i}/{n})', publishing: 'Publishing…',
    conflict: 'This branch was changed from another device. Reload the page, then make your changes again.', nothing: 'Nothing to save.',
    savedBuilding: 'Saved ✓ Updating the website… (about a minute)', savedToast: 'Saved. The website updates in about a minute.',
    live: 'Live on the website ✓', openPage: 'Open the page', deployFailed: 'Saved, but publishing failed. Try again or contact the site admin.',
    saved: 'Saved ✓', saveFailed: 'Couldn’t save. Please try again.', netCheck: 'Couldn’t check the connection. Check your internet.',
    pwLabel: 'Password', pwLogin: 'Sign in', pwWrong: 'Wrong password.', pwUnlocking: 'Unlocking…',
    useKey: 'Sign in with a GitHub key instead', usePw: 'Sign in with the password', noLock: 'No password has been set yet. Sign in with the GitHub key, then tap “Password” to set one.',
    firstTitle: 'First-time setup', firstLead: 'No password has been set for the admin yet. One time only: the owner pastes the GitHub key (it is in the owner guide) and chooses the password. After that, the link and the password are all anyone needs, on any phone.',
    firstBtn: 'Start setup', keyOnly: 'Sign in with the GitHub key only (no password)', pwPlaceholder: 'e.g. Admin123 or something stronger',
    keyStale: 'The password is right, but the GitHub key behind it has expired or was deleted. Paste a new key here; the password stays the same for everyone.',
    diagOwner: 'This key belongs to another GitHub account ({u}). The website is in the {o} account, so create the key while signed in as {o}.',
    diagRepo: 'This key can’t reach the Flaminio repository. When creating it, under “Repository access” choose “Only select repositories” and pick Flaminio. The default, “Public repositories”, is read-only.',
    diagContents: 'This key can’t save. Under “Repository permissions” set Contents to Read and write, and make sure “Repository access” is “Only select repositories” with Flaminio picked. Then press Update, or create a new key.',
    diagBlocked: 'GitHub refused to save: {m}',
    keyHow: 'To create the key: open the link while signed in as {o}. Under “Repository access” choose “Only select repositories” and pick Flaminio, check that Contents is Read and write, then press Generate token and copy it.', keyLink: 'Open the key page',
    newKey: 'New GitHub key', rekey: 'Save the new key', rekeying: 'Saving…', keyUpdated: 'Key updated ✓ The password has not changed.',
    quickTitle: 'Set the admin password (one time)', quickLead: 'After this, anyone you give the link and password to can sign in without a GitHub key. You won’t be asked again.', quickSave: 'Save password', quickDone: 'Password set ✓ Give the link and password to whoever edits the menu.',
    homeHint: 'To stay signed in on iPhone: tap Share, then “Add to Home Screen”, and open the admin from its icon.', ok: 'OK',
    draftRestored: 'Your unsaved edits were restored.', draftDropped: 'This branch was changed from another device, so your old unsaved edits were not restored.',
    pwMenu: 'Password', setupTitle: 'Set up the password', setupLead: 'One time only: paste the GitHub key and choose a password. After that, the link and the password are all anyone needs.',
    changeTitle: 'Change the password', changeLead: 'Choose a new password. The old one stops working immediately on every device.',
    setupKey: 'GitHub key (starts with github_pat_)', newPw: 'New password', suggest: 'Suggest another',
    pwRule: 'At least three words or 14 characters. The suggestion is easy to type and strong enough.', pwWeak: 'That password is too short or easy to guess. Use at least three words or 14 characters.',
    weakOk: 'Use a weak password at my own risk (it can be guessed; change it later if you can)', pwWeakTick: 'That password is weak. To keep it anyway, tick “at my own risk”.',
    setupSave: 'Save password', setupSaving: 'Encrypting and saving…', setupDone: 'Password set ✓', setupDoneLead: 'Give these two things to whoever manages the menu:',
    linkLabel: 'Link', continue: 'Continue to the admin', copy: 'Copy', copied: 'Copied ✓', back: 'Back',
  },
};
let lang = 'ar';
try { if (localStorage.getItem(LANG_KEY) === 'en') lang = 'en'; } catch (e) { /* storage unavailable */ }
const t = (key, vars = {}) => String(L[lang][key] ?? L.ar[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ''));
const bname = b => (lang === 'en' ? b.en : b.ar);
const dishName = it => (lang === 'en' ? (it.en || it.ar) : (it.ar || it.en));
const catName = c => (lang === 'en' ? (c.en || c.ar) : (c.ar || c.en));
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = L[lang].dir;
  document.title = t('title');
  document.querySelectorAll('[data-i18n]').forEach(el => { if (el.id !== 'save-status') el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  const btn = $('#lang-btn');
  btn.textContent = t('toggle'); btn.title = t('toggleTitle'); btn.lang = lang === 'en' ? 'ar' : 'en';
}
function setLang(next) {
  lang = next;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
  applyLang();
  // Redraw the current screen from memory; unsaved edits live in `state`, not in the page.
  if (state.screen === 'login') { const v = ($('#token') || $('#password') || {}).value || ''; renderLogin(state.loginError); const f = $('#token') || $('#password'); if (f) f.value = v; }
  else if (state.screen === 'setup') renderSetup(state.setupError);
  else if (state.screen === 'setup-done') renderSetupDone(state.donePw);
  else if (state.screen === 'picker') renderPicker();
  else if (state.screen === 'editor') { renderTop(); renderEditor(); }
  else if (state.screen === 'loading') renderTop();
}

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
  if (JSON.stringify(state.info) !== state.origInfo) list.push(t('chInfo'));
  if (catSignature(state.menu) !== state.origCats) list.push(t('chCats'));
  const seen = new Set();
  for (const c of state.menu) for (const it of itemsOf(c)) {
    seen.add(it._uid);
    const before = state.origItems.get(it._uid);
    if (before === undefined) list.push(t('chAdd', { d: dishName(it) }));
    else if (before !== serializeItem(it)) list.push(t('chEdit', { d: dishName(it) }));
  }
  for (const u of state.origItems.keys()) if (!seen.has(u)) list.push(t('chDel'));
  return list;
}
// Unsaved edits are kept on this device, so a reload or a failed save never loses them.
// Photos waiting to upload can't be kept; their dishes fall back to the photo they had before.
function saveDraft() {
  if (!state.branch || !state.menu || state.screen !== 'editor') return;
  const key = DRAFT_KEY(state.branch.id);
  try {
    if (!changes().length) { localStorage.removeItem(key); return; }
    const menu = cleanMenu(state.menu);
    const origMenu = JSON.parse(state.files[`content/menu-${state.branch.id}.json`].text);
    const origImg = new Map();
    for (const c of origMenu) { origImg.set('c:' + c.id, c.img || null); for (const it of (c.items || c.groups.flatMap(g => g.items))) origImg.set(it.id, it.img || null); }
    const fix = (o, k) => { if (o.img && state.pending.has(o.img)) o.img = origImg.has(k) ? origImg.get(k) : null; };
    for (const c of menu) { fix(c, 'c:' + c.id); for (const it of (c.items || c.groups.flatMap(g => g.items))) fix(it, it.id); }
    localStorage.setItem(key, JSON.stringify({
      shas: Object.fromEntries(Object.entries(state.files).map(([p, f]) => [p, f.sha])),
      info: state.info, menu, removed: [...state.removed].filter(p => !state.pending.has(p)),
    }));
  } catch (e) { /* storage full or blocked: nothing to do */ }
}
const dropDraft = id => { try { localStorage.removeItem(DRAFT_KEY(id)); } catch (e) { /* ignore */ } };
// Put a saved draft back on top of freshly loaded files, keeping each dish's identity (by id) so
// the change counter only counts real edits.
function restoreDraft(id) {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(DRAFT_KEY(id)) || 'null'); } catch (e) { d = null; }
  if (!d) return;
  const same = Object.keys(state.files).every(p => d.shas && d.shas[p] === state.files[p].sha);
  if (!same) { dropDraft(id); toast(t('draftDropped'), true, 6000); return; }
  const uidOf = new Map();
  for (const c of state.menu) { uidOf.set('c:' + c.id, c._uid); for (const it of itemsOf(c)) uidOf.set(it.id, it._uid); }
  for (const c of d.menu) {
    c._uid = uidOf.get('c:' + c.id) || uid();
    if (c.groups) for (const g of c.groups) { g._uid = uid(); for (const it of g.items) it._uid = uidOf.get(it.id) || uid(); }
    else for (const it of c.items) it._uid = uidOf.get(it.id) || uid();
  }
  state.info = d.info; state.menu = d.menu;
  for (const p of d.removed || []) state.removed.add(p);
  toast(t('draftRestored'), false, 4000);
}
function updateSaveBar() {
  const bar = $('#savebar'), st = $('#save-status'), btn = $('#save-btn'), discard = $('#discard-btn');
  if (!state.branch || !state.menu) { bar.hidden = true; requestAnimationFrame(fitBars); return; }
  bar.hidden = false;
  requestAnimationFrame(fitBars);
  if (state.busy) return;
  const n = changes().length;
  st.className = 'savebar-status';
  saveDraft();
  const count = n === 1 ? t('unsaved1') : n === 2 ? t('unsaved2') : t('unsavedN', { n });
  // A failed save stays on screen (not only in the pop-up) until the next save succeeds.
  if (n && state.status && state.status.cls === 'is-error') { st.className += ' is-error'; st.textContent = `${t(state.status.key, state.status.vars || {})} (${count})`; }
  else if (n) st.textContent = count;
  else if (state.status) { st.className += ' ' + state.status.cls; st.innerHTML = statusHtml(state.status); }
  else st.textContent = t('none');
  btn.disabled = !n;
  discard.hidden = !n;
}
// Save status is stored as a message key (+ optional link) so it follows the language toggle.
function statusHtml(s) {
  return esc(t(s.key, s.vars)) + (s.link ? ` <a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(t('openPage'))}</a>` : '');
}
function renderTop() {
  $('#top-branch').textContent = state.branch ? t('branchOf', { b: bname(state.branch) }) : '';
  if (state.screen === 'login' || state.screen === 'setup' || state.screen === 'setup-done') { $('#top-actions').innerHTML = ''; return; }
  if (state.screen === 'picker') {
    $('#top-actions').innerHTML = `<button class="btn btn-ghost btn-sm" id="pw-btn" type="button">${esc(t('pwMenu'))}</button><button class="btn btn-ghost btn-sm" id="logout-btn" type="button">${esc(t('logoutShort'))}</button>`;
    $('#pw-btn').addEventListener('click', () => renderSetup());
    $('#logout-btn').addEventListener('click', logout);
    return;
  }
  $('#top-actions').innerHTML = `<button class="btn btn-ghost btn-sm" id="logout-btn" type="button">${esc(t('logoutShort'))}</button>`;
  $('#logout-btn').addEventListener('click', () => { if (!changes().length || confirm(t('confirmLogout'))) logout(); });
}
window.addEventListener('beforeunload', e => { if (state.menu && changes().length && !state.busy) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- password lock ----------
   The GitHub key is stored in the repository only in encrypted form (content/admin-lock.json):
   PBKDF2-SHA256 (1,000,000 rounds, random salt) derives an AES-256-GCM key from the password. */
const LOCK_PATH = 'content/admin-lock.json';
const ITER = 1000000;
const WORDS = 'amber anchor apple arch basil bay bell berry birch bloom bread breeze brook cedar cherry cloud clover coast coral cotton crane crystal daisy dawn delta dove dune eagle ember fern fig flame flint forest fox garden ginger glade grape harbor hazel heron honey island ivory jade jasmine lemon lily lime linen lotus maple marble meadow melon mint mist moon moss night oak ocean olive orange orchid palm pearl pepper pine plum pond poppy quartz rain raven reef river robin rose sage salt sand sea shell silk silver sky snow spice spring star stone storm sugar summer sun swan thyme tide tiger tulip valley velvet violet wave willow wind winter wolf'.split(' ');
const bytesB64 = u8 => btoa(String.fromCharCode(...u8));
const b64Bytes = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
function suggestPassword() {
  const r = crypto.getRandomValues(new Uint32Array(4));
  return [WORDS[r[0] % WORDS.length], WORDS[r[1] % WORDS.length], WORDS[r[2] % WORDS.length], String(1000 + (r[3] % 9000))].join('-');
}
function strongEnough(pw) {
  const p = pw.trim();
  const words = p.split(/[\s\-_.]+/).filter(w => w.length >= 3);
  return p.length >= 14 || (words.length >= 3 && p.length >= 12);
}
async function deriveKey(password, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password.trim()), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function sealToken(token, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ITER);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(token)));
  return { v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, cipher: 'AES-256-GCM', salt: bytesB64(salt), iv: bytesB64(iv), data: bytesB64(ct) };
}
async function openToken(lock, password) {
  const key = await deriveKey(password, b64Bytes(lock.salt), lock.iter);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64Bytes(lock.iv) }, key, b64Bytes(lock.data));
  return new TextDecoder().decode(pt);
}
// The lock is public data: read it without a key, freshest source first.
async function fetchLock() {
  const sources = [
    // A unique query string skips GitHub's shared cache, so a new or changed password works at once.
    [`${API}/repos/${cfg.repo}/contents/${LOCK_PATH}?ref=${encodeURIComponent(cfg.branch)}&t=${Date.now()}`, { Accept: 'application/vnd.github.raw+json' }],
    [`https://raw.githubusercontent.com/${cfg.repo}/${cfg.branch}/${LOCK_PATH}?t=${Date.now()}`, {}],
    [`../${LOCK_PATH}?t=${Date.now()}`, {}],
  ];
  for (const [url, headers] of sources) {
    try {
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (res.status === 404) continue;
      if (!res.ok) continue;
      const lock = await res.json();
      if (lock && lock.data && lock.salt) return lock;
    } catch (e) { /* try the next source */ }
  }
  return null;
}
// Is this a working key for the site's repository? Write access is enforced by GitHub itself
// on every save; a refused write is reported as "no permission" (see asWriteError).
async function checkKey() {
  return gh(`/repos/${cfg.repo}`);
}
// Can this key actually save? Creating a blob needs Contents: write but changes nothing on the site
// (an unreferenced blob is invisible and cleaned up by GitHub). A refusal is turned into a precise message.
async function verifyWrite() {
  const owner = cfg.repo.split('/')[0];
  let login = '';
  try { login = (await gh('/user')).login || ''; } catch (e) { if (e.status === 401) throw e; }
  try { await gh(`/repos/${cfg.repo}/git/blobs`, { method: 'POST', body: { content: 'flaminio admin key check', encoding: 'utf-8' } }); }
  catch (e) {
    if (e.status === 401) throw e;
    state.errVars = { u: login, o: owner, m: e.message };
    if (login && login.toLowerCase() !== owner.toLowerCase() && String(state.token).startsWith('github_pat_')) e.key = 'diagOwner';
    else if (e.status === 404) e.key = 'diagRepo';
    else if (e.status === 403 && /not accessible|permission/i.test(e.message)) e.key = 'diagContents';
    else if (e.status === 403 || e.status === 422) e.key = 'diagBlocked';
    throw e;
  }
}
const KEY_URL = () => `https://github.com/settings/personal-access-tokens/new?name=Flaminio+admin&description=Flaminio+website+admin&target_name=${encodeURIComponent(cfg.repo.split('/')[0])}&expires_in=365&contents=write&actions=read`;
const keyHelp = () => `<p class="hint-box">${esc(t('keyHow', { o: cfg.repo.split('/')[0] }))} <a href="${esc(KEY_URL())}" target="_blank" rel="noopener">${esc(t('keyLink'))}</a></p>`;
const asWriteError = err => ((err.status === 403 || err.status === 404) && !err.key ? Object.assign(err, { key: 'errNoPush' }) : err);
function keepToken(token) {
  try { (state.remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token); } catch (e) { /* storage blocked: stay signed in for this page only */ }
}

/* ---------- login ---------- */
function renderLogin(error = '') {
  state.screen = 'login'; state.loginError = error;
  renderTop();
  $('#savebar').hidden = true;
  const usePw = state.lock && state.loginMode !== 'key';
  // No password yet (the lock file is missing): explain the one-time setup instead of showing a key form.
  if (!state.lock && state.loginMode !== 'key') {
    $('#app').innerHTML = `
    <section class="login">
      <img class="logo" src="../img/logo-burgundy.png" alt="">
      <h1>${esc(t('firstTitle'))}</h1>
      <div class="card" style="margin-top:18px">
        <p>${esc(t('firstLead'))}</p>
        ${error ? `<p class="error" role="alert">${esc(t(error, state.errVars || {}))}</p>` : ''}
        <button class="btn btn-primary btn-lg" type="button" id="first-btn">${esc(t('firstBtn'))}</button>
        <button class="linklike" type="button" id="mode-btn">${esc(t('keyOnly'))}</button>
      </div>
    </section>`;
    $('#first-btn').addEventListener('click', () => { history.replaceState(null, '', location.pathname + '#setup'); renderSetup(); });
    $('#mode-btn').addEventListener('click', () => { state.loginMode = 'key'; renderLogin(); });
    return;
  }
  $('#app').innerHTML = `
  <section class="login">
    <img class="logo" src="../img/logo-burgundy.png" alt="">
    <h1>${esc(t('title'))}</h1>
    <p class="muted">${esc(t('loginLead'))}</p>
    <form class="card" id="login-form" style="margin-top:18px">
      ${usePw ? `
      <div class="field">
        <label for="password">${esc(t('pwLabel'))}</label>
        <input id="password" name="password" type="password" autocomplete="current-password" dir="ltr" required>
      </div>` : `
      <div class="field">
        <label for="token">${esc(t('keyLabel'))}</label>
        <input id="token" name="token" type="password" autocomplete="off" dir="ltr" placeholder="github_pat_…" required>
        <span class="hint">${esc(t('keyHint'))}</span>
      </div>
      ${keyHelp()}
      ${state.lock ? '' : `<p class="hint-box">${esc(t('noLock'))}</p>`}`}
      <label class="check"><input type="checkbox" id="remember" checked> <span>${esc(t('remember'))}</span></label>
      ${error ? `<p class="error" role="alert">${esc(t(error, state.errVars || {}))}</p>` : ''}
      ${error === 'keyStale' && state.stalePw ? `<div class="field"><label for="new-key">${esc(t('newKey'))}</label><input id="new-key" type="password" autocomplete="off" dir="ltr" placeholder="github_pat_…"></div>
      <button class="btn btn-primary btn-lg" type="button" id="rekey-btn">${esc(t('rekey'))}</button>` : `
      <button class="btn btn-primary btn-lg" type="submit">${esc(usePw ? t('pwLogin') : t('login'))}</button>`}
      <button class="linklike" type="button" id="mode-btn">${esc(usePw ? t('useKey') : state.lock ? t('usePw') : t('back'))}</button>
    </form>
  </section>`;
  const modeBtn = $('#mode-btn');
  if (modeBtn) modeBtn.addEventListener('click', () => { state.loginMode = usePw ? 'key' : 'pw'; renderLogin(); });
  const rekeyBtn = $('#rekey-btn');
  if (rekeyBtn) rekeyBtn.addEventListener('click', async () => {
    const key = $('#new-key').value.trim(); if (!key) { $('#new-key').focus(); return; }
    rekeyBtn.disabled = true; rekeyBtn.textContent = t('rekeying');
    state.token = key;
    try {
      await checkKey(); await verifyWrite();
      const lock = await sealToken(key, state.stalePw);
      await putFile(LOCK_PATH, JSON.stringify(lock, null, 2) + '\n', 'Update admin key, same password / تحديث مفتاح لوحة التحكم');
      state.lock = lock; state.remember = true; keepToken(key); state.stalePw = '';
      renderPicker(); toast(t('keyUpdated'), false, 5000);
    } catch (err) {
      state.token = null; rekeyBtn.disabled = false; rekeyBtn.textContent = t('rekey');
      toast(t(err.status === 401 ? 'err401' : err.key || (err.status === 404 ? 'err404' : 'saveFailed'), state.errVars || {}), true, 9000);
    }
  });
  // The key form is the fallback for both modes: never leave the only sign-in path hidden.
  if (!state.lock) state.loginMode = 'key';
  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    state.remember = $('#remember').checked;
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
    if (usePw) {
      const pw = $('#password').value;
      if (!pw.trim()) { btn.disabled = false; return; }
      btn.textContent = t('pwUnlocking');
      let token;
      try { token = await openToken(state.lock, pw); } catch (err) { renderLogin('pwWrong'); $('#password').focus(); return; }
      state.token = token;
      try { await checkKey(); keepToken(token); state.stalePw = ''; renderPicker(); }
      catch (err) {
        state.token = null;
        if (err.status === 401 || err.status === 404) state.stalePw = pw;
        renderLogin(err.status === 401 || err.status === 404 ? 'keyStale' : err.key || 'errNet');
      }
      return;
    }
    const token = $('#token').value.trim();
    if (!token) { btn.disabled = false; return; }
    btn.textContent = t('checking');
    state.token = token;
    try { await checkKey(); await verifyWrite(); keepToken(token); renderPicker(); }
    catch (err) { state.token = null; renderLogin(err.status === 401 ? 'err401' : err.key || (err.status === 404 ? 'err404' : 'errNet')); }
  });
}
/* ---------- password setup / change ---------- */
function renderSetup(error = '') {
  state.screen = 'setup'; state.setupError = error;
  renderTop();
  $('#savebar').hidden = true;
  const needKey = !state.token;
  const pw = state.setupPw || '';
  $('#app').innerHTML = `
  <section class="login">
    <h1>${esc(needKey ? t('setupTitle') : t('changeTitle'))}</h1>
    <p class="muted">${esc(needKey ? t('setupLead') : t('changeLead'))}</p>
    <form class="card" id="setup-form" style="margin-top:18px">
      ${needKey ? `<div class="field"><label for="setup-key">${esc(t('setupKey'))}</label><input id="setup-key" type="password" autocomplete="off" dir="ltr" placeholder="github_pat_…" required></div>${keyHelp()}` : ''}
      <div class="field">
        <label for="setup-pw">${esc(t('newPw'))}</label>
        <div class="pw-row"><input id="setup-pw" type="text" autocomplete="new-password" autocapitalize="off" spellcheck="false" dir="ltr" value="${esc(pw)}" placeholder="${esc(t('pwPlaceholder'))}" required><button class="btn btn-sm" type="button" id="suggest-btn">${esc(t('suggest'))}</button></div>
        <span class="hint">${esc(t('pwRule'))}</span>
      </div>
      <label class="check" id="weak-row" ${!pw || strongEnough(pw) ? 'hidden' : ''}><input type="checkbox" id="weak-ok" ${state.weakOk ? 'checked' : ''}> <span>${esc(t('weakOk'))}</span></label>
      ${error ? `<p class="error" role="alert">${esc(t(error, state.errVars || {}))}</p>` : ''}
      <button class="btn btn-primary btn-lg" type="submit">${esc(t('setupSave'))}</button>
      <button class="linklike" type="button" id="setup-back">${esc(t('back'))}</button>
    </form>
  </section>`;
  const keyInput = $('#setup-key');
  if (keyInput && state.setupKey) keyInput.value = state.setupKey;
  $('#setup-pw').addEventListener('input', e => { state.setupPw = e.target.value; $('#weak-row').hidden = !e.target.value || strongEnough(e.target.value); });
  $('#weak-ok').addEventListener('change', e => { state.weakOk = e.target.checked; });
  if (keyInput) keyInput.addEventListener('input', e => { state.setupKey = e.target.value; });
  $('#suggest-btn').addEventListener('click', () => { state.setupPw = suggestPassword(); $('#setup-pw').value = state.setupPw; $('#weak-row').hidden = true; });
  $('#setup-back').addEventListener('click', () => { history.replaceState(null, '', location.pathname); state.setupPw = ''; state.setupKey = ''; state.token ? renderPicker() : renderLogin(); });
  $('#setup-form').addEventListener('submit', async e => {
    e.preventDefault();
    const password = $('#setup-pw').value.trim();
    if (!strongEnough(password) && !state.weakOk) { renderSetup('pwWeakTick'); return; }
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = t('setupSaving');
    const hadToken = !!state.token;
    if (!hadToken) state.token = (keyInput.value || '').trim();
    try {
      await checkKey(); await verifyWrite();
      const lock = await sealToken(state.token, password);
      await putFile(LOCK_PATH, JSON.stringify(lock, null, 2) + '\n', hadToken ? 'Change admin password / تغيير كلمة مرور لوحة التحكم' : 'Set admin password / تعيين كلمة مرور لوحة التحكم');
      state.lock = lock; state.remember = true; keepToken(state.token);
      state.setupPw = ''; state.setupKey = '';
      renderSetupDone(password);
    } catch (err) {
      if (!hadToken) state.token = null;
      renderSetup(err.status === 401 ? 'err401' : err.key || (err.status === 404 ? 'err404' : 'saveFailed'));
    }
  });
}
function renderSetupDone(password) {
  state.screen = 'setup-done'; state.donePw = password;
  renderTop();
  const link = `${cfg.siteUrl}admin/`;
  $('#app').innerHTML = `
  <section class="login">
    <h1>${esc(t('setupDone'))}</h1>
    <div class="card">
      <p>${esc(t('setupDoneLead'))}</p>
      <div class="field"><label>${esc(t('linkLabel'))}</label><div class="pw-row"><input readonly dir="ltr" value="${esc(link)}" id="done-link"><button class="btn btn-sm" type="button" data-copy="done-link">${esc(t('copy'))}</button></div></div>
      <div class="field"><label>${esc(t('pwLabel'))}</label><div class="pw-row"><input readonly dir="ltr" value="${esc(password)}" id="done-pw"><button class="btn btn-sm" type="button" data-copy="done-pw">${esc(t('copy'))}</button></div></div>
      <button class="btn btn-primary btn-lg" type="button" id="done-continue">${esc(t('continue'))}</button>
    </div>
  </section>`;
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const input = $('#' + b.dataset.copy);
    try { await navigator.clipboard.writeText(input.value); b.textContent = t('copied'); } catch (e) { input.select(); }
  }));
  $('#done-continue').addEventListener('click', () => { history.replaceState(null, '', location.pathname); renderPicker(); });
}
// Create or update one file on the branch with a single commit.
async function putFile(path, text, message) {
  let sha;
  try { sha = (await gh(`/repos/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`)).sha; } catch (e) { if (e.status !== 404) throw e; }
  try { return await gh(`/repos/${cfg.repo}/contents/${path}`, { method: 'PUT', body: { message, content: textToB64(text), branch: cfg.branch, ...(sha ? { sha } : {}) } }); }
  catch (e) { throw asWriteError(e); }
}
function logout() {
  localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY);
  state.token = null; state.branch = null; state.menu = null; state.status = null; state.loginMode = 'pw';
  renderLogin();
}

/* ---------- branch picker ---------- */
function renderPicker() {
  state.branch = null; state.menu = null; state.status = null; state.screen = 'picker';
  renderTop();
  updateSaveBar();
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  let hintSeen = false; try { hintSeen = localStorage.getItem(HINT_KEY) === '1'; } catch (e) { /* ignore */ }
  const quickPw = state.quickPw || '';
  $('#app').innerHTML = `
  ${state.lock ? '' : `
  <form class="card quick-pw" id="quick-form">
    <h2>${esc(t('quickTitle'))}</h2>
    <p class="muted">${esc(t('quickLead'))}</p>
    <div class="field"><label for="quick-pw">${esc(t('newPw'))}</label><input id="quick-pw" type="text" autocomplete="new-password" autocapitalize="off" spellcheck="false" dir="ltr" placeholder="${esc(t('pwPlaceholder'))}" value="${esc(quickPw)}" required></div>
    <label class="check" id="quick-weak-row" ${!quickPw || strongEnough(quickPw) ? 'hidden' : ''}><input type="checkbox" id="quick-weak" ${state.weakOk ? 'checked' : ''}> <span>${esc(t('weakOk'))}</span></label>
    ${state.quickError ? `<p class="error" role="alert">${esc(t(state.quickError, state.errVars || {}))}</p>` : ''}
    <button class="btn btn-primary" type="submit">${esc(t('quickSave'))}</button>
  </form>`}
  ${ios && !standalone && !hintSeen ? `<p class="notice home-hint">${esc(t('homeHint'))} <button class="linklike" type="button" id="hint-ok">${esc(t('ok'))}</button></p>` : ''}
  <h1>${esc(t('pickTitle'))}</h1>
  <div class="picker">
    ${cfg.branches.map(b => `<button class="pick" type="button" data-branch="${b.id}">${esc(bname(b))}<small>${esc(lang === 'en' ? (b.placeEn || '') : b.placeAr)}</small></button>`).join('')}
  </div>
  <p class="notice">${esc(t('pickNote'))}</p>`;
  document.querySelectorAll('[data-branch]').forEach(btn => btn.addEventListener('click', () => loadBranch(btn.dataset.branch)));
  const hintOk = $('#hint-ok');
  if (hintOk) hintOk.addEventListener('click', () => { try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* ignore */ } hintOk.parentElement.remove(); });
  const quick = $('#quick-form');
  if (!quick) return;
  $('#quick-pw').addEventListener('input', e => { state.quickPw = e.target.value; $('#quick-weak-row').hidden = !e.target.value || strongEnough(e.target.value); });
  $('#quick-weak').addEventListener('change', e => { state.weakOk = e.target.checked; });
  quick.addEventListener('submit', async e => {
    e.preventDefault();
    const password = $('#quick-pw').value.trim();
    if (!password) return;
    if (!strongEnough(password) && !state.weakOk) { state.quickError = 'pwWeakTick'; renderPicker(); return; }
    const btn = quick.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = t('setupSaving');
    try {
      await verifyWrite();
      const lock = await sealToken(state.token, password);
      await putFile(LOCK_PATH, JSON.stringify(lock, null, 2) + '\n', 'Set admin password / تعيين كلمة مرور لوحة التحكم');
      state.lock = lock; state.quickPw = ''; state.quickError = '';
      renderPicker(); toast(t('quickDone'), false, 6000);
    } catch (err) {
      state.quickError = err.status === 401 ? 'err401' : err.key || 'saveFailed';
      renderPicker();
    }
  });
}

/* ---------- loading content ---------- */
async function loadBranch(id) {
  state.branch = cfg.branches.find(b => b.id === id);
  state.screen = 'loading'; state.menu = null;
  $('#app').innerHTML = `<p class="loading">${esc(t('loadingBranch'))}</p>`;
  renderTop();
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
    if (!state.info) throw new Error(t('noBranchData'));
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
    state.screen = 'editor';
    restoreDraft(id);
    state.tab = 'info'; state.catUid = state.menu[0] && state.menu[0]._uid;
    state.screen = 'editor';
    renderEditor();
  } catch (err) {
    $('#app').innerHTML = `<div class="card"><h2>${esc(t('loadFailed'))}</h2><p>${esc(err.message)}</p><button class="btn" id="retry" type="button">${esc(t('retry'))}</button></div>`;
    $('#retry').addEventListener('click', () => loadBranch(id));
  }
}

/* ---------- editor ---------- */
function renderEditor() {
  $('#app').innerHTML = `
  <div class="editor-bar"><button class="linklike" type="button" id="switch-btn">‹ ${esc(t('switchBranch'))}</button><span class="editor-branch">${esc(t('branchOf', { b: bname(state.branch) }))}</span></div>
  <div class="tabs" role="tablist">
    <button class="tab${state.tab === 'info' ? ' is-active' : ''}" type="button" data-tab="info" role="tab">${esc(t('tabInfo'))}</button>
    <button class="tab${state.tab === 'menu' ? ' is-active' : ''}" type="button" data-tab="menu" role="tab">${esc(t('tabMenu'))}</button>
  </div>
  <div id="panel"></div>`;
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; renderEditor(); }));
  $('#switch-btn').addEventListener('click', () => { if (!changes().length || confirm(t('confirmSwitch'))) renderPicker(); });
  // One set of listeners per panel element; redrawing the panel's contents never adds more.
  const panel = $('#panel');
  panel.addEventListener('input', e => (state.tab === 'info' ? onInfoInput(e) : onMenuInput(e)));
  panel.addEventListener('change', e => { if (state.tab === 'menu') onMenuInput(e); });
  panel.addEventListener('click', e => { if (state.tab === 'menu') onMenuClick(e); });
  if (state.tab === 'info') renderInfo(); else renderMenu();
  updateSaveBar();
}

function field(label, name, value, { hint = '', dir = '', textarea = false, type = 'text', placeholder = '' } = {}) {
  const attrs = `id="f-${name}" name="${name}" data-info="${name}"${dir ? ` dir="${dir}"` : ''}${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}`;
  return `<div class="field"><label for="f-${name}">${label}</label>${textarea
    ? `<textarea ${attrs}>${esc(value)}</textarea>`
    : `<input type="${type}" ${attrs} value="${esc(value)}">`}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
}
// Arabic/English field pairs: the interface language's box comes first.
const pair = (arHtml, enHtml) => (lang === 'en' ? enHtml + arHtml : arHtml + enHtml);
function renderInfo() {
  const i = state.info;
  $('#panel').innerHTML = `
  <div class="card">
    <h2>${esc(t('phoneCard'))}</h2>
    ${field(esc(t('phone')), 'phone', i.phone, { dir: 'ltr', type: 'tel', placeholder: '0910181666', hint: `${esc(t('phoneShows'))} <span class="preview-number" id="phone-preview">${esc(displayNumber(i.phone))}</span>` })}
    ${field(esc(t('whatsapp')), 'whatsapp', i.whatsapp || '', { dir: 'ltr', type: 'tel', placeholder: '0910181666', hint: esc(t('whatsappHint')) })}
  </div>
  <div class="card">
    <h2>${esc(t('addressCard'))}</h2>
    <div class="grid-2">
      ${pair(field(esc(t('findTitleAr')), 'findTitle.ar', i.findTitle.ar, { dir: 'rtl', hint: esc(t('findTitleHint')) }), field(esc(t('findTitleEn')), 'findTitle.en', i.findTitle.en, { dir: 'ltr' }))}
      ${pair(field(esc(t('findSubAr')), 'findSub.ar', i.findSub.ar, { dir: 'rtl', hint: esc(t('findSubHint')) }), field(esc(t('findSubEn')), 'findSub.en', i.findSub.en, { dir: 'ltr' }))}
      ${pair(field(esc(t('addressAr')), 'address.ar', i.address.ar, { dir: 'rtl', textarea: true }), field(esc(t('addressEn')), 'address.en', i.address.en, { textarea: true, dir: 'ltr' }))}
    </div>
    ${field(esc(t('maps')), 'maps', i.maps || '', { dir: 'ltr', type: 'url', placeholder: 'https://maps.app.goo.gl/…', hint: esc(t('mapsHint')) })}
  </div>
  <div class="card">
    <h2>${esc(t('hoursCard'))}</h2>
    <div class="grid-2">
      ${pair(field(esc(t('hoursAr')), 'hours.ar', (i.hours && i.hours.ar) || '', { dir: 'rtl', textarea: true, placeholder: 'يومياً من 12 ظهراً إلى 12 منتصف الليل' }), field(esc(t('hoursEn')), 'hours.en', (i.hours && i.hours.en) || '', { textarea: true, dir: 'ltr', placeholder: 'Daily 12:00 – 00:00' }))}
    </div>
  </div>
  <div class="card">
    <h2>${esc(t('chefCard'))}</h2>
    ${field(esc(t('chef')), 'chef', i.chef || '', { dir: 'ltr' })}
  </div>`;
}
function onInfoInput(e) {
  const el = e.target.closest('[data-info]'); if (!el) return;
  const [a, b] = el.dataset.info.split('.');
  if (b) { if (!state.info[a]) state.info[a] = {}; state.info[a][b] = el.value; } else state.info[a] = el.value.trim();
  if (a === 'phone') $('#phone-preview').textContent = displayNumber(el.value);
  updateSaveBar();
}

function renderMenu() {
  const cat = state.menu.find(c => c._uid === state.catUid) || state.menu[0];
  if (cat) state.catUid = cat._uid;
  const idx = state.menu.indexOf(cat);
  $('#panel').innerHTML = `
  <div class="card cat-head">
    <h2>${esc(t('cats'))}</h2>
    <div class="chips">
      ${state.menu.map(c => `<button class="chip${c === cat ? ' is-active' : ''}" type="button" data-cat="${c._uid}">${esc(catName(c))}</button>`).join('')}
      <button class="chip chip-add" type="button" data-act="add-cat">${esc(t('addCat'))}</button>
    </div>
  </div>
  ${cat ? `
  <div class="card">
    <div class="grid-2">
      ${pair(`<div class="field"><label for="cat-ar">${esc(t('catAr'))}</label><input id="cat-ar" data-cat-field="ar" dir="rtl" value="${esc(cat.ar)}"></div>`, `<div class="field"><label for="cat-en">${esc(t('catEn'))}</label><input id="cat-en" data-cat-field="en" dir="ltr" value="${esc(cat.en)}"></div>`)}
    </div>
    <div class="field"><label>${esc(t('catPhoto'))}</label>${dropZone(cat, 'cat')}</div>
    <div class="cat-tools">
      <span class="order"><button class="icon-btn" type="button" data-act="cat-up" ${idx === 0 ? 'disabled' : ''} title="${esc(t('catUp'))}" aria-label="${esc(t('catUp'))}">▲</button><button class="icon-btn" type="button" data-act="cat-down" ${idx === state.menu.length - 1 ? 'disabled' : ''} title="${esc(t('catDown'))}" aria-label="${esc(t('catDown'))}">▼</button></span>
      <span class="spacer"></span>
      <button class="btn btn-sm btn-danger" type="button" data-act="del-cat">${esc(t('delCat'))}</button>
    </div>
  </div>
  ${cat.groups
    ? cat.groups.map(g => `<div class="group-head">${pair(`<input data-group="${g._uid}" data-group-field="ar" dir="rtl" value="${esc(g.ar)}" aria-label="${esc(t('groupAr'))}">`, `<input data-group="${g._uid}" data-group-field="en" dir="ltr" value="${esc(g.en)}" aria-label="${esc(t('groupEn'))}">`)}</div>
      <div class="items">${g.items.map((it, i) => itemCard(it, i, g.items.length)).join('') || `<p class="empty">${esc(t('noItemsGroup'))}</p>`}</div>
      <button class="btn" type="button" data-act="add-item" data-group="${g._uid}">${esc(t('addToGroup', { g: lang === 'en' ? (g.en || g.ar) : (g.ar || g.en) }))}</button>`).join('')
    : `<div class="items">${cat.items.map((it, i) => itemCard(it, i, cat.items.length)).join('') || `<p class="empty">${esc(t('noItems'))}</p>`}</div>
      <button class="btn btn-lg" type="button" data-act="add-item">${esc(t('addItem'))}</button>`}
  ` : `<p class="empty">${esc(t('noCats'))}</p>`}`;

  initDropZones($('#panel'));
  const active = $('.chip.is-active');
  if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function itemCard(it, i, n) {
  const arName = `<input name="ar" dir="rtl" value="${esc(it.ar)}" placeholder="${esc(t('dishAr'))}" aria-label="${esc(t('dishAr'))}">`;
  const enName = `<input name="en" dir="ltr" autocapitalize="words" value="${esc(it.en)}" placeholder="${esc(t('dishEn'))}" aria-label="${esc(t('dishEn'))}">`;
  const arDesc = `<textarea name="dar" dir="rtl" placeholder="${esc(t('descAr'))}">${esc(it.dar)}</textarea>`;
  const enDesc = `<textarea name="den" dir="ltr" placeholder="${esc(t('descEn'))}">${esc(it.den)}</textarea>`;
  return `<div class="item${it.hidden ? ' is-hidden' : ''}" data-item="${it._uid}">
    ${dropZone(it, 'item')}
    <div class="item-main">
      <div class="item-fields">
        ${pair(arName, enName)}
        <input name="price" inputmode="decimal" enterkeyhint="done" value="${it.price == null ? '' : it.price}" placeholder="${esc(t('price'))}" aria-label="${esc(t('priceLabel'))}">
      </div>
      <div class="item-row">
        <label class="switch"><input type="checkbox" name="isNew" ${it.isNew ? 'checked' : ''}> <span>${esc(t('isNew'))}</span></label>
        <label class="switch"><input type="checkbox" name="hidden" ${it.hidden ? 'checked' : ''}> <span>${esc(t('hide'))}</span></label>
        <span class="order"><button class="icon-btn" type="button" data-act="item-up" ${i === 0 ? 'disabled' : ''} title="${esc(t('up'))}" aria-label="${esc(t('up'))}">▲</button><button class="icon-btn" type="button" data-act="item-down" ${i === n - 1 ? 'disabled' : ''} title="${esc(t('down'))}" aria-label="${esc(t('down'))}">▼</button><button class="icon-btn" type="button" data-act="del-item" title="${esc(t('delItem'))}" aria-label="${esc(t('delItem'))}">🗑</button></span>
      </div>
      <details class="desc">
        <summary>${esc(t('desc'))}</summary>
        ${pair(arDesc, enDesc)}
      </details>
    </div>
  </div>`;
}
function dropZone(obj, kind) {
  const src = previewSrc(obj.img);
  return `<div class="drop${obj.img ? ' has-photo' : ''}${kind === 'cat' ? ' drop-lg' : ''}" data-drop="${obj._uid}" data-kind="${kind}" role="button" tabindex="0" aria-label="${esc(obj.img ? t('changePhoto') : t('addPhoto'))}">
    ${obj.img ? `<img src="${esc(src)}" alt=""><button class="remove" type="button" data-act="remove-photo" title="${esc(t('removePhoto'))}" aria-label="${esc(t('removePhoto'))}">×</button>` : `<span class="drop-label">${t('dropHere')}</span><span class="drop-label-short">${esc(t('dropShort'))}</span>`}
  </div>`;
}

function onMenuInput(e) {
  const el = e.target;
  if (el.dataset.catField) { const { cat } = findByUid(state.catUid); cat[el.dataset.catField] = el.value; const chip = $(`.chip[data-cat="${cat._uid}"]`); if (chip) chip.textContent = catName(cat) || '…'; }
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
    const c = { _uid: uid(), id: `c-${stamp()}`, en: 'New category', ar: L.ar.newCatAr, img: null, items: [] };
    state.menu.push(c); state.catUid = c._uid; renderMenu(); const first = $(lang === 'en' ? '#cat-en' : '#cat-ar'); first.focus(); first.select();
  } else if (act === 'del-cat') {
    if (!confirm(t('confirmDelCat', { c: catName(cat), n: itemsOf(cat).length }))) return;
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
    last.scrollIntoView({ block: 'center', behavior: 'smooth' }); last.querySelector(lang === 'en' ? 'input[name="en"]' : 'input[name="ar"]').focus();
  } else if (card) {
    const { item } = findByUid(card.dataset.item);
    const list = cat.groups ? cat.groups.find(g => g.items.includes(item)).items : cat.items;
    const i = list.indexOf(item);
    if (act === 'del-item') {
      if (!confirm(t('confirmDelItem', { d: dishName(item) || t('thisDish') }))) return;
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
  if (!/^image\//.test(file.type)) { toast(t('notImage'), true); return; }
  const found = findByUid(zone.dataset.drop);
  const target = zone.dataset.kind === 'cat' ? found.cat : found.item;
  if (!target) return;
  try {
    zone.innerHTML = `<span>${esc(t('preparing'))}</span>`;
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
    toast(t('badImage'), true);
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
  for (const c of state.menu) for (const it of itemsOf(c)) if (!it.ar.trim() && !it.en.trim()) { toast(t('noName'), true); return; }
  state.busy = true;
  const st = $('#save-status'), btn = $('#save-btn'); btn.disabled = true; $('#discard-btn').hidden = true;
  const setStatus = (text, cls) => { st.className = 'savebar-status ' + cls; st.textContent = text; };
  try {
    setStatus(t('saving'), 'is-busy');
    // Someone else may have saved since we loaded: accept if our files are unchanged, otherwise ask to reload.
    const ref = await gh(`/repos/${cfg.repo}/git/ref/heads/${cfg.branch}`);
    if (ref.object.sha !== state.head) {
      for (const p of Object.keys(state.files)) {
        const f = await gh(`/repos/${cfg.repo}/contents/${p}?ref=${ref.object.sha}`);
        if (f.sha !== state.files[p].sha) throw Object.assign(new Error(t('conflict')), { key: 'conflict' });
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
    for (const [path, blob] of state.pending) { n++; setStatus(t('uploading', { i: n, n: state.pending.size }), 'is-busy'); await put(path, await blobToB64(blob)); }
    for (const path of state.removed) if (!state.pending.has(path)) tree.push({ path, mode: '100644', type: 'blob', sha: null });
    if (!tree.length) throw Object.assign(new Error(t('nothing')), { key: 'nothing' });
    setStatus(t('publishing'), 'is-busy');
    const newTree = await gh(`/repos/${cfg.repo}/git/trees`, { method: 'POST', body: { base_tree: state.treeSha, tree } });
    const message = `تحديث فرع ${state.branch.ar} / Update ${state.branch.en} (${list.length})\n\n${list.slice(0, 20).map(s => '- ' + s).join('\n')}`;
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
    dropDraft(state.branch.id);
    state.busy = false;
    const siteLink = `${cfg.siteUrl}${state.branch.id}/${lang === 'en' ? '' : 'ar/'}${state.tab === 'menu' ? 'menu.html' : ''}`;
    state.status = { cls: 'is-busy', key: 'savedBuilding' };
    updateSaveBar();
    toast(t('savedToast'));
    watchDeploy(commit.sha, siteLink);
  } catch (err) {
    asWriteError(err);
    if (err.key === 'errNoPush') { try { await verifyWrite(); } catch (d) { if (d.key) { err.key = d.key; } } }
    state.busy = false;
    state.status = err.key ? { cls: 'is-error', key: err.key, vars: state.errVars } : { cls: 'is-error', key: 'saveFailed' };
    updateSaveBar();
    toast(err.key ? t(err.key, state.errVars || {}) : t('saveFailed'), true, 9000);
  }
}
async function watchDeploy(sha, siteLink) {
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, i < 3 ? 6000 : 9000));
    if (state.head !== sha) return; // a newer save is being watched
    try {
      let runs;
      try { runs = await gh(`/repos/${cfg.repo}/actions/runs?head_sha=${sha}&per_page=1`); }
      catch (e) { if (i === 0 && (e.status === 403 || e.status === 404)) break; throw e; } // key has no Actions access: skip the wait
      const run = runs.workflow_runs && runs.workflow_runs[0];
      if (run && run.status === 'completed') {
        state.status = run.conclusion === 'success'
          ? { cls: 'is-ok', key: 'live', link: `${siteLink}?v=${Date.now()}` }
          : { cls: 'is-error', key: 'deployFailed' };
        updateSaveBar();
        return;
      }
    } catch (e) { /* keep polling */ }
  }
  state.status = { cls: 'is-ok', key: 'saved', link: siteLink };
  updateSaveBar();
}

/* ---------- boot ---------- */
applyLang();
// The header and save bar are fixed: tell the page how tall they are so nothing hides behind them.
const fitBars = () => {
  const r = document.documentElement.style;
  r.setProperty('--top-h', `${Math.round($('.top').getBoundingClientRect().height)}px`);
  r.setProperty('--bar-h', `${$('#savebar').hidden ? 0 : Math.round($('#savebar').getBoundingClientRect().height)}px`);
};
if (window.ResizeObserver) { const ro = new ResizeObserver(fitBars); ro.observe($('.top')); ro.observe($('#savebar')); }
window.addEventListener('resize', fitBars); fitBars();
$('#lang-btn').addEventListener('click', () => setLang(lang === 'ar' ? 'en' : 'ar'));
$('#save-btn').addEventListener('click', save);
$('#discard-btn').addEventListener('click', () => { if (confirm(t('confirmDiscard'))) { dropDraft(state.branch.id); loadBranch(state.branch.id); } });
try { state.token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); } catch (e) { state.token = null; }
(async () => {
  state.lock = await fetchLock();
  if (location.hash === '#setup') { state.token = null; renderSetup(); return; }
  if (!state.token) { renderLogin(); return; }
  try { await checkKey(); renderPicker(); }
  catch (err) { if (err.status === 401 || err.status === 404 || err.key) logout(); else { renderPicker(); toast(t('netCheck'), true); } }
})();
