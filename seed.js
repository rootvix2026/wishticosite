export const DEMO_CATEGORIES = [
  {
    id: 'half-sleeve',
    name: 'Half Sleeve',
    slug: 'half-sleeve',
    image: 'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'full-sleeve',
    name: 'Full Sleeve',
    slug: 'full-sleeve',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'pants',
    name: 'Pants',
    slug: 'pants',
    image: 'https://images.unsplash.com/photo-1506629905607-24339d0bb38b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'combo-offers',
    name: 'Combo Offers',
    slug: 'combo-offers',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'jackets',
    name: 'Jackets',
    slug: 'jackets',
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 't-shirts',
    name: 'T-Shirts',
    slug: 't-shirts',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'offer-price-dresses',
    name: 'Offer Price Dresses',
    slug: 'offer-price-dresses',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
  }
];

export const DEMO_PRODUCTS = [
  {
    id: 'premium-cotton-half-shirt',
    name: 'Premium Cotton Shirt',
    description: 'A clean premium half-sleeve shirt cut from breathable cotton with a polished finish and versatile luxury fit.',
    image: 'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80'
    ],
    price: 899,
    originalPrice: 1299,
    offerPercentage: 31,
    category: 'Half Sleeve',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Ivory', hex: '#FAF8F5' }, { name: 'Black', hex: '#0E0E0E' }],
    stock: 18,
    trending: true,
    createdAt: '2026-05-10T00:00:00.000Z'
  },
  {
    id: 'casual-resort-half-shirt',
    name: 'Casual Resort Shirt',
    description: 'Resort-inspired half sleeves with elevated tailoring and a laid-back luxury drape for modern styling.',
    image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'
    ],
    price: 699,
    originalPrice: 999,
    offerPercentage: 30,
    category: 'Half Sleeve',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Tan', hex: '#C9A36A' }, { name: 'Navy', hex: '#2D4059' }],
    stock: 14,
    trending: false,
    createdAt: '2026-05-02T00:00:00.000Z'
  },
  {
    id: 'formal-white-full-shirt',
    name: 'Formal White Shirt',
    description: 'A signature full-sleeve essential with crisp structure, premium finishing, and day-to-night refinement.',
    image: 'https://images.unsplash.com/photo-1603252109612-24fa03d14562?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1603252109612-24fa03d14562?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80'
    ],
    price: 799,
    originalPrice: 1199,
    offerPercentage: 33,
    category: 'Full Sleeve',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    stock: 22,
    trending: true,
    createdAt: '2026-05-06T00:00:00.000Z'
  },
  {
    id: 'olive-green-full-shirt',
    name: 'Olive Green Shirt',
    description: 'Rich olive color, premium soft-touch fabric, and tailored full sleeves for understated confidence.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80'
    ],
    price: 799,
    originalPrice: 1099,
    offerPercentage: 27,
    category: 'Full Sleeve',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Olive', hex: '#6F7C59' }],
    stock: 16,
    trending: true,
    createdAt: '2026-05-07T00:00:00.000Z'
  },
  {
    id: 'black-tailored-pant',
    name: 'Black Pant',
    description: 'Tailored black pants with clean lines, premium stretch comfort, and an elevated formal-casual balance.',
    image: 'https://images.unsplash.com/photo-1506629905607-24339d0bb38b?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1506629905607-24339d0bb38b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80'
    ],
    price: 899,
    originalPrice: 1299,
    offerPercentage: 31,
    category: 'Pants',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#0E0E0E' }],
    stock: 20,
    trending: true,
    createdAt: '2026-05-04T00:00:00.000Z'
  },
  {
    id: 'sand-relaxed-pant',
    name: 'Sand Relaxed Pant',
    description: 'Relaxed premium trousers in a soft sand tone for sharp but effortless day styling.',
    image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80'
    ],
    price: 849,
    originalPrice: 1199,
    offerPercentage: 29,
    category: 'Pants',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Sand', hex: '#C7B39A' }],
    stock: 12,
    trending: false,
    createdAt: '2026-05-03T00:00:00.000Z'
  },
  {
    id: 'urban-denim-jacket',
    name: 'Denim Jacket',
    description: 'Structured premium denim with a sleek wash and elevated streetwear attitude.',
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80'
    ],
    price: 1299,
    originalPrice: 1799,
    offerPercentage: 28,
    category: 'Jackets',
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Indigo', hex: '#33547A' }],
    stock: 10,
    trending: true,
    createdAt: '2026-05-01T00:00:00.000Z'
  },
  {
    id: 'midnight-bomber-jacket',
    name: 'Midnight Bomber',
    description: 'A luxe bomber jacket with clean trims, minimalist hardware, and premium statement styling.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'
    ],
    price: 1499,
    originalPrice: 2199,
    offerPercentage: 32,
    category: 'Jackets',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#0E0E0E' }, { name: 'Olive', hex: '#6F7C59' }],
    stock: 8,
    trending: false,
    createdAt: '2026-04-29T00:00:00.000Z'
  },
  {
    id: 'printed-signature-tee',
    name: 'Printed T-Shirt',
    description: 'Heavyweight premium tee with a clean statement graphic and elevated everyday comfort.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80'
    ],
    price: 499,
    originalPrice: 699,
    offerPercentage: 29,
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#0E0E0E' }, { name: 'Ivory', hex: '#FAF8F5' }],
    stock: 30,
    trending: true,
    createdAt: '2026-05-08T00:00:00.000Z'
  },
  {
    id: 'essential-heavyweight-tee',
    name: 'Essential Heavyweight Tee',
    description: 'Oversized luxury tee with structured drape and a minimal premium finish.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
    ],
    price: 549,
    originalPrice: 799,
    offerPercentage: 31,
    category: 'T-Shirts',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Stone', hex: '#DDD1C1' }, { name: 'Charcoal', hex: '#2E2E2E' }],
    stock: 24,
    trending: false,
    createdAt: '2026-05-05T00:00:00.000Z'
  },
  {
    id: 'combo-pack-3',
    name: 'Combo Pack-3',
    description: 'Three premium essentials bundled into a sharp value set for instant wardrobe upgrades.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
    ],
    price: 1999,
    originalPrice: 2899,
    offerPercentage: 31,
    category: 'Combo Offers',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Mixed', hex: '#C9A36A' }],
    stock: 11,
    trending: true,
    createdAt: '2026-05-09T00:00:00.000Z'
  },
  {
    id: 'weekend-duo-offer',
    name: 'Weekend Duo Offer',
    description: 'Two wardrobe staples paired into one premium combo offer for effortless styling.',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
    ],
    price: 1399,
    originalPrice: 1999,
    offerPercentage: 30,
    category: 'Combo Offers',
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Mixed', hex: '#B88C58' }],
    stock: 9,
    trending: false,
    createdAt: '2026-05-11T00:00:00.000Z'
  },
  {
    id: 'satin-evening-dress',
    name: 'Offer Price Dress',
    description: 'A premium satin statement dress with soft sheen and occasion-ready luxury appeal.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
    ],
    price: 1599,
    originalPrice: 2399,
    offerPercentage: 33,
    category: 'Offer Price Dresses',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Champagne', hex: '#E8DDCB' }, { name: 'Black', hex: '#0E0E0E' }],
    stock: 7,
    trending: true,
    createdAt: '2026-05-12T00:00:00.000Z'
  }
];

