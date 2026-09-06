/**
 * THE NEW MIRCH MASALA - Google Apps Script Web App
 * SELF-HEALING DIGITAL MENU & GOOGLE SHEETS SYNC
 * 
 * Architecture:
 * Website / API Call -> doGet() -> getMenuData() -> ensureCompleteMenu()
 * 1. Checks if the 'Menu' sheet has the full catalog of 64 items.
 * 2. If test items (soup-01, soup-02, biryani-01) or missing items are detected,
 *    it automatically repairs the sheet, restores original images and missing items.
 * 3. Never creates duplicates (uses unique 'id').
 * 4. Preserves owner edits to price, secondaryPrice, isAvailable, isPopular, etc.
 * 5. Returns the complete 64-item menu dynamically.
 */

var SPREADSHEET_ID = ''; // Leave blank if bound to the sheet, or paste spreadsheet ID
var MENU_SHEET_NAME = 'Menu';
var RESTAURANT_SHEET_NAME = 'Restaurant';

// Phase 4: Customer Loyalty & Verified Visits Sheets
var CUSTOMERS_SHEET_NAME = 'Customers';
var VISITS_SHEET_NAME = 'Visits';
var REWARDS_SHEET_NAME = 'Rewards';
var REWARD_REDEMPTIONS_SHEET_NAME = 'RewardRedemptions';

// Configurable Loyalty Settings (Easily modified by restaurant management)
var LOYALTY_CONFIG = {
  visitsRequired: 5,
  rewardName: '₹50 OFF',
  rewardDescription: 'Get ₹50 off on your next eligible visit'
};

var HEADERS = [
  'id',
  'name',
  'category',
  'subCategory',
  'price',
  'secondaryPrice',
  'description',
  'image',
  'isVeg',
  'isAvailable',
  'isPopular'
];

var CUSTOMERS_HEADERS = [
  'customerId',
  'name',
  'phone',
  'restaurantId',
  'createdAt',
  'totalVisits',
  'availableRewards',
  'lastVisitAt',
  'status'
];

var VISITS_HEADERS = [
  'visitId',
  'customerId',
  'restaurantId',
  'visitDate',
  'visitTime',
  'verifiedBy',
  'status'
];

var REWARDS_HEADERS = [
  'rewardId',
  'customerId',
  'restaurantId',
  'rewardName',
  'unlockedAt',
  'status'
];

var REWARD_REDEMPTIONS_HEADERS = [
  'redemptionId',
  'customerId',
  'restaurantId',
  'rewardName',
  'redeemedAt',
  'verifiedBy',
  'status'
];

