import {
  addProduct,
  addReview,
  createOrder,
  deleteCategory,
  deleteCoupon,
  deleteProduct,
  deleteReview,
  getCart,
  getCategories,
  getCoupons,
  getOrders,
  getProduct,
  getProducts,
  getReviews,
  getUserProfile,
  getUsers,
  isDemoMode,
  onAuthChange,
  saveCart,
  saveCategory,
  saveCoupon,
  seedDemoData,
  signIn,
  signInGoogle,
  signOutUser,
  signUp,
  updateOrderStatus,
  updateProduct,
  updateReviewApproval,
  uploadProductImage,
  validateCoupon
} from './firebase.js';

const page = document.body.dataset.page || 'home';
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const params = new URLSearchParams(window.location.search);
const GUEST_CART_KEY = 'wishtico-guest-cart';
const COUPON_KEY = 'wishtico-coupon';
const WISHLIST_PREFIX = 'wishtico-wishlist';
const DEFAULT_PRODUCT_SIZE = 'M';
const DEFAULT_PRODUCT_COLOR = { name: 'Default', hex: '#0E0E0E' };

const state = {
  user: null,
  authReady: false,
  products: [],
  categories: [],
  reviews: [],
  coupons: [],
  orders: [],
  users: [],
  cart: [],
  appliedCoupon: '',
  appReady: false,
  collectionPage: 1,
  collectionFilters: {
    category: params.get('category') || 'All',
    size: '',
    color: '',
    price: 4999,
    sort: 'popular'
  }
};

const CATEGORY_ORDER = ['Half Sleeve', 'Full Sleeve', 'Pants', 'Combo Offers', 'Jackets', 'T-Shirts', 'Offer Price Dresses'];
const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL'];

const icon = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6"></circle><path d="m20 20-4.2-4.2"></path></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.7-7-10.4A4.4 4.4 0 0 1 9.4 5c1.4 0 2.3.6 2.6 1 .3-.4 1.2-1 2.6-1A4.4 4.4 0 0 1 19 9.6C19 15.3 12 20 12 20Z"></path></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="20" r="1.2"></circle><circle cx="18" cy="20" r="1.2"></circle><path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7"></path></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>`,
  star: '★'
};

const navItems = [
  ['Home', 'index.html'],
  ['Collections', 'collections.html'],
  ['Reviews', 'reviews.html'],
  ['About', 'about.html'],
  ['Contact', 'contact.html']
];

const utilityItems = [
  ['Contact', 'contact.html'],
  ['Help', 'contact.html#support'],
  ['Delivery Tracking', 'checkout.html#my-orders']
];

const byId = (id) => document.getElementById(id);
const formatPrice = (value) => currency.format(Number(value || 0));
const toSlug = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeRoleForComparison = (value = '') => String(value).trim().toLowerCase();
const averageRating = (productId) => {
  const productReviews = state.reviews.filter((review) => review.productId === productId && review.approved !== false);
  if (!productReviews.length) return 4.8;
  return productReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / productReviews.length;
};
const reviewCount = (productId) => state.reviews.filter((review) => review.productId === productId && review.approved !== false).length;
const getDiscount = (product) => product.offerPercentage || Math.max(0, Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100));
const getDeliveryCharge = (subtotal) => (subtotal > 0 && subtotal < 1499 ? 99 : 0);
const getWishlistKey = () => `${WISHLIST_PREFIX}-${state.user?.uid || 'guest'}`;
const sameUser = (a, b) => (a?.uid || '') === (b?.uid || '') && (a?.role || '') === (b?.role || '') && (a?.name || '') === (b?.name || '');
const isAdminUser = (profile = state.user) => normalizeRoleForComparison(profile?.role) === 'admin';
const getSafeRedirect = () => {
  const candidate = params.get('redirect');
  if (!candidate) return 'index.html';
  try {
    const url = new URL(candidate, window.location.origin);
    const isSameOrigin = url.origin === window.location.origin;
    const isSafePath = /^\/?[\w./#?-]+$/.test(candidate) && !candidate.startsWith('//');
    if (!isSameOrigin || !isSafePath) return 'index.html';
    return `${url.pathname.replace(/^\//, '')}${url.search}${url.hash}` || 'index.html';
  } catch {
    return 'index.html';
  }
};

function updateHeaderBadges() {
  const cartCount = state.cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const wishlistCount = getWishlistIds().length;
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(cartCount);
  });
  document.querySelectorAll('[data-wishlist-count]').forEach((node) => {
    node.textContent = String(wishlistCount);
  });
}

function setAuthFeedback(message = '', type = 'error') {
  const feedback = byId('auth-feedback');
  if (!feedback) return;
  feedback.hidden = !message;
  feedback.textContent = message;
  feedback.dataset.state = message ? type : '';
}

function getFriendlyAuthMessage(error, fallback) {
  const code = String(error?.code || error?.message || '').toLowerCase();
  if (code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('invalid-login-credentials')) return 'Incorrect email or password.';
  if (code.includes('user-not-found')) return 'No account was found for that email address.';
  if (code.includes('email-already-in-use')) return 'An account with this email already exists.';
  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('weak-password')) return 'Password must be at least 6 characters long.';
  if (code.includes('popup-closed')) return 'Google sign-in was cancelled before it finished.';
  if (code.includes('network')) return 'A network error occurred. Please check your connection and try again.';
  return error?.message || fallback;
}

function syncAuthSwitchLinks() {
  const redirect = getSafeRedirect();
  const suffix = redirect === 'index.html' ? '' : `?redirect=${encodeURIComponent(redirect)}`;
  byId('signup-link')?.setAttribute('href', `signup.html${suffix}`);
  byId('login-link')?.setAttribute('href', `login.html${suffix}`);
}

function showToast(message) {
  const stack = byId('toast-stack');
  if (!stack) return;
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  stack.appendChild(node);
  setTimeout(() => node.remove(), 3200);
}

function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function getWishlistIds() {
  try {
    return JSON.parse(localStorage.getItem(getWishlistKey()) || '[]');
  } catch {
    return [];
  }
}

function saveWishlistIds(ids) {
  localStorage.setItem(getWishlistKey(), JSON.stringify(ids));
}

function getCouponCode() {
  return localStorage.getItem(COUPON_KEY) || '';
}

function saveCouponCode(code) {
  if (code) localStorage.setItem(COUPON_KEY, code);
  else localStorage.removeItem(COUPON_KEY);
  state.appliedCoupon = code;
}

function cartTotals(items = state.cart, couponResult = null) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const delivery = getDeliveryCharge(subtotal);
  const discount = couponResult?.amount || 0;
  const total = Math.max(0, subtotal + delivery - discount);
  return { subtotal, delivery, discount, total };
}

