(() => {
  const user = renderAppHeader('progress.html');
  if (!user) return;

  document.getElementById('logDate').value = new Date().toISOString().slice(0, 10);

  function render() {
    const history = AuraDB.getUserProgressHistory(user.id);
    const latest = AuraDB.getLatestProgressLog(user.id);
    const change = AuraDB.calculateWeightLoss(user.id);

    document.getElementById('stat-count').textContent = history.length;
    document.getElementById('stat-latest').innerHTML = latest && latest.weight
      ? `${latest.weight}<span class="u">kg</span>` : '—';

    const changeEl = document.getElementById('stat-change');
    if (change === null) {
      changeEl.textContent = '—';
    } else if (change === 0) {
      changeEl.innerHTML = `0<span class="u">kg</span>`;
    } else {
      changeEl.innerHTML = `${change > 0 ? '−' : '+'}${Math.abs(change)}<span class="u">kg</span>`;
    }

    // bar chart of last 10 entries
    const barsHost = document.getElementById('weight-bars');
    const recent = history.slice(-10);
    if (!recent.length) {
      barsHost.innerHTML = `<div class="empty-state" style="width:100%;"><strong>No entries yet</strong>Log your first measurement to see the trend.</div>`;
    } else {
      const weights = recent.map(r => r.weight || 0);
      const max = Math.max(...weights, 1);
      const min = Math.min(...weights.filter(Boolean), max);
      const range = Math.max(max - min, 1);
      barsHost.innerHTML = recent.map(r => {
        const h = r.weight ? 20 + ((r.weight - min) / range) * 130 : 8;
        const label = new Date(r.logDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return `<div class="bar-col">
          <div class="bar" style="height:${h}px;" title="${r.weight ?? '—'} kg"></div>
          <div class="lbl">${label}</div>
        </div>`;
      }).join('');
    }

    // table
    const tableHost = document.getElementById('progress-table');
    if (!history.length) {
      tableHost.innerHTML = `<div class="empty-state"><strong>Nothing logged yet</strong>Use the form to add your first entry.</div>`;
    } else {
      tableHost.innerHTML = `<table class="responsive-table">
        <thead><tr><th>Date</th><th>Weight</th><th>Body fat</th><th>Notes</th></tr></thead>
        <tbody>
          ${history.slice().reverse().map(r => `
            <tr>
              <td data-label="Date">${new Date(r.logDate).toLocaleDateString()}</td>
              <td data-label="Weight">${r.weight ? r.weight + ' kg' : '—'}</td>
              <td data-label="Body fat">${r.bodyFatPercentage ? r.bodyFatPercentage + '%' : '—'}</td>
              <td data-label="Notes">${r.notes || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
    }
  }

  render();

  const form = document.getElementById('progress-form');
  const msg = document.getElementById('form-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    AuraDB.addProgressLog(user.id, {
      logDate: document.getElementById('logDate').value,
      weight: document.getElementById('weight').value,
      bodyFatPercentage: document.getElementById('bodyFat').value,
      chest: document.getElementById('chest').value,
      waist: document.getElementById('waist').value,
      hip: document.getElementById('hip').value,
      arm: document.getElementById('arm').value,
      thigh: document.getElementById('thigh').value,
      notes: document.getElementById('notes').value.trim(),
    });
    msg.textContent = 'Entry saved.';
    msg.classList.add('show');
    form.reset();
    document.getElementById('logDate').value = new Date().toISOString().slice(0, 10);
    render();
    setTimeout(() => msg.classList.remove('show'), 2500);
  });
})();
