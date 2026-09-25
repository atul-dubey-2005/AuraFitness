(() => {
  if (AuraDB.getCurrentUser()) window.location.href = 'dashboard.html';

  const form = document.getElementById('login-form');
  const msg = document.getElementById('form-msg');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('login-btn');

  Validate.liveWire(usernameInput, [Validate.rules.required]);
  Validate.liveWire(passwordInput, [Validate.rules.required]);
  Validate.wirePasswordToggle(document.getElementById('toggle-password'), passwordInput);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.classList.remove('show');

    const valid = Validate.validateAll([
      [usernameInput, [Validate.rules.required]],
      [passwordInput, [Validate.rules.required]],
    ]);
    if (!valid) return;

    setBtnBusy(loginBtn, true, 'Logging in…');
    setTimeout(() => {
      const result = AuraDB.validateUser(usernameInput.value, passwordInput.value);
      if (!result.ok) {
        setBtnBusy(loginBtn, false);
        msg.textContent = result.error;
        msg.classList.add('show');
        return;
      }
      window.location.href = 'dashboard.html';
    }, 250);
  });

  document.getElementById('demo-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    setBtnBusy(btn, true, 'Preparing demo…');
    setTimeout(() => {
      AuraDB.seedDemoAccount();
      AuraDB.validateUser('demo', 'Demo1234');
      window.location.href = 'dashboard.html';
    }, 350);
  });
})();