export const DEMO_REVIEWS = [
  {
    id: 'review-1',
    productId: 'premium-cotton-half-shirt',
    userId: 'demo-customer',
    userName: 'Ritika S.',
    rating: 5,
    title: 'Premium feel exactly as promised',
    message: 'The cotton quality is impressive and the fit feels far more expensive than the price.',
    approved: true,
    createdAt: '2026-05-10T12:00:00.000Z'
  },
  {
    id: 'review-2',
    productId: 'black-tailored-pant',
    userId: 'demo-customer',
    userName: 'Arjun P.',
    rating: 5,
    title: 'Perfect sharp fit',
    message: 'Looks premium, drapes well, and works with both sneakers and formal shoes.',
    approved: true,
    createdAt: '2026-05-11T12:00:00.000Z'
  },
  {
    id: 'review-3',
    productId: 'urban-denim-jacket',
    userId: 'demo-customer',
    userName: 'Neha K.',
    rating: 4,
    title: 'Loved the finish',
    message: 'The jacket styling is excellent and the packaging felt very premium.',
    approved: true,
    createdAt: '2026-05-09T12:00:00.000Z'
  },
  {
    id: 'review-4',
    productId: 'combo-pack-3',
    userId: 'demo-customer',
    userName: 'Kabir M.',
    rating: 5,
    title: 'Great combo value',
    message: 'A smart way to upgrade basics at once. Fabric and color palette are spot on.',
    approved: true,
    createdAt: '2026-05-08T12:00:00.000Z'
  }
];

export const DEMO_OFFERS = [
  { id: 'offer-1', code: 'WISHTICO10', percentage: 10, minOrder: 1500, expiry: '2026-12-31', active: true },
  { id: 'offer-2', code: 'LUXE15', percentage: 15, minOrder: 2500, expiry: '2026-12-31', active: true }
];

export const DEMO_USERS = [
  {
    uid: 'demo-admin',
    name: 'WISHTICO Admin',
    email: 'admin@wishtico.demo',
    password: 'WishTico@2026',
    role: 'admin',
    createdAt: '2026-05-01T00:00:00.000Z'
  },
  {
    uid: 'demo-customer',
    name: 'Demo Customer',
    email: 'customer@wishtico.demo',
    password: 'WishTico@2026',
    role: 'customer',
    createdAt: '2026-05-01T00:00:00.000Z'
  }
];
