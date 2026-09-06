import { MenuItem, RestaurantInfo } from '../types';

export const RESTAURANT_INFO: RestaurantInfo = {
  name: 'The New Mirch Masala',
  subtitle: 'Indian • Chinese • Biryani • Tandoori',
  location: 'Gunupur, Odisha',
  fullAddress: 'Main Road, Near College Square, Gunupur, Rayagada, Odisha 765022',
  statusText: 'OPEN NOW',
  isOpen: true,
  timings: '11:00 AM – 10:30 PM',
  phone: '+91 94370 12345',
};

export const MENU_ITEMS: MenuItem[] = [
  // --- POPULAR SPECIALTIES ---
  {
    id: 'biryani-chicken',
    name: 'Chicken Biryani',
    category: 'Biryani',
    subCategory: 'Hyderabadi Dum',
    price: 180,
    secondaryPrice: 120,
    description: 'Aromatic long-grain basmati rice cooked on dum with tender marinated chicken pieces, rich Indian spices, served with raita and salan.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: true,
    spicyLevel: 2,
    tags: ['Bestseller', 'Chef Special']
  },
  {
    id: 'starter-chicken-65',
    name: 'Chicken 65',
    category: 'Chicken',
    subCategory: 'Dry Appetizer',
    price: 160,
    secondaryPrice: 100,
    description: 'Crispy deep-fried chicken tossed with spicy red chilli paste, mustard seeds, curry leaves, and green chillies.',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: true,
    spicyLevel: 3,
    tags: ['Crispy', 'Spicy']
  },
  {
    id: 'chicken-angara',
    name: 'Chicken Angara',
    category: 'Chicken',
    subCategory: 'Gravy',
    price: 150,
    description: 'Smoky, fiery, slow-cooked chicken gravy infused with charcoal aroma, crushed spices, and rich tomato-onion paste.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: true,
    spicyLevel: 3,
    tags: ['Smoky Charcoal', 'Signature']
  },
  {
    id: 'chinese-chicken-fried-rice',
    name: 'Chicken Fried Rice',
    category: 'Fried Rice',
    subCategory: 'Wok Fried',
    price: 140,
    secondaryPrice: 90,
    description: 'Wok-tossed fragrant basmati rice with shredded juicy chicken, eggs, diced carrots, beans, spring onion, and oriental sauces.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: true,
    spicyLevel: 1,
    tags: ['Chinese Special']
  },
  {
    id: 'paneer-tikka-masala',
    name: 'Paneer Tikka Masala',
    category: 'Paneer',
    subCategory: 'North Indian Gravy',
    price: 180,
    description: 'Clay-oven roasted cottage cheese cubes bathed in a creamy, velvety spiced tomato and cashew nut gravy.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
    spicyLevel: 2,
    tags: ['Creamy', 'Pure Veg']
  },
  {
    id: 'prawn-masala',
    name: 'Prawn Masala',
    category: 'Prawn',
    subCategory: 'Seafood Special',
    price: 220,
    description: 'Succulent coastal fresh prawns cooked in a pungent blend of roasted spices, ginger-garlic, curry leaves, and thick onion masala.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: true,
    spicyLevel: 2,
    tags: ['Fresh Catch', 'Coastal Special']
  },

  // --- SOUP ---
  {
    id: 'soup-veg-manchow',
    name: 'Veg Manchow Soup',
    category: 'Soup',
    price: 80,
    description: 'Zesty Indo-Chinese thick soup with minced garden vegetables, garlic, coriander, topped with crunchy fried noodles.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'soup-chicken-manchow',
    name: 'Chicken Manchow Soup',
    category: 'Soup',
    price: 110,
    description: 'Hearty spicy broth loaded with chicken shreds, egg drop, soy garlic, and crunchy noodles.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'soup-sweet-corn-veg',
    name: 'Sweet Corn Veg Soup',
    category: 'Soup',
    price: 80,
    description: 'Velvety mild soup loaded with sweet American corn kernels, carrots, and spring cabbage.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 1
  },
  {
    id: 'soup-hot-sour-chicken',
    name: 'Chicken Hot & Sour Soup',
    category: 'Soup',
    price: 110,
    description: 'Classic tangy and spicy broth loaded with chicken ribbons, mushrooms, bamboo shoots, and vinegar pepper.',
    image: 'https://images.unsplash.com/photo-1607528971899-2e89e6c0ec69?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },

  // --- SALAD ---
  {
    id: 'salad-green',
    name: 'Fresh Green Salad',
    category: 'Salad',
    price: 50,
    description: 'Farm-fresh garden slices of cucumber, juicy tomatoes, red onions, radish, lemon wedge, and green chilli.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'salad-onion',
    name: 'Laccha Onion Salad',
    category: 'Salad',
    price: 40,
    description: 'Crisp thin onion rings dusted with chat masala, fresh chopped coriander, and freshly squeezed lemon juice.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },

  // --- PAPAD ---
  {
    id: 'papad-masala',
    name: 'Masala Papad',
    category: 'Papad',
    price: 40,
    description: 'Crispy roasted lentil papad topped with spicy onion-tomato salsa, green chillies, chaat masala, and fresh coriander.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'papad-roasted',
    name: 'Roasted Papad',
    category: 'Papad',
    price: 20,
    description: 'Traditional crisp lentil cracker gently fire-roasted on open flame.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },

  // --- PAKODA ---
  {
    id: 'pakoda-chicken',
    name: 'Chicken Pakoda',
    category: 'Pakoda',
    price: 150,
    secondaryPrice: 90,
    description: 'Juicy spiced chicken nuggets dipped in seasoned gram flour batter, deep fried till golden crunch, served with mint chutney.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'pakoda-paneer',
    name: 'Paneer Pakoda',
    category: 'Pakoda',
    price: 120,
    description: 'Tender cottage cheese stuffed with tangy mint chutney, batter-fried crisp.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'pakoda-onion',
    name: 'Onion Pakoda',
    category: 'Pakoda',
    price: 70,
    description: 'Classic Odia evening snack of shredded red onions fried with carom seeds and green chillies.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },

  // --- ROLL ---
  {
    id: 'roll-chicken-egg',
    name: 'Chicken Egg Roll',
    category: 'Roll',
    price: 90,
    description: 'Flaky paratha layered with beaten egg, stuffed with spiced sautéed chicken, crunchy sliced onions, and tangy house sauce.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'roll-double-egg',
    name: 'Double Egg Roll',
    category: 'Roll',
    price: 60,
    description: 'Golden crisped paratha lined with two seasoned eggs, layered with pickled onion rings and chilli sauce.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'roll-paneer',
    name: 'Paneer Roll',
    category: 'Roll',
    price: 75,
    description: 'Soft paratha rolled with tawa paneer chunks, crisp bell peppers, and spiced mint mayonnaise.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },

  // --- NOODLES ---
  {
    id: 'noodles-veg-hakka',
    name: 'Veg Hakka Noodles',
    category: 'Noodles',
    price: 90,
    secondaryPrice: 60,
    description: 'Slender Chinese noodles tossed in smoking wok with julienned cabbage, capsicum, carrots, and light soy sauce.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'noodles-chicken-hakka',
    name: 'Chicken Hakka Noodles',
    category: 'Noodles',
    price: 130,
    secondaryPrice: 85,
    description: 'Stir-fried noodles with chicken ribbons, scrambled eggs, shredded vegetables, and dark soy pepper sauce.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'noodles-chicken-schezwan',
    name: 'Schezwan Chicken Noodles',
    category: 'Noodles',
    price: 140,
    description: 'Fiery noodles tossed in homemade spicy Schezwan chilli pepper sauce with chicken and crisp vegetables.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 3
  },

  // --- FRIED RICE ---
  {
    id: 'rice-veg-fried',
    name: 'Veg Fried Rice',
    category: 'Fried Rice',
    price: 100,
    secondaryPrice: 70,
    description: 'Wok tossed fragrant rice loaded with finely diced carrots, French beans, and aromatic spring onions.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'rice-egg-fried',
    name: 'Egg Fried Rice',
    category: 'Fried Rice',
    price: 110,
    secondaryPrice: 80,
    description: 'Fluffy long grain rice wok-tossed with fluffy scrambled eggs, pepper, and fresh scallions.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'rice-mixed-special',
    name: 'Mirch Masala Special Mixed Fried Rice',
    category: 'Fried Rice',
    price: 180,
    description: 'Chef signature combination fried rice loaded with chicken, tender prawns, egg drops, and seasonal vegetables.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },

  // --- VEGETABLE ---
  {
    id: 'veg-mix-vegetable',
    name: 'Mix Vegetable Curry',
    category: 'Vegetable',
    price: 120,
    description: 'Garden fresh seasonal vegetables, green peas, carrots, cauliflower tossed in homestyle onion-tomato gravy.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'veg-kolhapuri',
    name: 'Veg Kolhapuri',
    category: 'Vegetable',
    price: 130,
    description: 'Spicy Maharastrian style mixed vegetable preparation in thick fiery red coconut and dried chilli gravy.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 3
  },
  {
    id: 'veg-aloo-dum',
    name: 'Kashmiri Aloo Dum',
    category: 'Vegetable',
    price: 110,
    description: 'Baby potatoes slow simmered in rich yoghurt and fennel-scented gravy.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },

  // --- MUSHROOM ---
  {
    id: 'mushroom-masala',
    name: 'Mushroom Masala',
    category: 'Mushroom',
    price: 150,
    description: 'Fresh button mushrooms simmered in a spiced onion, tomato, and cashew nut brown curry.',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'mushroom-chilli',
    name: 'Mushroom Chilli',
    category: 'Mushroom',
    price: 140,
    description: 'Batter coated fried mushrooms tossed with crisp capsicum, onion dice, and tangy green chilli soy sauce.',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'mushroom-kadai',
    name: 'Kadai Mushroom',
    category: 'Mushroom',
    price: 160,
    description: 'Plump button mushrooms cooked with crushed coriander seeds, bell peppers, and fragrant kadai masala.',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },

  // --- PANEER ---
  {
    id: 'paneer-butter-masala',
    name: 'Paneer Butter Masala',
    category: 'Paneer',
    price: 170,
    description: 'Melt-in-mouth cottage cheese cubes simmered in butter-rich silk tomato gravy with fenugreek leaves.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 1
  },
  {
    id: 'paneer-kadai',
    name: 'Kadai Paneer',
    category: 'Paneer',
    price: 160,
    description: 'Paneer cubes and crunchy bell peppers tossed in thick rustic gravy cooked in traditional iron wok.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'paneer-chilli',
    name: 'Chilli Paneer (Dry/Gravy)',
    category: 'Paneer',
    price: 150,
    description: 'Crispy fried paneer cubes tossed with red and green chillies, spring onions, garlic, and soya sauce.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },

  // --- CHICKEN ---
  {
    id: 'chicken-butter-masala',
    name: 'Chicken Butter Masala',
    category: 'Chicken',
    price: 190,
    secondaryPrice: 130,
    description: 'Tender chicken pieces cooked in a silky, creamy butter and tomato reduction with aromatic kasuri methi.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 1
  },
  {
    id: 'chicken-kadai',
    name: 'Kadai Chicken',
    category: 'Chicken',
    price: 170,
    secondaryPrice: 110,
    description: 'Chicken pieces braised with roasted coriander seeds, red dry chillies, and bell peppers in a semi-dry gravy.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'chicken-chilli',
    name: 'Chilli Chicken Dry',
    category: 'Chicken',
    price: 160,
    secondaryPrice: 100,
    description: 'All-time favorite crispy fried chicken tossed in hot wok with green chillies, ginger, and soy sauce.',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 3
  },
  {
    id: 'chicken-hyderabadi',
    name: 'Chicken Hyderabadi',
    category: 'Chicken',
    price: 170,
    description: 'Rich green masala chicken simmered with mint, coriander, yoghurt, and green chillies.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },

  // --- MUTTON ---
  {
    id: 'mutton-kassa',
    name: 'Odia Mutton Kassa',
    category: 'Mutton',
    price: 260,
    secondaryPrice: 180,
    description: 'Slow roasted tender country mutton cooked in deep rich caramelized onion and garlic masala, typical Gunupur style.',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 3
  },
  {
    id: 'mutton-curry',
    name: 'Desi Mutton Curry with Aloo',
    category: 'Mutton',
    price: 240,
    secondaryPrice: 160,
    description: 'Homestyle flavorful goat meat curry with fried potato halves in thin, aromatic spiced broth.',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'mutton-rogan-josh',
    name: 'Mutton Rogan Josh',
    category: 'Mutton',
    price: 280,
    description: 'Kashmiri delicacy of tender mutton stewed with Kashmiri deggi mirch, cinnamon, and whole aromatic spices.',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: false, // Demonstrates SOLD OUT requirement
    isPopular: false,
    spicyLevel: 2
  },

  // --- PRAWN ---
  {
    id: 'prawn-chilli',
    name: 'Chilli Prawn',
    category: 'Prawn',
    price: 230,
    description: 'Crispy batter fried prawns tossed with capsicum, garlic, green chillies, and Indo-Chinese sauces.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'prawn-malai-curry',
    name: 'Prawn Malai Curry',
    category: 'Prawn',
    price: 240,
    description: 'Fresh freshwater prawns cooked gently in rich coconut milk, cardamom, and mild spices.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 1
  },

  // --- FISH ---
  {
    id: 'fish-curry-odia',
    name: 'Odia Fish Besara (Mustard Curry)',
    category: 'Fish',
    price: 140,
    description: 'Traditional Rohu fish simmered in authentic pungent ground mustard paste, raw tomato, and dry mango ambula.',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'fish-fry-crispy',
    name: 'Crispy Rohu Fish Fry (2 Pcs)',
    category: 'Fish',
    price: 130,
    description: 'Fresh river fish steaks marinated with turmeric, red chilli, ginger paste, and pan fried to golden crisp.',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'fish-chilli',
    name: 'Chilli Fish',
    category: 'Fish',
    price: 160,
    description: 'Boneless fish fillets batter fried and tossed with Chinese seasonings and bell peppers.',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: false, // Demonstrates SOLD OUT requirement
    isPopular: false,
    spicyLevel: 2
  },

  // --- EGG ---
  {
    id: 'egg-curry',
    name: 'Egg Curry (2 Eggs)',
    category: 'Egg',
    price: 90,
    description: 'Fried boiled eggs simmered in homestyle onion-tomato gravy with warm spices.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'egg-tadka',
    name: 'Egg Dal Tadka',
    category: 'Egg',
    price: 100,
    description: 'Yellow lentils cooked with scrambled eggs, butter, roasted cumin, and garlic tadka.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'egg-bhurji',
    name: 'Masala Egg Bhurji (2 Eggs)',
    category: 'Egg',
    price: 60,
    description: 'Scrambled eggs spiced with onions, green chillies, tomatoes, and chopped coriander.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false
  },

  // --- TANDOORI ---
  {
    id: 'tandoori-chicken',
    name: 'Tandoori Chicken',
    category: 'Tandoori',
    price: 360,
    secondaryPrice: 190,
    description: 'Chicken steeped in hung curd, Kashmiri deggi mirch, ginger-garlic, roasted to perfection in charcoal tandoor.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'tandoori-chicken-tikka',
    name: 'Chicken Tikka (6 Pcs)',
    category: 'Tandoori',
    price: 180,
    description: 'Smoky skewered boneless chicken chunks charred in clay oven, sprinkled with lemon and chaat masala.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'tandoori-butter-naan',
    name: 'Butter Naan',
    category: 'Tandoori',
    price: 35,
    description: 'Traditional refined flour flatbread baked in clay tandoor, brushed generously with fresh butter.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'tandoori-roti',
    name: 'Tandoori Roti (Plain/Butter)',
    category: 'Tandoori',
    price: 15,
    secondaryPrice: 20,
    description: 'Whole wheat round bread baked fresh on the inner walls of the tandoor.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },

  // --- BIRYANI ---
  {
    id: 'biryani-mutton',
    name: 'Mutton Dum Biryani',
    category: 'Biryani',
    price: 240,
    secondaryPrice: 160,
    description: 'Succulent pieces of spiced mutton layered with fragrant saffron basmati rice, caramelised onions, cooked on slow dum.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'biryani-veg',
    name: 'Veg Dum Biryani',
    category: 'Biryani',
    price: 130,
    secondaryPrice: 90,
    description: 'Fragrant basmati rice cooked with fresh seasonal vegetables, paneer chunks, whole spices, and saffron.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 1
  },
  {
    id: 'biryani-egg',
    name: 'Egg Biryani',
    category: 'Biryani',
    price: 130,
    secondaryPrice: 90,
    description: 'Golden shallow-fried eggs resting in layers of spiced masala biryani rice with caramelized onions and herbs.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },

  // --- MEALS ---
  {
    id: 'meal-veg-thali',
    name: 'Special Veg Thali Meal',
    category: 'Meals',
    price: 120,
    description: 'Complete wholesome meal with Steamed Rice, Dal, 2 Sabzi, Papad, Salad, Pickle, and Sweet.',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'meal-chicken-thali',
    name: 'Special Chicken Thali Meal',
    category: 'Meals',
    price: 170,
    description: 'Hearty dinner meal with Steamed Rice, Chicken Kassa (2 pcs), Dal, Veg Curry, Papad, and Salad.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false,
    spicyLevel: 2
  },
  {
    id: 'meal-fish-thali',
    name: 'Odia Fish Thali Meal',
    category: 'Meals',
    price: 150,
    description: 'Authentic local thali with Steamed Rice, Odia Fish Curry, Dal, Bhaja, Salad, and Papad.',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: false
  },

  // --- SOFT DRINKS ---
  {
    id: 'drink-fresh-lime-soda',
    name: 'Fresh Lime Soda (Sweet/Salt)',
    category: 'Soft Drinks',
    price: 45,
    description: 'Refreshing thirst quencher prepared with freshly squeezed limes, chilled soda, mint, and black salt.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'drink-sweet-lassi',
    name: 'Special Sweet Lassi',
    category: 'Soft Drinks',
    price: 60,
    description: 'Thick, creamy churned sweet curd topped with cardamom essence and chopped dry fruits.',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'drink-cold-drinks',
    name: 'Cold Drink Bottle / Can (300ml)',
    category: 'Soft Drinks',
    price: 40,
    description: 'Chilled carbonated soft drinks: Thums Up, Sprite, Coca Cola, or Limca (served chilled).',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'drink-mineral-water',
    name: 'Packaged Drinking Water (1 Litre)',
    category: 'Soft Drinks',
    price: 20,
    description: 'Chilled pure packaged drinking water bottle.',
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  }
];

export const CATEGORIES = [
  'All',
  'Popular',
  'Soup',
  'Salad',
  'Papad',
  'Pakoda',
  'Roll',
  'Noodles',
  'Fried Rice',
  'Vegetable',
  'Mushroom',
  'Paneer',
  'Chicken',
  'Mutton',
  'Prawn',
  'Fish',
  'Egg',
  'Tandoori',
  'Biryani',
  'Meals',
  'Soft Drinks'
] as const;