var AUTHORITATIVE_CATALOG = [
  {
    "id": "biryani-chicken",
    "name": "Chicken Biryani",
    "category": "Biryani",
    "subCategory": "Hyderabadi Dum",
    "price": 180,
    "secondaryPrice": 120,
    "description": "Aromatic long-grain basmati rice cooked on dum with tender marinated chicken pieces, rich Indian spices, served with raita and salan.",
    "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": true
  },
  {
    "id": "starter-chicken-65",
    "name": "Chicken 65",
    "category": "Chicken",
    "subCategory": "Dry Appetizer",
    "price": 160,
    "secondaryPrice": 100,
    "description": "Crispy deep-fried chicken tossed with spicy red chilli paste, mustard seeds, curry leaves, and green chillies.",
    "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": true
  },
  {
    "id": "chicken-angara",
    "name": "Chicken Angara",
    "category": "Chicken",
    "subCategory": "Gravy",
    "price": 150,
    "secondaryPrice": null,
    "description": "Smoky, fiery, slow-cooked chicken gravy infused with charcoal aroma, crushed spices, and rich tomato-onion paste.",
    "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": true
  },
  {
    "id": "chinese-chicken-fried-rice",
    "name": "Chicken Fried Rice",
    "category": "Fried Rice",
    "subCategory": "Wok Fried",
    "price": 140,
    "secondaryPrice": 90,
    "description": "Wok-tossed fragrant basmati rice with shredded juicy chicken, eggs, diced carrots, beans, spring onion, and oriental sauces.",
    "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": true
  },
  {
    "id": "paneer-tikka-masala",
    "name": "Paneer Tikka Masala",
    "category": "Paneer",
    "subCategory": "North Indian Gravy",
    "price": 180,
    "secondaryPrice": null,
    "description": "Clay-oven roasted cottage cheese cubes bathed in a creamy, velvety spiced tomato and cashew nut gravy.",
    "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": true
  },
  {
    "id": "prawn-masala",
    "name": "Prawn Masala",
    "category": "Prawn",
    "subCategory": "Seafood Special",
    "price": 220,
    "secondaryPrice": null,
    "description": "Succulent coastal fresh prawns cooked in a pungent blend of roasted spices, ginger-garlic, curry leaves, and thick onion masala.",
    "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": true
  },
  {
    "id": "soup-veg-manchow",
    "name": "Veg Manchow Soup",
    "category": "Soup",
    "subCategory": "",
    "price": 80,
    "secondaryPrice": null,
    "description": "Zesty Indo-Chinese thick soup with minced garden vegetables, garlic, coriander, topped with crunchy fried noodles.",
    "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "soup-chicken-manchow",
    "name": "Chicken Manchow Soup",
    "category": "Soup",
    "subCategory": "",
    "price": 110,
    "secondaryPrice": null,
    "description": "Hearty spicy broth loaded with chicken shreds, egg drop, soy garlic, and crunchy noodles.",
    "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "soup-sweet-corn-veg",
    "name": "Sweet Corn Veg Soup",
    "category": "Soup",
    "subCategory": "",
    "price": 80,
    "secondaryPrice": null,
    "description": "Velvety mild soup loaded with sweet American corn kernels, carrots, and spring cabbage.",
    "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "soup-hot-sour-chicken",
    "name": "Chicken Hot & Sour Soup",
    "category": "Soup",
    "subCategory": "",
    "price": 110,
    "secondaryPrice": null,
    "description": "Classic tangy and spicy broth loaded with chicken ribbons, mushrooms, bamboo shoots, and vinegar pepper.",
    "image": "https://images.unsplash.com/photo-1607528971899-2e89e6c0ec69?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "salad-green",
    "name": "Fresh Green Salad",
    "category": "Salad",
    "subCategory": "",
    "price": 50,
    "secondaryPrice": null,
    "description": "Farm-fresh garden slices of cucumber, juicy tomatoes, red onions, radish, lemon wedge, and green chilli.",
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "salad-onion",
    "name": "Laccha Onion Salad",
    "category": "Salad",
    "subCategory": "",
    "price": 40,
    "secondaryPrice": null,
    "description": "Crisp thin onion rings dusted with chat masala, fresh chopped coriander, and freshly squeezed lemon juice.",
    "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "papad-masala",
    "name": "Masala Papad",
    "category": "Papad",
    "subCategory": "",
    "price": 40,
    "secondaryPrice": null,
    "description": "Crispy roasted lentil papad topped with spicy onion-tomato salsa, green chillies, chaat masala, and fresh coriander.",
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "papad-roasted",
    "name": "Roasted Papad",
    "category": "Papad",
    "subCategory": "",
    "price": 20,
    "secondaryPrice": null,
    "description": "Traditional crisp lentil cracker gently fire-roasted on open flame.",
    "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "pakoda-chicken",
    "name": "Chicken Pakoda",
    "category": "Pakoda",
    "subCategory": "",
    "price": 150,
    "secondaryPrice": 90,
    "description": "Juicy spiced chicken nuggets dipped in seasoned gram flour batter, deep fried till golden crunch, served with mint chutney.",
    "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "pakoda-paneer",
    "name": "Paneer Pakoda",
    "category": "Pakoda",
    "subCategory": "",
    "price": 120,
    "secondaryPrice": null,
    "description": "Tender cottage cheese stuffed with tangy mint chutney, batter-fried crisp.",
    "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "pakoda-onion",
    "name": "Onion Pakoda",
    "category": "Pakoda",
    "subCategory": "",
    "price": 70,
    "secondaryPrice": null,
    "description": "Classic Odia evening snack of shredded red onions fried with carom seeds and green chillies.",
    "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "roll-chicken-egg",
    "name": "Chicken Egg Roll",
    "category": "Roll",
    "subCategory": "",
    "price": 90,
    "secondaryPrice": null,
    "description": "Flaky paratha layered with beaten egg, stuffed with spiced sautéed chicken, crunchy sliced onions, and tangy house sauce.",
    "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "roll-double-egg",
    "name": "Double Egg Roll",
    "category": "Roll",
    "subCategory": "",
    "price": 60,
    "secondaryPrice": null,
    "description": "Golden crisped paratha lined with two seasoned eggs, layered with pickled onion rings and chilli sauce.",
    "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "roll-paneer",
    "name": "Paneer Roll",
    "category": "Roll",
    "subCategory": "",
    "price": 75,
    "secondaryPrice": null,
    "description": "Soft paratha rolled with tawa paneer chunks, crisp bell peppers, and spiced mint mayonnaise.",
    "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "noodles-veg-hakka",
    "name": "Veg Hakka Noodles",
    "category": "Noodles",
    "subCategory": "",
    "price": 90,
    "secondaryPrice": 60,
    "description": "Slender Chinese noodles tossed in smoking wok with julienned cabbage, capsicum, carrots, and light soy sauce.",
    "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "noodles-chicken-hakka",
    "name": "Chicken Hakka Noodles",
    "category": "Noodles",
    "subCategory": "",
    "price": 130,
    "secondaryPrice": 85,
    "description": "Stir-fried noodles with chicken ribbons, scrambled eggs, shredded vegetables, and dark soy pepper sauce.",
    "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "noodles-chicken-schezwan",
    "name": "Schezwan Chicken Noodles",
    "category": "Noodles",
    "subCategory": "",
    "price": 140,
    "secondaryPrice": null,
    "description": "Fiery noodles tossed in homemade spicy Schezwan chilli pepper sauce with chicken and crisp vegetables.",
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "rice-veg-fried",
    "name": "Veg Fried Rice",
    "category": "Fried Rice",
    "subCategory": "",
    "price": 100,
    "secondaryPrice": 70,
    "description": "Wok tossed fragrant rice loaded with finely diced carrots, French beans, and aromatic spring onions.",
    "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "rice-egg-fried",
    "name": "Egg Fried Rice",
    "category": "Fried Rice",
    "subCategory": "",
    "price": 110,
    "secondaryPrice": 80,
    "description": "Fluffy long grain rice wok-tossed with fluffy scrambled eggs, pepper, and fresh scallions.",
    "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "rice-mixed-special",
    "name": "Mirch Masala Special Mixed Fried Rice",
    "category": "Fried Rice",
    "subCategory": "",
    "price": 180,
    "secondaryPrice": null,
    "description": "Chef signature combination fried rice loaded with chicken, tender prawns, egg drops, and seasonal vegetables.",
    "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "veg-mix-vegetable",
    "name": "Mix Vegetable Curry",
    "category": "Vegetable",
    "subCategory": "",
    "price": 120,
    "secondaryPrice": null,
    "description": "Garden fresh seasonal vegetables, green peas, carrots, cauliflower tossed in homestyle onion-tomato gravy.",
    "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "veg-kolhapuri",
    "name": "Veg Kolhapuri",
    "category": "Vegetable",
    "subCategory": "",
    "price": 130,
    "secondaryPrice": null,
    "description": "Spicy Maharastrian style mixed vegetable preparation in thick fiery red coconut and dried chilli gravy.",
    "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "veg-aloo-dum",
    "name": "Kashmiri Aloo Dum",
    "category": "Vegetable",
    "subCategory": "",
    "price": 110,
    "secondaryPrice": null,
    "description": "Baby potatoes slow simmered in rich yoghurt and fennel-scented gravy.",
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "mushroom-masala",
    "name": "Mushroom Masala",
    "category": "Mushroom",
    "subCategory": "",
    "price": 150,
    "secondaryPrice": null,
    "description": "Fresh button mushrooms simmered in a spiced onion, tomato, and cashew nut brown curry.",
    "image": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "mushroom-chilli",
    "name": "Mushroom Chilli",
    "category": "Mushroom",
    "subCategory": "",
    "price": 140,
    "secondaryPrice": null,
    "description": "Batter coated fried mushrooms tossed with crisp capsicum, onion dice, and tangy green chilli soy sauce.",
    "image": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "mushroom-kadai",
    "name": "Kadai Mushroom",
    "category": "Mushroom",
    "subCategory": "",
    "price": 160,
    "secondaryPrice": null,
    "description": "Plump button mushrooms cooked with crushed coriander seeds, bell peppers, and fragrant kadai masala.",
    "image": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "paneer-butter-masala",
    "name": "Paneer Butter Masala",
    "category": "Paneer",
    "subCategory": "",
    "price": 170,
    "secondaryPrice": null,
    "description": "Melt-in-mouth cottage cheese cubes simmered in butter-rich silk tomato gravy with fenugreek leaves.",
    "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "paneer-kadai",
    "name": "Kadai Paneer",
    "category": "Paneer",
    "subCategory": "",
    "price": 160,
    "secondaryPrice": null,
    "description": "Paneer cubes and crunchy bell peppers tossed in thick rustic gravy cooked in traditional iron wok.",
    "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "paneer-chilli",
    "name": "Chilli Paneer (Dry/Gravy)",
    "category": "Paneer",
    "subCategory": "",
    "price": 150,
    "secondaryPrice": null,
    "description": "Crispy fried paneer cubes tossed with red and green chillies, spring onions, garlic, and soya sauce.",
    "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "chicken-butter-masala",
    "name": "Chicken Butter Masala",
    "category": "Chicken",
    "subCategory": "",
    "price": 190,
    "secondaryPrice": 130,
    "description": "Tender chicken pieces cooked in a silky, creamy butter and tomato reduction with aromatic kasuri methi.",
    "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "chicken-kadai",
    "name": "Kadai Chicken",
    "category": "Chicken",
    "subCategory": "",
    "price": 170,
    "secondaryPrice": 110,
    "description": "Chicken pieces braised with roasted coriander seeds, red dry chillies, and bell peppers in a semi-dry gravy.",
    "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "chicken-chilli",
    "name": "Chilli Chicken Dry",
    "category": "Chicken",
    "subCategory": "",
    "price": 160,
    "secondaryPrice": 100,
    "description": "All-time favorite crispy fried chicken tossed in hot wok with green chillies, ginger, and soy sauce.",
    "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "chicken-hyderabadi",
    "name": "Chicken Hyderabadi",
    "category": "Chicken",
    "subCategory": "",
    "price": 170,
    "secondaryPrice": null,
    "description": "Rich green masala chicken simmered with mint, coriander, yoghurt, and green chillies.",
    "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "mutton-kassa",
    "name": "Odia Mutton Kassa",
    "category": "Mutton",
    "subCategory": "",
    "price": 260,
    "secondaryPrice": 180,
    "description": "Slow roasted tender country mutton cooked in deep rich caramelized onion and garlic masala, typical Gunupur style.",
    "image": "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "mutton-curry",
    "name": "Desi Mutton Curry with Aloo",
    "category": "Mutton",
    "subCategory": "",
    "price": 240,
    "secondaryPrice": 160,
    "description": "Homestyle flavorful goat meat curry with fried potato halves in thin, aromatic spiced broth.",
    "image": "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "mutton-rogan-josh",
    "name": "Mutton Rogan Josh",
    "category": "Mutton",
    "subCategory": "",
    "price": 280,
    "secondaryPrice": null,
    "description": "Kashmiri delicacy of tender mutton stewed with Kashmiri deggi mirch, cinnamon, and whole aromatic spices.",
    "image": "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": false,
    "isPopular": false
  },
  {
    "id": "prawn-chilli",
    "name": "Chilli Prawn",
    "category": "Prawn",
    "subCategory": "",
    "price": 230,
    "secondaryPrice": null,
    "description": "Crispy batter fried prawns tossed with capsicum, garlic, green chillies, and Indo-Chinese sauces.",
    "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "prawn-malai-curry",
    "name": "Prawn Malai Curry",
    "category": "Prawn",
    "subCategory": "",
    "price": 240,
    "secondaryPrice": null,
    "description": "Fresh freshwater prawns cooked gently in rich coconut milk, cardamom, and mild spices.",
    "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "fish-curry-odia",
    "name": "Odia Fish Besara (Mustard Curry)",
    "category": "Fish",
    "subCategory": "",
    "price": 140,
    "secondaryPrice": null,
    "description": "Traditional Rohu fish simmered in authentic pungent ground mustard paste, raw tomato, and dry mango ambula.",
    "image": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "fish-fry-crispy",
    "name": "Crispy Rohu Fish Fry (2 Pcs)",
    "category": "Fish",
    "subCategory": "",
    "price": 130,
    "secondaryPrice": null,
    "description": "Fresh river fish steaks marinated with turmeric, red chilli, ginger paste, and pan fried to golden crisp.",
    "image": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "fish-chilli",
    "name": "Chilli Fish",
    "category": "Fish",
    "subCategory": "",
    "price": 160,
    "secondaryPrice": null,
    "description": "Boneless fish fillets batter fried and tossed with Chinese seasonings and bell peppers.",
    "image": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": false,
    "isPopular": false
  },
  {
    "id": "egg-curry",
    "name": "Egg Curry (2 Eggs)",
    "category": "Egg",
    "subCategory": "",
    "price": 90,
    "secondaryPrice": null,
    "description": "Fried boiled eggs simmered in homestyle onion-tomato gravy with warm spices.",
    "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "egg-tadka",
    "name": "Egg Dal Tadka",
    "category": "Egg",
    "subCategory": "",
    "price": 100,
    "secondaryPrice": null,
    "description": "Yellow lentils cooked with scrambled eggs, butter, roasted cumin, and garlic tadka.",
    "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "egg-bhurji",
    "name": "Masala Egg Bhurji (2 Eggs)",
    "category": "Egg",
    "subCategory": "",
    "price": 60,
    "secondaryPrice": null,
    "description": "Scrambled eggs spiced with onions, green chillies, tomatoes, and chopped coriander.",
    "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "tandoori-chicken",
    "name": "Tandoori Chicken",
    "category": "Tandoori",
    "subCategory": "",
    "price": 360,
    "secondaryPrice": 190,
    "description": "Chicken steeped in hung curd, Kashmiri deggi mirch, ginger-garlic, roasted to perfection in charcoal tandoor.",
    "image": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "tandoori-chicken-tikka",
    "name": "Chicken Tikka (6 Pcs)",
    "category": "Tandoori",
    "subCategory": "",
    "price": 180,
    "secondaryPrice": null,
    "description": "Smoky skewered boneless chicken chunks charred in clay oven, sprinkled with lemon and chaat masala.",
    "image": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "tandoori-butter-naan",
    "name": "Butter Naan",
    "category": "Tandoori",
    "subCategory": "",
    "price": 35,
    "secondaryPrice": null,
    "description": "Traditional refined flour flatbread baked in clay tandoor, brushed generously with fresh butter.",
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "tandoori-roti",
    "name": "Tandoori Roti (Plain/Butter)",
    "category": "Tandoori",
    "subCategory": "",
    "price": 15,
    "secondaryPrice": 20,
    "description": "Whole wheat round bread baked fresh on the inner walls of the tandoor.",
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "biryani-mutton",
    "name": "Mutton Dum Biryani",
    "category": "Biryani",
    "subCategory": "",
    "price": 240,
    "secondaryPrice": 160,
    "description": "Succulent pieces of spiced mutton layered with fragrant saffron basmati rice, caramelised onions, cooked on slow dum.",
    "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "biryani-veg",
    "name": "Veg Dum Biryani",
    "category": "Biryani",
    "subCategory": "",
    "price": 130,
    "secondaryPrice": 90,
    "description": "Fragrant basmati rice cooked with fresh seasonal vegetables, paneer chunks, whole spices, and saffron.",
    "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "biryani-egg",
    "name": "Egg Biryani",
    "category": "Biryani",
    "subCategory": "",
    "price": 130,
    "secondaryPrice": 90,
    "description": "Golden shallow-fried eggs resting in layers of spiced masala biryani rice with caramelized onions and herbs.",
    "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "meal-veg-thali",
    "name": "Special Veg Thali Meal",
    "category": "Meals",
    "subCategory": "",
    "price": 120,
    "secondaryPrice": null,
    "description": "Complete wholesome meal with Steamed Rice, Dal, 2 Sabzi, Papad, Salad, Pickle, and Sweet.",
    "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "meal-chicken-thali",
    "name": "Special Chicken Thali Meal",
    "category": "Meals",
    "subCategory": "",
    "price": 170,
    "secondaryPrice": null,
    "description": "Hearty dinner meal with Steamed Rice, Chicken Kassa (2 pcs), Dal, Veg Curry, Papad, and Salad.",
    "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "meal-fish-thali",
    "name": "Odia Fish Thali Meal",
    "category": "Meals",
    "subCategory": "",
    "price": 150,
    "secondaryPrice": null,
    "description": "Authentic local thali with Steamed Rice, Odia Fish Curry, Dal, Bhaja, Salad, and Papad.",
    "image": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80",
    "isVeg": false,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "drink-fresh-lime-soda",
    "name": "Fresh Lime Soda (Sweet/Salt)",
    "category": "Soft Drinks",
    "subCategory": "",
    "price": 45,
    "secondaryPrice": null,
    "description": "Refreshing thirst quencher prepared with freshly squeezed limes, chilled soda, mint, and black salt.",
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "drink-sweet-lassi",
    "name": "Special Sweet Lassi",
    "category": "Soft Drinks",
    "subCategory": "",
    "price": 60,
    "secondaryPrice": null,
    "description": "Thick, creamy churned sweet curd topped with cardamom essence and chopped dry fruits.",
    "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "drink-cold-drinks",
    "name": "Cold Drink Bottle / Can (300ml)",
    "category": "Soft Drinks",
    "subCategory": "",
    "price": 40,
    "secondaryPrice": null,
    "description": "Chilled carbonated soft drinks: Thums Up, Sprite, Coca Cola, or Limca (served chilled).",
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  },
  {
    "id": "drink-mineral-water",
    "name": "Packaged Drinking Water (1 Litre)",
    "category": "Soft Drinks",
    "subCategory": "",
    "price": 20,
    "secondaryPrice": null,
    "description": "Chilled pure packaged drinking water bottle.",
    "image": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80",
    "isVeg": true,
    "isAvailable": true,
    "isPopular": false
  }
];

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action ? String(params.action).toLowerCase() : 'menu';
  return handleRequest(action, params, 'GET');
}

