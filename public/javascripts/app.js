(() => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  const flashRegion = document.querySelector('#flash-region');

  if (success && flashRegion) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success app-alert d-flex align-items-center justify-content-between gap-3';
    alert.setAttribute('role', 'status');
    alert.innerHTML = `<span>${escapeHtml(success)}</span><button class="btn-close" type="button" aria-label="Close"></button>`;
    alert.querySelector('.btn-close').addEventListener('click', () => alert.remove());
    flashRegion.appendChild(alert);
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    window.setTimeout(() => alert.remove(), 5000);
  }

  document.querySelectorAll('form[data-confirm]').forEach(form => {
    form.addEventListener('submit', event => {
      if (!window.confirm(form.dataset.confirm)) {
        event.preventDefault();
        return;
      }

      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.textContent = button.dataset.loadingText || 'Working...';
      }
    });
  });

  document.querySelectorAll('form[data-loading]').forEach(form => {
    form.addEventListener('submit', () => {
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.textContent = button.dataset.loadingText || 'Saving...';
      }
    });
  });

  function escapeHtml(value) {
    const element = document.createElement('span');
    element.textContent = value;
    return element.innerHTML;
  }
})();
