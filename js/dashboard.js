(() => {
  const user = renderAppHeader('dashboard.html');
  if (!user) return;

  document.getElementById('greeting').textContent = `Welcome back, ${user.firstName}`;
  document.getElementById('dateline').textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  function renderAll() {
    const workouts = AuraDB.getUserWorkouts(user.id);
    document.getElementById('sample-prompt').style.display = workouts.length ? 'none' : 'block';

    document.getElementById('stat-workouts').textContent = AuraDB.getTotalWorkoutsThisMonth(user.id);
    document.getElementById('stat-calories').innerHTML =
      `${AuraDB.getTotalCaloriesBurnedThisMonth(user.id)}<span class="u">kcal</span>`;
    document.getElementById('stat-intensity').textContent = AuraDB.getAverageIntensityThisMonth(user.id) || '—';

    const latest = AuraDB.getLatestProgressLog(user.id);
    document.getElementById('stat-weight').innerHTML = latest && latest.weight
      ? `${latest.weight}<span class="u">kg</span>`
      : (user.weight ? `${user.weight}<span class="u">kg</span>` : '—');

    // recent workouts
    const recent = workouts.slice(0, 6);
    const recentHost = document.getElementById('recent-workouts');
    if (!recent.length) {
      recentHost.innerHTML = `<div class="empty-state">
        <strong>No workouts logged yet</strong>
        Log your first session to start building your history.
      </div>`;
    } else {
      recentHost.innerHTML = `<table>
        <thead><tr><th>Date</th><th>Type</th><th>Duration</th><th>Intensity</th><th>Calories</th></tr></thead>
        <tbody>
          ${recent.map(w => `
            <tr>
              <td>${new Date(w.workoutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
              <td>${w.workoutType}</td>
              <td>${w.durationMinutes} min</td>
              <td><span class="badge ${w.intensity === 'High' ? 'coral' : 'line'}">${w.intensity}</span></td>
              <td>${w.caloriesBurned} kcal</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
    }

    // active routine
    const routine = AuraDB.getUserActiveRoutine(user.id);
    const routineHost = document.getElementById('active-routine');
    if (!routine) {
      routineHost.innerHTML = `<div class="empty-state">
        <strong>No routine assigned</strong>
        Browse routines and pick one that matches your goal.
      </div>
      <a href="routines.html" class="btn btn-outline btn-block" style="margin-top:14px;">Browse routines</a>`;
    } else {
      routineHost.innerHTML = `
        <h3 style="margin-bottom:4px;">${routine.name}</h3>
        <div class="tags" style="margin-bottom:14px;">
          <span class="badge volt">${routine.goal}</span>
          <span class="badge line">${routine.difficulty}</span>
          <span class="badge line">${routine.durationWeeks} weeks</span>
        </div>
        <a href="routines.html?id=${routine.id}" class="btn btn-dark btn-block">View schedule</a>
      `;
    }
  }

  renderAll();

  document.getElementById('load-sample-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    setBtnBusy(btn, true, 'Loading…');
    setTimeout(() => {
      AuraDB.generateSampleActivity(user.id);
      renderAll();
      setBtnBusy(btn, false);
      Toast.show('Sample workouts, progress, and a routine were added.', 'success');
    }, 350);
  });
})();
