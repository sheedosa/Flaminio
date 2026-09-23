// All site content. The build (scripts/build.mjs) renders every page from this
// file, and the browser scripts import it too — edit here, rebuild, done.
// Prices and Arabic dish names/descriptions come from the restaurant's own menu
// (assets/Flaminio-Menu.pdf). English descriptions are condensed from the same PDF.

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
export const SIGNATURE = [
  { ref: 'seafood/flaminio-seafood', img: 'seafood-pan' },
  { ref: 'steaks/fillet-with-cheese-sauce', img: 'fillet-cheese' },
  { ref: 'steaks/tomahawk-steak', img: 'tomahawk' },
  { ref: 'pasta/spaghetti-seafood', img: 'spaghetti-seafood' },
  { ref: 'salads/tropical-salad', img: 'tropical-salad' },
  { ref: 'pizza/chicken-arugula', img: 'pizza-chicken-arugula', en: 'Chicken & Arugula Pizza' },
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

// price: number, [small, large] when the menu lists two prices, or null.
const i = (en, ar, price, den = '', dar = '') => ({ id: slug(en), en, ar, price, den, dar });

// `img: null` shows a branded panel until the restaurant supplies a real photo.
// `drinks: true` keeps a category out of the "100+ dishes" count.
export const MENU = [
  { id: 'soups', en: 'Soups', ar: 'الشوربات', img: 'mushroom-soup', items: [
    i('White Seafood Soup', 'شوربة فواكه البحر البيضاء', 50, 'Rich, creamy soup with a mix of fresh seafood.', 'شوربة كريمية غنية بمزيج فواكه البحر الطازجة، تقدم بنكهات بحرية ناعمة ومميزة.'),
    i('Red Seafood Soup', 'شوربة فواكه البحر الحمراء', 50, 'Fresh seafood in our signature Italian bisque.', 'شوربة غنية بمزيج فواكه البحر الطازجة مع صوص البيسك الإيطالي المميز، تقدم بنكهات بحرية عميقة ومليئة بالألوان.'),
    i('Vegetable Soup', 'شوربة الخضار', 22, 'Smooth, light and full of natural flavour.', 'شوربة خضار مهروسة غنية بالنكهات الطبيعية، خفيفة ومغذية.'),
    i('Mushroom Soup', 'شوربة الماشروم', 30, 'Creamy soup with fresh mushroom pieces.', 'شوربة كريمية مع قطع المشروم الطازج، نكهة غنية ودافقة باللذة.'),
    i('Sweet Potato Soup', 'شوربة البطاطا الحلوة', 22, 'Creamy sweet potato soup, smooth and comforting.', 'شوربة كريمية مصنوعة من البطاطا الحلوة، ناعمة ومريحة.'),
  ]},
  { id: 'salads', en: 'Salads', ar: 'السلاطات', img: 'greek-salad', items: [
    i('Caesar Salad', 'سلطة سيزر', 35, 'Romaine, grilled chicken, Parmesan and Caesar dressing.', 'خس طازج، شرائح دجاج مشوي، جبن بارميزان، وصوص السيزر.'),
    i('Caprese Salad', 'سلطة كابريزي', 25, 'Tomatoes, mozzarella, basil and extra virgin olive oil.', 'طماطم طازجة، جبن موتزاريلا، ريحان، وزيت زيتون بكر.'),
    i('Tunisian Salad', 'سلطة تونسية', 25, 'Tuna, boiled egg, tomato, cucumber and red onion.', 'تونة، بيض مسلوق، طماطم، خيار، وبصل أحمر.'),
    i('Italian Countryside Salad', 'سلطة الريف الإيطالي', 35, 'Lettuce, avocado, luncheon meat and pineapple.', 'خس، أفوكادو، لانشون، وشرائح أناناس.'),
    i('Greek Salad', 'سلطة يونانية', 30, 'Cucumber, tomato, olives, feta and red onion.', 'خيار، طماطم، زيتون، جبنة فيتا، وبصل أحمر.'),
    i('Flaminio Salad', 'سلطة فلامينيو', 49, 'Grilled chicken, lettuce, avocado, sweet potato, corn and raisins.', 'دجاج مشوي، خس، أفوكادو، بطاطا حلوة، ذرة، وزبيب.'),
    i('Avocado Salad', 'سلطة الأفوكادو', 48, 'Guacamole, tomatoes and shrimp.', 'جواكامولي، أناناس، وجمبري ملكي.'),
    i('Tropical Salad', 'السلطة الاستوائية', 38, 'Fresh rocket, chia seeds, pineapple and shrimp.', 'خليط من الجرجير الطازج، حبوب الشيا المغذية، قطع الأناناس الطازج، وقطع الجمبري، تقدم بنكهات منعشة وحيوية.'),
  ]},
  { id: 'appetizers', en: 'Appetizers', ar: 'المقبلات', img: 'king-prawns', items: [
    i('Crispy Calamari', 'كالامار مقرمش', 40, 'Fried calamari rings with tartar sauce.', 'حلقات كالامار مقلية تقدم مع صوص التارتار.'),
    i('Spicy King Prawn', 'جمبري ملكي حار', 45, 'King prawns sautéed with garlic, olive oil and spice.', 'جمبري ملكي مطهو بالزيت والثوم مع التوابل الحارة.'),
    i('Seafood Gratin', 'جراتان فواكه البحر', 43, 'Mixed seafood baked with cream and assorted cheeses.', 'فواكه بحر مشكلة مع كريمة الطبخ وتشكيلة من الأجبان بالفرن.'),
    i('Royal Sauté', 'سوتيه رويال', 60, 'Black mussels, clams and king prawns, Italian style.', 'محار أسود وجندوفلي مع جمبري ملكي على الطريقة الإيطالية.'),
    i('Crispy Chicken', 'دجاج كرسبي', 47, 'Six pieces in a crunchy Doritos crumb with special sauce.', '6 قطع دجاج مغطاة بفتات دوريتوس المقرمش، تقدّم مع صوص خاص.'),
    i('Shrimp with Almonds', 'جمبري باللوز', 45, 'Four almond-crusted shrimp with tartar sauce.', '4 قطع جمبري مغطاة بشرائح اللوز المقرمشة مع صوص التارتار.'),
    i('Flaminio Special', 'فلامينيو سبيشال', 48, 'Fried shrimp, mozzarella sticks and breaded chicken with tartar sauce.', 'تشكيلة مميزة من الجمبري المقلي، أصابع الموزاريلا، ودجاج بانيه مع صوص التارتار.'),
  ]},
  { id: 'pasta', en: 'Pasta', ar: 'الباستا', img: 'rigatoni-beef', items: [
    i('Penne Arrabbiata', 'بينا أرابياتا', 30, 'Spicy tomato sauce, olive oil, garlic, basil, olives and Parmesan.', 'بينا مع صلصة الطماطم الحارة، زيت الزيتون، ثوم، ريحان، وزيتون، بجبنة بارميزان.'),
    i('Alfredo', 'الفريدو', 46, 'Fettuccine with cream, chicken, mushrooms and Parmesan.', 'فيتوتشيني مع كريمة الطبخ، قطع دجاج، وماشروم وجبنة بارميزان.'),
    i('Pasta Pesto', 'باستا بيستو', 52, 'Rigatoni with pesto, cream and chicken.', 'ريغاتوني مع صوص البيستو، كريمة الطبخ، وقطع الدجاج.'),
    i('Four Cheese Pasta', 'باستا أربع أجبان', 39, 'Cream and a mix of Italian cheeses.', 'باستا مع كريمة الطبخ وتشكيلة من الأجبان الإيطالية.'),
    i('Spaghetti Bolognese', 'سباغيتي بولونيز', 45, 'Minced beef in tomato sauce, mozzarella and Parmesan.', 'سباغيتي مع لحم مفروم بصلصة طماطم، موزاريلا، وجبنة بارميزان.'),
    i('Rigatoni with Beef Strips', 'ريغاتوني بشرائح اللحمة', 50, 'Tomato sauce, olives, grilled beef strips and Parmesan.', 'ريغاتوني مع صلصة الطماطم، زيتون، شرائح فيليه مشوي، وجبنة بارميزان.'),
    i('Parma Ravioli', 'رافيولي بارما', 50, 'Beef-stuffed ravioli in a creamy pink sauce.', 'رافيولي محشو باللحم المفروم مع صوص وردي كريمي.'),
    i('Lasagna', 'لازانيا', 45, 'Minced meat with Italian cheese.', 'لحم مفروم مع الجبن الإيطالي.'),
    i('Mare e Monti', 'ماري مانتي', 47, 'Baby shrimp, king prawns and mushrooms in a creamy pink sauce.', '(بحر وجبل) يجمع بين روعة البحر وسحر الأرض، حيث يلتقي الجمبري الصغير والجمبري الملكي مع الفطر الطازج، مغمورين في صوص وردي كريمي يضيف لمسة إيطالية أنيقة ونكهة متوازنة.'),
    i('Shrimp & Mushroom Ravioli', 'رافيولي بالجمبري والمشروم', 55, 'Six ravioli with cream and blue cheese.', '6 قطع رافيولي محشوة بالجمبري والمشروم مع كريمة الطبخ والجبنة الزرقاء.'),
    i('Spaghetti Seafood', 'سباغيتي فواكه البحر', 55, 'Tomato sauce, mixed seafood, garlic and basil.', 'سباغيتي مع صلصة الطماطم، فواكه البحر، ثوم، وريحان.'),
    i('Seafood Spaghetti with Mascarpone', 'سباغيتي فواكه البحر مع ماسكربوني', 70, 'Tomato sauce, seafood and mascarpone.', 'سباغيتي مع صلصة الطماطم، فواكه البحر، وجبنة ماسكربوني.'),
    i('Pasta with Lemon Sauce', 'باستا بصوص الليمون', 70, 'Shrimp, mushrooms, mussels, cream and lemon zest.', 'باستا مع جمبري، مشروم، محار، كريمة طبخ، وقشور الليمون.'),
    i('King Prawns Pasta with Bisque Sauce', 'باستا جمبري ملكي بصوص البيسك', 68, 'Rich bisque sauce and king prawns.', 'باستا مع صوص البيسك والجمبري الملكي.'),
    i('Pasta with Shrimp Sauce', 'باستا جانوتشي بصلصة الجمبري', 45, 'King prawns in a creamy pink sauce.', 'باستا مع جمبري ملكي وصوص وردي كريمي.'),
  ]},
  { id: 'risotto', en: 'Risotto', ar: 'الريزوتو', img: 'beef-risotto', items: [
    i('Seafood Risotto', 'ريزوتو فواكه البحر', 52, 'Creamy rice with mixed seafood, tomato sauce, pesto and Parmesan.', 'أرز كريمي مع فواكه البحر المشكلة، صوص الطماطم، صوص البيستو، وجبنة بارميزان.'),
    i('Chicken & Mushroom Risotto', 'ريزوتو بالدجاج والمشروم', 49, 'Chicken, fresh mushrooms and a touch of cream.', 'أرز مع قطع دجاج ومشروم طازج بلمسة من الكريمة.'),
    i('Beef & Mushroom Risotto', 'ريزوتو لحم بالمشروم', 55, 'Beef, mushrooms, cream, Parmesan, blue cheese and arugula.', 'أرز كريمي مع شرائح لحم، مشروم، كريمة طبخ، جبنة بارميزان، جبنة زرقاء، وجرجير.'),
    i('Vegetable Risotto', 'ريزوتو خضار', 40, 'Fresh vegetables and Parmesan.', 'أرز كريمي مع تشكيلة من الخضار الطازجة وجبنة بارميزان.'),
    i('Paella', 'بايلا', 58, 'Rice with seafood, chicken, peas and bell peppers.', 'أرز مع مزيج من فواكه البحر، الدجاج، البزاليا، والفلفل الألوان.'),
    i('Spinach & Shrimp Risotto', 'ريزوتو سبانخ بالجمبري', 49, 'Spinach, shrimp, mushrooms and Parmesan.', 'أرز مع سبانخ طازج، جمبري، مشروم، وجبنة بارميزان.'),
  ]},
  { id: 'steaks', en: 'Fillet & Steaks', ar: 'الفيليه والستيك', img: 'tomahawk', items: [
    i('Grilled Fillet', 'فليه مشوي', 95, 'With mashed potatoes, mixed vegetables and rice.', 'فيليه لحم مشوي مع بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Fillet with Cheese Sauce', 'فليه بصوص الجبن', 120, 'Cream, blue cheese and Parmesan, with mash, vegetables and rice.', 'فيليه لحم مع كريمة الطبخ، جبنة زرقاء، جبنة بارميزان، بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Fillet with Pepper Sauce', 'فليه بصوص الفلفل', 98, 'Pepper demi-glace, with mash, vegetables and rice.', 'فيليه لحم مع صوص الديمي جلاص بالفلفل، بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Fillet with Mushroom Sauce', 'فليه بالفطر', 98, 'Mushroom demi-glace, with mash, vegetables and rice.', 'فيليه لحم مع صوص المشروم بالديمي جلاص، بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Parmesan Fillet', 'فليه باريمجانو', 120, 'Cream and Parmesan, with mash, vegetables and rice.', 'فيليه لحم مع كريمة الطبخ، جبنة بارميزان، بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Fillet Roma', 'فيلي روما', 120, 'Marinated fillet slices, mushroom demi-glace and creamy risotto.', 'شرائح فيليه متبلة بتتبيلة فلامينيو الخاصة، تقدم مع صوص الديمي جلاص والفطر مع ريزوتو كريمي.'),
    i('T-Bone Steak', 'طبق تي بون', 110, 'Mixed vegetables, mash, BBQ sauce and rice.', 'تي بون مع خضار مشكلة، بطاطا مهروسة، صوص باربكيو، وأرز.'),
    i('Tomahawk Steak', 'طبق التوماهوك', 98, 'With pasta in Italian tomato sauce, vegetables and mash.', 'ستيك التوماهوك يقدم مع باستا بصلصة الطماطم الإيطالية، خضار مشكلة، وبطاطا مهروسة.'),
    i('Flaminio Mixed Grill', 'مشاوي فلامينيو', 250, 'Fillet slices, T-bone, chicken breast, merguez and nuggets with all the sides.', 'تشكيلة فاخرة من شرائح الفيليه، تي بون، صدور دجاج، مرقاز، ناغتس، مع أرز، بطاطا مهروسة، خضار مشكلة، بطاطا مقلية، مخللات، سلطة، وتشكيلة صلصات خاصة.'),
  ]},
  { id: 'chicken', en: 'Chicken', ar: 'أطباق الدجاج', img: 'chicken-cheese', items: [
    i('Chicken Breast with Italian Cheese', 'صدر الدجاج بالجبن الإيطالي', 55, 'Melted mozzarella, mixed vegetables and creamy mash.', 'صدر دجاج مشوي وجبنة الموزاريلا الذائبة، يقدم مع خضار مشكلة وبطاطا مهروسة كريمية.'),
    i('Chicken with Creamy Mushroom Sauce', 'دجاج بصوص الفطر الكريمي', 55, 'Rich Italian mushroom sauce, seasonal vegetables and mash.', 'صدور دجاج مشوية تقدم مع صوص الفطر الكريمي الإيطالي الغني، مرافق بخضار موسمية وبطاطا مهروسة.'),
    i('Chicken with Italian Lemon Sauce', 'دجاج بصوص الليمون الإيطالي', 55, 'Mixed vegetables and smooth mash.', 'صدور دجاج مشوية بنكهة الليمون الإيطالية العطرية، تقدم مع خضار مشكلة وبطاطا مهروسة ناعمة.'),
    i('Parmesan Pesto Chicken', 'دجاج بيستو بالبرميجان', 58, 'Tender slices in classic pesto with Parmesan.', 'شرائح دجاج طرية مغطاة بصوص البيستو الإيطالي الكلاسيكي، مع لمسة من جبنة البرميجان.'),
    i('Grilled Chicken with Rice', 'دجاج مشوي مع الأرز', 45, "Flaminio's special marinade, vegetables and white rice.", 'صدر دجاج مشوي بتتبيلة فلامينيو الخاصة، يقدم مع خضار مشكلة وأرز أبيض.'),
    i('Chicken Diet', 'دجاج دايت', 40, 'Grilled breast, fresh salad and light vegetables.', 'صدور دجاج مشوية على الطريقة الإيطالية، مع سلطة طازجة وخضار مشكلة خفيفة.'),
  ]},
  { id: 'seafood', en: 'Seafood', ar: 'أطباق فواكه البحر', img: 'seafood-pan', items: [
    i('Salmon with Cheese', 'سالمون بالجبنة', 120, 'Salmon fillet, mash, mushrooms, cream and blue cheese.', 'قطعة سالمون فيليه مع بطاطا مهروسة، مشروم، كريمة طبخ، وجبنة زرقاء.'),
    i('Royal Shrimp with Garlic & Lemon', 'طبق جمبري ملكي بالثوم والليمون', 75, 'With mash, vegetables and rice.', 'جمبري ملكي كبير مطهو بالثوم والليمون مع بطاطا مهروسة، خضار مشكلة، وأرز.'),
    i('Flaminio Seafood', 'فلامينيو فواكه البحر', 135, 'Baby shrimp, cuttlefish, king prawns, clams and black mussels in our signature sauce.', 'مزيج فاخر من ثمار البحر الطازجة، يجمع بين الجمبري الصغير، السيبيا، الجمبري الملكي، الجندوفلي، والمحار الأسود، محضر بلمسة خاصة مع صوص فلامينيو المميز.'),
    i('Creamy King Prawns', 'جمبري ملكي بالكريمة', 95, 'King and small prawns with rice in a rich cream sauce.', 'تتكون من جمبري صغير وجمبري ملكي مع أرز وصوص كريمي غني.'),
    i('Grilled Fish', 'سمك مشوي', 75, 'With fries, mixed vegetables and rice.', 'سمك مشوي مع بطاطا مقلية، خضار مشكلة، وأرز.'),
  ]},
  { id: 'pizza', en: 'Pizza', ar: 'البيتزا', img: 'pizza-wood-fired', items: [
    i('Margherita', 'بيتزا مارغريتا', 29, 'Tomato sauce, mozzarella and fresh basil.', 'بيتزا كلاسيكية مع صلصة الطماطم، جبنة موتزاريلا، وأوراق ريحان طازجة.'),
    i('Tuna', 'بيتزا تونة', 35, 'Tomato, mozzarella and tuna.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، وتونة طازجة.'),
    i('Chicken & Arugula', 'بيتزا دجاج مع جرجير', 39, 'Tomato, mozzarella, grilled chicken and fresh arugula.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، دجاج مشوي، وجرجير طازج.'),
    i('Seafood', 'بيتزا فواكه البحر', 50, 'Assorted seafood, tomato and mozzarella.', 'بيتزا غنية بفواكه البحر المتنوعة مع صلصة الطماطم وجبنة موتزاريلا.'),
    i('Vegetarian', 'بيتزا الخضروات', 33, 'Peppers, olives, mushrooms and zucchini.', 'بيتزا طازجة مع صلصة الطماطم، جبنة موتزاريلا، وفلفل ألوان، زيتون، مشروم، وكوسة.'),
    i('Pepperoni', 'بيتزا بيبروني', 59, 'Tomato, mozzarella and pepperoni.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، وشرائح بيبروني.'),
    i('Four Cheese', 'بيتزا أربع أجبان', 55, 'Fresh cream and Italian cheeses.', 'بيتزا مع كريمة طازجة وخليط من الأجبان الإيطالية.'),
    i('Luncheon', 'بيتزا لانشون', 36, 'Tomato, mozzarella and luncheon slices.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، وشرائح لانشون.'),
    i('Alfredo', 'بيتزا ألفريدو', 62, 'Creamy sauce, chicken, mushrooms and mozzarella.', 'بيتزا بالكريمة، قطع دجاج، مشروم، وجبنة موتزاريلا.'),
    i('Chicago', 'بيتزا شيكاغو', 65, 'Double crust stuffed with chicken, beef, mushrooms and cheeses.', 'من طبقتين من العجينة محشوة بالدجاج، اللحم المفروم، الفطر، ومزيج من الأجبان.'),
    i('Mushroom', 'بيتزا ماشروم', 34, 'Tomato, mozzarella and mushrooms.', 'بيتزا مع صلصة الطماطم، جبنة موتزاريلا، وماشروم.'),
  ]},
  { id: 'sandwiches', en: 'Sandwiches', ar: 'الساندويتشات', img: 'skillet-burger', items: [
    i('Beef Burger', 'برغر لحم', 16, 'Grilled beef, lettuce, tomato, cheese and special sauce.', 'برغر لحم بقري مشوي مع خس، طماطم، جبنة، وصوص خاص.'),
    i('Skillet Burger', 'برغر سكيليت', 45, 'Two patties in mushroom sauce.', 'قطعتين من اللحم وصوص الفطر.'),
    i('Banieh', 'بانيه', 14, 'Crispy breaded chicken, lettuce, tomato, cheese and special sauce.', 'دجاج بانيه مقرمش مع خس، طماطم، جبنة، وصوص خاص.'),
    i('Chicken Fajitas', 'فاخيتاس دجاج', 26, 'Tortilla and creamy sauce.', 'دجاج مع خبز التورتيلا وصوص كريمي.'),
    i('Avocado Chicken Fajitas', 'فاخيتاس بصوص الأفوكادو', 30, 'Tortilla and avocado sauce.', 'دجاج مع خبز التورتيلا وصوص الأفوكادو.'),
    i('Grilled Chicken Scallop', 'جريل سكالوب دجاج', 22, 'White cheese and Flaminio bread.', 'دجاج مع جبنة بيضاء وخبز فلامينيو.'),
    i('Grilled Beef Steak Sandwich', 'جريل ستيك لحم', 28, 'With special sauce.', 'ساندويتش ستيك لحم مشوي مع صوص خاص.'),
    i('Chicken Panuzzo', 'بانوزو دجاج', 24, 'Grilled chicken, sauces and cheese.', 'خبز بانوزو إيطالي محشو بدجاج مشوي مع صوصات وجبنة.'),
    i('Beef Panuzzo', 'بانوزو لحم', 26, 'Minced beef, sauces and cheese.', 'خبز بانوزو إيطالي محشو بلحم مفروم مع صوصات وجبنة.'),
    i('Chicken Corny', 'كورني دجاج', 25, 'Grilled chicken, tomato sauce and cheese.', 'خبز كورني محشو بدجاج مشوي مع صلصة الطماطم والجبنة.'),
    i('Beef Corny', 'كورني لحم', 28, 'Minced beef, tomato sauce and cheese.', 'خبز كورني محشو بلحم مفروم مع صلصة الطماطم والجبنة.'),
    i('Chicken Baguette', 'باقات دجاج', 28, 'Chicken, tomato sauce, mushrooms and cheese.', 'باقات إيطالي محشو بدجاج، صلصة الطماطم، الفطر، والجبنة.'),
    i('Beef Baguette', 'باقات لحم', 30, 'Minced beef, tomato sauce, mushrooms and cheese.', 'باقات إيطالي محشو بلحم مفروم، صلصة الطماطم، الفطر، والجبنة.'),
    i('Mixed Baguette', 'باقات مكس', 35, 'Chicken, beef, mushrooms, tomato sauce and cheese.', 'باقات إيطالي محشو بدجاج، لحم مفروم، فطر، صلصة الطماطم، والجبنة.'),
  ]},
  { id: 'kids', en: 'Kids', ar: 'فلامينيو كيدز', img: 'kids-pasta', items: [
    i('Kids Chicken Fillet', 'صدور دجاج أطفال', 25, 'Chicken with cheese, fries and a Santop drink.', 'قطع دجاج مع جبنة، بطاطا مقلية، ومشروب سانتوب.'),
    i('Mini Pasta Kids', 'ميني باستا كيدز', 34, 'Tomato sauce, meatballs, mozzarella and a Santop drink.', 'باستا بصلصة الطماطم مع كرات اللحم وجبنة موتزاريلا، تقدم مع مشروب سانتوب.'),
    i('Kids Pizza', 'بيتزا كيدز', 16, 'Mini pizza with fries and a Santop drink.', 'بيتزا صغيرة مع بطاطا مقلية ومشروب سانتوب.'),
    i('Mozzarella Sticks', 'موتزاريلا ستيك', 28, 'Four sticks with special sauce and a Santop drink.', '4 قطع من أصابع الموتزاريلا المقلية مع صوص خاص ومشروب سانتوب.'),
    i('Mini Calzone', 'ميني كالزوني', 25, 'Chicken and tomato, fries and a Santop drink.', 'كالزوني صغير محشو بالدجاج وصلصة الطماطم، يقدم مع بطاطا مقلية ومشروب سانتوب.'),
  ]},
  { id: 'desserts', en: 'Desserts', ar: 'الحلويات', img: null, items: [
    i('Vanilla Crème Brûlée', 'كريم برولي فانيلا', 15),
    i('Large Crème Brûlée', 'كريم برولي كبير', 20),
    i('Small Crème Brûlée', 'كريم برولي صغير', 15),
    i('Lemon Tiramisu', 'تيراميسو ليمون', 25),
    i('Small Tiramisu', 'تيراميسو كلاسيك صغير', 20),
    i('Large Tiramisu', 'تيراميسو كبير', 25),
    i('Cake', 'كيكة', 20),
    i('San Sebastián Cake', 'كيكة سان سيباستيان', 25),
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
    i('Cappuccino', 'كابتشينو', [3, 8]),
    i('Nescafé', 'نسكافيه', [3, 5]),
    i('Mocha', 'موكا', 12),
    i('Latte', 'لاتيه', 8),
    i('Arabic Coffee', 'قهوة عربية', 6),
    i('Tea (Red / Green)', 'شاي (أحمر / أخضر)', 2),
    i('Tunisian Tea (Red / Green)', 'شاي تونسي (أحمر / أخضر)', 3),
    i('Turkish Coffee', 'قهوة تركية', 6),
    i('Hot Chocolate', 'هوت شوكلت', 15),
    i('American Coffee', 'أميريكان كافي', 4),
    i('Nesquik', 'نسكويك', 5),
    i('Ovaltine', 'أوفلتين', 5),
  ]},
  { id: 'cold-drinks', en: 'Cold Coffee & Drinks', ar: 'قهوة ومشروبات باردة', img: null, drinks: true, groups: [
    { en: 'Cold Coffee', ar: 'قهوة باردة', items: [
      i('Flavoured Latte', 'لاتيه نكهات', 12, 'Mocha, caramel, hazelnut or vanilla.', 'موكا، كراميل، بندق، فانيليا.'),
      i('Iced Macchiato', 'ايس مكياطة', 10),
      i('Iced Café', 'ايس كافي', 10),
      i('Frappuccino', 'فرابتشينو', 15, 'Mocha, caramel, hazelnut or vanilla.', 'موكا، كراميل، بندق، فانيليا.'),
    ]},
    { en: 'Cold Drinks', ar: 'مشروبات باردة', items: [
      i('Milkshakes', 'ميلك شيك', 12, 'Nutella, Lotus, Kinder, Milka, strawberry, mango, vanilla, raspberry or blueberry.', 'نوتيلا، لوتس، كيندر، ميلكا، فراولة، منجا، فانيليا، توت أحمر، توت أزرق.'),
      i('Mojito', 'موهيتو', 10, 'Classic, pineapple, strawberry or kiwi.', 'كلاسيك، أناناس، فراولة، كيوي.'),
      i('Smoothies', 'سموثي', 10, 'Depending on available flavours.', 'حسب النكهات المتوفرة.'),
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
      i('Dates & Almonds', 'تمر ولوز', 13),
      i('Avocado', 'أفوكادو', 17),
      i('Cocktail', 'كوكتيل', 15),
      i('Banana Milk', 'حليب بالموز', 9),
    ]},
  ]},
];

// Flat list of a category's items, whether or not it is split into groups.
export const itemsOf = cat => cat.items || cat.groups.flatMap(g => g.items);

export function findItem(ref) {
  const [catId, itemId] = ref.split('/');
  const cat = MENU.find(c => c.id === catId);
  const item = cat && itemsOf(cat).find(it => it.id === itemId);
  if (!item) throw new Error(`Unknown menu item: ${ref}`);
  return item;
}
