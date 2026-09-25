(() => {
  let user = renderAppHeader('profile.html');
  if (!user) return;

  const $ = (id) => document.getElementById(id);
  const R = Validate.rules;
  const firstName = $('firstName'), lastName = $('lastName'), email = $('email');
  const age = $('age'), height = $('height'), weight = $('weight');

  function fieldSpecs() {
    return [
      [firstName, [R.required, R.name]],
      [lastName, [R.required, R.name]],
      [email, [R.required, R.email, (v) =>
        AuraDB.isEmailTaken(v, user.id) ? 'Another account already uses that email.' : '']],
      [age, [R.range(10, 100, 'years')]],
      [height, [R.range(100, 250, 'cm')]],
      [weight, [R.range(30, 300, 'kg')]],
    ];
  }
  fieldSpecs().forEach(([input, validators]) => Validate.liveWire(input, validators));

  function fillForm() {
    $('avatar-initials').textContent = (user.firstName[0] || '') + (user.lastName[0] || '');
    $('profile-name').textContent = `${user.firstName} ${user.lastName}`;
    $('profile-username').textContent = `@${user.username}`;

    firstName.value = user.firstName || '';
    lastName.value = user.lastName || '';
    email.value = user.email || '';
    age.value = user.age || '';
    $('fitnessGoal').value = user.fitnessGoal || 'General Fitness';
    height.value = user.height || '';
    weight.value = user.weight || '';
  }

  function renderStats() {
    const workouts = AuraDB.getUserWorkouts(user.id);
    const totalCalories = workouts.reduce((s, w) => s + w.caloriesBurned, 0);
    const memberSince = new Date(user.createdDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    $('account-stats').innerHTML = `
      <div class="stat plain" style="margin-bottom:12px;">
        <div class="k">Member since</div>
        <div class="v" style="font-size:22px;">${memberSince}</div>
      </div>
      <div class="stat plain" style="margin-bottom:12px;">
        <div class="k">Total workouts logged</div>
        <div class="v" style="font-size:22px;">${workouts.length}</div>
      </div>
      <div class="stat plain" style="margin-bottom:12px;">
        <div class="k">Lifetime calories burned</div>
        <div class="v" style="font-size:22px;">${totalCalories}<span class="u">kcal</span></div>
      </div>
      <div class="stat plain">
        <div class="k">Last login</div>
        <div class="v" style="font-size:22px;">${new Date(user.lastLoginDate).toLocaleDateString()}</div>
      </div>
    `;

    const latestProgress = AuraDB.getLatestProgressLog(user.id);
    const w = (latestProgress && latestProgress.weight) || Number(user.weight) || null;
    const h = Number(user.height) || null;
    const bmi = calcBMI(w, h);
    $('bmi-stat').innerHTML = bmi
      ? `<div class="stat tint">
           <div class="k">${bmiLabel(bmi)}</div>
           <div class="v" style="font-size:30px;">${bmi}</div>
         </div>
         <p style="margin-top:10px;font-size:12.5px;">Based on ${w} kg and ${h} cm. BMI is a rough guide, not a diagnosis.</p>`
      : `<div class="empty-state"><strong>Add height &amp; weight</strong>Fill both in in the form to see your BMI.</div>`;
  }

  fillForm();
  renderStats();

  const form = $('profile-form');
  const msg = $('form-msg');
  const saveBtn = $('save-profile-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.classList.remove('show');

    if (!Validate.validateAll(fieldSpecs())) return;

    setBtnBusy(saveBtn, true, 'Saving…');
    setTimeout(() => {
      const result = AuraDB.updateUserProfile(user.id, {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        age: age.value,
        fitnessGoal: $('fitnessGoal').value,
        height: height.value,
        weight: weight.value,
      });
      setBtnBusy(saveBtn, false);
      if (result.ok) {
        user = result.user;
        fillForm();
        renderStats();
        Toast.show('Profile updated.', 'success');
      } else {
        msg.textContent = result.error;
        msg.classList.add('show');
      }
    }, 250);
  });
})();
