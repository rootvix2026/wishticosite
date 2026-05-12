(() => {
  const icon = (name) => ({
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="m20 20-4.2-4.2"></path></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20a7 7 0 0 1 14 0"></path></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20s-7-4.7-7-10.4A4.4 4.4 0 0 1 9.4 5c1.4 0 2.3.6 2.6 1 .3-.4 1.2-1 2.6-1A4.4 4.4 0 0 1 19 9.6C19 15.3 12 20 12 20Z"></path></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="9" cy="20" r="1.2"></circle><circle cx="18" cy="20" r="1.2"></circle><path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7"></path></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>'
  })[name];

  const links = [['Home', 'index.html', 'home'], ['Collections', 'collections.html', 'collections'], ['Categories', 'collections.html#categories', 'collections'], ['Offers', 'collections.html?category=Combo%20Offers', 'collections'], ['About Us', 'about.html', 'about'], ['Contact', 'contact.html', 'contact']];
  const currentPage = document.body.dataset.page || 'home';
  const imageFallbackSrc = 'assets/images/image-fallback.svg';

  const renderSharedChrome = () => {
    const headerRoot = document.querySelector('[data-site-header]');
    const cartRoot = document.querySelector('[data-cart-drawer]');
    const footerRoot = document.querySelector('[data-site-footer]');
    if (headerRoot) {
      headerRoot.innerHTML = `<header class="site-header" id="siteHeader"><div class="announcement-bar">Welcome to WishTico — Premium Fashion Wear | Free Delivery on Prepaid Orders</div><div class="site-header__bar"><div class="container site-header__inner"><a class="logo-link" href="index.html" aria-label="WishTico home"><img src="assets/images/logo-lockup.svg" alt="WishTico logo" /></a><nav class="desktop-nav" aria-label="Primary navigation">${links.map(([label, href, key]) => `<a class="nav-link ${currentPage === key ? 'is-active' : ''}" href="${href}">${label}</a>`).join('')}</nav><div class="header-actions"><button class="icon-button" type="button" data-toast="Search curation is arriving soon." aria-label="Search">${icon('search')}</button><button class="icon-button" type="button" data-toast="Account features are coming soon." aria-label="Account">${icon('user')}</button><button class="icon-button" type="button" data-toast="Wishlist saved locally from product cards." aria-label="Wishlist">${icon('heart')}</button><button class="icon-button" type="button" data-open-cart aria-label="Open cart">${icon('cart')}<span class="cart-badge" data-cart-count>0</span></button><button class="icon-button mobile-menu-toggle" type="button" data-open-mobile-nav aria-label="Open menu">${icon('menu')}</button></div></div></div></header><div class="mobile-drawer" id="mobileDrawer" aria-hidden="true"><div class="mobile-drawer__backdrop" data-close-mobile-nav></div><aside class="mobile-drawer__panel"><div class="mobile-drawer__header"><img src="assets/images/logo-lockup.svg" alt="WishTico logo" width="114" /><button class="close-button" type="button" data-close-mobile-nav aria-label="Close menu">×</button></div><nav class="mobile-nav" aria-label="Mobile navigation">${links.map(([label, href]) => `<a href="${href}" data-close-mobile-nav>${label}</a>`).join('')}</nav></aside></div>`;
    }
    if (cartRoot) {
      cartRoot.innerHTML = `<div class="cart-drawer" id="cartDrawer" aria-hidden="true"><div class="cart-drawer__backdrop" data-close-cart></div><aside class="cart-drawer__panel"><div class="cart-drawer__header"><div><strong>Your Cart</strong><p>Refined picks, ready to ship.</p></div><button class="close-button" type="button" data-close-cart aria-label="Close cart">×</button></div><div class="cart-items" id="cart-drawer-items"></div><div class="cart-drawer__footer"><div><small>Total</small><strong id="cart-drawer-total">₹0</strong></div><a class="button button-primary" href="cart.html">Checkout</a></div></aside></div>`;
    }
    if (footerRoot) {
      footerRoot.innerHTML = `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><img src="assets/images/logo-lockup.svg" alt="WishTico logo" /><p>WishTico delivers premium fashion wear with refined silhouettes, curated essentials, and standout everyday luxury.</p><div class="social-links"><a href="#" aria-label="Instagram">Instagram</a><a href="#" aria-label="Facebook">Facebook</a><a href="#" aria-label="Twitter or X">Twitter/X</a><a href="#" aria-label="YouTube">YouTube</a></div></div><div class="footer-column"><h3>Shop</h3><a href="collections.html?category=Shirts">Shirts</a><a href="collections.html?category=T-Shirts">T-Shirts</a><a href="collections.html?category=Pants">Pants</a><a href="collections.html?category=Jackets">Jackets</a></div><div class="footer-column"><h3>Help</h3><a href="contact.html">Customer Care</a><a href="cart.html">Shipping & Returns</a><a href="contact.html">Size Guide</a><a href="contact.html">FAQs</a></div><div class="footer-column"><h3>Company</h3><a href="about.html">About Us</a><a href="contact.html">Contact</a><a href="collections.html">Latest Collection</a><a href="index.html#featured-products">Best Sellers</a></div><div class="footer-column"><h3>Legal</h3><a href="#">Privacy Policy</a><a href="#">Terms & Conditions</a><a href="#">Refund Policy</a><div class="payment-strip"><span>Visa</span><span>Mastercard</span><span>UPI</span><span>Paytm</span></div></div></div><div class="container footer-bottom"><span>© <span id="footer-year"></span> WishTico. All rights reserved.</span><span>Crafted for premium everyday style.</span></div></footer><div class="toast-stack" id="toastStack" aria-live="polite"></div>`;
    }
  };

  const showToast = (message) => { const stack = document.getElementById('toastStack'); if (!stack) return; const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = message; stack.appendChild(toast); setTimeout(() => toast.remove(), 2600); };
  const initStickyHeader = () => { const header = document.getElementById('siteHeader'); if (!header) return; const update = () => header.classList.toggle('scrolled', window.scrollY > 16); update(); window.addEventListener('scroll', update, { passive: true }); };
  const initMobileNav = () => { const drawer = document.getElementById('mobileDrawer'); if (!drawer) return; const toggle = (open) => { drawer.classList.toggle('is-open', open); drawer.setAttribute('aria-hidden', String(!open)); }; document.querySelectorAll('[data-open-mobile-nav]').forEach((button) => button.addEventListener('click', () => toggle(true))); drawer.querySelectorAll('[data-close-mobile-nav]').forEach((button) => button.addEventListener('click', () => toggle(false))); };
  const initReveal = () => { const items = document.querySelectorAll('.reveal'); if (!items.length) return; const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: .18 }); items.forEach((item) => observer.observe(item)); };
  const initParallax = () => { const target = document.querySelector('[data-parallax]'); if (!target) return; target.addEventListener('pointermove', (event) => { const bounds = target.getBoundingClientRect(); const x = (event.clientX - bounds.left) / bounds.width - .5; const y = (event.clientY - bounds.top) / bounds.height - .5; target.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0)`; }); target.addEventListener('pointerleave', () => { target.style.transform = ''; }); };
  const initMagnetic = () => { document.querySelectorAll('.magnetic').forEach((button) => { button.addEventListener('pointermove', (event) => { const bounds = button.getBoundingClientRect(); const x = ((event.clientX - bounds.left) / bounds.width - .5) * 12; const y = ((event.clientY - bounds.top) / bounds.height - .5) * 10; button.style.transform = `translate(${x}px, ${y}px)`; }); button.addEventListener('pointerleave', () => { button.style.transform = ''; }); }); };
  const initPageTransitions = () => { document.querySelectorAll('a[href]').forEach((link) => { link.addEventListener('click', (event) => { const href = link.getAttribute('href'); if (!href || href.startsWith('#') || link.target === '_blank') return; const url = new URL(link.href, window.location.href); if (url.origin !== window.location.origin || event.metaKey || event.ctrlKey || event.shiftKey) return; event.preventDefault(); document.body.classList.add('route-leaving'); setTimeout(() => { window.location.href = url.href; }, 220); }); }); };
  const initCounters = () => { document.querySelectorAll('[data-counter]').forEach((counter) => { const target = Number(counter.dataset.counter || 0); let current = 0; const step = Math.max(1, Math.round(target / 40)); const observer = new IntersectionObserver((entries) => { if (!entries[0].isIntersecting) return; const timer = setInterval(() => { current += step; if (current >= target) { current = target; clearInterval(timer); } counter.textContent = `${current}${target > 99 ? '+' : ''}`; }, 28); observer.disconnect(); }); observer.observe(counter); }); };
  const initForms = () => { document.getElementById('newsletter-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.target.reset(); showToast('Thanks for joining the WishTico private list.'); }); document.getElementById('contact-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.target.reset(); showToast('Message received. Our team will reach out shortly.'); }); };
  const initTestimonials = () => { const slider = document.querySelector('[data-testimonial-slider]'); if (!slider) return; const cards = Array.from(slider.querySelectorAll('[data-testimonial]')); let index = 0; const showCard = (next) => cards.forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex === next)); showCard(index); slider.querySelector('[data-slider-prev]')?.addEventListener('click', () => { index = (index - 1 + cards.length) % cards.length; showCard(index); }); slider.querySelector('[data-slider-next]')?.addEventListener('click', () => { index = (index + 1) % cards.length; showCard(index); }); setInterval(() => { index = (index + 1) % cards.length; showCard(index); }, 4200); };
  const initToastButtons = () => { document.querySelectorAll('[data-toast]').forEach((button) => button.addEventListener('click', () => showToast(button.dataset.toast))); };
  const initImageFallbacks = () => {
    document.addEventListener('error', (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied === 'true') return;
      image.dataset.fallbackApplied = 'true';
      image.src = imageFallbackSrc;
    }, true);
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderSharedChrome();
    initStickyHeader();
    initMobileNav();
    initReveal();
    initParallax();
    initMagnetic();
    initPageTransitions();
    initCounters();
    initForms();
    initTestimonials();
    initToastButtons();
    initImageFallbacks();
    const year = document.getElementById('footer-year');
    if (year) year.textContent = String(new Date().getFullYear());
    window.WishTicoUI = { showToast };
  });
})();
