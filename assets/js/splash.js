(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;
    const seen = sessionStorage.getItem('wishtico-splash-seen');
    const hideSplash = (delay) => setTimeout(() => { splash.classList.add('is-hidden'); sessionStorage.setItem('wishtico-splash-seen', 'true'); setTimeout(() => splash.remove(), 900); }, delay);
    if (seen) { hideSplash(120); return; }
    hideSplash(2500);
  });
})();