function doPost(e) {
  var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).toLowerCase() : '';
  var body = {};
  if (e && e.postData && e.postData.contents) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch(err) {
      body = {};
    }
  }
  // Merge parameters
  if (e && e.parameter) {
    for (var k in e.parameter) {
      if (body[k] === undefined) body[k] = e.parameter[k];
    }
  }
  if (!action && body.action) {
    action = String(body.action).toLowerCase();
  }
  return handleRequest(action, body, 'POST');
}

function handleRequest(action, params, method) {
  try {
    var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error('Spreadsheet not found. If this script is standalone, please set SPREADSHEET_ID in Code.gs.');
    }
    
    // Existing actions
    if (action === 'restaurant') {
      var restaurant = getRestaurantData(ss);
      return createJsonResponse({
        success: true,
        restaurant: restaurant
      });
    } else if (action === 'all') {
      var fullMenu = getMenuData(ss);
      var fullRestaurant = getRestaurantData(ss);
      return createJsonResponse({
        success: true,
        menu: fullMenu,
        restaurant: fullRestaurant,
        meta: {
          totalItems: fullMenu.length,
          itemsWithImages: fullMenu.filter(function(i) { return !!i.image; }).length
        }
      });
    } else if (action === 'health') {
      return createJsonResponse({
        success: true,
        message: 'The New Mirch Masala API is running (Loyalty & Menu Active)',
        timestamp: new Date().toISOString()
      });
    } else if (action === 'restore' || action === 'seed' || action === 'repair') {
      var repairResult = ensureCompleteMenu(ss, true);
      return createJsonResponse({
        success: true,
        message: 'Self-healing restoration complete.',
        details: repairResult
      });
    } else if (action === 'loyaltyconfig') {
      return createJsonResponse({
        success: true,
        config: LOYALTY_CONFIG
      });
    } 
    
    // Phase 4 Loyalty Actions: registerCustomer, verifyVisit, getCustomerLoyalty
    else if (
      action === 'customer' ||
      action === 'loyalty' ||
      action === 'getcustomerloyalty' ||
      action === 'getloyalty'
    ) {
      return getLoyaltyStatusResponse(ss, params);
    } else if (action === 'customervisits') {
      return getCustomerVisitsResponse(ss, params);
    } else if (action === 'searchcustomer') {
      return searchCustomerForStaffResponse(ss, params);
    } else if (action === 'registercustomer' || action === 'register') {
      return registerCustomerResponse(ss, params);
    } else if (action === 'verifyvisit' || action === 'verify') {
      return verifyVisitResponse(ss, params);
    } else if (action === 'redeemreward' || action === 'redeem') {
      return redeemRewardResponse(ss, params);
    } else {
      // Default: 'menu' action -> checks and auto-restores menu if needed, then returns it
      var menu = getMenuData(ss);
      var withImages = 0;
      for (var m = 0; m < menu.length; m++) {
        if (menu[m].image) withImages++;
      }
      return createJsonResponse({
        success: true,
        menu: menu,
        meta: {
          totalItems: menu.length,
          itemsWithImages: withImages
        }
      });
    }
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * AUTOMATIC SELF-HEALING MENU ENGINE
 * Compares sheet rows with AUTHORITATIVE_CATALOG (64 items).
 * Appends missing items, restores missing images, cleans up test records,
 * and preserves valid owner modifications.
 */
function ensureCompleteMenu(ss, forceFullSync) {
  var sheet = ss.getSheetByName(MENU_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(MENU_SHEET_NAME);
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // 1. If sheet is empty or only has headers, populate all 64 items immediately
  if (!values || values.length <= 1) {
    return seedFullMenu(sheet);
  }

  var headers = values[0];
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    var hName = String(headers[c]).trim().toLowerCase();
    if (hName) colMap[hName] = c;
  }

  // Verify critical column positions; if headers are invalid, rebuild header row
  if (colMap['id'] === undefined || colMap['name'] === undefined) {
    return seedFullMenu(sheet);
  }

  var idCol = colMap['id'];
  var nameCol = colMap['name'];
  var imageCol = colMap['image'] !== undefined ? colMap['image'] : -1;
  var descCol = colMap['description'] !== undefined ? colMap['description'] : -1;
  var catCol = colMap['category'] !== undefined ? colMap['category'] : -1;

  // Build existing index
  var existingIds = {};
  var rowsToKeep = [values[0]]; // keep headers
  var updatedCells = 0;
  var removedTestRows = 0;

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var rawId = String(row[idCol] || '').trim();
    var rawName = String(row[nameCol] || '').trim();

    if (!rawName) continue; // skip blank rows

    // Identify temporary Phase 3 test records that don't belong in production catalog
    if (rawId === 'soup-01' || rawId === 'soup-02' || (rawId === 'biryani-01' && rawName.toLowerCase() === 'chicken biryani')) {
      removedTestRows++;
      continue; // exclude temporary test rows; the authentic biryani-chicken will be added
    }

    // Prevent duplicates in sheet
    if (existingIds[rawId]) {
      continue;
    }

    // Check if an existing item has empty image, and restore authentic image from catalog
    var authMatch = findAuthoritativeItem(rawId, rawName);
    if (authMatch) {
      if (imageCol >= 0 && (!row[imageCol] || String(row[imageCol]).trim() === '')) {
        row[imageCol] = authMatch.image;
        updatedCells++;
      }
      if (descCol >= 0 && (!row[descCol] || String(row[descCol]).trim() === '')) {
        row[descCol] = authMatch.description;
        updatedCells++;
      }
      if (catCol >= 0 && (!row[catCol] || String(row[catCol]).trim() === '')) {
        row[catCol] = authMatch.category;
        updatedCells++;
      }
    }

    existingIds[rawId] = true;
    rowsToKeep.push(row);
  }

  // 2. Identify missing items from AUTHORITATIVE_CATALOG (64 items)
  var missingItems = [];
  for (var i = 0; i < AUTHORITATIVE_CATALOG.length; i++) {
    var item = AUTHORITATIVE_CATALOG[i];
    if (!existingIds[item.id]) {
      missingItems.push(item);
    }
  }

  // If no items are missing and no test rows were removed and no cells updated, sheet is already complete
  if (missingItems.length === 0 && removedTestRows === 0 && updatedCells === 0 && !forceFullSync) {
    return { status: 'already_healthy', totalItems: rowsToKeep.length - 1 };
  }

  // Append missing items to rowsToKeep
  for (var m = 0; m < missingItems.length; m++) {
    var it = missingItems[m];
    var newRow = new Array(headers.length);
    for (var colIdx = 0; colIdx < headers.length; colIdx++) {
      newRow[colIdx] = '';
    }
    setRowVal(newRow, colMap, ['id'], it.id);
    setRowVal(newRow, colMap, ['name', 'dishname', 'itemname'], it.name);
    setRowVal(newRow, colMap, ['category'], it.category);
    setRowVal(newRow, colMap, ['subcategory', 'sub_category'], it.subCategory);
    setRowVal(newRow, colMap, ['price'], it.price);
    setRowVal(newRow, colMap, ['secondaryprice', 'secondary_price', 'halfprice'], it.secondaryPrice !== null ? it.secondaryPrice : '');
    setRowVal(newRow, colMap, ['description', 'desc'], it.description);
    setRowVal(newRow, colMap, ['image', 'imageurl', 'img'], it.image);
    setRowVal(newRow, colMap, ['isveg', 'veg'], it.isVeg ? 'TRUE' : 'FALSE');
    setRowVal(newRow, colMap, ['isavailable', 'available'], it.isAvailable ? 'TRUE' : 'FALSE');
    setRowVal(newRow, colMap, ['ispopular', 'popular'], it.isPopular ? 'TRUE' : 'FALSE');

    rowsToKeep.push(newRow);
  }

  // Write repaired dataset back to sheet
  sheet.clear();
  sheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#FFF7ED');

  Logger.log('Self-healing complete: Added ' + missingItems.length + ' missing items. Total items: ' + (rowsToKeep.length - 1));

  return {
    status: 'repaired',
    addedCount: missingItems.length,
    removedTestCount: removedTestRows,
    updatedCells: updatedCells,
    totalItems: rowsToKeep.length - 1
  };
}

