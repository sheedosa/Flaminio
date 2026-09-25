// All site content. The build (scripts/build.mjs) renders every page from this
// file, and the browser scripts import it too — edit here, rebuild, done.
//
// Two branches share everything except the menu: MENU (Markabaat) comes from the
// printed menu (assets/Flaminio-Menu.pdf); MENU_DOWNTOWN from the Downtown menu
// document. Names and descriptions follow those sources verbatim (only evident
// spelling errors corrected). BRANCHES at the bottom ties it together.

export const CONTACT = {
  phoneDisplay: '091-0181666',
  phoneTel: '+218910181666',
  whatsapp: 'https://wa.me/218910181666',
  maps: 'https://www.google.com/maps/search/?api=1&query=Asayel+Resort+Al-Hawari+Benghazi',
  facebook: 'https://www.facebook.com/flaminio.ly/',
};

// Each photo exists as img/<name>.jpg and img/<name>.webp.
export const HERO = ['fillet-cheese', 'caprese-pour', 'spaghetti-seafood', 'interior-table'];

// `ref` is "<category id>/<item id>"; name, price and description come from MENU.
// `pos` (optional) is the CSS object-position focus for tall photos in the landscape frame.
export const SIGNATURE = [
  { ref: 'seafood/flaminio-seafood', img: 'seafood-pan' },
  { ref: 'steaks/fillet-with-cheese-sauce', img: 'fillet-cheese' },
  { ref: 'steaks/tomahawk-steak', img: 'tomahawk' },
  { ref: 'pasta/spaghetti-seafood', img: 'spaghetti-seafood' },
  { ref: 'salads/tropical-salad', img: 'tropical-salad' },
  { ref: 'pizza/chicken-arugula-pizza', img: 'pizza-chicken-arugula', pos: '50% 78%' },
];

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

const slug = s => s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// price: a number in LYD, or null. Pass an explicit id when the same name is listed twice.
const i = (en, ar, price, den = '', dar = '', id = slug(en)) => ({ id, en, ar, price, den, dar });

