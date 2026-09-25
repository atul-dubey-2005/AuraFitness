(() => {
  const user = renderAppHeader('routines.html');
  if (!user) return;

  const DAY_NAMES = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
  const grid = document.getElementById('routine-grid');
  const goalFilter = document.getElementById('goal-filter');
  let selectedDay = 1;

  function renderGrid() {
    const routines = AuraDB.getRoutinesByGoal(goalFilter.value);
    const active = AuraDB.getUserActiveRoutine(user.id);
    if (!routines.length) {
      grid.innerHTML = `<div class="empty-state"><strong>No routines match that goal</strong>Try a different filter.</div>`;
      return;
    }
    grid.innerHTML = routines.map(r => `
      <div class="xcard">
        <div class="tags">
          <span class="badge volt">${r.goal}</span>
          <span class="badge line">${r.difficulty}</span>
          ${active && active.id === r.id ? '<span class="badge coral">Active</span>' : ''}
        </div>
        <h3>${r.name}</h3>
        <p>${r.durationWeeks}-week program built around ${Object.values(r.schedule).flat().length} scheduled sessions a week.</p>
        <div class="foot">
          <span>${Object.values(r.schedule).filter(d => d.length).length} training days / week</span>
          <button class="btn btn-outline view-btn" data-id="${r.id}">View</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.view-btn').forEach(btn =>
      btn.addEventListener('click', () => showDetail(Number(btn.dataset.id))));
  }

  function showDetail(routineId) {
    const routine = AuraDB.getRoutineById(routineId);
    if (!routine) return;
    selectedDay = 1;

    document.getElementById('routine-detail').style.display = 'block';
    document.getElementById('detail-name').textContent = routine.name;
    document.getElementById('detail-tags').innerHTML = `
      <span class="badge volt">${routine.goal}</span>
      <span class="badge line">${routine.difficulty}</span>
      <span class="badge line">${routine.durationWeeks} weeks</span>
    `;

    const assignBtn = document.getElementById('assign-btn');
    assignBtn.onclick = () => {
      AuraDB.assignRoutineToUser(user.id, routine.id);
      renderGrid();
      showDetail(routine.id);
    };

    renderDayStrip(routine);
    renderDayExercises(routine);

    document.getElementById('routine-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderDayStrip(routine) {
    const strip = document.getElementById('day-strip');
    strip.innerHTML = Object.keys(DAY_NAMES).map(day => {
      const hasWork = (routine.schedule[day] || []).length > 0;
      return `<button type="button" class="day-pill ${Number(day) === selectedDay ? 'active' : ''} ${hasWork ? '' : 'rest'}" data-day="${day}">
        ${DAY_NAMES[day]}${hasWork ? '' : ' · rest'}
      </button>`;
    }).join('');
    strip.querySelectorAll('.day-pill').forEach(btn =>
      btn.addEventListener('click', () => {
        selectedDay = Number(btn.dataset.day);
        renderDayStrip(routine);
        renderDayExercises(routine);
      }));
  }

  function renderDayExercises(routine) {
    const host = document.getElementById('day-exercises');
    const exs = AuraDB.getRoutineExercisesByDay(routine.id, selectedDay);
    if (!exs.length) {
      host.innerHTML = `<div class="empty-state"><strong>Rest day</strong>Nothing scheduled — recover or add light mobility work.</div>`;
      return;
    }
    host.innerHTML = `<table>
      <thead><tr><th>Exercise</th><th>Category</th><th>Difficulty</th><th>Equipment</th><th></th></tr></thead>
      <tbody>
        ${exs.map(x => `
          <tr>
            <td>
              <div class="routine-ex-row">
                <div class="routine-ex-icon">${ExerciseIcons.svg(x.icon, 34)}</div>
                <span>${x.name}</span>
              </div>
            </td>
            <td>${x.category}</td>
            <td><span class="badge ${x.difficulty === 'Advanced' ? 'coral' : x.difficulty === 'Beginner' ? 'volt' : ''}">${x.difficulty}</span></td>
            <td>${x.equipment}</td>
            <td><button type="button" class="btn btn-ghost view-ex-btn" data-id="${x.id}">Steps &amp; photo</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;

    host.querySelectorAll('.view-ex-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ex = AuraDB.getExerciseById(btn.dataset.id);
        if (ex) openExerciseModal(ex);
      });
    });
  }

  goalFilter.addEventListener('change', renderGrid);
  renderGrid();

  // deep link: routines.html?id=3
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  if (idParam) showDetail(Number(idParam));
})();