function findAuthoritativeItem(id, name) {
  var idLower = String(id || '').toLowerCase();
  var nameLower = String(name || '').toLowerCase();
  for (var i = 0; i < AUTHORITATIVE_CATALOG.length; i++) {
    var a = AUTHORITATIVE_CATALOG[i];
    if (a.id.toLowerCase() === idLower || a.name.toLowerCase() === nameLower) {
      return a;
    }
  }
  return null;
}

function setRowVal(row, colMap, possibleKeys, value) {
  for (var i = 0; i < possibleKeys.length; i++) {
    var k = possibleKeys[i].toLowerCase();
    if (colMap.hasOwnProperty(k)) {
      row[colMap[k]] = value;
      return;
    }
  }
}

function seedFullMenu(sheet) {
  var outputRows = [HEADERS];
  for (var i = 0; i < AUTHORITATIVE_CATALOG.length; i++) {
    var it = AUTHORITATIVE_CATALOG[i];
    outputRows.push([
      it.id,
      it.name,
      it.category,
      it.subCategory || '',
      it.price,
      it.secondaryPrice !== null && it.secondaryPrice !== undefined ? it.secondaryPrice : '',
      it.description,
      it.image,
      it.isVeg ? 'TRUE' : 'FALSE',
      it.isAvailable ? 'TRUE' : 'FALSE',
      it.isPopular ? 'TRUE' : 'FALSE'
    ]);
  }

  sheet.clear();
  sheet.getRange(1, 1, outputRows.length, HEADERS.length).setValues(outputRows);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#FFF7ED');

  return {
    status: 'seeded',
    totalItems: AUTHORITATIVE_CATALOG.length
  };
}

