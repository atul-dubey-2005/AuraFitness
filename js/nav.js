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
        <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="app-nav" aria-label="Menu">
          <span class="bar"></span>
        </button>
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

  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function closeNav() {
    navEl.classList.remove('open');
    backdrop.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  function openNav() {
    navEl.classList.add('open');
    backdrop.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', () => {
    const isOpen = navEl.classList.contains('open');
    if (isOpen) closeNav(); else openNav();
  });
  backdrop.addEventListener('click', closeNav);
  navEl.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') closeNav();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  // subtle shadow once the page scrolls under the sticky header
  const header = host;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return user;
}
