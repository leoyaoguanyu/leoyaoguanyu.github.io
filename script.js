// Copy email to clipboard: one click, with a "Copied" confirmation state.
const copyBtn = document.getElementById('copy-email');
if (copyBtn) {
  const copyLabel = copyBtn.querySelector('.copy-label');
  const originalLabel = copyLabel.textContent;
  let resetTimer = null;
  function showCopied(message, pressed) {
    copyBtn.classList.toggle('copied', pressed);
    copyBtn.setAttribute('aria-label', message);
    copyLabel.textContent = pressed ? 'Copied' : originalLabel;
  }
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        // Fallback for older browsers without the Clipboard API.
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showCopied('Email address copied to clipboard', true);
    } catch (e) {
      copyBtn.setAttribute('aria-label', 'Copy failed. Select the email address manually.');
      copyLabel.textContent = 'Failed';
    }
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => showCopied('Copy email address', false), 2000);
  });
}

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

// Scroll reveal: tagged sections rise and fade in as they enter the viewport,
// project cards staggered. No-JS and reduced-motion users see everything as-is.
if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  rootEl.classList.add('js');
  document.querySelectorAll('.projects').forEach(grid => {
    [...grid.children].forEach((card, i) =>
      card.style.setProperty('--reveal-delay', Math.min(i, 3) * 90 + 'ms'));
  });
  const targets = document.querySelectorAll('[data-reveal]');
  targets.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
  targets.forEach(el => io.observe(el));
}

// Cursor spotlight: a soft glow follows the pointer over each project's
// visual banner. Skipped on touch devices and for reduced-motion users.
const canSpotlight =
  matchMedia('(hover: hover) and (pointer: fine)').matches &&
  matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (canSpotlight) {
  document.querySelectorAll('.project-visual').forEach(visual => {
    visual.addEventListener('pointermove', event => {
      const rect = visual.getBoundingClientRect();
      visual.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
      visual.style.setProperty('--my', (event.clientY - rect.top) + 'px');
    });
  });
}

// Scroll progress bar: a razor-thin bar at the top edge fills as the page is
// read. Transform-only updates coalesced through rAF; no transitions, so it
// stays accurate and animation-free for reduced-motion users.
const progressBar = document.querySelector('.scroll-progress');
if (progressBar) {
  let progressScheduled = false;
  function paintProgress() {
    progressScheduled = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
  }
  function scheduleProgress() {
    if (!progressScheduled) {
      progressScheduled = true;
      requestAnimationFrame(paintProgress);
    }
  }
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress);
  paintProgress();
}

// Scrollspy: highlight the nav link whose section is currently in view.
// A link is active only when its section crosses the viewport middle; when
// nothing matches (e.g. at the very top), no link is highlighted.
const navLinks = [...document.querySelectorAll('header nav a[href^="#"]')];
const sectionLinks = navLinks
  .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(({ section }) => section !== null);
if ('IntersectionObserver' in window && sectionLinks.length > 0) {
  function setActive(current) {
    sectionLinks.forEach(({ link }) => {
      const active = link === current;
      link.classList.toggle('active', active);
      if (active) { link.setAttribute('aria-current', 'true'); }
      else { link.removeAttribute('aria-current'); }
    });
  }
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const match = sectionLinks.find(({ section }) => section === entry.target);
        if (match) setActive(match.link);
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sectionLinks.forEach(({ section }) => spy.observe(section));
}