function readFormJson(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function renderSharedChrome() {
  const headerRoot = document.querySelector('[data-site-header]');
  const drawerRoot = document.querySelector('[data-cart-drawer]');
  const searchRoot = document.querySelector('[data-search-overlay]');
  const footerRoot = document.querySelector('[data-site-footer]');
  const cartCount = state.cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const wishlistCount = getWishlistIds().length;
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const accountHtml = state.user
    ? `<div class="account-menu"><button class="account-menu__toggle" type="button" data-account-toggle>Hi, ${state.user.name?.split(' ')[0] || 'User'}</button><div class="account-menu__panel"><a href="checkout.html#my-orders">My Orders</a><a href="collections.html?view=wishlist">Wishlist</a>${isAdminUser(state.user) ? '<a href="admin.html">Admin</a>' : ''}<button type="button" data-logout-button>Logout</button></div></div>`
    : `<a href="login.html" class="utility-link">Login</a><a href="signup.html" class="utility-link">Sign Up</a>`;

  if (headerRoot) {
    headerRoot.innerHTML = `
      <header class="site-header" id="siteHeader">
        <div class="announcement-bar">Welcome to WishTico — Premium Fashion Wear  |  Free Delivery on Prepaid Orders</div>
        ${isDemoMode ? '<div class="demo-banner">Demo mode active — replace the placeholder Firebase config in <code>firebase.js</code> to enable live data.</div>' : ''}
        <div class="site-header__bar">
          <div class="container site-header__row">
            <a class="brand-lockup" href="index.html" aria-label="WISHTICO home"><img src="assets/images/logo-lockup.svg" alt="WISHTICO" /></a>
            <nav class="desktop-nav" aria-label="Primary navigation">
              ${navItems
                .map(([label, href]) => `<a class="nav-link ${currentPath === href ? 'is-active' : ''}" href="${href}">${label}</a>`)
                .join('')}
            </nav>
            <div class="header-utilities">
              <div class="utility-links">${accountHtml}${utilityItems.map(([label, href]) => `<a class="utility-link" href="${href}">${label}</a>`).join('')}</div>
              <div class="icon-actions">
                <button class="icon-button" type="button" data-open-search aria-label="Search">${icon.search}</button>
                <a class="icon-button" href="collections.html?view=wishlist" aria-label="Wishlist">${icon.heart}<span class="cart-badge" data-wishlist-count>${wishlistCount}</span></a>
                <button class="icon-button" type="button" data-open-cart aria-label="Cart">${icon.cart}<span class="cart-badge" data-cart-count>${cartCount}</span></button>
                <button class="icon-button mobile-only" type="button" data-open-mobile aria-label="Menu">${icon.menu}</button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="mobile-panel" id="mobilePanel" aria-hidden="true">
        <div class="mobile-panel__backdrop" data-close-mobile></div>
        <aside class="mobile-panel__sheet">
          <div class="mobile-panel__head"><img src="assets/images/logo-lockup.svg" alt="WISHTICO" /><button class="close-button" type="button" data-close-mobile>×</button></div>
          <nav class="mobile-nav">${navItems.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}</nav>
          <div class="mobile-actions">${state.user ? `<a href="checkout.html#my-orders">My Orders</a><a href="collections.html?view=wishlist">Wishlist</a>${isAdminUser(state.user) ? '<a href="admin.html">Admin</a>' : ''}<button type="button" data-logout-button>Logout</button>` : `<a href="login.html">Login</a><a href="signup.html">Sign Up</a>`}${utilityItems.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}</div>
        </aside>
      </div>`;
  }

  if (drawerRoot) {
    drawerRoot.innerHTML = `
      <div class="cart-drawer" id="cartDrawer" aria-hidden="true">
        <div class="cart-drawer__backdrop" data-close-cart></div>
        <aside class="cart-drawer__panel">
          <div class="cart-drawer__head">
            <div><strong>Your Cart</strong><p>Luxury pieces ready for checkout.</p></div>
            <button class="close-button" type="button" data-close-cart>×</button>
          </div>
          <div class="cart-list" id="cart-drawer-items"></div>
          <div class="cart-drawer__footer">
            <div><small>Total</small><strong id="drawer-total">${formatPrice(cartTotals().total)}</strong></div>
            <a class="button button-primary" href="cart.html">Open Cart</a>
          </div>
        </aside>
      </div>`;
  }

  if (searchRoot) {
    searchRoot.innerHTML = `
      <div class="search-overlay" id="searchOverlay" aria-hidden="true">
        <div class="search-overlay__backdrop" data-close-search></div>
        <div class="search-overlay__panel">
          <div class="search-overlay__head">
            <h2>Search WISHTICO</h2>
            <button class="close-button" type="button" data-close-search>×</button>
          </div>
          <label class="field"><span>Search products</span><input id="search-input" type="search" placeholder="Search by name or category" /></label>
          <div class="search-results" id="search-results"></div>
        </div>
      </div>`;
  }

  if (footerRoot) {
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div>
            <img class="footer-logo" src="assets/images/logo-lockup.svg" alt="WISHTICO" />
            <p>WISHTICO delivers premium fashion essentials with a luxury modern feel, smooth shopping flow, and elegant details.</p>
            <div class="social-row"><a href="#">Instagram</a><a href="#">Facebook</a><a href="#">Pinterest</a><a href="#">YouTube</a></div>
          </div>
          <div>
            <h3>Shop</h3>
            <a href="collections.html">Collections</a>
            <a href="collections.html?category=Combo%20Offers">Combo Offers</a>
            <a href="collections.html?view=wishlist">Wishlist</a>
            <a href="cart.html">Cart</a>
          </div>
          <div>
            <h3>Help</h3>
            <a href="login.html">Login</a>
            <a href="signup.html">Sign Up</a>
            <a href="checkout.html#my-orders">Delivery Tracking</a>
            <a href="contact.html#support">Support</a>
          </div>
          <div>
            <h3>Company</h3>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
            <a href="reviews.html">Reviews</a>
            <a href="admin.html">Admin</a>
          </div>
          <div>
            <h3>Legal</h3>
            <p>Privacy Policy</p>
            <p>Terms & Conditions</p>
            <p>Refund Policy</p>
            <div class="payment-badges"><span>Visa</span><span>Mastercard</span><span>UPI</span><span>Razorpay</span></div>
          </div>
        </div>
        <div class="container footer-newsletter">
          <div>
            <span class="eyebrow">Newsletter</span>
            <h3>Unlock new drops and premium offers</h3>
          </div>
          <form id="newsletter-form" class="newsletter-form"><input type="email" placeholder="Enter your email" required /><button class="button button-primary" type="submit">Subscribe</button></form>
        </div>
        <div class="container footer-bottom"><span>© ${new Date().getFullYear()} WISHTICO. All rights reserved.</span><span>${isDemoMode ? 'Offline demo mode enabled.' : 'Live Firebase mode enabled.'}</span></div>
      </footer>
      <div class="toast-stack" id="toast-stack" aria-live="polite"></div>`;
  }
}

function initChromeEvents() {
  document.querySelectorAll('[data-open-mobile]').forEach((button) => button.addEventListener('click', () => togglePanel('mobilePanel', true)));
  document.querySelectorAll('[data-close-mobile]').forEach((button) => button.addEventListener('click', () => togglePanel('mobilePanel', false)));
  document.querySelectorAll('[data-open-cart]').forEach((button) => button.addEventListener('click', () => togglePanel('cartDrawer', true)));
  document.querySelectorAll('[data-close-cart]').forEach((button) => button.addEventListener('click', () => togglePanel('cartDrawer', false)));
  document.querySelectorAll('[data-open-search]').forEach((button) => button.addEventListener('click', () => {
    togglePanel('searchOverlay', true);
    wait(50).then(() => byId('search-input')?.focus());
  }));
  document.querySelectorAll('[data-close-search]').forEach((button) => button.addEventListener('click', () => togglePanel('searchOverlay', false)));
  document.querySelectorAll('[data-logout-button]').forEach((button) => button.addEventListener('click', async () => {
    await signOutUser();
    showToast('Logged out successfully.');
    if (page === 'admin') window.location.href = 'login.html?redirect=admin.html';
  }));
  byId('newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    showToast('Thanks for joining the WISHTICO private list.');
  });
  byId('search-input')?.addEventListener('input', debounce(renderSearchResults, 180));
  document.querySelector('[data-account-toggle]')?.addEventListener('click', (event) => {
    event.currentTarget.parentElement.classList.toggle('is-open');
  });
  const header = byId('siteHeader');
  const handleScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

function togglePanel(id, open) {
  const panel = byId(id);
  if (!panel) return;
  panel.classList.toggle('is-open', open);
  panel.setAttribute('aria-hidden', String(!open));
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function initRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
}

function renderSearchResults() {
  const root = byId('search-results');
  const input = byId('search-input');
  if (!root || !input) return;
  const term = input.value.trim().toLowerCase();
  if (!term) {
    root.innerHTML = `<p class="empty-copy">Search premium shirts, pants, jackets, tees, and combo offers.</p>`;
    return;
  }
  const matches = state.products
    .filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(term))
    .slice(0, 6);
  root.replaceChildren();
  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-copy';
    empty.textContent = `No products matched “${input.value.trim()}”.`;
    root.appendChild(empty);
    return;
  }
  matches.forEach((product) => {
    const link = document.createElement('a');
    link.className = 'search-item';
    link.href = `product.html?id=${encodeURIComponent(product.id)}`;
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    const content = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = product.name;
    const meta = document.createElement('span');
    meta.textContent = `${product.category} · ${formatPrice(product.price)}`;
    content.append(title, meta);
    link.append(image, content);
    root.appendChild(link);
  });
}

async function loadCatalogData() {
  const [products, categories, reviews, coupons] = await Promise.all([getProducts(), getCategories(), getReviews(), getCoupons()]);
  state.products = products.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  state.categories = categories.length ? categories : CATEGORY_ORDER.map((name) => ({ id: toSlug(name), name, slug: toSlug(name), image: state.products.find((product) => product.category === name)?.image || '' }));
  state.reviews = reviews.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  state.coupons = coupons;
}

async function syncCartFromSource() {
  state.appliedCoupon = getCouponCode();
  if (!state.user?.uid) {
    state.cart = getGuestCart();
    return;
  }
  const remoteCart = await getCart(state.user.uid);
  const guestItems = getGuestCart();
  const merged = [...remoteCart.items];
  guestItems.forEach((guestItem) => {
    const existing = merged.find((item) => item.id === guestItem.id && item.size === guestItem.size && item.color === guestItem.color);
    if (existing) existing.quantity += Number(guestItem.quantity || 1);
    else merged.push(guestItem);
  });
  state.cart = merged;
  await saveCart(state.user.uid, merged);
  saveGuestCart([]);
}

async function persistCart() {
  if (state.user?.uid) await saveCart(state.user.uid, state.cart);
  else saveGuestCart(state.cart);
  renderCartSurfaces();
  updateHeaderBadges();
}

function addToCart(product, overrides = {}) {
  const item = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image: product.image,
    size: overrides.size || product.sizes?.[0] || DEFAULT_PRODUCT_SIZE,
    color: overrides.color || product.colors?.[0]?.hex || DEFAULT_PRODUCT_COLOR.hex,
    colorName: overrides.colorName || product.colors?.[0]?.name || DEFAULT_PRODUCT_COLOR.name,
    quantity: Number(overrides.quantity || 1)
  };
  const existing = state.cart.find((entry) => entry.id === item.id && entry.size === item.size && entry.color === item.color);
  if (existing) existing.quantity += item.quantity;
  else state.cart.push(item);
  persistCart();
  showToast(`${product.name} added to cart.`);
}

function updateCartItem(id, size, color, change) {
  state.cart = state.cart
    .map((item) => (item.id === id && item.size === size && item.color === color ? { ...item, quantity: Math.max(1, Number(item.quantity || 1) + change) } : item));
  persistCart();
}

function removeCartItem(id, size, color) {
  state.cart = state.cart.filter((item) => !(item.id === id && item.size === size && item.color === color));
  persistCart();
}

function clearCart() {
  state.cart = [];
  persistCart();
}

function toggleWishlist(productId) {
  const ids = getWishlistIds();
  const next = ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
  saveWishlistIds(next);
  updateHeaderBadges();
  renderPage();
}

function productCard(product) {
  const wished = getWishlistIds().includes(product.id);
  return `
    <article class="product-card reveal">
      <div class="product-card__media">
        <span class="discount-badge">-${getDiscount(product)}%</span>
        <button class="wishlist-button ${wished ? 'is-active' : ''}" type="button" data-toggle-wishlist="${product.id}" aria-label="Wishlist">${icon.heart}</button>
        <img src="${product.image}" alt="${product.name}" />
        <img src="${product.images?.[1] || product.image}" alt="${product.name} alternate view" />
        <div class="product-card__overlay">
          <button class="button button-primary" type="button" data-add-to-cart="${product.id}">Quick Add to Cart</button>
        </div>
      </div>
      <div class="product-card__body">
        <div>
          <p class="product-card__meta">${product.category}</p>
          <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
        </div>
        <div class="price-row"><strong>${formatPrice(product.price)}</strong><s>${formatPrice(product.originalPrice)}</s></div>
        <div class="product-card__footer"><span>${icon.star} ${averageRating(product.id).toFixed(1)} · ${reviewCount(product.id)} reviews</span><a class="text-link" href="product.html?id=${product.id}">View</a></div>
      </div>
    </article>`;
}

function reviewCard(review, stagger = 0) {
  const product = state.products.find((item) => item.id === review.productId);
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently';
  return `
    <article class="review-card reveal" style="transition-delay:${stagger}ms">
      <div class="review-card__head">
        <div class="avatar">${review.userName?.charAt(0) || 'W'}</div>
        <div><strong>${review.userName}</strong><span>${icon.star.repeat(Number(review.rating || 0))}</span></div>
      </div>
      <h3>${review.title}</h3>
      <p>${review.message}</p>
      <div class="review-card__foot"><a href="product.html?id=${review.productId}">${product?.name || 'Product'}</a><span>${date}</span></div>
    </article>`;
}

function collectionCard(category) {
  return `
    <article class="collection-card reveal">
      <img src="${category.image}" alt="${category.name}" />
      <div class="collection-card__overlay">
        <h3>${category.name}</h3>
        <a href="collections.html?category=${encodeURIComponent(category.name)}">Shop now</a>
      </div>
    </article>`;
}

function renderHomePage() {
  byId('featured-collections').innerHTML = state.categories.slice(0, 7).map(collectionCard).join('');
  byId('trending-products').innerHTML = state.products.filter((product) => product.trending).slice(0, 8).map(productCard).join('');
  byId('combo-products').innerHTML = state.products.filter((product) => product.category === 'Combo Offers').slice(0, 4).map(productCard).join('');
  byId('home-reviews').innerHTML = state.reviews.slice(0, 3).map((review, index) => reviewCard(review, index * 80)).join('');
}

function renderCollectionFilters(filteredProducts) {
  const categoryRoot = byId('category-filter-list');
  const sizeRoot = byId('size-filter-group');
  const colorRoot = byId('color-filter-group');
  if (!categoryRoot || !sizeRoot || !colorRoot) return;
  categoryRoot.innerHTML = ['All', ...CATEGORY_ORDER]
    .map((category) => {
      const count = category === 'All' ? state.products.length : state.products.filter((product) => product.category === category).length;
      return `<button class="filter-option ${state.collectionFilters.category === category ? 'is-active' : ''}" type="button" data-filter-category="${category}">${category}<span>${count}</span></button>`;
    })
    .join('');
  sizeRoot.innerHTML = SIZE_ORDER.map((size) => `<button class="chip ${state.collectionFilters.size === size ? 'is-active' : ''}" type="button" data-filter-size="${size}">${size}</button>`).join('');
  const colors = [...new Map(state.products.flatMap((product) => product.colors || []).map((color) => [color.hex, color])).values()];
  colorRoot.innerHTML = colors
    .map(
      (color) => `<button class="swatch ${state.collectionFilters.color === color.hex ? 'is-active' : ''}" type="button" style="--swatch:${color.hex}" data-filter-color="${color.hex}" aria-label="${color.name}"></button>`
    )
    .join('');
  byId('price-range').value = String(state.collectionFilters.price);
  byId('price-range-output').textContent = `Up to ${formatPrice(state.collectionFilters.price)}`;
  byId('sort-select').value = state.collectionFilters.sort;
  byId('collection-count').textContent = String(filteredProducts.length);
}

function filterCollectionProducts() {
  let filtered = [...state.products];
  if (params.get('view') === 'wishlist') {
    const wishes = getWishlistIds();
    filtered = filtered.filter((product) => wishes.includes(product.id));
  }
  if (state.collectionFilters.category !== 'All') filtered = filtered.filter((product) => product.category === state.collectionFilters.category);
  if (state.collectionFilters.size) filtered = filtered.filter((product) => product.sizes?.includes(state.collectionFilters.size));
  if (state.collectionFilters.color) filtered = filtered.filter((product) => product.colors?.some((color) => color.hex === state.collectionFilters.color));
  filtered = filtered.filter((product) => Number(product.price) <= Number(state.collectionFilters.price));
  switch (state.collectionFilters.sort) {
    case 'newest':
      filtered.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      break;
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    default:
      filtered.sort((a, b) => Number(b.trending) - Number(a.trending));
      break;
  }
  return filtered;
}

function renderCollectionsPage() {
  const filtered = filterCollectionProducts();
  renderCollectionFilters(filtered);
  byId('collection-heading').textContent = params.get('view') === 'wishlist' ? 'Wishlist' : state.collectionFilters.category;
  const grid = byId('collection-grid');
  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  state.collectionPage = Math.min(state.collectionPage, totalPages);
  const products = filtered.slice((state.collectionPage - 1) * perPage, state.collectionPage * perPage);
  grid.innerHTML = products.length ? products.map(productCard).join('') : `<div class="empty-state"><h2>No matching products</h2><p>Try clearing filters or adding items to your wishlist.</p></div>`;
  byId('collection-pagination').innerHTML = Array.from({ length: totalPages }, (_, index) => `<button class="${state.collectionPage === index + 1 ? 'is-active' : ''}" type="button" data-page-index="${index + 1}">${index + 1}</button>`).join('');
  bindCollectionPageEvents();
}

function bindCollectionPageEvents() {
  document.querySelectorAll('[data-filter-category]').forEach((button) => button.addEventListener('click', () => {
    state.collectionFilters.category = button.dataset.filterCategory;
    state.collectionPage = 1;
    renderCollectionsPage();
  }));
  document.querySelectorAll('[data-filter-size]').forEach((button) => button.addEventListener('click', () => {
    state.collectionFilters.size = state.collectionFilters.size === button.dataset.filterSize ? '' : button.dataset.filterSize;
    state.collectionPage = 1;
    renderCollectionsPage();
  }));
  document.querySelectorAll('[data-filter-color]').forEach((button) => button.addEventListener('click', () => {
    state.collectionFilters.color = state.collectionFilters.color === button.dataset.filterColor ? '' : button.dataset.filterColor;
    state.collectionPage = 1;
    renderCollectionsPage();
  }));
  if (byId('price-range')) byId('price-range').oninput = (event) => {
    state.collectionFilters.price = Number(event.target.value);
    byId('price-range-output').textContent = `Up to ${formatPrice(state.collectionFilters.price)}`;
  };
  if (byId('sort-select')) byId('sort-select').onchange = (event) => {
    state.collectionFilters.sort = event.target.value;
    renderCollectionsPage();
  };
  if (byId('apply-filters')) byId('apply-filters').onclick = () => renderCollectionsPage();
  if (byId('clear-filters')) byId('clear-filters').onclick = () => {
    state.collectionFilters = { category: params.get('category') || 'All', size: '', color: '', price: 4999, sort: 'popular' };
    state.collectionPage = 1;
    renderCollectionsPage();
  };
  document.querySelectorAll('[data-page-index]').forEach((button) => button.addEventListener('click', () => {
    state.collectionPage = Number(button.dataset.pageIndex);
    renderCollectionsPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));
}

function renderProductPage() {
  const product = state.products.find((item) => item.id === params.get('id')) || state.products[0];
  if (!product) return;
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  const sizes = product.sizes?.length ? product.sizes : [DEFAULT_PRODUCT_SIZE];
  const colors = product.colors?.length ? product.colors : [DEFAULT_PRODUCT_COLOR];
  const reviews = state.reviews.filter((review) => review.productId === product.id && review.approved !== false);
  byId('product-breadcrumb') && (byId('product-breadcrumb').textContent = `Home / Collections / ${product.category} / ${product.name}`);
  byId('tab-description') && (byId('tab-description').innerHTML = `<div class="content-card"><p>${product.description}</p></div>`);
  byId('product-review-grid') && (byId('product-review-grid').innerHTML = reviews.length ? reviews.map((review, index) => reviewCard(review, index * 80)).join('') : `<div class="empty-state"><h2>No reviews yet</h2><p>Be the first to review this product.</p></div>`);
  byId('product-detail-root').innerHTML = `
    <div class="product-layout">
      <div class="product-gallery reveal">
        <div class="product-gallery__main"><img id="product-main-image" src="${product.image}" alt="${product.name}" /></div>
        <div class="product-gallery__thumbs">${images.map((image, index) => `<button type="button" data-product-thumb="${image}" class="${index === 0 ? 'is-active' : ''}"><img src="${image}" alt="${product.name} view ${index + 1}" /></button>`).join('')}</div>
      </div>
      <div class="product-summary reveal">
        <span class="eyebrow">${product.category}</span>
        <h1>${product.name}</h1>
        <div class="rating-row"><span>${icon.star} ${averageRating(product.id).toFixed(1)}</span><span>${reviewCount(product.id)} reviews</span></div>
        <div class="price-row"><strong>${formatPrice(product.price)}</strong><s>${formatPrice(product.originalPrice)}</s><span class="pill">Save ${getDiscount(product)}%</span></div>
        <div>
          <h3>Color</h3>
          <div class="swatch-group">${colors.map((color, index) => `<button class="swatch ${index === 0 ? 'is-active' : ''}" type="button" style="--swatch:${color.hex}" data-product-color="${color.hex}" data-product-color-name="${color.name}"></button>`).join('')}</div>
        </div>
        <div>
          <h3>Size</h3>
          <div class="chip-group">${sizes.map((size, index) => `<button class="chip ${index === 0 ? 'is-active' : ''}" type="button" data-product-size="${size}">${size}</button>`).join('')}</div>
        </div>
        <div>
          <h3>Quantity</h3>
          <div class="quantity-stepper"><button type="button" data-product-qty="-1">−</button><span id="product-qty">1</span><button type="button" data-product-qty="1">+</button></div>
        </div>
        <div class="button-group">
          <button class="button button-primary" type="button" id="product-add-cart">ADD TO CART</button>
          <button class="button button-secondary" type="button" id="product-buy-now">BUY NOW</button>
        </div>
        <div class="trust-row"><span>Free Shipping</span><span>Easy Returns</span><span>Secure Payment</span></div>
      </div>
    </div>`;
  const selected = { size: sizes[0], color: colors[0]?.hex, colorName: colors[0]?.name, quantity: 1 };
  document.querySelectorAll('[data-product-thumb]').forEach((button) => button.addEventListener('click', () => {
    if (byId('product-main-image')) byId('product-main-image').src = button.dataset.productThumb;
    document.querySelectorAll('[data-product-thumb]').forEach((thumb) => thumb.classList.remove('is-active'));
    button.classList.add('is-active');
  }));
  document.querySelectorAll('[data-product-size]').forEach((button) => button.addEventListener('click', () => {
    selected.size = button.dataset.productSize;
    document.querySelectorAll('[data-product-size]').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
  }));
  document.querySelectorAll('[data-product-color]').forEach((button) => button.addEventListener('click', () => {
    selected.color = button.dataset.productColor;
    selected.colorName = button.dataset.productColorName;
    document.querySelectorAll('[data-product-color]').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
  }));
  document.querySelectorAll('[data-product-qty]').forEach((button) => button.addEventListener('click', () => {
    selected.quantity = Math.max(1, selected.quantity + Number(button.dataset.productQty));
    byId('product-qty') && (byId('product-qty').textContent = String(selected.quantity));
  }));
  byId('product-add-cart')?.addEventListener('click', () => addToCart(product, selected));
  byId('product-buy-now')?.addEventListener('click', () => {
    addToCart(product, selected);
    window.location.href = state.user ? 'checkout.html' : `login.html?redirect=${encodeURIComponent('checkout.html')}`;
  });
  byId('related-products') && (byId('related-products').innerHTML = state.products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4).map(productCard).join(''));
  document.querySelectorAll('[data-tab-target]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-tab-target]').forEach((node) => node.classList.remove('is-active'));
    document.querySelectorAll('.tab-panel').forEach((node) => node.classList.remove('is-active'));
    button.classList.add('is-active');
    byId(`tab-${button.dataset.tabTarget}`)?.classList.add('is-active');
  }));
}

async function applyCouponAndRenderSummary(prefix, items = state.cart) {
  const coupon = state.appliedCoupon || getCouponCode();
  let couponResult = null;
  if (coupon) couponResult = await validateCoupon(coupon, items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const totals = cartTotals(items, couponResult?.valid ? couponResult : null);
  byId(`${prefix}-subtotal`) && (byId(`${prefix}-subtotal`).textContent = formatPrice(totals.subtotal));
  byId(`${prefix}-delivery`) && (byId(`${prefix}-delivery`).textContent = formatPrice(totals.delivery));
  byId(`${prefix}-discount`) && (byId(`${prefix}-discount`).textContent = `-${formatPrice(totals.discount)}`);
  byId(`${prefix}-total`) && (byId(`${prefix}-total`).textContent = formatPrice(totals.total));
  if (prefix === 'cart') byId('drawer-total') && (byId('drawer-total').textContent = formatPrice(totals.total));
  return { totals, couponResult };
}

function cartItemMarkup(item, compact = false) {
  return `
    <article class="cart-item ${compact ? 'cart-item--compact' : ''}">
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item__content">
        <div class="cart-item__head">
          <div><strong>${item.name}</strong><span>Size ${item.size} · ${item.colorName}</span></div>
          <strong>${formatPrice(item.price)}</strong>
        </div>
        <div class="cart-item__foot">
          <div class="quantity-stepper quantity-stepper--small"><button type="button" data-cart-change="-1" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">−</button><span>${item.quantity}</span><button type="button" data-cart-change="1" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">+</button></div>
          ${compact ? '' : `<button class="text-link button-reset" type="button" data-cart-remove data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">Remove</button>`}
        </div>
      </div>
    </article>`;
}

function renderCartSurfaces() {
  const empty = `<div class="empty-state"><h2>Your cart is empty</h2><p>Add premium WISHTICO pieces to continue.</p></div>`;
  byId('cart-drawer-items') && (byId('cart-drawer-items').innerHTML = state.cart.length ? state.cart.map((item) => cartItemMarkup(item)).join('') : empty);
  byId('cart-page-items') && (byId('cart-page-items').innerHTML = state.cart.length ? state.cart.map((item) => cartItemMarkup(item)).join('') : empty);
  byId('checkout-items') && (byId('checkout-items').innerHTML = state.cart.length ? state.cart.map((item) => cartItemMarkup(item, true)).join('') : empty);
  updateHeaderBadges();
  applyCouponAndRenderSummary('cart');
  applyCouponAndRenderSummary('checkout');
}

async function renderCartPage() {
  byId('coupon-code').value = getCouponCode();
  renderCartSurfaces();
  if (byId('apply-coupon')) byId('apply-coupon').onclick = async () => {
    const code = byId('coupon-code').value.trim().toUpperCase();
    saveCouponCode(code);
    const result = await validateCoupon(code, state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
    showToast(result.valid ? `${result.coupon.code} applied.` : result.message);
    renderCartSurfaces();
  };
  if (byId('checkout-button')) byId('checkout-button').onclick = (event) => {
    if (!state.user) {
      event.preventDefault();
      window.location.href = `login.html?redirect=${encodeURIComponent('checkout.html')}`;
    }
  };
}

// TODO: replace with real key + server-side order creation before production use.
function openRazorpay(amount) {
  if (typeof window.Razorpay !== 'function') {
    showToast('Razorpay preview is unavailable right now.');
    return;
  }
  const instance = new window.Razorpay({
    key: 'rzp_test_XXXXXXXX',
    amount: Math.round(amount * 100),
    currency: 'INR',
    name: 'WISHTICO',
    description: 'Premium fashion order preview',
    order_id: 'order_demo_wishtico_12345',
    handler: () => showToast('Razorpay placeholder completed.')
  });
  instance.open();
}
window.openRazorpay = openRazorpay;

async function renderOrdersForCurrentUser() {
  if (!byId('my-orders-list')) return;
  if (!state.user) {
    byId('my-orders-list').innerHTML = `<div class="empty-state"><h2>Login required</h2><p>Please login to view your order history.</p></div>`;
    return;
  }
  const orders = await getOrders(state.user.uid);
  state.orders = orders.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  byId('my-orders-list').innerHTML = state.orders.length
    ? state.orders
        .map(
          (order) => `<article class="order-card reveal"><div><strong>${order.id}</strong><p>${order.items.length} items · ${order.paymentMethod}</p></div><div><strong>${formatPrice(order.total)}</strong><span class="pill pill--dark">${order.status}</span></div></article>`
        )
        .join('')
    : `<div class="empty-state"><h2>No orders yet</h2><p>Your future WISHTICO orders will appear here.</p></div>`;
}

async function renderCheckoutPage() {
  if (!state.user) {
    window.location.href = `login.html?redirect=${encodeURIComponent('checkout.html')}`;
    return;
  }
  renderCartSurfaces();
  const form = byId('checkout-form');
  if (byId('pay-razorpay')) byId('pay-razorpay').onclick = async () => {
    const { totals } = await applyCouponAndRenderSummary('checkout');
    openRazorpay(totals.total || 1);
  };
  if (form) form.onsubmit = async (event) => {
    event.preventDefault();
    if (!state.cart.length) {
      showToast('Your cart is empty.');
      return;
    }
    const details = readFormJson(form);
    const { totals } = await applyCouponAndRenderSummary('checkout');
    const order = await createOrder({
      userId: state.user.uid,
      items: state.cart,
      subtotal: totals.subtotal,
      discount: totals.discount,
      delivery: totals.delivery,
      total: totals.total,
      address: details,
      paymentMethod: details.paymentMethod,
      status: 'pending'
    });
    clearCart();
    showOrderSuccess(order);
    await renderOrdersForCurrentUser();
  };
  await renderOrdersForCurrentUser();
}

function showOrderSuccess() {
  const overlay = byId('order-success');
  const confettiRoot = byId('confetti-root');
  if (!overlay || !confettiRoot) return;
  overlay.classList.add('is-visible');
  overlay.setAttribute('aria-hidden', 'false');
  confettiRoot.innerHTML = Array.from({ length: 24 }, (_, index) => `<span style="--x:${Math.random() * 100}%;--delay:${index * 40}ms"></span>`).join('');
  byId('view-order-button')?.addEventListener('click', () => {
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    window.location.hash = 'my-orders';
  }, { once: true });
}

function passwordToggleSetup() {
  document.querySelectorAll('[data-password-toggle]').forEach((button) => button.addEventListener('click', () => {
    const input = button.parentElement?.querySelector('input[name="password"]');
    if (!input) return;
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    button.textContent = reveal ? 'Hide' : 'Show';
  }));
}

function redirectAfterAuth() {
  return getSafeRedirect();
}

function renderAuthNote() {
  const note = byId('auth-demo-note');
  if (!note) return;
  note.textContent = isDemoMode ? 'Demo mode: use admin@wishtico.demo / WishTico@2026 for admin access.' : 'Use your registered WISHTICO account or Google sign-in.';
}

function renderLoginPage() {
  renderAuthNote();
  syncAuthSwitchLinks();
  passwordToggleSetup();
  if (state.user) {
    window.location.replace(redirectAfterAuth());
    return;
  }
  if (byId('login-form')) byId('login-form').onsubmit = async (event) => {
    event.preventDefault();
    const form = readFormJson(event.currentTarget);
    const email = String(form.email || '').trim();
    const password = String(form.password || '');
    if (!email || !password) {
      setAuthFeedback('Please enter your email and password.');
      return;
    }
    setAuthFeedback();
    try {
      await signIn(email, password);
      window.location.href = redirectAfterAuth();
    } catch (error) {
      console.error('Login failed.', error);
      setAuthFeedback(getFriendlyAuthMessage(error, 'Unable to login.'));
    }
  };
  if (byId('google-login')) byId('google-login').onclick = async () => {
    setAuthFeedback();
    try {
      await signInGoogle();
      window.location.href = redirectAfterAuth();
    } catch (error) {
      console.error('Google sign-in failed.', error);
      setAuthFeedback(getFriendlyAuthMessage(error, 'Google sign-in failed.'));
    }
  };
}

function renderSignupPage() {
  syncAuthSwitchLinks();
  passwordToggleSetup();
  if (state.user) {
    window.location.replace(redirectAfterAuth());
    return;
  }
  if (byId('signup-form')) byId('signup-form').onsubmit = async (event) => {
    event.preventDefault();
    const form = readFormJson(event.currentTarget);
    const name = String(form.name || '').trim();
    const email = String(form.email || '').trim();
    const password = String(form.password || '');
    if (!name || !email || !password) {
      setAuthFeedback('Please complete every required field.');
      return;
    }
    setAuthFeedback();
    try {
      await signUp(email, password, name);
      window.location.href = redirectAfterAuth();
    } catch (error) {
      console.error('Signup failed.', error);
      setAuthFeedback(getFriendlyAuthMessage(error, 'Unable to create account.'));
    }
  };
  if (byId('google-signup')) byId('google-signup').onclick = async () => {
    setAuthFeedback();
    try {
      await signInGoogle();
      window.location.href = redirectAfterAuth();
    } catch (error) {
      console.error('Google sign-up failed.', error);
      setAuthFeedback(getFriendlyAuthMessage(error, 'Google sign-up failed.'));
    }
  };
}

function renderContactPage() {
  const form = byId('contact-form');
  if (!form) return;
  form.onsubmit = (event) => {
    event.preventDefault();
    const details = readFormJson(form);
    const name = String(details.name || '').trim();
    const email = String(details.email || '').trim();
    const subject = String(details.subject || '').trim();
    const message = String(details.message || '').trim();
    if (!name || !email || !subject || !message) {
      showToast('Please complete all contact form fields.');
      return;
    }
    form.reset();
    showToast('Message received. Our team will reply soon.');
  };
}

function renderReviewsPage() {
  if (!byId('all-reviews-grid') || !byId('review-product')) return;
  byId('all-reviews-grid').innerHTML = state.reviews.map((review, index) => reviewCard(review, index * 70)).join('');
  byId('review-product').innerHTML = `<option value="">Select a product</option>${state.products.map((product) => `<option value="${product.id}">${product.name}</option>`).join('')}`;
  if (byId('review-form')) byId('review-form').onsubmit = async (event) => {
    event.preventDefault();
    if (!state.user) {
      window.location.href = `login.html?redirect=${encodeURIComponent('reviews.html')}`;
      return;
    }
    await addReview({
      productId: byId('review-product').value,
      userId: state.user.uid,
      userName: state.user.name || 'Customer',
      rating: Number(byId('review-rating').value),
      title: byId('review-title').value,
      message: byId('review-message').value,
      approved: true
    });
    showToast('Review submitted successfully.');
    await loadCatalogData();
    renderReviewsPage();
    event.currentTarget.reset();
  };
}

async function ensureAdmin() {
  if (!state.authReady) return false;
  if (!state.user) {
    window.location.href = `login.html?redirect=${encodeURIComponent('admin.html')}`;
    return false;
  }
  let profile = null;
  let profileFetchFailed = false;
  try {
    profile = await getUserProfile(state.user.uid);
  } catch (error) {
    profileFetchFailed = true;
    console.error('Failed to load admin profile.', error);
  }
  const resolvedUser = { ...state.user, ...(profile || {}) };
  state.user = resolvedUser;
  const hasAdminAccess = isAdminUser(resolvedUser);
  if (profileFetchFailed) {
    if (!hasAdminAccess) {
      showToast('We could not verify admin access right now. Please refresh and try again.');
      return false;
    }
  } else if (!hasAdminAccess) {
    showToast('Admin access only.');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function bindAdminTabs() {
  document.querySelectorAll('[data-admin-tab]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-admin-tab]').forEach((item) => item.classList.remove('is-active'));
    document.querySelectorAll('.admin-panel').forEach((panel) => panel.classList.remove('is-active'));
    button.classList.add('is-active');
    byId(`admin-panel-${button.dataset.adminTab}`).classList.add('is-active');
  }));
}

async function loadAdminData() {
  const [orders, users] = await Promise.all([getOrders(), getUsers()]);
  state.orders = orders.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  state.users = users;
}

function renderDashboardStats() {
  const totalSales = state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const revenueToday = state.orders.filter((order) => String(order.createdAt || '').slice(0, 10) === today).reduce((sum, order) => sum + Number(order.total || 0), 0);
  byId('dashboard-stats').innerHTML = [
    ['Total Sales', formatPrice(totalSales)],
    ['Revenue Today', formatPrice(revenueToday)],
    ['Total Orders', state.orders.length],
    ['Total Customers', state.users.length],
    ['Total Products', state.products.length]
  ]
    .map(([label, value]) => `<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`)
    .join('');
  byId('recent-orders-body').innerHTML = state.orders.slice(0, 6).map((order) => `<tr><td>${order.id}</td><td>${order.address?.name || 'Customer'}</td><td>${formatPrice(order.total)}</td><td><span class="pill">${order.status}</span></td></tr>`).join('') || '<tr><td colspan="4">No orders yet.</td></tr>';
  const todayDate = new Date();
  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
  const dayValues = chartDays.map((day) => ({ day, value: state.orders.filter((order) => String(order.createdAt || '').slice(0, 10) === day).reduce((sum, order) => sum + Number(order.total || 0), 0) }));
  const maxValue = Math.max(...dayValues.map((entry) => entry.value), 1);
  byId('revenue-chart').innerHTML = dayValues.map((entry) => `<div class="chart-bar"><span style="height:${(entry.value / maxValue) * 100}%"></span><strong>${new Date(entry.day).toLocaleDateString('en-IN', { weekday: 'short' })}</strong><small>${formatPrice(entry.value)}</small></div>`).join('');
}

function renderAdminProducts() {
  byId('admin-products-body').innerHTML = state.products
    .map(
      (product) => `<tr><td><div class="table-product"><img src="${product.image}" alt="${product.name}" /><div><strong>${product.name}</strong><span>${product.id}</span></div></div></td><td>${product.category}</td><td>${formatPrice(product.price)}</td><td>${product.stock}</td><td>${product.stock > 0 ? 'Active' : 'Out of stock'}</td><td><div class="table-actions"><button type="button" data-edit-product="${product.id}">Edit</button><button type="button" data-delete-product="${product.id}">Delete</button></div></td></tr>`
    )
    .join('');
}

function renderAdminOrders() {
  byId('admin-orders-body').innerHTML = state.orders
    .map(
      (order) => `<tr><td>${order.id}</td><td>${order.address?.name || 'Customer'}</td><td>${formatPrice(order.total)}</td><td>${order.paymentMethod}</td><td><select data-order-status="${order.id}">${['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`
    )
    .join('');
}

function renderAdminCustomers() {
  byId('admin-customers-body').innerHTML = state.users
    .map((user) => {
      const orderCount = state.orders.filter((order) => order.userId === user.uid).length;
      return `<tr><td>${user.name}</td><td>${user.email}</td><td>${user.role}</td><td>${orderCount}</td></tr>`;
    })
    .join('');
}

function renderAdminReviews() {
  byId('admin-reviews-body').innerHTML = state.reviews
    .map((review) => {
      const product = state.products.find((item) => item.id === review.productId);
      return `<tr><td>${review.userName}</td><td>${product?.name || review.productId}</td><td>${review.rating}</td><td>${review.approved ? 'Approved' : 'Pending'}</td><td><div class="table-actions"><button type="button" data-approve-review="${review.id}">${review.approved ? 'Unapprove' : 'Approve'}</button><button type="button" data-delete-review="${review.id}">Delete</button></div></td></tr>`;
    })
    .join('');
}

function renderAdminOffers() {
  byId('admin-offers-body').innerHTML = state.coupons
    .map((coupon) => `<tr><td>${coupon.code}</td><td>${coupon.percentage}%</td><td>${formatPrice(coupon.minOrder)}</td><td>${coupon.expiry}</td><td><button type="button" data-delete-coupon="${coupon.id}">Delete</button></td></tr>`)
    .join('');
}

function renderAdminCategories() {
  byId('admin-categories-body').innerHTML = state.categories
    .map((category) => `<tr><td>${category.name}</td><td>${category.slug}</td><td><button type="button" data-delete-category="${category.id}">Delete</button></td></tr>`)
    .join('');
}

function openProductModal(product = null) {
  const modal = byId('product-modal');
  byId('product-modal-title').textContent = product ? 'Edit Product' : 'Add Product';
  byId('product-id').value = product?.id || '';
  byId('product-name').value = product?.name || '';
  byId('product-description').value = product?.description || '';
  byId('product-category').innerHTML = state.categories.map((category) => `<option value="${category.name}" ${product?.category === category.name ? 'selected' : ''}>${category.name}</option>`).join('');
  byId('product-price').value = product?.price || '';
  byId('product-original-price').value = product?.originalPrice || '';
  byId('product-offer').value = product?.offerPercentage || '';
  byId('product-stock').value = product?.stock || '';
  byId('product-sizes').value = (product?.sizes || []).join(', ');
  byId('product-colors').value = (product?.colors || []).map((color) => `${color.name}:${color.hex}`).join(', ');
  byId('product-image').value = product?.image || '';
  byId('product-trending').checked = Boolean(product?.trending);
  byId('product-image-preview').innerHTML = product?.image ? `<img src="${product.image}" alt="Preview" />` : '';
  modal.showModal();
}

async function handleAdminEvents() {
  bindAdminTabs();
  renderDashboardStats();
  renderAdminProducts();
  renderAdminOrders();
  renderAdminCustomers();
  renderAdminReviews();
  renderAdminOffers();
  renderAdminCategories();
  byId('firebase-mode-copy').textContent = isDemoMode ? 'Offline demo mode is active until you replace the Firebase config.' : 'Connected to Firebase live collections.';

  byId('admin-add-product')?.addEventListener('click', () => openProductModal());
  byId('close-product-modal')?.addEventListener('click', () => byId('product-modal').close());
  byId('cancel-product-modal')?.addEventListener('click', () => byId('product-modal').close());
  byId('product-image-upload')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageUrl = await uploadProductImage(file);
    byId('product-image').value = imageUrl;
    byId('product-image-preview').innerHTML = `<img src="${imageUrl}" alt="Preview" />`;
  });
  byId('product-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = byId('product-id').value || toSlug(byId('product-name').value);
    const colors = byId('product-colors').value.split(',').map((value) => value.trim()).filter(Boolean).map((pair) => {
      const [name, hex] = pair.split(':');
      return { name: name?.trim() || 'Color', hex: hex?.trim() || '#0E0E0E' };
    });
    const payload = {
      id,
      name: byId('product-name').value.trim(),
      description: byId('product-description').value.trim(),
      category: byId('product-category').value,
      price: Number(byId('product-price').value),
      originalPrice: Number(byId('product-original-price').value),
      offerPercentage: Number(byId('product-offer').value),
      stock: Number(byId('product-stock').value),
      sizes: byId('product-sizes').value.split(',').map((item) => item.trim()).filter(Boolean),
      colors,
      image: byId('product-image').value.trim(),
      images: [byId('product-image').value.trim(), byId('product-image').value.trim()],
      trending: byId('product-trending').checked
    };
    if (byId('product-id').value) await updateProduct(id, payload);
    else await addProduct(payload);
    byId('product-modal').close();
    await loadCatalogData();
    await loadAdminData();
    await handleAdminRefresh();
    showToast('Product saved.');
  });

  document.querySelectorAll('[data-edit-product]').forEach((button) => button.addEventListener('click', () => openProductModal(state.products.find((item) => item.id === button.dataset.editProduct))));
  document.querySelectorAll('[data-delete-product]').forEach((button) => button.addEventListener('click', async () => {
    await deleteProduct(button.dataset.deleteProduct);
    await loadCatalogData();
    await loadAdminData();
    await handleAdminRefresh();
  }));
  document.querySelectorAll('[data-order-status]').forEach((select) => select.addEventListener('change', async () => {
    await updateOrderStatus(select.dataset.orderStatus, select.value);
    await loadAdminData();
    renderAdminOrders();
    renderDashboardStats();
  }));
  document.querySelectorAll('[data-approve-review]').forEach((button) => button.addEventListener('click', async () => {
    const review = state.reviews.find((item) => item.id === button.dataset.approveReview);
    await updateReviewApproval(review.id, !review.approved);
    await loadCatalogData();
    renderAdminReviews();
  }));
  document.querySelectorAll('[data-delete-review]').forEach((button) => button.addEventListener('click', async () => {
    await deleteReview(button.dataset.deleteReview);
    await loadCatalogData();
    renderAdminReviews();
  }));
  byId('offer-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = readFormJson(event.currentTarget);
    await saveCoupon({
      code: form.code.toUpperCase(),
      percentage: Number(form.percentage),
      minOrder: Number(form.minOrder),
      expiry: form.expiry,
      active: true
    });
    event.currentTarget.reset();
    state.coupons = await getCoupons();
    renderAdminOffers();
    showToast('Coupon saved.');
  });
  document.querySelectorAll('[data-delete-coupon]').forEach((button) => button.addEventListener('click', async () => {
    await deleteCoupon(button.dataset.deleteCoupon);
    state.coupons = await getCoupons();
    renderAdminOffers();
  }));
  byId('category-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = readFormJson(event.currentTarget);
    await saveCategory({ name: form.name, slug: toSlug(form.name), image: form.image });
    event.currentTarget.reset();
    state.categories = await getCategories();
    renderAdminCategories();
    showToast('Category saved.');
  });
  document.querySelectorAll('[data-delete-category]').forEach((button) => button.addEventListener('click', async () => {
    await deleteCategory(button.dataset.deleteCategory);
    state.categories = await getCategories();
    renderAdminCategories();
  }));
  byId('seed-data-button')?.addEventListener('click', async () => {
    await seedDemoData();
    await loadCatalogData();
    await loadAdminData();
    await handleAdminRefresh();
    showToast('Demo data seeded successfully.');
  });
}

