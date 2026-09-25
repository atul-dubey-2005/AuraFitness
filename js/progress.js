(() => {
  const user = renderAppHeader('progress.html');
  if (!user) return;

  const R = Validate.rules;
  const logDateInput = document.getElementById('logDate');
  const weightInput = document.getElementById('weight');
  const bodyFatInput = document.getElementById('bodyFat');
  const chestInput = document.getElementById('chest');
  const waistInput = document.getElementById('waist');
  const hipInput = document.getElementById('hip');
  const armInput = document.getElementById('arm');
  const thighInput = document.getElementById('thigh');

  logDateInput.value = new Date().toISOString().slice(0, 10);

  const fieldSpecs = [
    [logDateInput, [R.required, R.notFutureDate]],
    [weightInput, [R.rangeRequired(20, 400, 'kg')]],
    [bodyFatInput, [R.range(1, 70, '%')]],
    [chestInput, [R.range(20, 250, 'cm')]],
    [waistInput, [R.range(20, 250, 'cm')]],
    [hipInput, [R.range(20, 250, 'cm')]],
    [armInput, [R.range(10, 100, 'cm')]],
    [thighInput, [R.range(10, 150, 'cm')]],
  ];
  fieldSpecs.forEach(([input, validators]) => Validate.liveWire(input, validators));

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
      tableHost.innerHTML = `<table>
        <thead><tr><th>Date</th><th>Weight</th><th>Body fat</th><th>Notes</th></tr></thead>
        <tbody>
          ${history.slice().reverse().map(r => `
            <tr>
              <td>${new Date(r.logDate).toLocaleDateString()}</td>
              <td>${r.weight ? r.weight + ' kg' : '—'}</td>
              <td>${r.bodyFatPercentage ? r.bodyFatPercentage + '%' : '—'}</td>
              <td>${r.notes || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
    }
  }

  render();

  const form = document.getElementById('progress-form');
  const msg = document.getElementById('form-msg');
  const saveBtn = document.getElementById('save-progress-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.classList.remove('show');

    if (!Validate.validateAll(fieldSpecs)) return;

    setBtnBusy(saveBtn, true, 'Saving…');
    setTimeout(() => {
      AuraDB.addProgressLog(user.id, {
        logDate: logDateInput.value,
        weight: weightInput.value,
        bodyFatPercentage: bodyFatInput.value,
        chest: chestInput.value,
        waist: waistInput.value,
        hip: hipInput.value,
        arm: armInput.value,
        thigh: thighInput.value,
        notes: document.getElementById('notes').value.trim(),
      });
      Toast.show('Entry saved.', 'success');
      form.reset();
      logDateInput.value = new Date().toISOString().slice(0, 10);
      document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
      document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
      setBtnBusy(saveBtn, false);
      render();
    }, 250);
  });
})();
