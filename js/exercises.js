(() => {
  const user = renderAppHeader('exercises.html');
  if (!user) return;

  const all = AuraDB.getAllExercises();
  const grid = document.getElementById('exercise-grid');
  const searchEl = document.getElementById('search');
  const categoryEl = document.getElementById('category');
  const muscleEl = document.getElementById('muscle');
  const difficultyEl = document.getElementById('difficulty');

  document.getElementById('library-subtitle').textContent =
    `Search and filter ${all.length} exercises across ${new Set(all.map(x => x.category)).size} workout types.`;

  // populate category options from data, in a sensible fixed order
  const categoryOrder = [...new Set(all.map(x => x.category))];
  categoryOrder.forEach(cat => {
    const opt = document.createElement('option');
    opt.textContent = cat;
    categoryEl.appendChild(opt);
  });

  // populate muscle group options from data
  [...new Set(all.map(x => x.muscleGroup))].sort().forEach(mg => {
    const opt = document.createElement('option');
    opt.textContent = mg;
    muscleEl.appendChild(opt);
  });

  function render() {
    const q = searchEl.value.trim().toLowerCase();
    const list = all.filter(x =>
      (!q || x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q) || x.category.toLowerCase().includes(q)) &&
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
        <div class="xcard-icon">${ExerciseIcons.svg(x.icon, 56)}</div>
        <div class="tags">
          <span class="badge line">${x.category}</span>
          <span class="badge line">${x.muscleGroup}</span>
          <span class="badge ${x.difficulty === 'Advanced' ? 'coral' : x.difficulty === 'Beginner' ? 'volt' : ''}">${x.difficulty}</span>
        </div>
        <h3>${x.name}</h3>
        <p>${x.description}</p>
        <div class="foot">
          <span>${x.equipment}</span>
          <span>~${x.caloriesPerSet} kcal / set</span>
        </div>
        <button type="button" class="btn btn-outline btn-block foot-actions view-details-btn" data-id="${x.id}">View steps &amp; details</button>
      </div>
    `).join('');

    grid.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ex = all.find(x => x.id === Number(btn.dataset.id));
        if (ex) openExerciseModal(ex);
      });
    });
  }

  [searchEl, categoryEl, muscleEl, difficultyEl].forEach(el =>
    el.addEventListener('input', render));

  render();
})();