async function handleAdminRefresh() {
  renderDashboardStats();
  renderAdminProducts();
  renderAdminOrders();
  renderAdminCustomers();
  renderAdminReviews();
  renderAdminOffers();
  renderAdminCategories();
  await handleAdminEventsBindingsOnly();
}

async function handleAdminEventsBindingsOnly() {
  document.querySelectorAll('[data-edit-product]').forEach((button) => button.onclick = () => openProductModal(state.products.find((item) => item.id === button.dataset.editProduct)));
  document.querySelectorAll('[data-delete-product]').forEach((button) => button.onclick = async () => {
    await deleteProduct(button.dataset.deleteProduct);
    await loadCatalogData();
    await loadAdminData();
    await handleAdminRefresh();
  });
  document.querySelectorAll('[data-order-status]').forEach((select) => select.onchange = async () => {
    await updateOrderStatus(select.dataset.orderStatus, select.value);
    await loadAdminData();
    renderAdminOrders();
    renderDashboardStats();
  });
  document.querySelectorAll('[data-approve-review]').forEach((button) => button.onclick = async () => {
    const review = state.reviews.find((item) => item.id === button.dataset.approveReview);
    await updateReviewApproval(review.id, !review.approved);
    await loadCatalogData();
    await handleAdminRefresh();
  });
  document.querySelectorAll('[data-delete-review]').forEach((button) => button.onclick = async () => {
    await deleteReview(button.dataset.deleteReview);
    await loadCatalogData();
    await handleAdminRefresh();
  });
  document.querySelectorAll('[data-delete-coupon]').forEach((button) => button.onclick = async () => {
    await deleteCoupon(button.dataset.deleteCoupon);
    state.coupons = await getCoupons();
    await handleAdminRefresh();
  });
  document.querySelectorAll('[data-delete-category]').forEach((button) => button.onclick = async () => {
    await deleteCategory(button.dataset.deleteCategory);
    state.categories = await getCategories();
    await handleAdminRefresh();
  });
}

