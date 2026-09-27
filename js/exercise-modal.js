/* Reusable "exercise details" modal — used from the exercise library
   and from a routine's day-by-day schedule. Builds its own DOM once
   and is driven by AuraExerciseModal.open(exercise). */

const AuraExerciseModal = (() => {
  let backdrop, closeBtn, body;

  function ensure() {
    if (backdrop) return;
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-ex-name">
        <button type="button" class="modal-close" id="modal-close" aria-label="Close">✕</button>
        <div class="modal-body" id="modal-body"></div>
      </div>
    `;
    document.body.appendChild(backdrop);
    closeBtn = backdrop.querySelector('#modal-close');
    body = backdrop.querySelector('#modal-body');

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function close() {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function open(exercise, opts = {}) {
    ensure();
    const diffBadge = exercise.difficulty === 'Advanced' ? 'coral' : 'volt';

    body.innerHTML = `
      <div class="modal-top">
        <div class="xicon-badge lg">${ExerciseIcons.svg(exercise.icon, 56)}</div>
        <div>
          <h2 id="modal-ex-name">${exercise.name}</h2>
          <div class="modal-meta">
            <span class="badge line">${exercise.category}</span>
            <span class="badge line">${exercise.muscleGroup}</span>
            <span class="badge ${diffBadge}">${exercise.difficulty}</span>
          </div>
          <p style="margin:8px 0 0;">${exercise.description}</p>
        </div>
      </div>

      <div class="modal-section">
        <h4>At a glance</h4>
        <div class="stat-grid" style="grid-template-columns:repeat(3,1fr); margin-bottom:0;">
          <div class="stat plain"><div class="k">Equipment</div><div class="v" style="font-size:18px;">${exercise.equipment}</div></div>
          <div class="stat plain"><div class="k">Calories / set</div><div class="v" style="font-size:18px;">~${exercise.caloriesPerSet}</div></div>
          <div class="stat plain"><div class="k">Difficulty</div><div class="v" style="font-size:18px;">${exercise.difficulty}</div></div>
        </div>
      </div>

      ${exercise.steps ? `
        <div class="modal-section">
          <h4>How to do it</h4>
          <ol class="step-list">
            ${exercise.steps.map((s, i) => `<li><span class="num">${i + 1}</span><span>${s}</span></li>`).join('')}
          </ol>
        </div>` : ''}

      ${exercise.benefits ? `
        <div class="modal-section">
          <h4>Advantages</h4>
          <ul class="benefit-list">
            ${exercise.benefits.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>` : ''}

      ${exercise.tips ? `
        <div class="modal-section">
          <h4>Common mistakes to avoid</h4>
          <ul class="tip-list">
            ${exercise.tips.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>` : ''}

      <div class="modal-section" style="display:flex; gap:10px; flex-wrap:wrap;">
        <a href="log-workout.html?exercise=${exercise.id}" class="btn btn-primary">Add to today's log</a>
        <button type="button" class="btn btn-outline" id="modal-close-2">Close</button>
      </div>
    `;

    body.querySelector('#modal-close-2').addEventListener('click', close);

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  return { open, close };
})();
