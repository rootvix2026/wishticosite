import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { DEMO_CATEGORIES, DEMO_OFFERS, DEMO_PRODUCTS, DEMO_REVIEWS, DEMO_USERS } from './seed.js';

// TODO: Replace every field in this placeholder config with your own Firebase Web App config.
// The site will automatically fall back to offline demo mode until real values are provided.
const firebaseConfig = {
    apiKey: "AIzaSyCksq5rDnqypS5_OtZMYqjeg6dwN4x7Zuo",
    authDomain: "wishtico-4fcf0.firebaseapp.com",
    projectId: "wishtico-4fcf0",
    storageBucket: "wishtico-4fcf0.firebasestorage.app",
    messagingSenderId: "1058742857837",
    appId: "1:1058742857837:web:4e81db1c5e075f72eecf64",
    measurementId: "G-YV4HLLHGQN"
  };

const DEMO_DB_KEY = 'wishtico-demo-db-v1';
const DEMO_AUTH_KEY = 'wishtico-demo-auth-v1';
const demoListeners = new Set();
const provider = new GoogleAuthProvider();

export const isDemoMode = Object.values(firebaseConfig).some((value) => String(value).startsWith('REPLACE_WITH_YOUR'));
export const app = isDemoMode ? null : initializeApp(firebaseConfig);
export const db = isDemoMode ? null : getFirestore(app);
export const auth = isDemoMode ? null : getAuth(app);
export const storage = isDemoMode ? null : getStorage(app);
let persistencePromise = null;

