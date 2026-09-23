// Shared content for the Flaminio site. Edit here to update copy, prices or photos
// on both pages — index.html and menu.html both import this module.

export const PHONE_DISPLAY = '091-0181666';
export const PHONE_TEL = 'tel:+218910181666';
export const WHATSAPP = 'https://wa.me/218910181666';
export const MAPS = 'https://www.google.com/maps/search/?api=1&query=Asayel+Resort+Al-Hawari+Benghazi';
export const FACEBOOK = 'https://www.facebook.com/flaminio.ly/';
export const ADDRESS = 'Al-Hawari, Al-Markabat Street, near Asayel Resort, Benghazi, Libya';

// `home` links are used on index.html, `menu` links on menu.html — both files
// live at the site root, so menu.html points back to index.html's anchors.
export const NAV_LINKS = [
  { label: 'About Us', home: '#about', menu: 'index.html#about' },
  { label: 'Menu', home: 'menu.html', menu: 'menu.html' },
  { label: 'Gallery', home: '#gallery', menu: 'index.html#gallery' },
  { label: 'Contact', home: '#contact', menu: 'index.html#contact' },
  { label: 'Reservations', home: '#reserve', menu: 'index.html#reserve' },
];

export const HERO_SLIDES = [
  { img: 'img/fillet-cheese.jpg' },
  { img: 'img/caprese-pour.jpg' },
  { img: 'img/clams.jpg' },
  { img: 'img/interior-table.jpg' },
];

export const TRUST = ['Fresh pasta daily', 'Wood-fired pizza', 'Premium steaks & seafood'];

export const SIGNATURE = [
  { img: 'img/seafood-pan.jpg', price: 135, name: 'Flaminio Seafood', desc: 'Baby shrimp, cuttlefish, king prawns, clams & black mussels in our signature sauce' },
  { img: 'img/fillet-cheese.jpg', price: 250, name: 'Flaminio Mixed Grill', desc: 'Fillet slices, T-bone, chicken, merguez, with rice, mash & sauces' },
  { img: 'img/tomahawk.jpg', price: 98, name: 'Tomahawk Steak', desc: 'With pasta in Italian tomato sauce' },
  { img: 'img/lemon-shrimp-pasta.jpg', price: 47, name: 'Mare e Monti', desc: 'Prawns, king prawns & mushrooms in creamy pink sauce' },
  { img: 'img/clams.jpg', price: 52, name: 'Seafood Risotto', desc: 'Creamy rice with mixed seafood and tomato' },
  { img: 'img/pizza-top.jpg', price: 29, name: 'Margherita Pizza', desc: 'Wood-fired, tomato, mozzarella, basil' },
];

export const STATS = [
  { big: '15', label: 'Menu Categories' },
  { big: '100+', label: 'Dishes' },
  { big: 'Kids Menu', label: 'Family Friendly' },
];

export const WHY = [
  { title: 'Wood-Fired Pizza', desc: 'Neapolitan dough, blistered in minutes over oak.' },
  { title: 'Fresh Seafood Daily', desc: 'King prawns, clams and mussels from the morning catch.' },
  { title: 'Premium Cuts', desc: 'Fillet, T-bone and tomahawk, grilled to order.' },
  { title: 'Italian Coffee & Desserts', desc: 'Espresso, tiramisù and a slow finish to the evening.' },
];

// Gallery: every photo not used elsewhere first, then the rest.
export const GALLERY = [
  { img: 'img/caprese-pour.jpg', cap: 'Caprese, dressed at the table' },
  { img: 'img/salad-platter.jpg', cap: 'Italian countryside salad' },
  { img: 'img/mussels-pasta.jpg', cap: 'Mussels & linguine' },
  { img: 'img/pizza-chicken.jpg', cap: 'Chicken & arugula pizza' },
  { img: 'img/avocado-shrimp.jpg', cap: 'Avocado salad with shrimp' },
  { img: 'img/seafood-gratin.jpg', cap: 'Seafood gratin' },
  { img: 'img/gratin-pan.jpg', cap: 'From the oven' },
  { img: 'img/salmon.jpg', cap: 'Salmon with cheese' },
  { img: 'img/mushroom-soup.jpg', cap: 'Mushroom soup' },
  { img: 'img/rigatoni-beef.jpg', cap: 'Rigatoni with beef strips' },
  { img: 'img/pizza-arugula.jpg', cap: 'From the wood-fired oven' },
  { img: 'img/interior-table.jpg', cap: 'Our dining room' },
  { img: 'img/seafood-pan.jpg', cap: 'Flaminio Seafood' },
  { img: 'img/tomahawk.jpg', cap: 'Tomahawk steak' },
  { img: 'img/clams.jpg', cap: 'Seafood risotto' },
  { img: 'img/lemon-shrimp-pasta.jpg', cap: 'Mare e Monti' },
  { img: 'img/fillet-cheese.jpg', cap: 'Fillet with cheese sauce' },
  { img: 'img/pizza-top.jpg', cap: 'Margherita' },
  { img: 'img/interior-booth.jpg', cap: 'Booth seating' },
];

