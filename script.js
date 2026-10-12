// Filter the real project collection without changing the page location.
const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  let count = 0;
  projects.forEach(project => {
    project.hidden = category !== 'all' && project.dataset.category !== category;
    if (!project.hidden) count += 1;
  });
  document.querySelector('#project-count').textContent = `Showing ${count} projects`;
}));

// Theme: day/night toggle. Remembers the choice; otherwise follows the OS setting.
const themeToggle = document.getElementById('theme-toggle');
const rootEl = document.documentElement;
const isDark = () => rootEl.dataset.theme === 'dark';
function paintToggle() {
  const dark = isDark();
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.setAttribute('aria-pressed', String(dark));
}
themeToggle.addEventListener('click', () => {
  if (isDark()) { delete rootEl.dataset.theme; } else { rootEl.dataset.theme = 'dark'; }
  try { localStorage.setItem('leo-theme', isDark() ? 'dark' : 'light'); } catch (e) {}
  paintToggle();
});
paintToggle();