async function renderAdminPage() {
  if (!(await ensureAdmin())) return;
  await loadAdminData();
  bindAdminTabs();
  renderDashboardStats();
  renderAdminProducts();
  renderAdminOrders();
  renderAdminCustomers();
  renderAdminReviews();
  renderAdminOffers();
  renderAdminCategories();
  byId('firebase-mode-copy').textContent = isDemoMode ? 'Offline demo mode is active until you replace the Firebase config.' : 'Connected to Firebase live collections.';
  await handleAdminEvents();
}

function bindGlobalActions() {
  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-to-cart]');
    if (addButton) {
      const product = state.products.find((item) => item.id === addButton.dataset.addToCart);
      if (product) addToCart(product);
    }
    const wishButton = event.target.closest('[data-toggle-wishlist]');
    if (wishButton) toggleWishlist(wishButton.dataset.toggleWishlist);
    const changeButton = event.target.closest('[data-cart-change]');
    if (changeButton) updateCartItem(changeButton.dataset.id, changeButton.dataset.size, changeButton.dataset.color, Number(changeButton.dataset.cartChange));
    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) removeCartItem(removeButton.dataset.id, removeButton.dataset.size, removeButton.dataset.color);
  });
}

async function renderPage() {
  renderSharedChrome();
  initChromeEvents();
  renderSearchResults();
  renderCartSurfaces();
  if (page === 'home') renderHomePage();
  if (page === 'collections') renderCollectionsPage();
  if (page === 'product') renderProductPage();
  if (page === 'cart') await renderCartPage();
  if (page === 'checkout') await renderCheckoutPage();
  if (page === 'login') renderLoginPage();
  if (page === 'signup') renderSignupPage();
  if (page === 'contact') renderContactPage();
  if (page === 'reviews') renderReviewsPage();
  if (page === 'admin') await renderAdminPage();
  initRevealAnimations();
}

document.addEventListener('DOMContentLoaded', async () => {
  saveCouponCode(getCouponCode());
  bindGlobalActions();

  let resolveInitialAuth;
  const initialAuthReady = new Promise((resolve) => {
    resolveInitialAuth = resolve;
  });

  onAuthChange(async (user) => {
    const firstAuthEvent = !state.authReady;
    const changedUser = !sameUser(state.user, user);
    if (changedUser) state.user = user;
    state.authReady = true;
    if (firstAuthEvent) resolveInitialAuth();
    if (!state.appReady || (!firstAuthEvent && !changedUser)) return;
    try {
      await syncCartFromSource();
      await renderPage();
    } catch (error) {
      console.error('Failed to refresh the page after the auth state changed.', error);
    }
  });

  try {
    await Promise.all([loadCatalogData(), initialAuthReady]);
    await syncCartFromSource();
    state.appReady = true;
    if (page === 'home') {
      await wait(850);
      byId('splashScreen')?.classList.add('is-hidden');
    }
    await renderPage();
  } catch (error) {
    console.error('Failed to initialize WISHTICO.', error);
    renderSharedChrome();
    initChromeEvents();
    renderCartSurfaces();
    showToast('The page could not finish loading. Please refresh and try again.');
  }
});
