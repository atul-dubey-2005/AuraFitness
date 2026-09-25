/* =========================================================
   Aura Fitness — exercise detail modal
   Shared across the Exercise Library and Routines pages:
   shows the pictogram, key facts, and step-by-step form cues.
   ========================================================= */

function ensureExerciseModal() {
  if (document.getElementById('exercise-modal')) return;

  const host = document.createElement('div');
  host.id = 'exercise-modal';
  host.className = 'modal-overlay';
  host.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-ex-name">
      <button type="button" class="modal-close" id="modal-close-btn" aria-label="Close">&times;</button>
      <div class="modal-icon" id="modal-icon"></div>
      <div class="modal-body">
        <div class="tags" id="modal-tags"></div>
        <h2 id="modal-ex-name"></h2>
        <p id="modal-desc"></p>
        <h3 style="font-size:15px; margin-bottom:10px;">How to perform it</h3>
        <ol class="steps-list" id="modal-steps"></ol>
      </div>
    </div>
  `;
  document.body.appendChild(host);

  host.addEventListener('click', (e) => { if (e.target === host) closeExerciseModal(); });
  document.getElementById('modal-close-btn').addEventListener('click', closeExerciseModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && host.classList.contains('open')) closeExerciseModal();
  });
}

function openExerciseModal(exercise) {
  ensureExerciseModal();

  document.getElementById('modal-icon').innerHTML = ExerciseIcons.svg(exercise.icon, 128);
  document.getElementById('modal-tags').innerHTML = `
    <span class="badge line">${exercise.category}</span>
    <span class="badge line">${exercise.muscleGroup}</span>
    <span class="badge ${exercise.difficulty === 'Advanced' ? 'coral' : exercise.difficulty === 'Beginner' ? 'volt' : ''}">${exercise.difficulty}</span>
    <span class="badge line">${exercise.equipment}</span>
  `;
  document.getElementById('modal-ex-name').textContent = exercise.name;
  document.getElementById('modal-desc').textContent = exercise.description;
  document.getElementById('modal-steps').innerHTML =
    (exercise.steps || []).map(s => `<li>${s}</li>`).join('');

  const host = document.getElementById('exercise-modal');
  host.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close-btn').focus();
}

function closeExerciseModal() {
  const host = document.getElementById('exercise-modal');
  if (host) host.classList.remove('open');
  document.body.style.overflow = '';
}
