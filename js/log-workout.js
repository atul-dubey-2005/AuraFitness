(() => {
  const user = renderAppHeader('log-workout.html');
  if (!user) return;

  const exercises = AuraDB.getAllExercises();
  document.getElementById('workoutDate').value = new Date().toISOString().slice(0, 10);

  const rowsHost = document.getElementById('exercise-rows');
  let rowCount = 0;

  function exerciseOptions() {
    return exercises.map(x => `<option value="${x.id}">${x.name}</option>`).join('');
  }

  function addRow(preselectId) {
    rowCount++;
    const id = `row-${rowCount}`;
    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.id = id;
    row.innerHTML = `
      <div class="field">
        <label>Exercise</label>
        <select class="ex-select">${exerciseOptions()}</select>
      </div>
      <div class="field">
        <label>Sets</label>
        <input type="number" class="ex-sets" min="1" max="20" value="3">
      </div>
      <div class="field">
        <label>Reps</label>
        <input type="number" class="ex-reps" min="1" max="100" value="10">
      </div>
      <div class="field">
        <label>Weight (kg)</label>
        <input type="number" class="ex-weight" min="0" max="500" step="0.5" value="0">
      </div>
      <button type="button" class="remove-row" aria-label="Remove exercise">Remove</button>
    `;
    if (preselectId) row.querySelector('.ex-select').value = String(preselectId);
    row.querySelector('.remove-row').addEventListener('click', () => row.remove());
    rowsHost.appendChild(row);
  }

  document.getElementById('add-exercise').addEventListener('click', () => addRow());

  // deep link from the exercise library / a routine day: log-workout.html?exercise=5
  const params = new URLSearchParams(window.location.search);
  const exerciseParam = params.get('exercise');
  addRow(exerciseParam ? Number(exerciseParam) : null); // start with one row

  // live calorie estimate
  const typeEl = document.getElementById('workoutType');
  const durationEl = document.getElementById('durationMinutes');
  const intensityEl = document.getElementById('intensity');
  const estimateEl = document.getElementById('calorie-estimate');

  function updateEstimate() {
    const cal = AuraDB.calculateCalories(typeEl.value, Number(durationEl.value) || 0, intensityEl.value);
    estimateEl.innerHTML = `${cal}<span class="u">kcal</span>`;
  }
  [typeEl, durationEl, intensityEl].forEach(el => el.addEventListener('input', updateEstimate));
  updateEstimate();

  // submit
  const form = document.getElementById('workout-form');
  const msg = document.getElementById('form-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const exerciseEntries = Array.from(rowsHost.querySelectorAll('.exercise-row')).map(row => ({
      exerciseId: Number(row.querySelector('.ex-select').value),
      sets: Number(row.querySelector('.ex-sets').value),
      reps: Number(row.querySelector('.ex-reps').value),
      weight: Number(row.querySelector('.ex-weight').value),
    }));

    AuraDB.createWorkout(user.id, {
      workoutDate: document.getElementById('workoutDate').value,
      workoutType: typeEl.value,
      durationMinutes: durationEl.value,
      intensity: intensityEl.value,
      notes: document.getElementById('notes').value.trim(),
      exercises: exerciseEntries,
    });

    msg.textContent = 'Workout saved. Nice work.';
    msg.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
  });
})();