const generateId = (prefix = 'item') => {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint32Array(2);
    globalThis.crypto.getRandomValues(bytes);
    return `${prefix}-${Array.from(bytes, (value) => value.toString(36)).join('')}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
};
const slugify = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const clone = (value) => JSON.parse(JSON.stringify(value));
const nowIso = () => new Date().toISOString();

if (isDemoMode) {
  console.warn('WISHTICO is running in offline demo mode. Replace the placeholder firebaseConfig values in firebase.js to enable live Firebase data.');
}

async function ensureAuthPersistence() {
  if (isDemoMode || !auth) return true;
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Failed to enable Firebase auth persistence.', error);
      persistencePromise = null;
      throw error;
    });
  }
  return persistencePromise;
}

function loadDemoDb() {
  const existing = localStorage.getItem(DEMO_DB_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      localStorage.removeItem(DEMO_DB_KEY);
    }
  }

  const initial = {
    products: clone(DEMO_PRODUCTS),
    categories: clone(DEMO_CATEGORIES),
    reviews: clone(DEMO_REVIEWS),
    offers: clone(DEMO_OFFERS),
    orders: [],
    carts: {},
    users: clone(DEMO_USERS)
  };
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(initial));
  return initial;
}

function saveDemoDb(data) {
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(data));
}

function setDemoAuth(user) {
  if (user) {
    localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_AUTH_KEY);
  }
  demoListeners.forEach((callback) => callback(user));
}

function getDemoAuth() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}

function mapUserProfile(record) {
  if (!record) return null;
  const { password, ...profile } = record;
  return profile;
}

async function demoRead(name) {
  return clone(loadDemoDb()[name]);
}

async function readCollection(name) {
  if (isDemoMode) return demoRead(name);
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

export async function getProducts(filters = {}) {
  const products = await readCollection('products');
  return products.filter((product) => {
    if (filters.trending === true && !product.trending) return false;
    if (filters.category && filters.category !== 'All' && product.category !== filters.category) return false;
    return true;
  });
}

export async function getProduct(id) {
  if (isDemoMode) {
    const products = await demoRead('products');
    return products.find((item) => item.id === id) || null;
  }
  const snapshot = await getDoc(doc(db, 'products', id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function addProduct(data) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    const product = { ...data, id: data.id || slugify(data.name) || generateId('product'), createdAt: data.createdAt || nowIso() };
    demoDb.products.unshift(product);
    saveDemoDb(demoDb);
    return product;
  }
  const payload = { ...data, createdAt: serverTimestamp() };
  const refDoc = await addDoc(collection(db, 'products'), payload);
  return { id: refDoc.id, ...payload };
}

export async function updateProduct(id, data) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    demoDb.products = demoDb.products.map((item) => (item.id === id ? { ...item, ...data } : item));
    saveDemoDb(demoDb);
    return true;
  }
  await updateDoc(doc(db, 'products', id), data);
  return true;
}

export async function deleteProduct(id) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    demoDb.products = demoDb.products.filter((item) => item.id !== id);
    saveDemoDb(demoDb);
    return true;
  }
  await deleteDoc(doc(db, 'products', id));
  return true;
}

export async function getOrders(uid) {
  if (isDemoMode) {
    const orders = await demoRead('orders');
    return uid ? orders.filter((item) => item.userId === uid) : orders;
  }
  const target = uid ? query(collection(db, 'orders'), where('userId', '==', uid)) : collection(db, 'orders');
  const snapshot = await getDocs(target);
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

export async function createOrder(data) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    const order = { id: generateId('order'), status: 'pending', createdAt: nowIso(), ...data };
    demoDb.orders.unshift(order);
    saveDemoDb(demoDb);
    return order;
  }
  const payload = { ...data, status: data.status || 'pending', createdAt: serverTimestamp() };
  const refDoc = await addDoc(collection(db, 'orders'), payload);
  return { id: refDoc.id, ...payload };
}

export async function updateOrderStatus(id, status) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    demoDb.orders = demoDb.orders.map((item) => (item.id === id ? { ...item, status } : item));
    saveDemoDb(demoDb);
    return true;
  }
  await updateDoc(doc(db, 'orders', id), { status });
  return true;
}

export async function getReviews(productId, includePending = false) {
  const reviews = isDemoMode ? await demoRead('reviews') : (await readCollection('reviews'));
  return reviews.filter((review) => {
    if (productId && review.productId !== productId) return false;
    if (!includePending && review.approved === false) return false;
    return true;
  });
}

export async function addReview(data) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    const review = { id: generateId('review'), approved: true, createdAt: nowIso(), ...data };
    demoDb.reviews.unshift(review);
    saveDemoDb(demoDb);
    return review;
  }
  const payload = { ...data, approved: data.approved ?? true, createdAt: serverTimestamp() };
  const refDoc = await addDoc(collection(db, 'reviews'), payload);
  return { id: refDoc.id, ...payload };
}

export async function deleteReview(id) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    demoDb.reviews = demoDb.reviews.filter((item) => item.id !== id);
    saveDemoDb(demoDb);
    return true;
  }
  await deleteDoc(doc(db, 'reviews', id));
  return true;
}

export async function updateReviewApproval(id, approved) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    demoDb.reviews = demoDb.reviews.map((item) => (item.id === id ? { ...item, approved } : item));
    saveDemoDb(demoDb);
    return true;
  }
  await updateDoc(doc(db, 'reviews', id), { approved });
  return true;
}

export async function getCart(uid) {
  if (!uid) return { uid: '', items: [], updatedAt: nowIso() };
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    return clone(demoDb.carts[uid] || { uid, items: [], updatedAt: nowIso() });
  }
  const snapshot = await getDoc(doc(db, 'carts', uid));
  return snapshot.exists() ? snapshot.data() : { uid, items: [], updatedAt: nowIso() };
}

export async function saveCart(uid, items) {
  if (!uid) return { uid: '', items };
  const payload = { uid, items, updatedAt: isDemoMode ? nowIso() : serverTimestamp() };
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    demoDb.carts[uid] = payload;
    saveDemoDb(demoDb);
    return payload;
  }
  await setDoc(doc(db, 'carts', uid), payload);
  return payload;
}

export async function signUp(email, password, name) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    if (demoDb.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const record = { uid: generateId('user'), name, email, password, role: 'customer', createdAt: nowIso() };
    demoDb.users.push(record);
    saveDemoDb(demoDb);
    const profile = mapUserProfile(record);
    setDemoAuth(profile);
    return profile;
  }
  await ensureAuthPersistence();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    role: 'customer',
    createdAt: serverTimestamp()
  });
  return credential.user;
}

export async function signIn(email, password) {
  if (isDemoMode) {
    const user = loadDemoDb().users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
    if (!user) throw new Error('Invalid email or password.');
    const profile = mapUserProfile(user);
    setDemoAuth(profile);
    return profile;
  }
  await ensureAuthPersistence();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInGoogle() {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    let user = demoDb.users.find((item) => item.email === 'google@wishtico.demo');
    if (!user) {
      user = {
        uid: generateId('google'),
        name: 'Google Shopper',
        email: 'google@wishtico.demo',
        password: '',
        role: 'customer',
        createdAt: nowIso()
      };
      demoDb.users.push(user);
      saveDemoDb(demoDb);
    }
    const profile = mapUserProfile(user);
    setDemoAuth(profile);
    return profile;
  }
  await ensureAuthPersistence();
  const credential = await signInWithPopup(auth, provider);
  const profileRef = doc(db, 'users', credential.user.uid);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) {
    await setDoc(profileRef, {
      uid: credential.user.uid,
      name: credential.user.displayName || 'Google User',
      email: credential.user.email,
      role: 'customer',
      createdAt: serverTimestamp()
    });
  }
  return credential.user;
}

export async function signOutUser() {
  if (isDemoMode) {
    setDemoAuth(null);
    return true;
  }
  await signOut(auth);
  return true;
}

export function onAuthChange(callback) {
  if (isDemoMode) {
    demoListeners.add(callback);
    callback(getDemoAuth());
    return () => demoListeners.delete(callback);
  }
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }
    const profile = await getUserProfile(user.uid);
    callback({ uid: user.uid, email: user.email, name: user.displayName || profile?.name || 'Customer', role: profile?.role || 'customer' });
  });
}

export async function uploadProductImage(file) {
  if (!file) return '';
  if (isDemoMode) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read selected image.'));
      reader.readAsDataURL(file);
    });
  }
  const imageRef = ref(storage, `products/${Date.now()}-${file.name}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

export async function getCoupons() {
  return readCollection('offers');
}

export async function validateCoupon(code, subtotal) {
  const coupons = await getCoupons();
  const coupon = coupons.find((item) => item.code.toUpperCase() === code.trim().toUpperCase() && item.active);
  if (!coupon) return { valid: false, amount: 0, message: 'Coupon not found.' };
  if (subtotal < Number(coupon.minOrder || 0)) {
    return { valid: false, amount: 0, message: `Minimum order is ₹${coupon.minOrder}.` };
  }
  if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
    return { valid: false, amount: 0, message: 'Coupon has expired.' };
  }
  return { valid: true, amount: Math.round((subtotal * Number(coupon.percentage || 0)) / 100), coupon };
}

