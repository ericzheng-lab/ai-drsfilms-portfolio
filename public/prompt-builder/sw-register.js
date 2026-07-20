if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js?v=onesheet-v5-2026-07-20')
      .then(registration => registration.update())
      .catch(() => {});
  });
}