/**
 * Reads menu rows from Google Sheet
 */
function getMenuData(ss) {
  // Always verify and self-heal menu data if catalog is incomplete
  ensureCompleteMenu(ss, false);

  var sheet = ss.getSheetByName(MENU_SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    return [];
  }

  var headers = values[0];
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    var headerName = String(headers[c]).trim();
    if (headerName) {
      colMap[headerName] = c;
      colMap[headerName.toLowerCase()] = c;
    }
  }

  var menu = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var name = getCell(row, colMap, ['name', 'dishname', 'itemname']);
    if (!name) continue;

    var id = getCell(row, colMap, ['id']) || ('item-' + r);
    var category = getCell(row, colMap, ['category']) || 'Special';
    var subCategory = getCell(row, colMap, ['subcategory', 'sub_category']);
    var description = getCell(row, colMap, ['description', 'desc']) || '';
    var image = getCell(row, colMap, ['image', 'imageurl', 'img']) || '';
    
    var rawPrice = getCell(row, colMap, ['price']);
    var price = parsePrice(rawPrice);
    if (price === null) price = 0;

    var rawSecondary = getCell(row, colMap, ['secondaryprice', 'secondary_price', 'halfprice']);
    var secondaryPrice = parsePrice(rawSecondary);
    if (secondaryPrice === '' || secondaryPrice === null || isNaN(secondaryPrice)) {
      secondaryPrice = null;
    }

    var isVeg = parseBoolean(getCell(row, colMap, ['isveg', 'veg']));
    var rawAvailable = getCell(row, colMap, ['isavailable', 'available']);
    var isAvailable = (rawAvailable === '' || rawAvailable === undefined || rawAvailable === null) 
      ? true 
      : parseBoolean(rawAvailable);
    var isPopular = parseBoolean(getCell(row, colMap, ['ispopular', 'popular']));

    menu.push({
      id: String(id),
      name: String(name).trim(),
      category: String(category).trim(),
      subCategory: subCategory ? String(subCategory).trim() : undefined,
      price: price,
      secondaryPrice: secondaryPrice,
      description: String(description).trim(),
      image: String(image).trim(),
      isVeg: isVeg,
      isAvailable: isAvailable,
      isPopular: isPopular
    });
  }

  return menu;
}

function getRestaurantData(ss) {
  var sheet = ss.getSheetByName(RESTAURANT_SHEET_NAME);
  if (!sheet) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().toLowerCase() === RESTAURANT_SHEET_NAME.toLowerCase()) {
        sheet = sheets[i];
        break;
      }
    }
  }
  if (!sheet) {
    return {
      restaurantId: 'mirch-masala-01',
      name: 'The New Mirch Masala',
      subtitle: 'Indian • Chinese • Biryani • Tandoori',
      location: 'Gunupur, Odisha',
      fullAddress: 'Main Road, Near College Square, Gunupur, Rayagada, Odisha 765022',
      phone: '+91 94370 12345',
      openingTime: '11:00 AM',
      closingTime: '10:30 PM',
      timings: '11:00 AM – 10:30 PM',
      googleReviewUrl: '',
      logo: '',
      statusText: 'OPEN NOW',
      isOpen: true
    };
  }

  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    return {
      name: 'The New Mirch Masala',
      subtitle: 'Indian • Chinese • Biryani • Tandoori',
      location: 'Gunupur, Odisha',
      phone: '+91 94370 12345',
      timings: '11:00 AM – 10:30 PM',
      isOpen: true
    };
  }

  var headers = values[0];
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    var headerName = String(headers[c]).trim();
    if (headerName) {
      colMap[headerName] = c;
      colMap[headerName.toLowerCase()] = c;
    }
  }

  var row = values[1];
  var restaurantId = getCell(row, colMap, ['restaurantid', 'id']) || 'mirch-masala-01';
  var name = getCell(row, colMap, ['restaurantname', 'name']) || 'The New Mirch Masala';
  var tagline = getCell(row, colMap, ['tagline', 'subtitle', 'cuisine']) || 'Indian • Chinese • Biryani • Tandoori';
  var location = getCell(row, colMap, ['location', 'city', 'address']) || 'Gunupur, Odisha';
  var phone = getCell(row, colMap, ['phone', 'contact']) || '+91 94370 12345';
  var openingTime = getCell(row, colMap, ['openingtime', 'open_time']) || '11:00 AM';
  var closingTime = getCell(row, colMap, ['closingtime', 'close_time']) || '10:30 PM';
  var googleReviewUrl = getCell(row, colMap, ['googlereviewurl', 'review_url', 'reviewurl']) || '';
  var logo = getCell(row, colMap, ['logo', 'logourl', 'image']) || '';

  var timings = (openingTime && closingTime) ? (openingTime + ' – ' + closingTime) : (openingTime || '11:00 AM – 10:30 PM');

  return {
    restaurantId: String(restaurantId),
    name: String(name),
    subtitle: String(tagline),
    location: String(location),
    phone: String(phone),
    openingTime: String(openingTime),
    closingTime: String(closingTime),
    timings: String(timings),
    googleReviewUrl: String(googleReviewUrl),
    logo: String(logo),
    statusText: 'OPEN NOW',
    isOpen: true
  };
}

function getCell(row, colMap, possibleKeys) {
  for (var i = 0; i < possibleKeys.length; i++) {
    var key = possibleKeys[i].toLowerCase();
    if (colMap.hasOwnProperty(key)) {
      var val = row[colMap[key]];
      if (val !== undefined && val !== null) {
        return val;
      }
    }
  }
  return '';
}

function parseBoolean(val) {
  if (val === true || val === false) return val;
  if (typeof val === 'string') {
    var clean = val.trim().toLowerCase();
    if (clean === 'true' || clean === 'yes' || clean === '1' || clean === 'y') return true;
    if (clean === 'false' || clean === 'no' || clean === '0' || clean === 'n') return false;
  }
  if (typeof val === 'number') return val === 1;
  return false;
}

