(() => {
  if (AuraDB.getCurrentUser()) window.location.href = 'dashboard.html';

  const $ = (id) => document.getElementById(id);
  const form = $('register-form');
  const msg = $('form-msg');
  const registerBtn = $('register-btn');

  const firstName = $('firstName'), lastName = $('lastName');
  const username = $('username'), email = $('email');
  const password = $('password'), confirmPassword = $('confirmPassword');
  const age = $('age'), height = $('height'), weight = $('weight');

  const R = Validate.rules;

  const fieldSpecs = [
    [firstName, [R.required, R.name]],
    [lastName, [R.required, R.name]],
    [username, [R.required, R.username, (v) =>
      AuraDB.isUsernameTaken(v) ? 'That username is already taken.' : '']],
    [email, [R.required, R.email, (v) =>
      AuraDB.isEmailTaken(v) ? 'An account already exists with that email.' : '']],
    [password, [R.required, R.password]],
    [confirmPassword, [R.required, R.matches(() => password, 'password')]],
    [age, [R.range(10, 100, 'years')]],
    [height, [R.range(100, 250, 'cm')]],
    [weight, [R.range(30, 300, 'kg')]],
  ];

  fieldSpecs.forEach(([input, validators]) => Validate.liveWire(input, validators));

  // re-check confirm password whenever password changes
  password.addEventListener('input', () => {
    if (confirmPassword.value) Validate.validateField(confirmPassword, [R.required, R.matches(() => password, 'password')]);
    renderStrength(password.value);
  });

  function renderStrength(pw) {
    const meter = $('strength-meter');
    const label = $('strength-label');
    meter.className = 'strength-meter';
    if (!pw) { label.textContent = 'At least 8 characters, with a letter and a number.'; return; }
    const score = Validate.passwordStrength(pw);
    meter.classList.add(`s${score}`);
    label.textContent = ['Too short', 'Weak', 'Okay', 'Strong', 'Very strong'][score];
  }

  // live "is this taken" feedback, debounced slightly for a natural feel
  function wireAvailabilityCheck(input, checkFn, takenMessage) {
    const checkEl = $(input.id + '-check');
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      checkEl.textContent = '';
      checkEl.className = 'field-check';
      if (!input.value.trim()) return;
      timer = setTimeout(() => {
        if (input.classList.contains('invalid')) return; // format error already showing
        const taken = checkFn(input.value);
        checkEl.textContent = taken ? takenMessage : 'Available.';
        checkEl.className = 'field-check ' + (taken ? 'bad' : 'ok');
      }, 300);
    });
  }
  wireAvailabilityCheck(username, AuraDB.isUsernameTaken, 'That username is already taken.');
  wireAvailabilityCheck(email, AuraDB.isEmailTaken, 'An account already exists with that email.');

  Validate.wirePasswordToggle($('toggle-password'), password);
  Validate.wirePasswordToggle($('toggle-confirm'), confirmPassword);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.classList.remove('show');

    if (!Validate.validateAll(fieldSpecs)) return;

    setBtnBusy(registerBtn, true, 'Creating account…');
    setTimeout(() => {
      const result = AuraDB.registerUser({
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value,
        age: age.value,
        height: height.value,
        weight: weight.value,
        fitnessGoal: $('fitnessGoal').value,
      });

      if (!result.ok) {
        setBtnBusy(registerBtn, false);
        msg.textContent = result.error;
        msg.classList.add('show');
        return;
      }

      AuraDB.validateUser(result.user.username, password.value);
      window.location.href = 'dashboard.html';
    }, 300);
  });
})();