// `img: null` shows a branded panel until the restaurant supplies a real photo.
// `drinks: true` keeps a category out of the "100+ dishes" count.
export const MENU = [
  { id: 'soups', en: 'Soups', ar: 'الشوربات', img: 'mushroom-soup', items: [
    i('White Seafood Soup', 'شوربة فواكه البحر البيضاء', 50, 'A rich creamy soup with a mix of fresh seafood, offering smooth and distinctive ocean flavors.', 'شوربة كريمية غنية بمزيج فواكه البحر الطازجة، تقدم بنكهات بحرية ناعمة ومميزة.'),
    i('Red Seafood Soup', 'شوربة فواكه البحر الحمراء', 50, 'A rich soup with a mix of fresh seafood in a signature Italian bisque sauce, offering deep and vibrant ocean flavors.', 'شوربة غنية بمزيج فواكه البحر الطازجة مع صوص البيسك الإيطالي المميز، تقدم بنكهات بحرية عميقة ومليئة بالألوان.'),
    i('Vegetable Soup', 'شوربة الخضار', 22, 'Smooth vegetable soup, full of natural flavors, light and nutritious.', 'شوربة خضار مهروسة غنية بالنكهات الطبيعية، خفيفة ومغذية.'),
    i('Mushroom Soup', 'شوربة الماشروم', 30, 'Creamy mushroom soup with fresh mushroom pieces, delivering a rich and flavorful experience.', 'شوربة كريمية مع قطع المشروم الطازج، نكهة غنية ودافقة باللذة.'),
    i('Sweet Potato Soup', 'شوربة البطاطا الحلوة', 22, 'Creamy soup made from sweet potatoes, smooth and comforting.', 'شوربة كريمية مصنوعة من البطاطا الحلوة، ناعمة ومريحة.'),
  ]},
  { id: 'salads', en: 'Salads', ar: 'السلاطات', img: 'greek-salad', items: [
    i('Caesar Salad', 'سلطة سيزر', 35, 'Fresh romaine lettuce with grilled chicken slices, Parmesan cheese, and Caesar dressing.', 'خس طازج، شرائح دجاج مشوي، جبن بارميزان، وصوص السيزر.'),
    i('Caprese Salad', 'سلطة كابريزي', 25, 'Fresh tomatoes with mozzarella cheese, basil, and extra virgin olive oil.', 'طماطم طازجة، جبن موتزاريلا، ريحان، وزيت زيتون بكر.'),
    i('Tunisian Salad', 'سلطة تونسية', 25, 'Tuna with boiled eggs, tomatoes, cucumbers, and red onions.', 'تونة، بيض مسلوق، طماطم، خيار، وبصل أحمر.'),
    i('Italian Countryside Salad', 'سلطة الريف الإيطالي', 35, 'Lettuce, avocado, luncheon meat, and pineapple slices.', 'خس، أفوكادو، لانشون، وشرائح أناناس.'),
    i('Greek Salad', 'سلطة يونانية', 30, 'Cucumbers, tomatoes, olives, feta cheese, and red onions.', 'خيار، طماطم، زيتون، جبنة فيتا، وبصل أحمر.'),
    i('Flaminio Salad', 'سلطة فلامينيو', 49, 'Chicken, lettuce, avocado, sweet potatoes, raisins, and corn.', 'دجاج مشوي، خس، أفوكادو، بطاطا حلوة، ذرة، وزبيب.'),
    i('Avocado Salad', 'سلطة الأفوكادو', 48, 'Guacamole, tomatoes, and shrimp.', 'جواكامولي، أناناس، وجمبري ملكي.'),
    i('Tropical Salad', 'السلطة الاستوائية', 38, 'A mix of fresh rocket, nutritious chia seeds, juicy pineapple pieces, and shrimp, served with refreshing and vibrant flavors.', 'خليط من الجرجير الطازج، حبوب الشيا المغذية، قطع الأناناس الطازج، وقطع الجمبري، تقدم بنكهات منعشة وحيوية.'),
  ]},
  { id: 'appetizers', en: 'Appetizers', ar: 'المقبلات', img: 'king-prawns', items: [
    i('Crispy Calamari', 'كالامار مقرمش', 40, 'Crispy fried calamari rings served with tartar sauce.', 'حلقات كالامار مقلية تقدم مع صوص التارتار.'),
    i('Spicy King Prawn', 'جمبري ملكي حار', 45, 'King prawns sautéed with garlic, olive oil, and spicy seasoning.', 'جمبري ملكي مطهو بالزيت والثوم مع التوابل الحارة.'),
    i('Seafood Gratin', 'جراتان فواكه البحر', 43, 'Mixed seafood baked in the oven with cooking cream and assorted cheeses.', 'فواكه بحر مشكلة مع كريمة الطبخ وتشكيلة من الأجبان بالفرن.'),
    i('Royal Sauté', 'سوتيه رويال', 60, 'Black mussels, clams, and king prawns prepared in authentic Italian style.', 'محار أسود وجندوفلي مع جمبري ملكي على الطريقة الإيطالية.'),
    i('Crispy Chicken', 'دجاج كرسبي', 47, 'Six crispy chicken pieces coated with Doritos crumbs, served with special sauce.', '6 قطع دجاج مغطاة بفتات دوريتوس المقرمش، تقدّم مع صوص خاص.'),
    i('Shrimp with Almonds', 'جمبري باللوز', 45, 'Four shrimp pieces coated with crunchy almond slices, served with tartar sauce.', '4 قطع جمبري مغطاة بشرائح اللوز المقرمشة مع صوص التارتار.'),
    i('Flaminio Special', 'فلامينيو سبيشال', 48, 'A special platter of fried shrimp, mozzarella sticks, and breaded chicken with tartar sauce.', 'تشكيلة مميزة من الجمبري المقلي، أصابع الموزاريلا، ودجاج بانيه مع صوص التارتار.'),
  ]},
  { id: 'pasta', en: 'Pasta', ar: 'الباستا', img: 'rigatoni-beef', items: [
    i('Penne Arrabbiata', 'بينا أرابياتا', 30, 'Penne pasta with spicy tomato sauce, olive oil, garlic, basil, olives, and Parmesan cheese.', 'بينا مع صلصة الطماطم الحارة، زيت الزيتون، ثوم، ريحان، وزيتون، بجبنة بارميزان.'),
    i('Alfredo', 'الفريدو', 46, 'Fettuccine pasta with cooking cream, chicken pieces, mushroom and Parmesan cheese.', 'فيتوتشيني مع كريمة الطبخ، قطع دجاج، وماشروم وجبنة بارميزان.'),
    i('Pasta Pesto', 'باستا بيستو', 52, 'Rigatoni pasta with pesto sauce, cooking cream, and chicken pieces.', 'ريغاتوني مع صوص البيستو، كريمة الطبخ، وقطع الدجاج.'),
    i('Four Cheese Pasta', 'باستا أربع أجبان', 39, 'Pasta with cooking cream and a mix of Italian cheeses.', 'باستا مع كريمة الطبخ وتشكيلة من الأجبان الإيطالية.'),
    i('Spaghetti Bolognese', 'سباغيتي بولونيز', 45, 'Spaghetti with minced beef, tomato sauce, mozzarella, and Parmesan cheese.', 'سباغيتي مع لحم مفروم بصلصة طماطم، موزاريلا، وجبنة بارميزان.'),
    i('Rigatoni with Beef Strips', 'ريغاتوني بشرائح اللحمة', 50, 'Rigatoni pasta with tomato sauce, olives, grilled beef strips, and Parmesan cheese.', 'ريغاتوني مع صلصة الطماطم، زيتون، شرائح فيليه مشوي، وجبنة بارميزان.'),
    i('Parma Ravioli', 'رافيولي بارما', 50, 'Ravioli stuffed with minced beef, served with creamy pink sauce.', 'رافيولي محشو باللحم المفروم مع صوص وردي كريمي.'),
    i('Lasagna', 'لازانيا', 45, 'Minced meat with Italian cheese.', 'لحم مفروم مع الجبن الإيطالي.'),
    i('Mare e Monti', 'ماري مانتي', 47, '(Sea and Mountain) combines the best of the sea and the land, featuring baby shrimp, king prawns, and fresh mushrooms, all brought together in a creamy pink sauce for an elegant Italian flavor.', '(بحر وجبل) يجمع بين روعة البحر وسحر الأرض، حيث يلتقي الجمبري الصغير والجمبري الملكي مع الفطر الطازج، مغمورين في صوص وردي كريمي يضيف لمسة إيطالية أنيقة ونكهة متوازنة.'),
    i('Shrimp & Mushroom Ravioli', 'رافيولي بالجمبري والمشروم', 55, 'Six ravioli pieces stuffed with shrimp and mushrooms, served with cooking cream and blue cheese.', '6 قطع رافيولي محشوة بالجمبري والمشروم مع كريمة الطبخ والجبنة الزرقاء.'),
    i('Spaghetti Seafood', 'سباغيتي فواكه البحر', 55, 'Spaghetti with tomato sauce, seafood mix, garlic, and basil.', 'سباغيتي مع صلصة الطماطم، فواكه البحر، ثوم، وريحان.'),
    i('Seafood Spaghetti with Mascarpone', 'سباغيتي فواكه البحر مع ماسكربوني', 70, 'Spaghetti with tomato sauce, seafood, and mascarpone cheese.', 'سباغيتي مع صلصة الطماطم، فواكه البحر، وجبنة ماسكربوني.'),
    i('Pasta with Lemon Sauce', 'باستا بصوص الليمون', 70, 'Pasta with shrimp, mushrooms, mussels, cooking cream, and lemon zest.', 'باستا مع جمبري، مشروم، محار، كريمة طبخ، وقشور الليمون.'),
    i('King Prawns Pasta with Bisque Sauce', 'باستا جمبري ملكي بصوص البيسك', 68, 'Pasta with rich bisque sauce and king prawns.', 'باستا مع صوص البيسك والجمبري الملكي.'),
    i('Pasta with Shrimp Sauce', 'باستا جانوتشي بصلصة الجمبري', 45, 'Pasta with king prawns and creamy pink sauce.', 'باستا مع جمبري ملكي وصوص وردي كريمي.'),
  ]},
  { id: 'risotto', en: 'Risotto', ar: 'الريزوتو', img: 'beef-risotto', items: [
    i('Seafood Risotto', 'ريزوتو فواكه البحر', 52, 'Creamy rice with mixed seafood, tomato sauce, pesto, and Parmesan cheese.', 'أرز كريمي مع فواكه البحر المشكلة، صوص الطماطم، صوص البيستو، وجبنة بارميزان.'),
    i('Chicken & Mushroom Risotto', 'ريزوتو بالدجاج والمشروم', 49, 'Rice with chicken pieces, fresh mushrooms, and a touch of cream.', 'أرز مع قطع دجاج ومشروم طازج بلمسة من الكريمة.'),
    i('Beef & Mushroom Risotto', 'ريزوتو لحم بالمشروم', 55, 'Creamy rice with beef slices, mushrooms, cooking cream, Parmesan, blue cheese, and arugula.', 'أرز كريمي مع شرائح لحم، مشروم، كريمة طبخ، جبنة بارميزان، جبنة زرقاء، وجرجير.'),
    i('Vegetable Risotto', 'ريزوتو خضار', 40, 'Creamy rice with a mix of fresh vegetables and Parmesan cheese.', 'أرز كريمي مع تشكيلة من الخضار الطازجة وجبنة بارميزان.'),
    i('Paella', 'بايلا', 58, 'Rice with a mix of seafood, chicken, peas, and bell peppers.', 'أرز مع مزيج من فواكه البحر، الدجاج، البزاليا، والفلفل الألوان.'),
    i('Spinach & Shrimp Risotto', 'ريزوتو سبانخ بالجمبري', 49, 'Rice with fresh spinach, shrimp, mushrooms, and Parmesan cheese.', 'أرز مع سبانخ طازج، جمبري، مشروم، وجبنة بارميزان.'),
  ]},
  { id: 'steaks', en: 'Fillet & Steaks', ar: 'الفيليه والستيك', img: 'tomahawk', items: [
    i('Grilled Fillet', 'فليه مشوي', 95, 'Grilled beef fillet with mashed potatoes, mixed vegetables, and rice.', 'فيليه لحم مشوي مع بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Fillet with Cheese Sauce', 'فليه بصوص الجبن', 120, 'Beef fillet with cooking cream, blue cheese, Parmesan cheese, mashed potatoes, mixed vegetables, and rice.', 'فيليه لحم مع كريمة الطبخ، جبنة زرقاء، جبنة بارميزان، بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Fillet with Pepper Sauce', 'فليه بصوص الفلفل', 98, 'Beef fillet with pepper demi-glace sauce, mashed potatoes, mixed vegetables, and rice.', 'فيليه لحم مع صوص الديمي جلاص بالفلفل، بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Fillet with Mushroom Sauce', 'فليه بالفطر', 98, 'Beef fillet with mushroom demi-glace sauce, mashed potatoes, mixed vegetables, and rice.', 'فيليه لحم مع صوص المشروم بالديمي جلاص، بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Parmesan Fillet', 'فليه باريمجانو', 120, 'Beef fillet with cooking cream, Parmesan cheese, mashed potatoes, mixed vegetables, and rice.', 'فيليه لحم مع كريمة الطبخ، جبنة بارميزان، بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Fillet Roma', 'فيلي روما', 120, 'Marinated beef fillet slices with Flaminio’s special seasoning, served with demi-glace mushroom sauce and creamy risotto.', 'شرائح فيليه متبلة بتتبيلة فلامينيو الخاصة، تقدم مع صوص الديمي جلاص والفطر مع ريزوتو كريمي.'),
    i('T-Bone Steak', 'طبق تي بون', 110, 'T-bone steak with mixed vegetables, mashed potatoes, BBQ sauce, and rice.', 'تي بون مع خضار مشكلة، بطاطا مهروسة، صوص باربكيو، وأرز.'),
    i('Tomahawk Steak', 'طبق التوماهوك', 98, 'Tomahawk steak served with pasta in Italian tomato sauce, mixed vegetables, and mashed potatoes.', 'ستيك التوماهوك يقدم مع باستا بصلصة الطماطم الإيطالية، خضار مشكلة، وبطاطا مهروسة.'),
    i('Flaminio Mixed Grill', 'مشاوي فلامينيو', 250, 'A premium platter of beef fillet slices, T-bone, chicken breast, merguez, and nuggets, served with rice, mashed potatoes, mixed vegetables, fries, pickles, salad, and a selection of Flaminio’s special sauces.', 'تشكيلة فاخرة من شرائح الفيليه، تي بون، صدور دجاج، مرقاز، ناغتس، مع أرز، بطاطا مهروسة، خضار مشكلة، بطاطا مقلية، مخللات، سلطة، وتشكيلة صلصات خاصة.'),
  ]},
  { id: 'chicken', en: 'Chicken Dishes', ar: 'أطباق الدجاج', img: 'chicken-cheese', items: [
    i('Chicken Breast with Italian Cheese', 'صدر الدجاج بالجبن الإيطالي', 55, 'Grilled chicken breast and melted mozzarella cheese, served with mixed vegetables and creamy mashed potatoes.', 'صدر دجاج مشوي وجبنة الموزاريلا الذائبة، يقدم مع خضار مشكلة وبطاطا مهروسة كريمية.'),
    i('Chicken with Creamy Mushroom Sauce', 'دجاج بصوص الفطر الكريمي', 55, 'Grilled chicken breast topped with rich Italian creamy mushroom sauce, served with seasonal vegetables and mashed potatoes.', 'صدور دجاج مشوية تقدم مع صوص الفطر الكريمي الإيطالي الغني، مرافق بخضار موسمية وبطاطا مهروسة.'),
    i('Chicken with Italian Lemon Sauce', 'دجاج بصوص الليمون الإيطالي', 55, 'Grilled chicken breast infused with authentic Italian lemon flavor, served with mixed vegetables and smooth mashed potatoes.', 'صدور دجاج مشوية بنكهة الليمون الإيطالية العطرية، تقدم مع خضار مشكلة وبطاطا مهروسة ناعمة.'),
    i('Parmesan Pesto Chicken', 'دجاج بيستو بالبرميجان', 58, 'Tender chicken slices coated in classic Italian pesto sauce, finished with a touch of Parmesan cheese.', 'شرائح دجاج طرية مغطاة بصوص البيستو الإيطالي الكلاسيكي، مع لمسة من جبنة البرميجان.'),
    i('Grilled Chicken with Rice', 'دجاج مشوي مع الأرز', 45, 'Grilled chicken breast marinated in Flaminio’s special seasoning, served with mixed vegetables and white rice.', 'صدر دجاج مشوي بتتبيلة فلامينيو الخاصة، يقدم مع خضار مشكلة وأرز أبيض.'),
    i('Chicken Diet', 'دجاج دايت', 40, 'Healthy grilled chicken breast Italian style, served with fresh salad and light mixed vegetables.', 'صدور دجاج مشوية على الطريقة الإيطالية، مع سلطة طازجة وخضار مشكلة خفيفة.'),
  ]},
  { id: 'seafood', en: 'Seafood Dishes', ar: 'أطباق فواكه البحر', img: 'seafood-pan', items: [
    i('Salmon with Cheese', 'سالمون بالجبنة', 120, 'Salmon fillet with mashed potatoes, mushrooms, cooking cream, and blue cheese.', 'قطعة سالمون فيليه مع بطاطا مهروسة، مشروم، كريمة طبخ، وجبنة زرقاء.'),
    i('Royal Shrimp with Garlic & Lemon', 'طبق جمبري ملكي بالثوم والليمون', 75, 'King prawns cooked with garlic and lemon, served with mashed potatoes, mixed vegetables, and rice.', 'جمبري ملكي كبير مطهو بالثوم والليمون مع بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Flaminio Seafood', 'فلامينيو فواكه البحر', 135, 'A premium selection of fresh seafood, combining baby shrimp, cuttlefish, king prawns, clams, and black mussels, delicately prepared with our signature Flaminio sauce, offering you a unique seafood experience with an authentic Italian touch.', 'مزيج فاخر من ثمار البحر الطازجة، يجمع بين الجمبري الصغير، السيبيا، الجمبري الملكي، الجندوفلي، والمحار الأسود، محضر بلمسة خاصة مع صوص فلامينيو المميز.'),
    i('Creamy King Prawns', 'جمبري ملكي بالكريمة', 95, 'A mix of king prawns and small prawns with rice, served in a rich creamy sauce.', 'تتكون من جمبري صغير وجمبري ملكي مع أرز وصوص كريمي غني.'),
    i('Grilled Fish', 'سمك مشوي', 75, 'Grilled fish served with fries, mixed vegetables, and rice.', 'سمك مشوي مع بطاطا مقلية، خضار مشكلة، وأرز.'),
  ]},
  { id: 'pizza', en: 'Pizza', ar: 'البيتزا', img: 'pizza-chicken', items: [
    i('Margherita Pizza', 'بيتزا مارغريتا', 29, 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil leaves.', 'بيتزا كلاسيكية مع صلصة الطماطم، جبنة موتزاريلا، وأوراق ريحان طازجة.'),
    i('Tuna Pizza', 'بيتزا تونة', 35, 'Pizza with tomato sauce, mozzarella cheese, and tuna.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، وتونة طازجة.'),
    i('Chicken & Arugula Pizza', 'بيتزا دجاج مع جرجير', 39, 'Pizza with tomato sauce, mozzarella cheese, grilled chicken, and fresh arugula.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، دجاج مشوي، وجرجير طازج.'),
    i('Seafood Pizza', 'بيتزا فواكه البحر', 50, 'Pizza topped with assorted seafood, tomato sauce, and mozzarella cheese.', 'بيتزا غنية بفواكه البحر المتنوعة مع صلصة الطماطم وجبنة موتزاريلا.'),
    i('Vegetarian Pizza', 'بيتزا الخضروات', 33, 'Pizza with tomato sauce, mozzarella cheese, bell peppers, olives, mushrooms, and zucchini.', 'بيتزا طازجة مع صلصة الطماطم، جبنة موتزاريلا، وفلفل ألوان، زيتون، مشروم، وكوسة.'),
    i('Pepperoni Pizza', 'بيتزا بيبروني', 59, 'Pizza with tomato sauce, mozzarella cheese, and pepperoni slices.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، وشرائح بيبروني.'),
    i('Four Cheese Pizza', 'بيتزا أربع أجبان', 55, 'Pizza with fresh cream and a mixture of Italian cheeses.', 'بيتزا مع كريمة طازجة وخليط من الأجبان الإيطالية.'),
    i('Luncheon Pizza', 'بيتزا لانشون', 36, 'Pizza with tomato sauce, mozzarella cheese, and luncheon meat slices.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، وشرائح لانشون.'),
    i('Alfredo Pizza', 'بيتزا ألفريدو', 62, 'Pizza with creamy sauce, chicken pieces, mushrooms, and mozzarella cheese.', 'بيتزا بالكريمة، قطع دجاج، مشروم، وجبنة موتزاريلا.'),
    i('Chicago Pizza', 'بيتزا شيكاغو', 65, 'Double-crust pizza stuffed with chicken, minced beef, mushrooms, and a blend of cheeses.', 'من طبقتين من العجينة محشوة بالدجاج، اللحم المفروم، الفطر، ومزيج من الأجبان.'),
    i('Mushroom Pizza', 'بيتزا ماشروم', 34, 'Pizza with tomato sauce, mozzarella cheese, and mushrooms.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، وماشروم.'),
  ]},
  { id: 'sandwiches', en: 'Sandwiches', ar: 'الساندويتشات', img: 'skillet-burger', items: [
    i('Beef Burger', 'برغر لحم', 16, 'Grilled beef burger with lettuce, tomatoes, cheese, and special sauce.', 'برغر لحم بقري مشوي مع خس، طماطم، جبنة، وصوص خاص.'),
    i('Skillet Burger', 'برغر سكيليت', 45, 'Two pieces of meat with mushroom sauce.', 'قطعتين من اللحم وصوص الفطر.'),
    i('Banieh', 'بانيه', 14, 'Breaded chicken burger with lettuce, tomatoes, cheese, and special sauce.', 'دجاج بانيه مقرمش مع خس، طماطم، جبنة، وصوص خاص.'),
    i('Chicken Fajitas', 'فاخيتاس دجاج', 26, 'Grilled chicken served with tortilla bread and creamy sauce.', 'دجاج مع خبز التورتيلا وصوص كريمي.'),
    i('Avocado Chicken Fajitas', 'فاخيتاس بصوص الأفوكادو', 30, 'Grilled chicken served with tortilla bread and avocado sauce.', 'دجاج مع خبز التورتيلا وصوص الأفوكادو.'),
    i('Grilled Chicken Scallop', 'جريل سكالوب دجاج', 22, 'Chicken with white cheese and Flaminio bread.', 'دجاج مع جبنة بيضاء وخبز فلامينيو.'),
    i('Grilled Beef Steak Sandwich', 'جريل ستيك لحم', 28, 'Grilled beef steak sandwich with special sauce.', 'ساندويتش ستيك لحم مشوي مع صوص خاص.'),
    i('Chicken Panuzzo', 'بانوزو دجاج', 24, 'Italian panuzzo bread filled with grilled chicken, sauces, and cheese.', 'خبز بانوزو إيطالي محشو بدجاج مشوي مع صوصات وجبنة.'),
    i('Beef Panuzzo', 'بانوزو لحم', 26, 'Italian panuzzo bread filled with minced beef, sauces, and cheese.', 'خبز بانوزو إيطالي محشو بلحم مفروم مع صوصات وجبنة.'),
    i('Chicken Corny', 'كورني دجاج', 25, 'Corny bread filled with grilled chicken, tomato sauce, and cheese.', 'خبز كورني محشو بدجاج مشوي مع صلصة الطماطم والجبنة.'),
    i('Beef Corny', 'كورني لحم', 28, 'Corny bread filled with minced beef, tomato sauce, and cheese.', 'خبز كورني محشو بلحم مفروم مع صلصة الطماطم والجبنة.'),
    i('Chicken Baguette', 'باقات دجاج', 28, 'Italian baguette filled with chicken, tomato sauce, mushrooms, and cheese.', 'باقات إيطالي محشو بدجاج، صلصة الطماطم، الفطر، والجبنة.'),
    i('Beef Baguette', 'باقات لحم', 30, 'Italian baguette filled with minced beef, tomato sauce, mushrooms, and cheese.', 'باقات إيطالي محشو بلحم مفروم، صلصة الطماطم، الفطر، والجبنة.'),
    i('Mixed Baguette', 'باقات مكس', 35, 'Italian baguette filled with chicken, minced beef, mushrooms, tomato sauce, and cheese.', 'باقات إيطالي محشو بدجاج، لحم مفروم، فطر، صلصة الطماطم، والجبنة.'),
  ]},
  { id: 'kids', en: 'Flaminio Kids', ar: 'فلامينيو كيدز', img: 'kids-pasta', items: [
    i('Kids Chicken Fillet', 'صدور دجاج أطفال', 25, 'Chicken fillet with cheese, French fries, and a Suntop drink.', 'قطع دجاج مع جبنة، بطاطا مقلية، ومشروب سانتوب.'),
    i('Mini Pasta Kids', 'ميني باستا كيدز', 34, 'Pasta with tomato sauce, meatballs, mozzarella cheese, and a Suntop drink.', 'باستا بصلصة الطماطم مع كرات اللحم وجبنة موتزاريلا، تقدم مع مشروب سانتوب.'),
    i('Kids Pizza', 'بيتزا كيدز', 16, 'Mini pizza served with French fries and a Suntop drink.', 'بيتزا صغيرة مع بطاطا مقلية ومشروب سانتوب.'),
    i('Mozzarella Sticks', 'موتزاريلا ستيك', 28, 'Four crispy mozzarella sticks served with special sauce and a Suntop drink.', '4 قطع من أصابع الموتزاريلا المقلية مع صوص خاص ومشروب سانتوب.'),
    i('Mini Calzone', 'ميني كالزوني', 25, 'Mini calzone stuffed with chicken and tomato sauce, served with French fries and a Suntop drink.', 'كالزوني صغير محشو بالدجاج وصلصة الطماطم، يقدم مع بطاطا مقلية ومشروب سانتوب.'),
  ]},
  { id: 'desserts', en: 'Desserts', ar: 'الحلويات', img: null, items: [
    i('Vanilla Crème Brûlée', 'كريم برولي فانيلا', 15),
    i('Large Crème Brûlée', 'كريم برولي كبير', 20),
    i('Small Crème Brûlée', 'كريم برولي صغير', 15),
    i('Lemon Tiramisu', 'تيراميسو ليمون', 25),
    i('Small Tiramisu', 'تيراميسو كلاسيك صغير', 20),
    i('Large Tiramisu', 'تيراميسو كبير', 25),
    i('Cake', 'كيكة', 20),
    i('San Sebastian Cake', 'كيكة سان سيباستيان', 25),
    i('Nutella Nut Pancakes', 'بان كيك نوتيلا', 20),
    i('Lotus Pancakes', 'بان كيك لوتس', 20),
    i('Mix Pancakes', 'بان كيك ميكس', 25),
    i('Nutella Banana Crepe', 'كريب نوتيلا', 20),
    i('Lotus Crepe', 'كريب لوتس', 20),
    i('Mix Crepe', 'كريب ميكس', 25),
  ]},
  { id: 'hot-coffee', en: 'Hot Coffee', ar: 'مشروبات ساخنة', img: null, drinks: true, items: [
    i('Espresso', 'اسبريسو', 4),
    i('Double Espresso', 'دبل اسبريسو', 5),
    i('Macchiato', 'مكياتو', 4),
    i('Double Macchiato', 'دبل مكياتو', 4),
    i('Special', 'اسبسيال', 6),
    i('Cappuccino', 'كابتشينو', 8),
    i('Cappuccino', 'كابتشينو', 3, '', '', 'cappuccino-2'),
    i('Nescafe', 'نسكافيه', 5),
    i('Nescafe', 'نسكافيه', 3, '', '', 'nescafe-2'),
    i('Mocha', 'موكا', 12),
    i('Latte', 'لاتيه', 8),
    i('Arabic Coffee', 'قهوة عربية', 6),
    i('Tea (Red/Green)', 'شاي (أحمر / أخضر)', 2),
    i('Tunisian Tea (Red/Green)', 'شاي تونسي (أحمر / أخضر)', 3),
    i('Turkish Coffee', 'قهوة تركية', 6),
    i('Hot Chocolate', 'هوت شوكلت', 15),
    i('American Coffee', 'أميريكان كافي', 4),
    i('Nesquik', 'نسكويك', 5),
    i('Ovaltine', 'أوفلتين', 5),
  ]},
  { id: 'cold-drinks', en: 'Cold Coffee & Drinks', ar: 'قهوة ومشروبات باردة', img: null, drinks: true, groups: [
    { en: 'Cold Coffee', ar: 'قهوة باردة', items: [
      i('Flavored Latte', 'لاتيه نكهات', 12, 'Mocha - Caramel - Hazelnut - Vanilla', 'موكا، كراميل، بندق، فانيليا.'),
      i('Iced Macchiato', 'ايس مكياطة', 10),
      i('Iced Café', 'ايس كافي', 10),
      i('Frappuccino', 'فرابتشينو', 15, 'Mocha - Caramel - Hazelnut - Vanilla', 'موكا، كراميل، بندق، فانيليا.'),
    ]},
    { en: 'Cold Drinks', ar: 'مشروبات باردة', items: [
      i('Milkshakes', 'ميلك شيك', 12, 'Nutella - Lotus - Kinder - Milka - Strawberry - Mango - Vanilla - Raspberry - Blueberry', 'نوتيلا، لوتس، كيندر، ميلكا، فراولة، منجا، فانيليا، توت أحمر، توت أزرق.'),
      i('Mojito', 'موهيتو', 10, 'Classic - Pineapple - Strawberry - Kiwi', 'كلاسيك، أناناس، فراولة، كيوي.'),
      i('Smoothies', 'سموثي', 10, 'Depending on available flavors', 'حسب النكهات المتوفرة.'),
    ]},
  ]},
  { id: 'soft-drinks', en: 'Soft Drinks & Juices', ar: 'مشروبات غازية وعصائر', img: null, drinks: true, groups: [
    { en: 'Soft Drinks', ar: 'المشروبات الغازية', items: [
      i('Sparkling Water', 'مياه غازية', 8),
      i('Soft Drink', 'مشروب غازي', 5),
      i('Mineral Water 1 L', 'مياه معدنية 1 ل', 5),
      i('Mineral Water', 'مياه معدنية', 1),
    ]},
    { en: 'Natural Juices', ar: 'عصائر طبيعية', items: [
      i('Orange', 'برتقال', 10),
      i('Strawberry', 'فراولة', 12),
      i('Mango', 'مانجو', 10),
      i('Lemon with Mint', 'ليمون بالنعناع', 10),
      i('Guava', 'جوافة', 10),
      i('Kiwi', 'كيوي', 17),
      i('Yogurt', 'زبادو', 16),
      i('Dates and Almonds', 'تمر ولوز', 13),
      i('Avocado', 'أفوكادو', 17),
      i('Cocktail', 'كوكتيل', 15),
      i('Banana Milk', 'حليب بالموز', 9),
    ]},
  ]},
];

// Flat list of a category's items, whether or not it is split into groups.
export const itemsOf = cat => cat.items || cat.groups.flatMap(g => g.items);

export function findItem(ref, menu = MENU) {
  const [catId, itemId] = ref.split('/');
  const cat = menu.find(c => c.id === catId);
  const item = cat && itemsOf(cat).find(it => it.id === itemId);
  if (!item) throw new Error(`Unknown menu item: ${ref}`);
  return item;
}

// ---------------------------------------------------------------------------
// Downtown branch menu (from the restaurant's Downtown menu document).
// The document lists names and prices only. `from()` copies the description of
// the same dish on the Markabaat menu; dishes that are new to Flaminio (marked
// NEW in the document, or not on the Markabaat menu) have no description yet.
// A `null` price shows "—" (price on request) until the restaurant confirms it.
const NEW = it => ({ ...it, isNew: true });
const from = (ref, en, ar, price, over = {}) => {
  const m = findItem(ref, MENU);
  return { ...i(en, ar, price, m.den, m.dar), ...over };
};

export const MENU_DOWNTOWN = [
  { id: 'soups', en: 'Soups', ar: 'الشوربات', img: 'mushroom-soup', items: [
    from('soups/red-seafood-soup', 'Red Seafood Soup', 'شربة حمراء فواكه البحر', 55),
    from('soups/white-seafood-soup', 'White Seafood Soup', 'شربة بيضاء فواكه البحر', 55),
    from('soups/mushroom-soup', 'Mushroom Soup', 'شربة مشروم', 35),
    from('soups/vegetable-soup', 'Vegetable Soup', 'شربة خضار', 30),
  ]},
  { id: 'salads', en: 'Salads', ar: 'السلطات', img: 'greek-salad', items: [
    from('salads/caesar-salad', 'Caesar Salad', 'سلطة سيزر', 33),
    from('salads/avocado-salad', 'Shrimp & Avocado Salad', 'سلطة جمبري وأفوكادو', 50),
    from('salads/flaminio-salad', 'Flaminio Salad', 'سلطة فلامينيو', 55),
    i('Quinoa Salad', 'سلطة كينوا', 52),
    from('salads/greek-salad', 'Greek Salad', 'سلطة يونانية', 30),
  ]},
  { id: 'appetizers', en: 'Appetizers', ar: 'المقبلات', img: 'king-prawns', items: [
    from('appetizers/crispy-chicken', 'Crispy Chicken', 'دجاج كرسبي', 49),
    from('appetizers/shrimp-with-almonds', 'Almond Shrimp', 'جمبري باللوز', 49),
    from('appetizers/seafood-gratin', 'Seafood Gratin', 'جراتان فواكه البحر', 46),
    NEW(i('Black Mussels in Cream Sauce', 'محار أسود بالكريمة', 50)),
  ]},
  { id: 'pasta', en: 'Pasta', ar: 'الباستا', img: 'rigatoni-beef', items: [
    from('pasta/spaghetti-seafood', 'Seafood Pasta', 'باستا فواكه البحر', 57),
    from('pasta/alfredo', 'Alfredo Pasta', 'ألفريدو', 49),
    from('pasta/pasta-pesto', 'Pesto Pasta', 'بيستو', 55),
    from('pasta/penne-arrabbiata', 'Arrabbiata Pasta', 'أرابياتا', 35),
    from('pasta/rigatoni-with-beef-strips', 'Rigatoni Beef Strips', 'ريغاتوني شرائح اللحمة', 55),
    from('pasta/parma-ravioli', 'Parma Ravioli', 'رافيولي بارما', 55),
    i('Shrimp Bottarga Pasta', 'باستا جمبري بوتارغ', 95),
    from('pasta/lasagna', 'Lasagna', 'لازانيا', 47),
    NEW(i('Flaminio Pasta', 'باستا فلامينيو', 120)),
    i('Beef and Truffle Pasta', 'باستا لحم وترفاس', 110),
  ]},
  { id: 'risotto', en: 'Risotto', ar: 'الريزوتو', img: 'beef-risotto', items: [
    from('risotto/seafood-risotto', 'Seafood Risotto', 'ريزوتو فواكه البحر', 55),
    from('risotto/chicken-mushroom-risotto', 'Chicken & Mushroom Risotto', 'ريزوتو دجاج ومشروم', 52),
    i('Truffle and Chicken Risotto', 'ريزوتو ترفاس ودجاج', 65),
    NEW(i('Pink Sauce Shrimp & Mushroom Risotto', 'ريزوتو بينك صوص جمبري ومشروم', 57)),
  ]},
  { id: 'meat', en: 'Meat Selections', ar: 'اللحوم', img: 'tomahawk', items: [
    from('steaks/grilled-fillet', 'Grilled Fillet Steak', 'فيليه مشوي', 99),
    from('steaks/fillet-with-cheese-sauce', 'Fillet Steak with Cheese Sauce', 'فيليه بصوص الجبنة', 125),
    from('steaks/parmesan-fillet', 'Fillet Steak with Parmesan Sauce', 'فيليه بصوص البرميزان', 127),
    from('steaks/tomahawk-steak', 'Italian Style Tomahawk', 'توماهوك على الطريقة الإيطالية', 99),
    from('steaks/fillet-with-mushroom-sauce', 'Fillet Steak with Mushroom Sauce', 'فيليه بصوص المشروم', 110),
    i('Fillet Steak with Truffle Sauce', 'فيليه بصوص الترفاس', 135),
  ]},
  { id: 'chicken', en: 'Chicken', ar: 'الدجاج', img: 'chicken-cheese', items: [
    from('chicken/grilled-chicken-with-rice', 'Grilled Chicken with Rice', 'دجاج مشوي مع الأرز', 47),
    from('chicken/chicken-with-creamy-mushroom-sauce', 'Chicken with Mushroom Sauce', 'دجاج بصوص الفطر', 60),
    from('chicken/chicken-with-italian-lemon-sauce', 'Lemon Sauce Chicken', 'دجاج بصوص الليمون', 60),
    NEW(i('Flaminio Chicken', 'دجاج فلامينيو', 65)),
  ]},
  { id: 'kids', en: 'Kids Menu', ar: 'أطباق الأطفال', img: null, items: [
    from('kids/kids-pizza', 'Kids Pizza', 'بيتزا كيدز', 20),
    from('kids/kids-chicken-fillet', 'Kids Chicken Breast', 'صدور الدجاج للأطفال', 29),
    NEW(i('Potato Wedges with Cheese Sauce', 'ودجز بطاطا مع صوص الجبنة', 25)),
    from('kids/mini-calzone', 'Calzone', 'كالزوني', 27),
  ]},
  { id: 'pizza', en: 'Pizza', ar: 'البيتزا', img: 'pizza-chicken', items: [
    from('pizza/margherita-pizza', 'Margherita Pizza', 'بيتزا مارغاريتا', 30),
    from('pizza/tuna-pizza', 'Tuna Pizza', 'بيتزا تونة', 37),
    from('pizza/vegetarian-pizza', 'Vegetable Pizza', 'بيتزا خضروات', 35),
    from('pizza/chicken-arugula-pizza', 'Chicken & Rocket Pizza', 'بيتزا دجاج وجرجير', 42, { den: 'Pizza with tomato sauce, mozzarella cheese, grilled chicken, and fresh rocket.' }),
    from('pizza/alfredo-pizza', 'Alfredo Pizza', 'بيتزا ألفريدو', 62),
    from('pizza/chicago-pizza', 'Chicago Pizza', 'بيتزا شيكاغو', 65),
    i('Minced Beef Pizza', 'بيتزا لحم مفروم', 42),
    from('pizza/pepperoni-pizza', 'Pepperoni Pizza', 'بيتزا بيبروني', 65),
    from('pizza/mushroom-pizza', 'Mushroom Pizza', 'بيتزا مشروم', 37),
    from('pizza/four-cheese-pizza', 'Four Cheese Pizza', 'بيتزا أربع أجبان', 57),
    i('Truffle Pizza', 'بيتزا ترافل', 70),
    i('Burrata Pizza', 'بيتزا بوراتا', null),
  ]},
];

// Signature dishes for the Downtown home page (photos verified to show the named dish).
export const SIGNATURE_DOWNTOWN = [
  { ref: 'meat/italian-style-tomahawk', img: 'tomahawk' },
  { ref: 'meat/fillet-steak-with-cheese-sauce', img: 'fillet-cheese' },
  { ref: 'pasta/seafood-pasta', img: 'spaghetti-seafood' },
  { ref: 'pasta/rigatoni-beef-strips', img: 'rigatoni-beef' },
  { ref: 'salads/shrimp-avocado-salad', img: 'avocado-shrimp', pos: '50% 62%' },
  { ref: 'pizza/chicken-rocket-pizza', img: 'pizza-chicken-arugula', pos: '50% 78%' },
];

// ---------------------------------------------------------------------------
// Branches. Each gets its own site (/<id>/ and /<id>/ar/) with its own menu and
// signature dishes; everything else is shared for now. `pdf` is a file in assets/;
// `address` feeds the Restaurant structured data and is left out until known.
export const BRANCHES = [
  {
    id: 'markabaat', en: 'Markabaat', ar: 'المركبات',
    placeEn: 'Al-Markabat Street, Al-Hawari', placeAr: 'شارع المركبات، الهواري',
    menu: MENU, signature: SIGNATURE, pdf: 'Flaminio-Menu.pdf',
    address: { streetAddress: 'Al-Markabat Street, Al-Hawari, near Asayel Resort', addressLocality: 'Benghazi', addressCountry: 'LY' },
  },
  {
    id: 'downtown', en: 'Downtown', ar: 'وسط البلد',
    placeEn: 'Downtown Benghazi', placeAr: 'وسط مدينة بنغازي',
    menu: MENU_DOWNTOWN, signature: SIGNATURE_DOWNTOWN, pdf: null,
    chef: 'Saif Eddine Fardhi',
  },
];