function parsePrice(val) {
  if (val === '' || val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  var str = String(val).replace(/[^0-9.]/g, '').trim();
  if (!str) return null;
  var num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Manual one-click restore trigger (callable from Apps Script editor)
 */
function restoreCompleteMenu() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var result = ensureCompleteMenu(ss, true);
  Logger.log('restoreCompleteMenu finished: ' + JSON.stringify(result));
  return result.totalItems || AUTHORITATIVE_CATALOG.length;
}

/**
 * Safe initializer alias
 */
function initializeRestaurantData() {
  return restoreCompleteMenu();
}

/**
 * ============================================================================
 * PHASE 4 — CUSTOMER LOYALTY & VERIFIED VISITS ENGINE
 * ============================================================================
 */

function getOrCreateSheet(ss, sheetName, defaultHeaders) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    var allSheets = ss.getSheets();
    for (var i = 0; i < allSheets.length; i++) {
      if (allSheets[i].getName().toLowerCase() === sheetName.toLowerCase()) {
        sheet = allSheets[i];
        break;
      }
    }
  }
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  if (!values || values.length === 0 || !values[0] || values[0].length === 0 || !values[0][0]) {
    sheet.appendRow(defaultHeaders);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight('bold');
  }
  return sheet;
}

function getKolkataDateTime() {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  var timeStr = Utilities.formatDate(now, 'Asia/Kolkata', 'hh:mm a');
  var fullIso = Utilities.formatDate(now, 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ssXXX");
  return {
    dateStr: dateStr,
    timeStr: timeStr,
    fullIso: fullIso
  };
}

/**
 * Normalizes any spreadsheet date cell (Date object or string) into yyyy-MM-dd in Asia/Kolkata
 */
function formatSheetDate(cellValue) {
  if (!cellValue) return '';
  if (cellValue instanceof Date) {
    return Utilities.formatDate(cellValue, 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  var str = String(cellValue).trim();
  if (str.length >= 10 && str.charAt(4) === '-' && str.charAt(7) === '-') {
    return str.substring(0, 10);
  }
  var parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  return str;
}

function normalizePhoneNumber(raw) {
  if (!raw) return '';
  var cleaned = String(raw).replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.indexOf('91') === 0) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.length === 11 && cleaned.indexOf('0') === 0) {
    cleaned = cleaned.substring(1);
  }
  return (cleaned.length === 10) ? cleaned : '';
}

function buildHeaderMap(sheet) {
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var colMap = {};
  if (values && values.length > 0) {
    var headers = values[0];
    for (var c = 0; c < headers.length; c++) {
      var hName = String(headers[c]).trim().toLowerCase();
      if (hName) colMap[hName] = c;
    }
  }
  return {
    colMap: colMap,
    values: values
  };
}

function findCustomerRow(sheet, phone, customerId, restaurantId) {
  var info = buildHeaderMap(sheet);
  var colMap = info.colMap;
  var values = info.values;

  var phoneCol = colMap['phone'];
  var idCol = colMap['customerid'];
  var restCol = colMap['restaurantid'];

  if (!values || values.length <= 1) return null;

  var normPhone = normalizePhoneNumber(phone);

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var rowId = idCol !== undefined ? String(row[idCol]).trim() : '';
    var rowPhone = phoneCol !== undefined ? normalizePhoneNumber(row[phoneCol]) : '';
    var rowRest = restCol !== undefined ? String(row[restCol]).trim() : '';

    var match = false;
    if (customerId && rowId && rowId.toLowerCase() === String(customerId).trim().toLowerCase()) {
      match = true;
    } else if (normPhone && rowPhone && rowPhone === normPhone) {
      if (!restaurantId || !rowRest || rowRest.toLowerCase() === String(restaurantId).trim().toLowerCase()) {
        match = true;
      }
    }

    if (match) {
      return {
        rowIndex: r + 1, // 1-based index for Sheet API
        rowValues: row,
        colMap: colMap,
        customer: {
          customerId: rowId,
          name: colMap['name'] !== undefined ? String(row[colMap['name']]) : '',
          phone: rowPhone,
          restaurantId: rowRest || 'mirch-masala-01',
          createdAt: colMap['createdat'] !== undefined ? String(row[colMap['createdat']]) : '',
          totalVisits: colMap['totalvisits'] !== undefined ? (parseInt(row[colMap['totalvisits']], 10) || 0) : 0,
          availableRewards: colMap['availablerewards'] !== undefined ? (parseInt(row[colMap['availablerewards']], 10) || 0) : 0,
          lastVisitAt: colMap['lastvisitat'] !== undefined ? String(row[colMap['lastvisitat']]) : '',
          status: colMap['status'] !== undefined ? String(row[colMap['status']]) : 'ACTIVE'
        }
      };
    }
  }
  return null;
}

function countRedeemedRewards(ss, customerId) {
  var sheet = getOrCreateSheet(ss, REWARD_REDEMPTIONS_SHEET_NAME, REWARD_REDEMPTIONS_HEADERS);
  var info = buildHeaderMap(sheet);
  var values = info.values;
  var idCol = info.colMap['customerid'];

  var count = 0;
  if (values && values.length > 1 && idCol !== undefined) {
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][idCol]).trim().toLowerCase() === String(customerId).trim().toLowerCase()) {
        count++;
      }
    }
  }
  return count;
}

function getCustomerVisitsList(ss, customerId) {
  var sheet = getOrCreateSheet(ss, VISITS_SHEET_NAME, VISITS_HEADERS);
  var info = buildHeaderMap(sheet);
  var values = info.values;
  var colMap = info.colMap;

  var idCol = colMap['customerid'];
  var dateCol = colMap['visitdate'];
  var timeCol = colMap['visittime'];
  var statusCol = colMap['status'];
  var visitIdCol = colMap['visitid'];
  var verifiedByCol = colMap['verifiedby'];

  var visits = [];
  if (values && values.length > 1 && idCol !== undefined) {
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      if (String(row[idCol]).trim().toLowerCase() === String(customerId).trim().toLowerCase()) {
        var rawDate = dateCol !== undefined ? row[dateCol] : '';
        var vDate = formatSheetDate(rawDate);
        var vTime = timeCol !== undefined ? String(row[timeCol] || '') : '';
        visits.push({
          visitId: visitIdCol !== undefined ? String(row[visitIdCol]) : ('VIS-' + r),
          customerId: customerId,
          visitDate: vDate,
          visitTime: vTime,
          verifiedBy: verifiedByCol !== undefined ? String(row[verifiedByCol]) : 'Staff',
          status: statusCol !== undefined ? String(row[statusCol]) : 'VERIFIED'
        });
      }
    }
  }
  // Sort descending by date
  visits.sort(function(a, b) {
    var da = (a.visitDate || '') + ' ' + (a.visitTime || '');
    var db = (b.visitDate || '') + ' ' + (b.visitTime || '');
    return db.localeCompare(da);
  });
  return visits;
}

function getCustomerRewardsList(ss, customerId) {
  var sheet = getOrCreateSheet(ss, REWARDS_SHEET_NAME, REWARDS_HEADERS);
  var info = buildHeaderMap(sheet);
  var values = info.values;
  var colMap = info.colMap;

  var idCol = colMap['customerid'];
  var rewardIdCol = colMap['rewardid'];
  var nameCol = colMap['rewardname'];
  var unlockedCol = colMap['unlockedat'];
  var statusCol = colMap['status'];

  var rewards = [];
  if (values && values.length > 1 && idCol !== undefined) {
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      if (String(row[idCol]).trim().toLowerCase() === String(customerId).trim().toLowerCase()) {
        rewards.push({
          rewardId: rewardIdCol !== undefined ? String(row[rewardIdCol]) : ('REW-' + r),
          customerId: customerId,
          rewardName: nameCol !== undefined ? String(row[nameCol]) : '₹50 OFF',
          unlockedAt: unlockedCol !== undefined ? String(row[unlockedCol]) : '',
          status: statusCol !== undefined ? String(row[statusCol]) : 'UNCLAIMED'
        });
      }
    }
  }
  return rewards;
}