export async function getCategories() {
  return readCollection('categories');
}

export async function saveCategory(data) {
  const category = { ...data, id: data.id || slugify(data.name), slug: data.slug || slugify(data.name) };
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    const exists = demoDb.categories.find((item) => item.id === category.id);
    demoDb.categories = exists
      ? demoDb.categories.map((item) => (item.id === category.id ? { ...item, ...category } : item))
      : [...demoDb.categories, category];
    saveDemoDb(demoDb);
    return category;
  }
  await setDoc(doc(db, 'categories', category.id), category, { merge: true });
  return category;
}

export async function deleteCategory(id) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    demoDb.categories = demoDb.categories.filter((item) => item.id !== id);
    saveDemoDb(demoDb);
    return true;
  }
  await deleteDoc(doc(db, 'categories', id));
  return true;
}

export async function saveCoupon(data) {
  const coupon = { ...data, id: data.id || slugify(data.code), active: data.active ?? true };
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    const exists = demoDb.offers.find((item) => item.id === coupon.id);
    demoDb.offers = exists
      ? demoDb.offers.map((item) => (item.id === coupon.id ? { ...item, ...coupon } : item))
      : [...demoDb.offers, coupon];
    saveDemoDb(demoDb);
    return coupon;
  }
  await setDoc(doc(db, 'offers', coupon.id), coupon, { merge: true });
  return coupon;
}

export async function deleteCoupon(id) {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    demoDb.offers = demoDb.offers.filter((item) => item.id !== id);
    saveDemoDb(demoDb);
    return true;
  }
  await deleteDoc(doc(db, 'offers', id));
  return true;
}

export async function getUsers() {
  if (isDemoMode) return (await demoRead('users')).map(mapUserProfile);
  const users = await readCollection('users');
  return users.map(mapUserProfile);
}

export async function getUserProfile(uid) {
  if (isDemoMode) return mapUserProfile(loadDemoDb().users.find((item) => item.uid === uid));
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function seedDemoData() {
  if (isDemoMode) {
    const demoDb = loadDemoDb();
    if (!demoDb.products.length) demoDb.products = clone(DEMO_PRODUCTS);
    if (!demoDb.categories.length) demoDb.categories = clone(DEMO_CATEGORIES);
    if (!demoDb.reviews.length) demoDb.reviews = clone(DEMO_REVIEWS);
    if (!demoDb.offers.length) demoDb.offers = clone(DEMO_OFFERS);
    if (!demoDb.users.length) demoDb.users = clone(DEMO_USERS);
    saveDemoDb(demoDb);
    return { mode: 'demo', seeded: true };
  }

  const productsSnapshot = await getDocs(collection(db, 'products'));
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
  const offersSnapshot = await getDocs(collection(db, 'offers'));

  if (productsSnapshot.empty) {
    await Promise.all(DEMO_PRODUCTS.map((product) => setDoc(doc(db, 'products', product.id), product)));
  }
  if (categoriesSnapshot.empty) {
    await Promise.all(DEMO_CATEGORIES.map((category) => setDoc(doc(db, 'categories', category.id), category)));
  }
  if (reviewsSnapshot.empty) {
    await Promise.all(DEMO_REVIEWS.map((review) => setDoc(doc(db, 'reviews', review.id), review)));
  }
  if (offersSnapshot.empty) {
    await Promise.all(DEMO_OFFERS.map((offer) => setDoc(doc(db, 'offers', offer.id), offer)));
  }

  return { mode: 'firebase', seeded: true };
}
