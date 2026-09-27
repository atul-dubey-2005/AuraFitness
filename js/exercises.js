(() => {
  const user = renderAppHeader('exercises.html');
  if (!user) return;

  const all = AuraDB.getAllExercises();
  const grid = document.getElementById('exercise-grid');
  const searchEl = document.getElementById('search');
  const categoryEl = document.getElementById('category');
  const muscleEl = document.getElementById('muscle');
  const difficultyEl = document.getElementById('difficulty');

  // populate muscle group options from data
  [...new Set(all.map(x => x.muscleGroup))].sort().forEach(mg => {
    const opt = document.createElement('option');
    opt.textContent = mg;
    muscleEl.appendChild(opt);
  });

  function render() {
    const q = searchEl.value.trim().toLowerCase();
    const list = all.filter(x =>
      (!q || x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q)) &&
      (!categoryEl.value || x.category === categoryEl.value) &&
      (!muscleEl.value || x.muscleGroup === muscleEl.value) &&
      (!difficultyEl.value || x.difficulty === difficultyEl.value)
    );

    if (!list.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><strong>No exercises match</strong>Try clearing a filter.</div>`;
      return;
    }

    grid.innerHTML = list.map(x => `
      <div class="xcard">
        <div class="xcard-head">
          <div class="xicon-badge">${ExerciseIcons.svg(x.icon)}</div>
          <div class="titles">
            <h3>${x.name}</h3>
            <div class="tags">
              <span class="badge line">${x.category}</span>
              <span class="badge ${x.difficulty === 'Advanced' ? 'coral' : 'volt'}">${x.difficulty}</span>
            </div>
          </div>
        </div>
        <p>${x.description}</p>
        <div class="foot">
          <span>${x.equipment} · ~${x.caloriesPerSet} kcal/set</span>
          <button type="button" class="details-link" data-id="${x.id}">View details</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.details-link').forEach(btn =>
      btn.addEventListener('click', () => {
        const ex = AuraDB.getExerciseById(Number(btn.dataset.id));
        if (ex) AuraExerciseModal.open(ex);
      }));
  }

  [searchEl, categoryEl, muscleEl, difficultyEl].forEach(el =>
    el.addEventListener('input', render));

  render();
})();