function computeLoyaltyStatus(customer, visits) {
  var visitsRequired = LOYALTY_CONFIG.visitsRequired || 5;
  var totalVisits = customer.totalVisits || 0;
  
  var progressVisits = totalVisits % visitsRequired;
  var remainingVisits = visitsRequired - progressVisits;
  if (progressVisits === 0 && totalVisits > 0) {
    // Exactly on a milestone
    remainingVisits = 0;
  }

  // Check today's visit status in Kolkata timezone
  var kolkata = getKolkataDateTime();
  var todayDate = kolkata.dateStr;
  var todayStatus = 'NOT_RECORDED';

  if (visits && visits.length > 0) {
    for (var i = 0; i < visits.length; i++) {
      if (visits[i].visitDate === todayDate) {
        if (visits[i].status === 'VERIFIED') {
          todayStatus = 'VERIFIED';
          break;
        } else if (visits[i].status === 'PENDING') {
          todayStatus = 'PENDING';
        }
      }
    }
  }

  var isRewardUnlocked = customer.availableRewards > 0;

  return {
    customer: customer,
    totalVisits: totalVisits,
    visitsRequired: visitsRequired,
    progressVisits: progressVisits,
    remainingVisits: remainingVisits,
    availableRewards: customer.availableRewards || 0,
    isRewardUnlocked: isRewardUnlocked,
    todayVisitStatus: todayStatus,
    lastVisitDateFormatted: customer.lastVisitAt ? customer.lastVisitAt : '',
    config: LOYALTY_CONFIG
  };
}

/**
 * API HANDLER: GET /loyalty or GET /customer or GET/POST /getCustomerLoyalty
 */
function getLoyaltyStatusResponse(ss, params) {
  var sheet = getOrCreateSheet(ss, CUSTOMERS_SHEET_NAME, CUSTOMERS_HEADERS);
  var phone = params.phone || '';
  var customerId = params.customerId || params.customerid || '';
  var restaurantId = params.restaurantId || params.restaurantid || 'mirch-masala-01';

  var found = findCustomerRow(sheet, phone, customerId, restaurantId);
  if (!found) {
    return createJsonResponse({
      success: false,
      error: 'Customer not found. Please join the rewards program.'
    });
  }

  var visits = getCustomerVisitsList(ss, found.customer.customerId);
  var rewards = getCustomerRewardsList(ss, found.customer.customerId);
  var loyalty = computeLoyaltyStatus(found.customer, visits);

  return createJsonResponse({
    success: true,
    customer: found.customer,
    loyalty: loyalty,
    recentVisits: visits.slice(0, 5),
    rewards: rewards
  });
}

/**
 * API HANDLER: GET /customerVisits
 */
function getCustomerVisitsResponse(ss, params) {
  var customerId = params.customerId || params.customerid;
  if (!customerId) {
    return createJsonResponse({ success: false, error: 'customerId is required' });
  }
  var visits = getCustomerVisitsList(ss, customerId);
  return createJsonResponse({
    success: true,
    visits: visits
  });
}

/**
 * API HANDLER: GET /searchCustomer (Staff Verification Search)
 */
function searchCustomerForStaffResponse(ss, params) {
  var sheet = getOrCreateSheet(ss, CUSTOMERS_SHEET_NAME, CUSTOMERS_HEADERS);
  var phone = params.phone || '';
  var customerId = params.customerId || params.customerid || '';
  var restaurantId = params.restaurantId || params.restaurantid || 'mirch-masala-01';

  if (!phone && !customerId) {
    return createJsonResponse({
      success: false,
      error: 'Please enter a mobile number to search.'
    });
  }

  var found = findCustomerRow(sheet, phone, customerId, restaurantId);
  if (!found) {
    return createJsonResponse({
      success: false,
      error: 'No registered customer found with this mobile number.'
    });
  }

  var visits = getCustomerVisitsList(ss, found.customer.customerId);
  var rewards = getCustomerRewardsList(ss, found.customer.customerId);
  var loyalty = computeLoyaltyStatus(found.customer, visits);

  return createJsonResponse({
    success: true,
    customer: found.customer,
    loyalty: loyalty,
    recentVisits: visits.slice(0, 5),
    rewards: rewards
  });
}

/**
 * API HANDLER: POST /registerCustomer
 * Anti-Duplicate: If phone exists, returns existing customer without creating duplicate.
 */
function registerCustomerResponse(ss, params) {
  var name = String(params.name || '').trim();
  var rawPhone = params.phone || '';
  var restaurantId = params.restaurantId || params.restaurantid || 'mirch-masala-01';

  if (!name || name.length < 2) {
    return createJsonResponse({
      success: false,
      error: 'Please enter your name (minimum 2 characters).'
    });
  }

  var phone = normalizePhoneNumber(rawPhone);
  if (!phone) {
    return createJsonResponse({
      success: false,
      error: 'Please enter a valid 10-digit mobile number.'
    });
  }

  var sheet = getOrCreateSheet(ss, CUSTOMERS_SHEET_NAME, CUSTOMERS_HEADERS);
  
  // Check for existing customer
  var existing = findCustomerRow(sheet, phone, null, restaurantId);
  if (existing) {
    var existingVisits = getCustomerVisitsList(ss, existing.customer.customerId);
    var existingLoyalty = computeLoyaltyStatus(existing.customer, existingVisits);
    return createJsonResponse({
      success: true,
      isNew: false,
      message: 'Welcome back! You are already registered.',
      customer: existing.customer,
      loyalty: existingLoyalty
    });
  }

  // Generate unique customer ID (e.g. CUS-A1B2C3D4)
  var randomCode = Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
  var customerId = 'CUS-' + randomCode;

  var kolkata = getKolkataDateTime();
  var newCustomerRow = [
    customerId,
    name,
    phone,
    restaurantId,
    kolkata.fullIso,
    0, // totalVisits
    0, // availableRewards
    '', // lastVisitAt
    'ACTIVE'
  ];

  sheet.appendRow(newCustomerRow);

  var newCustomer = {
    customerId: customerId,
    name: name,
    phone: phone,
    restaurantId: restaurantId,
    createdAt: kolkata.fullIso,
    totalVisits: 0,
    availableRewards: 0,
    lastVisitAt: '',
    status: 'ACTIVE'
  };

  var loyalty = computeLoyaltyStatus(newCustomer, []);

  return createJsonResponse({
    success: true,
    isNew: true,
    message: "You're now part of The New Mirch Masala Rewards.",
    customer: newCustomer,
    loyalty: loyalty
  });
}

/**
 * API HANDLER: POST /verifyVisit
 * Enforces Anti-Fraud Rule: Maximum 1 verified visit per customer per restaurant per day (Asia/Kolkata).
 */
