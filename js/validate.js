/* =========================================================
   Aura Fitness — validation helpers
   Field-level rules + wiring so every form gives immediate,
   specific feedback instead of a single generic error banner.
   ========================================================= */

const Validate = (() => {

  function setError(input, message) {
    input.classList.toggle('invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    const errEl = document.getElementById(input.id + '-error');
    if (errEl) errEl.textContent = message || '';
  }

  function clearError(input) { setError(input, ''); }

  const rules = {
    required: (v) => (v.trim() ? '' : 'This field is required.'),

    name: (v) => (/^[A-Za-z' -]{2,40}$/.test(v.trim()) ? '' : 'Letters only, 2–40 characters.'),

    username: (v) => (/^[A-Za-z0-9_]{3,20}$/.test(v.trim())
      ? '' : '3–20 characters: letters, numbers, underscore.'),

    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.'),

    password: (v) => {
      if (v.length < 8) return 'At least 8 characters.';
      if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return 'Include at least one letter and one number.';
      return '';
    },

    matches: (otherInputGetter, label) => (v) => {
      const other = otherInputGetter();
      return v === other.value ? '' : `Doesn't match ${label}.`;
    },

    range: (min, max, unit = '') => (v) => {
      if (v === '' || v == null) return '';
      const n = Number(v);
      if (Number.isNaN(n)) return 'Enter a number.';
      if (n < min || n > max) return `Must be between ${min} and ${max}${unit ? ' ' + unit : ''}.`;
      return '';
    },

    rangeRequired: (min, max, unit = '') => (v) => {
      if (v === '' || v == null) return 'This field is required.';
      return rules.range(min, max, unit)(v);
    },

    notFutureDate: (v) => {
      if (!v) return '';
      const today = new Date().toISOString().slice(0, 10);
      return v > today ? "Date can't be in the future." : '';
    },
  };

  function validateField(input, validators) {
    for (const fn of validators) {
      const msg = fn(input.value);
      if (msg) { setError(input, msg); return false; }
    }
    setError(input, '');
    return true;
  }

  // wires blur + live re-check once a field has already failed once
  function liveWire(input, validators) {
    input.addEventListener('blur', () => validateField(input, validators));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) validateField(input, validators);
    });
    return () => validateField(input, validators);
  }

  function validateAll(pairs) {
    // pairs: [[input, validators], ...] — runs every check so all
    // errors show at once, returns true only if every field passed
    let allOk = true;
    let firstInvalid = null;
    pairs.forEach(([input, validators]) => {
      const ok = validateField(input, validators);
      if (!ok) {
        allOk = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });
    if (firstInvalid) firstInvalid.focus();
    return allOk;
  }

  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  function wirePasswordToggle(button, input) {
    button.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Hide' : 'Show';
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }

  return {
    setError, clearError, rules, validateField, liveWire, validateAll,
    passwordStrength, wirePasswordToggle,
  };
})();
