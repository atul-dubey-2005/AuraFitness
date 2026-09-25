(() => {
  const user = renderAppHeader('log-workout.html');
  if (!user) return;

  const R = Validate.rules;
  const exercises = AuraDB.getAllExercises();
  const dateInput = document.getElementById('workoutDate');
  const durationInput = document.getElementById('durationMinutes');
  dateInput.value = new Date().toISOString().slice(0, 10);

  Validate.liveWire(dateInput, [R.required, R.notFutureDate]);
  Validate.liveWire(durationInput, [R.rangeRequired(1, 300, 'min')]);

  const rowsHost = document.getElementById('exercise-rows');
  const typeEl = document.getElementById('workoutType');
  let rowCount = 0;

  function typeElValue() { return typeEl.value; }

  function exercisesForType(type) {
    const matches = exercises.filter(x => x.category === type);
    return matches.length ? matches : exercises;
  }

  function exerciseOptions(type) {
    return exercisesForType(type)
      .map(x => `<option value="${x.id}">${x.name} · ${x.difficulty}</option>`).join('');
  }

  function addRow() {
    rowCount++;
    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.innerHTML = `
      <div class="field">
        <label>Exercise</label>
        <select class="ex-select">${exerciseOptions(typeElValue())}</select>
      </div>
      <div class="field">
        <label>Sets</label>
        <input type="number" class="ex-sets" min="1" max="15" value="3">
        <span class="field-error ex-sets-error"></span>
      </div>
      <div class="field">
        <label>Reps</label>
        <input type="number" class="ex-reps" min="1" max="100" value="10">
        <span class="field-error ex-reps-error"></span>
      </div>
      <div class="field">
        <label>Weight (kg)</label>
        <input type="number" class="ex-weight" min="0" max="500" step="0.5" value="0">
        <span class="field-error ex-weight-error"></span>
      </div>
      <button type="button" class="remove-row" aria-label="Remove exercise">Remove</button>
    `;
    const setsInput = row.querySelector('.ex-sets');
    const repsInput = row.querySelector('.ex-reps');
    const weightInput = row.querySelector('.ex-weight');

    wireInlineRange(setsInput, row.querySelector('.ex-sets-error'), 1, 15);
    wireInlineRange(repsInput, row.querySelector('.ex-reps-error'), 1, 100);
    wireInlineRange(weightInput, row.querySelector('.ex-weight-error'), 0, 500);

    row.querySelector('.remove-row').addEventListener('click', () => row.remove());
    rowsHost.appendChild(row);
  }

  function wireInlineRange(input, errEl, min, max) {
    const check = () => {
      const v = Number(input.value);
      const bad = input.value === '' || Number.isNaN(v) || v < min || v > max;
      input.classList.toggle('invalid', bad);
      errEl.textContent = bad ? `Between ${min} and ${max}.` : '';
      return !bad;
    };
    input.addEventListener('blur', check);
    input.addEventListener('input', () => { if (input.classList.contains('invalid')) check(); });
    input._check = check;
  }

  document.getElementById('add-exercise').addEventListener('click', addRow);
  addRow(); // start with one row

  // when the workout type changes, refresh every row's exercise list to match
  typeEl.addEventListener('change', () => {
    rowsHost.querySelectorAll('.exercise-row').forEach(row => {
      const select = row.querySelector('.ex-select');
      const previousName = select.options[select.selectedIndex]?.textContent.split(' · ')[0];
      select.innerHTML = exerciseOptions(typeElValue());
      const match = Array.from(select.options).find(o => o.textContent.startsWith(previousName));
      if (match) select.value = match.value;
    });
  });

  // live calorie estimate
  const intensityEl = document.getElementById('intensity');
  const estimateEl = document.getElementById('calorie-estimate');

  function updateEstimate() {
    const cal = AuraDB.calculateCalories(typeEl.value, Number(durationInput.value) || 0, intensityEl.value);
    estimateEl.innerHTML = `${cal}<span class="u">kcal</span>`;
  }
  [typeEl, durationInput, intensityEl].forEach(el => el.addEventListener('input', updateEstimate));
  updateEstimate();

  // submit
  const form = document.getElementById('workout-form');
  const msg = document.getElementById('form-msg');
  const saveBtn = document.getElementById('save-workout-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.classList.remove('show');

    const topValid = Validate.validateAll([
      [dateInput, [R.required, R.notFutureDate]],
      [durationInput, [R.rangeRequired(1, 300, 'min')]],
    ]);

    let rowsValid = true;
    rowsHost.querySelectorAll('.exercise-row').forEach(row => {
      ['.ex-sets', '.ex-reps', '.ex-weight'].forEach(sel => {
        const input = row.querySelector(sel);
        if (!input._check()) rowsValid = false;
      });
    });

    if (!topValid || !rowsValid) {
      if (!rowsValid && topValid) {
        msg.textContent = 'Fix the highlighted exercise fields before saving.';
        msg.classList.add('show');
      }
      return;
    }

    const exerciseEntries = Array.from(rowsHost.querySelectorAll('.exercise-row')).map(row => ({
      exerciseId: Number(row.querySelector('.ex-select').value),
      sets: Number(row.querySelector('.ex-sets').value),
      reps: Number(row.querySelector('.ex-reps').value),
      weight: Number(row.querySelector('.ex-weight').value),
    }));

    setBtnBusy(saveBtn, true, 'Saving…');
    setTimeout(() => {
      AuraDB.createWorkout(user.id, {
        workoutDate: dateInput.value,
        workoutType: typeEl.value,
        durationMinutes: durationInput.value,
        intensity: intensityEl.value,
        notes: document.getElementById('notes').value.trim(),
        exercises: exerciseEntries,
      });
      Toast.show('Workout saved. Nice work.', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
    }, 250);
  });
})();
