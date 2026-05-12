# WISHTICO

WISHTICO is a premium fashion clothing e-commerce website built with **HTML5**, **CSS3**, **vanilla JavaScript ES modules**, and **Firebase** (Firestore + Authentication + Storage). It is designed to feel like a luxury modern fashion brand while still running as a static site on GitHub Pages.

## Features

- Premium glassmorphism navbar, hero splash screen, floating visuals, and modern luxury layout
- Responsive storefront pages: `index.html`, `collections.html`, `product.html`, `cart.html`, `checkout.html`, `login.html`, `signup.html`, `reviews.html`, `admin.html`
- Shared `style.css`, `script.js`, `firebase.js`, and `seed.js` flat root layout
- Firebase modular SDK integration with Firestore, Authentication, and Storage helpers
- Offline demo fallback when `firebase.js` still uses the placeholder config
- Dynamic product loading, cart persistence, wishlist, search overlay, protected checkout, and admin CRUD flows
- Razorpay checkout placeholder with dummy keys for front-end preview only

## Screenshots

Add homepage, collections, product, checkout, reviews, and admin screenshots here after deployment.

## Firebase Setup

1. Create a Firebase project.
2. Enable **Firestore Database**, **Authentication** (Email/Password + Google), and **Storage**.
3. Open `firebase.js`.
4. Replace the placeholder `firebaseConfig` object values with your own Firebase web app config.
5. Optional: use **Admin → Settings → Seed Demo Data** to populate sample products, categories, and reviews if your database is empty.
6. Make your user an admin by setting `users/{yourUid}.role = "admin"` in Firestore.

## Local Run

You can open `index.html` directly, but serving the site locally is recommended:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages Deployment

1. Push the site to the repository.
2. Open **Settings → Pages**.
3. Select the **main** branch and the **root** folder.
4. Save and wait for GitHub Pages to publish the site.

## Razorpay Note

`checkout.html` includes a placeholder Razorpay integration for UI/demo purposes only.

- It uses a dummy key ID.
- It does **not** create real orders.
- Replace it with a real backend-generated order flow before production payments.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES modules)
- Firebase App / Firestore / Authentication / Storage (CDN modular SDK)
- Razorpay Checkout placeholder
- Unsplash placeholder imagery

## Credits

- Fashion and lifestyle placeholders from [Unsplash](https://unsplash.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)
