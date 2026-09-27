(() => {
  let user = renderAppHeader('profile.html');
  if (!user) return;

  function fillForm() {
    document.getElementById('avatar-initials').textContent =
      (user.firstName[0] || '') + (user.lastName[0] || '');
    document.getElementById('profile-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profile-username').textContent = `@${user.username}`;

    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('age').value = user.age || '';
    document.getElementById('fitnessGoal').value = user.fitnessGoal || 'General Fitness';
    document.getElementById('height').value = user.height || '';
    document.getElementById('weight').value = user.weight || '';
  }

  function renderStats() {
    const workouts = AuraDB.getUserWorkouts(user.id);
    const totalCalories = workouts.reduce((s, w) => s + w.caloriesBurned, 0);
    const memberSince = new Date(user.createdDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    document.getElementById('account-stats').innerHTML = `
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
  }

  fillForm();
  renderStats();

  const form = document.getElementById('profile-form');
  const msg = document.getElementById('form-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = AuraDB.updateUserProfile(user.id, {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      age: document.getElementById('age').value,
      fitnessGoal: document.getElementById('fitnessGoal').value,
      height: document.getElementById('height').value,
      weight: document.getElementById('weight').value,
    });
    if (result.ok) {
      user = result.user;
      fillForm();
      msg.textContent = 'Profile updated.';
      msg.classList.add('show');
      setTimeout(() => msg.classList.remove('show'), 2500);
    }
  });
})();