function verifyVisitResponse(ss, params) {
  var customerId = params.customerId || params.customerid;
  var phone = params.phone;
  var restaurantId = params.restaurantId || params.restaurantid || 'mirch-masala-01';
  var verifiedBy = params.verifiedBy || params.verifiedby || 'Staff';

  if (!customerId && !phone) {
    return createJsonResponse({
      success: false,
      error: 'customerId or phone is required'
    });
  }

  var customersSheet = getOrCreateSheet(ss, CUSTOMERS_SHEET_NAME, CUSTOMERS_HEADERS);
  var found = findCustomerRow(customersSheet, phone, customerId, restaurantId);
  if (!found) {
    return createJsonResponse({
      success: false,
      error: 'Customer not found.'
    });
  }

  customerId = found.customer.customerId;

  var kolkata = getKolkataDateTime();
  var todayDate = kolkata.dateStr;
  var currentTime = kolkata.timeStr;

  // Check Visits sheet for today's visit with strict Asia/Kolkata date normalization
  var visitsSheet = getOrCreateSheet(ss, VISITS_SHEET_NAME, VISITS_HEADERS);
  var visitsInfo = buildHeaderMap(visitsSheet);
  var visitsValues = visitsInfo.values;
  var vIdCol = visitsInfo.colMap['customerid'];
  var vDateCol = visitsInfo.colMap['visitdate'];
  var vRestCol = visitsInfo.colMap['restaurantid'];
  var vStatusCol = visitsInfo.colMap['status'];

  if (visitsValues && visitsValues.length > 1 && vIdCol !== undefined && vDateCol !== undefined) {
    for (var r = 1; r < visitsValues.length; r++) {
      var row = visitsValues[r];
      var rowCust = String(row[vIdCol]).trim().toLowerCase();
      var rowDate = formatSheetDate(row[vDateCol]);
      var rowStatus = vStatusCol !== undefined ? String(row[vStatusCol]).trim().toUpperCase() : '';
      var rowRest = vRestCol !== undefined ? String(row[vRestCol]).trim().toLowerCase() : '';

      if (rowCust === String(customerId).trim().toLowerCase() && rowDate === todayDate && rowStatus === 'VERIFIED') {
        if (!restaurantId || !rowRest || rowRest === String(restaurantId).trim().toLowerCase()) {
          return createJsonResponse({
            success: false,
            alreadyVerified: true,
            message: "Today's visit has already been recorded."
          });
        }
      }
    }
  }

  // Create new verified visit
  var visitCode = Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
  var visitId = 'VIS-' + visitCode;

  var newVisitRow = [
    visitId,
    customerId,
    restaurantId,
    todayDate,
    currentTime,
    verifiedBy,
    'VERIFIED'
  ];
  visitsSheet.appendRow(newVisitRow);

  // Update customer's total visits and recalculate rewards
  var newTotalVisits = (found.customer.totalVisits || 0) + 1;
  var visitsRequired = LOYALTY_CONFIG.visitsRequired || 5;

  var redeemedCount = countRedeemedRewards(ss, customerId);
  var totalUnlocked = Math.floor(newTotalVisits / visitsRequired);
  var newAvailableRewards = Math.max(0, totalUnlocked - redeemedCount);

  // Check if a new reward threshold was crossed
  var previousUnlocked = Math.floor((found.customer.totalVisits || 0) / visitsRequired);
  if (totalUnlocked > previousUnlocked) {
    var rewardsSheet = getOrCreateSheet(ss, REWARDS_SHEET_NAME, REWARDS_HEADERS);
    var rewardCode = Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
    var rewardId = 'REW-' + rewardCode;
    rewardsSheet.appendRow([
      rewardId,
      customerId,
      restaurantId,
      LOYALTY_CONFIG.rewardName,
      todayDate + ' ' + currentTime,
      'AVAILABLE'
    ]);
  }

  // Write updated values to customer row
  var colMap = found.colMap;
  var rowIndex = found.rowIndex;
  if (colMap['totalvisits'] !== undefined) {
    customersSheet.getRange(rowIndex, colMap['totalvisits'] + 1).setValue(newTotalVisits);
  }
  if (colMap['availablerewards'] !== undefined) {
    customersSheet.getRange(rowIndex, colMap['availablerewards'] + 1).setValue(newAvailableRewards);
  }
  if (colMap['lastvisitat'] !== undefined) {
    customersSheet.getRange(rowIndex, colMap['lastvisitat'] + 1).setValue(todayDate + ' ' + currentTime);
  }

  // Reload customer and visits for fresh return
  var updatedCustomer = {
    customerId: customerId,
    name: found.customer.name,
    phone: found.customer.phone,
    restaurantId: restaurantId,
    createdAt: found.customer.createdAt,
    totalVisits: newTotalVisits,
    availableRewards: newAvailableRewards,
    lastVisitAt: todayDate + ' ' + currentTime,
    status: 'ACTIVE'
  };

  var allVisits = getCustomerVisitsList(ss, customerId);
  var loyalty = computeLoyaltyStatus(updatedCustomer, allVisits);

  return createJsonResponse({
    success: true,
    message: 'Visit verified successfully!',
    visit: {
      visitId: visitId,
      customerId: customerId,
      visitDate: todayDate,
      visitTime: currentTime,
      verifiedBy: verifiedBy,
      status: 'VERIFIED'
    },
    customer: updatedCustomer,
    loyalty: loyalty,
    recentVisits: allVisits.slice(0, 5)
  });
}

/**
 * API HANDLER: POST /redeemReward
 * Verified by restaurant staff
 */
function redeemRewardResponse(ss, params) {
  var customerId = params.customerId || params.customerid;
  var restaurantId = params.restaurantId || params.restaurantid || 'mirch-masala-01';
  var rewardName = params.rewardName || LOYALTY_CONFIG.rewardName;
  var verifiedBy = params.verifiedBy || 'Staff';

  if (!customerId) {
    return createJsonResponse({ success: false, error: 'customerId is required' });
  }

  var customersSheet = getOrCreateSheet(ss, CUSTOMERS_SHEET_NAME, CUSTOMERS_HEADERS);
  var found = findCustomerRow(customersSheet, null, customerId, restaurantId);
  if (!found) {
    return createJsonResponse({ success: false, error: 'Customer not found.' });
  }

  var currentAvailable = found.customer.availableRewards || 0;
  if (currentAvailable <= 0) {
    return createJsonResponse({
      success: false,
      error: 'No available rewards to redeem.'
    });
  }

  var kolkata = getKolkataDateTime();
  var redemptionCode = Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
  var redemptionId = 'RED-' + redemptionCode;

  var redemptionsSheet = getOrCreateSheet(ss, REWARD_REDEMPTIONS_SHEET_NAME, REWARD_REDEMPTIONS_HEADERS);
  redemptionsSheet.appendRow([
    redemptionId,
    customerId,
    restaurantId,
    rewardName,
    kolkata.fullIso,
    verifiedBy,
    'REDEEMED'
  ]);

  // Update corresponding reward in Rewards sheet to REDEEMED
  var rewardsSheet = getOrCreateSheet(ss, REWARDS_SHEET_NAME, REWARDS_HEADERS);
  var rewardsInfo = buildHeaderMap(rewardsSheet);
  var rValues = rewardsInfo.values;
  var rCustCol = rewardsInfo.colMap['customerid'];
  var rStatusCol = rewardsInfo.colMap['status'];
  if (rValues && rValues.length > 1 && rCustCol !== undefined && rStatusCol !== undefined) {
    for (var rw = 1; rw < rValues.length; rw++) {
      if (
        String(rValues[rw][rCustCol]).trim().toLowerCase() === String(customerId).trim().toLowerCase() &&
        String(rValues[rw][rStatusCol]).trim().toUpperCase() === 'AVAILABLE'
      ) {
        rewardsSheet.getRange(rw + 1, rStatusCol + 1).setValue('REDEEMED');
        break;
      }
    }
  }

  // Decrement customer's available rewards
  var newAvailable = Math.max(0, currentAvailable - 1);
  if (found.colMap['availablerewards'] !== undefined) {
    customersSheet.getRange(found.rowIndex, found.colMap['availablerewards'] + 1).setValue(newAvailable);
  }

  found.customer.availableRewards = newAvailable;
  var visits = getCustomerVisitsList(ss, customerId);
  var rewards = getCustomerRewardsList(ss, customerId);
  var loyalty = computeLoyaltyStatus(found.customer, visits);

  return createJsonResponse({
    success: true,
    message: 'Reward redeemed successfully!',
    redemption: {
      redemptionId: redemptionId,
      customerId: customerId,
      rewardName: rewardName,
      redeemedAt: kolkata.fullIso,
      verifiedBy: verifiedBy
    },
    customer: found.customer,
    loyalty: loyalty,
    rewards: rewards
  });
}

/**
 * ============================================================================
 * DIRECT API EXPORT WRAPPERS
 * Can be invoked via Apps Script API, Google Triggers, or unit tests
 * ============================================================================
 */

function registerCustomer(params) {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  return registerCustomerResponse(ss, params || {});
}

function verifyVisit(params) {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  return verifyVisitResponse(ss, params || {});
}

function getCustomerLoyalty(params) {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  return getLoyaltyStatusResponse(ss, params || {});
}

