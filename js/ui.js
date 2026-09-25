/* =========================================================
   Aura Fitness — small UI helpers
   Toast notifications + a busy state for submit buttons, used
   across every page for consistent, professional-feeling feedback.
   ========================================================= */

const Toast = (() => {
  let host;
  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.className = 'toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
    return host;
  }

  function show(message, type = 'success', duration = 3200) {
    const h = ensureHost();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    h.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 220);
    }, duration);
  }

  return { show };
})();

function setBtnBusy(btn, busy, busyLabel) {
  if (busy) {
    btn.dataset.originalLabel = btn.textContent;
    btn.textContent = busyLabel || 'Working…';
    btn.disabled = true;
    btn.classList.add('is-busy');
  } else {
    btn.textContent = btn.dataset.originalLabel || btn.textContent;
    btn.disabled = false;
    btn.classList.remove('is-busy');
  }
}

function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return +(weightKg / (m * m)).toFixed(1);
}

function bmiLabel(bmi) {
  if (bmi == null) return '—';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy range';
  if (bmi < 30) return 'Above range';
  return 'Well above range';
}
