// Code-owned shared content: hero and gallery photos, the Facebook link, and the two
// branches with their signature dishes. Menus and branch details (phone, WhatsApp,
// address, hours, photos) are edited in the admin page (/admin/) and stored in
// content/*.json; scripts/build.mjs merges the two when it renders the site.

export const CONTACT = {
  facebook: 'https://www.facebook.com/flaminio.ly/',
};

// Each photo exists as img/<name>.jpg and img/<name>.webp.
export const HERO = ['fillet-cheese', 'caprese-pour', 'spaghetti-seafood', 'interior-table'];

// Photos not used elsewhere come first so the 8-photo preview shows new images.
export const GALLERY = [
  { img: 'caprese-pour', en: 'Caprese, dressed at the table', ar: 'سلطة كابريزي تُتبّل على المائدة' },
  { img: 'greek-salad', en: 'Greek salad', ar: 'سلطة يونانية' },
  { img: 'mussels-prawns', en: 'Mussels and prawns in tomato sauce', ar: 'محار وجمبري بصلصة الطماطم' },
  { img: 'pizza-chicken', en: 'Chicken & arugula pizza', ar: 'بيتزا دجاج مع جرجير' },
  { img: 'avocado-shrimp', en: 'Avocado salad', ar: 'سلطة الأفوكادو' },
  { img: 'skillet-burger', en: 'Skillet burger', ar: 'برغر سكيليت' },
  { img: 'skillet-burger-fries', en: 'Skillet burger with fries', ar: 'برغر سكيليت مع بطاطا مقلية' },
  { img: 'king-prawns', en: 'King prawns', ar: 'جمبري ملكي' },
  { img: 'mushroom-soup', en: 'Mushroom soup', ar: 'شوربة الماشروم' },
  { img: 'rigatoni-beef', en: 'Rigatoni with beef strips', ar: 'ريغاتوني بشرائح اللحمة' },
  { img: 'pizza-wood-fired', en: 'From the wood-fired oven', ar: 'من فرن الحطب' },
  { img: 'interior-table', en: 'Our dining room', ar: 'صالة الطعام' },
  { img: 'seafood-pan', en: 'Flaminio Seafood', ar: 'فلامينيو فواكه البحر' },
  { img: 'tomahawk', en: 'Tomahawk steak', ar: 'طبق التوماهوك' },
  { img: 'spaghetti-seafood', en: 'Spaghetti seafood', ar: 'سباغيتي فواكه البحر' },
  { img: 'tropical-salad', en: 'Tropical salad', ar: 'السلطة الاستوائية' },
  { img: 'fillet-cheese', en: 'Fillet with cheese sauce', ar: 'فليه بصوص الجبن' },
  { img: 'pizza-chicken-arugula', en: 'Wood-fired pizza', ar: 'بيتزا على الحطب' },
  { img: 'interior-booth', en: 'Booth seating', ar: 'جلسات الصالة' },
];

// Signature dishes on each branch's home page. `ref` is "<category id>/<item id>" in
// that branch's menu (content/menu-<branch>.json); a ref that no longer exists is
// skipped at build time. `pos` is the CSS object-position for tall photos in the
// landscape frame. `placeEn`/`placeAr` are the sub-labels on the front page.
export const BRANCHES = [
  {
    id: 'markabaat', en: 'Markabaat', ar: 'المركبات',
    placeEn: 'Al-Markabat Street, Al-Hawari', placeAr: 'شارع المركبات، الهواري',
    signature: [
      { ref: 'seafood/flaminio-seafood', img: 'seafood-pan' },
      { ref: 'steaks/fillet-with-cheese-sauce', img: 'fillet-cheese' },
      { ref: 'steaks/tomahawk-steak', img: 'tomahawk' },
      { ref: 'pasta/spaghetti-seafood', img: 'spaghetti-seafood' },
      { ref: 'salads/tropical-salad', img: 'tropical-salad' },
      { ref: 'pizza/chicken-arugula-pizza', img: 'pizza-chicken-arugula', pos: '50% 78%' },
    ],
  },
  {
    id: 'downtown', en: 'Downtown', ar: 'داون تاون',
    placeEn: 'Venezia Street, Benghazi', placeAr: 'شارع فينيسيا، بنغازي',
    signature: [
      { ref: 'meat/italian-style-tomahawk', img: 'tomahawk' },
      { ref: 'meat/fillet-steak-with-cheese-sauce', img: 'fillet-cheese' },
      { ref: 'pasta/seafood-pasta', img: 'spaghetti-seafood' },
      { ref: 'pasta/rigatoni-beef-strips', img: 'rigatoni-beef' },
      { ref: 'salads/shrimp-avocado-salad', img: 'avocado-shrimp', pos: '50% 62%' },
      { ref: 'pizza/chicken-rocket-pizza', img: 'pizza-chicken-arugula', pos: '50% 78%' },
    ],
  },
];
