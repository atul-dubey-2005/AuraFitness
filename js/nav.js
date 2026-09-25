/* Renders the app header/nav into #app-header, and guards the page. */

function renderAppHeader(activePage) {
  const user = AuraDB.requireAuth();
  if (!user) return null;

  const links = [
    ['dashboard.html', 'Dashboard'],
    ['log-workout.html', 'Log Workout'],
    ['progress.html', 'Progress'],
    ['routines.html', 'Routines'],
    ['exercises.html', 'Exercises'],
    ['profile.html', 'Profile'],
  ];

  const navHtml = links.map(([href, label]) =>
    `<a href="${href}" class="${activePage === href ? 'active' : ''}">${label}</a>`
  ).join('');

  const host = document.getElementById('app-header');
  host.innerHTML = `
    <div class="wrap">
      <a href="dashboard.html" class="brand">Aura<span>Fitness</span></a>
      <nav class="app-nav" id="app-nav">${navHtml}</nav>
      <div class="header-actions">
        <div class="who"><strong>${user.firstName}</strong>${user.fitnessGoal}</div>
        <a href="#" class="logout-link" id="logout-link">Log out</a>
        <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="app-nav">Menu</button>
      </div>
    </div>
  `;

  document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    AuraDB.logout();
    window.location.href = 'index.html';
  });

  const toggle = document.getElementById('nav-toggle');
  const navEl = document.getElementById('app-nav');
  toggle.addEventListener('click', () => {
    const open = navEl.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  return user;
}