// Menu: prices in LYD, null = price on request. Descriptions are optional.
const item = (name, price, desc) => ({ name, price, desc: desc || '' });

export const MENU = [
  { id: 'soups', label: 'Soups', img: 'img/mushroom-soup.jpg', items: [
    item('White Seafood Soup', 30, 'Rich creamy soup with a mix of fresh seafood.'),
    item('Red Seafood Soup', 30, 'Fresh seafood in a signature Italian bisque.'),
    item('Vegetable Soup', 30, 'Smooth, light and full of natural flavour.'),
    item('Mushroom Soup', 30, 'Creamy soup with fresh mushroom pieces.'),
    item('Sweet Potato Soup', 30, 'Smooth and comforting.'),
  ]},
  { id: 'salads', label: 'Salads', img: 'img/salad-platter.jpg', items: [
    item('Caesar Salad', 35, 'Romaine, grilled chicken, Parmesan, Caesar dressing.'),
    item('Caprese Salad', 25, 'Tomatoes, mozzarella, basil, extra virgin olive oil.'),
    item('Tunisian Salad', 25, 'Tuna, boiled egg, tomato, cucumber, red onion.'),
    item('Italian Countryside Salad', 35, 'Lettuce, avocado, luncheon meat, pineapple.'),
    item('Greek Salad', 30, 'Cucumber, tomato, olives, feta, red onion.'),
    item('Flaminio Salad', 49, 'Chicken, lettuce, avocado, sweet potato, raisins, corn.'),
    item('Avocado Salad', 48, 'Guacamole, tomato and shrimp.'),
    item('Tropical Salad', 38, 'Rocket, chia, pineapple and shrimp.'),
  ]},
  { id: 'appetizers', label: 'Appetizers', img: 'img/avocado-shrimp.jpg', items: [
    item('Crispy Calamari', 40, 'Fried calamari rings with tartar sauce.'),
    item('Spicy King Prawn', 45, 'Sautéed with garlic, olive oil and spice.'),
    item('Seafood Gratin', 43, 'Baked with cream and assorted cheeses.'),
    item('Royal Sauté', 60, 'Black mussels, clams and king prawns, Italian style.'),
    item('Crispy Chicken', 47, 'Six pieces in Doritos crumb with special sauce.'),
    item('Shrimp with Almonds', 45, 'Four almond-crusted shrimp, tartar sauce.'),
    item('Flaminio Special', 48, 'Fried shrimp, mozzarella sticks, breaded chicken.'),
  ]},
  { id: 'pasta', label: 'Pasta', img: 'img/rigatoni-beef.jpg', items: [
    item('Penne Arrabbiata', 30, 'Spicy tomato, garlic, basil, olives, Parmesan.'),
    item('Alfredo', 46, 'Fettuccine, cream, chicken, mushroom, Parmesan.'),
    item('Pasta Pesto', 52, 'Rigatoni, pesto, cream and chicken.'),
    item('Four Cheese Pasta', 39, 'Cream and a mix of Italian cheeses.'),
    item('Spaghetti Bolognese', 45, 'Minced beef, tomato, mozzarella, Parmesan.'),
    item('Rigatoni with Beef Strips', 50, 'Tomato, olives, grilled beef, Parmesan.'),
    item('Parma Ravioli', 50, 'Beef-stuffed ravioli in creamy pink sauce.'),
    item('Lasagna', 45, 'Minced meat with Italian cheese.'),
    item('Mare e Monti', 47, 'Baby shrimp, king prawns, mushrooms, pink sauce.'),
    item('Shrimp & Mushroom Ravioli', 52, 'Six ravioli, cream and blue cheese.'),
    item('Spaghetti Seafood', 49, 'Tomato, seafood mix, garlic, basil.'),
    item('Seafood Spaghetti with Mascarpone', 55, 'Tomato, seafood and mascarpone.'),
    item('Pasta with Lemon Sauce', 40, 'Shrimp, mushrooms, mussels, cream, lemon zest.'),
    item('King Prawns Pasta with Bisque', 58, 'Rich bisque sauce and king prawns.'),
    item('Pasta with Shrimp Sauce', 49, 'King prawns and creamy pink sauce.'),
  ]},
  { id: 'risotto', label: 'Risotto', img: 'img/clams.jpg', items: [
    item('Seafood Risotto', 52, 'Creamy rice, mixed seafood, tomato.'),
    item('Chicken & Mushroom Risotto', null, 'Chicken, fresh mushrooms, a touch of cream.'),
    item('Beef & Mushroom Risotto', null, 'Beef, mushrooms, Parmesan, blue cheese, arugula.'),
    item('Vegetable Risotto', null, 'Fresh vegetables and Parmesan.'),
    item('Paella', null, 'Seafood, chicken, peas and bell peppers.'),
    item('Spinach & Shrimp Risotto', null, 'Spinach, shrimp, mushrooms, Parmesan.'),
  ]},
  { id: 'steaks', label: 'Fillet & Steaks', img: 'img/tomahawk.jpg', items: [
    item('Grilled Fillet', null, 'With mash, mixed vegetables and rice.'),
    item('Fillet with Cheese Sauce', null, 'Cream, blue cheese and Parmesan.'),
    item('Fillet with Pepper Sauce', null, 'Pepper demi-glace.'),
    item('Fillet with Mushroom Sauce', null, 'Mushroom demi-glace.'),
    item('Parmesan Fillet', null, 'Cream and Parmesan.'),
    item('Fillet Roma', 120, 'Marinated fillet slices, mushroom demi-glace, creamy risotto.'),
    item('T-Bone Steak', 120, 'Mixed vegetables, mash, BBQ sauce and rice.'),
    item('Tomahawk Steak', 98, 'With pasta in Italian tomato sauce.'),
    item('Flaminio Mixed Grill', 250, 'Fillet, T-bone, chicken, merguez, nuggets and all the sides.'),
  ]},
  { id: 'chicken', label: 'Chicken', img: 'img/fillet-cheese.jpg', items: [
    item('Chicken Breast with Italian Cheese', null, 'Melted mozzarella, vegetables, creamy mash.'),
    item('Chicken with Creamy Mushroom Sauce', null, 'Seasonal vegetables and mash.'),
    item('Chicken with Italian Lemon Sauce', null, 'Mixed vegetables and smooth mash.'),
    item('Parmesan Pesto Chicken', null, 'Tender slices in classic pesto.'),
    item('Flaminio Grilled Chicken', null, 'Special seasoning, vegetables, white rice.'),
    item('Chicken Diet', null, 'Grilled breast, fresh salad, light vegetables.'),
  ]},
  { id: 'seafood', label: 'Seafood', img: 'img/seafood-pan.jpg', items: [
    item('Salmon with Cheese', 120, 'Mash, mushrooms, cream and blue cheese.'),
    item('Royal Shrimp with Garlic & Lemon', 75, 'With mash, vegetables and rice.'),
    item('Flaminio Seafood', 135, 'Baby shrimp, cuttlefish, king prawns, clams, black mussels.'),
    item('Creamy King Prawns', 95, 'King and small prawns with rice in creamy sauce.'),
    item('Grilled Fish', 75, 'With fries, vegetables and rice.'),
  ]},
  { id: 'pizza', label: 'Pizza', img: 'img/pizza-arugula.jpg', items: [
    item('Margherita', 29, 'Tomato, mozzarella, fresh basil.'),
    item('Tuna', 35, 'Tomato, mozzarella and tuna.'),
    item('Chicken & Arugula', 39, 'Grilled chicken and fresh arugula.'),
    item('Seafood', 50, 'Assorted seafood, tomato, mozzarella.'),
    item('Vegetarian', 33, 'Peppers, olives, mushrooms, zucchini.'),
    item('Pepperoni', 59, 'Tomato, mozzarella, pepperoni.'),
    item('Four Cheese', 55, 'Fresh cream and Italian cheeses.'),
    item('Luncheon', 36, 'Tomato, mozzarella, luncheon slices.'),
    item('Alfredo', 62, 'Creamy sauce, chicken, mushrooms.'),
    item('Chicago', 65, 'Double crust stuffed with chicken, beef, mushrooms, cheeses.'),
    item('Mushroom', 34, 'Tomato, mozzarella, mushrooms.'),
  ]},
  { id: 'sandwiches', label: 'Sandwiches', img: 'img/seafood-gratin.jpg', items: [
    item('Beef Burger', 16, 'Lettuce, tomato, cheese, special sauce.'),
    item('Skillet Burger', 45, 'Two patties with mushroom sauce.'),
    item('Banieh', 14, 'Breaded chicken burger.'),
    item('Chicken Fajitas', 26, 'Tortilla and creamy sauce.'),
    item('Avocado Chicken Fajitas', 30, 'Tortilla and avocado sauce.'),
    item('Grilled Chicken Scallop', 22, 'White cheese and Flaminio bread.'),
    item('Grilled Beef Steak Sandwich', 28, 'With special sauce.'),
    item('Chicken Panuzzo', 24, 'Grilled chicken, sauces, cheese.'),
    item('Beef Panuzzo', 26, 'Minced beef, sauces, cheese.'),
    item('Chicken Corny', 25, 'Grilled chicken, tomato, cheese.'),
    item('Beef Corny', 28, 'Minced beef, tomato, cheese.'),
    item('Chicken Baguette', 28, 'Chicken, tomato, mushrooms, cheese.'),
    item('Beef Baguette', 30, 'Minced beef, tomato, mushrooms, cheese.'),
    item('Mixed Baguette', 35, 'Chicken, beef, mushrooms, tomato, cheese.'),
  ]},
  { id: 'kids', label: 'Kids', img: 'img/pizza-chicken.jpg', items: [
    item('Kids Chicken Fillet', 16, 'Cheese, fries and a juice drink.'),
    item('Mini Pasta Kids', 16, 'Tomato, meatballs, mozzarella and a juice drink.'),
    item('Kids Pizza', 16, 'Mini pizza with fries and a juice drink.'),
    item('Mozzarella Sticks', 16, 'Four sticks, special sauce and a juice drink.'),
    item('Mini Calzone', 16, 'Chicken and tomato, fries and a juice drink.'),
  ]},
  { id: 'desserts', label: 'Desserts', img: 'img/caprese-pour.jpg', items: [
    item('Tiramisù', null, 'Espresso-soaked, mascarpone, cocoa.'),
    item('Panna Cotta', null, 'Vanilla cream with berry coulis.'),
    item('Cheesecake', null, 'Baked New York style.'),
    item('Chocolate Fondant', null, 'Molten centre, vanilla ice cream.'),
  ]},
  { id: 'hotcoffee', label: 'Hot Coffee', img: 'img/interior-table.jpg', items: [
    item('Espresso', null), item('Double Espresso', null), item('Macchiato', null), item('Cappuccino', null),
    item('Latte', null), item('Flat White', null), item('Americano', null), item('Hot Chocolate', null),
  ]},
  { id: 'coldcoffee', label: 'Cold Coffee & Drinks', img: 'img/interior-booth.jpg', items: [
    item('Flavored Latte', 12, 'Mocha, caramel, hazelnut, vanilla.'),
    item('Iced Macchiato', 10), item('Iced Café', 10),
    item('Frappuccino', 15, 'Mocha, caramel, hazelnut, vanilla.'),
    item('Milkshakes', null, 'Nutella, Lotus, Kinder, Milka, strawberry, mango, vanilla, raspberry, blueberry.'),
    item('Mojito', null, 'Classic, pineapple, strawberry, kiwi.'),
    item('Smoothies', null, 'Depending on available flavours.'),
  ]},
  { id: 'softdrinks', label: 'Soft Drinks & Juices', img: 'img/interior-table.jpg', items: [
    item('Soft Drinks', null, 'Cola, lemon, orange, soda water.'),
    item('Mineral Water', null), item('Sparkling Water', null),
    item('Natural Juices', null, 'Orange, lemon-mint, mango, strawberry, mixed.'),
  ]},
];
