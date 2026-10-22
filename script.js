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
// Back-to-top progress ring: fills with the same reading progress; the
// button appears once the page is scrolled. Click returns to the top,
// smooth unless the user prefers reduced motion. Without JS the plain
// anchor jump (#main) remains as the fallback.
const backTop = document.getElementById('back-top');
const ringFg = backTop ? backTop.querySelector('.ring-fg') : null;
let ringLen = 0;
if (ringFg) {
  ringLen = 2 * Math.PI * 19;
  ringFg.style.strokeDasharray = ringLen;
  ringFg.style.strokeDashoffset = ringLen;
}
if (progressBar) {
  let progressScheduled = false;
  function paintProgress() {
    progressScheduled = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    if (ringFg) ringFg.style.strokeDashoffset = (ringLen * (1 - progress)).toFixed(2);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 600);
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
if (backTop) {
  backTop.addEventListener('click', event => {
    event.preventDefault();
    const smooth = matchMedia('(prefers-reduced-motion: no-preference)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  });
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

// Live local time in the hero availability badge (Hamilton, ON). Static
// "Hamilton, ON" text stays for no-JS users; the clock only appends itself
// when the Intl API is available. Screen readers are not spammed: no
// aria-live, the time is plain text updated every 30 seconds.
const localTimeEl = document.getElementById('local-time');
// Magnetic CTA buttons: drift a fraction of the pointer offset toward the
// cursor while hovered, then spring back on leave. Desktop hover-capable
// pointers only; reduced-motion, touch and no-JS users get static buttons.
const canMagnet =
  matchMedia('(hover: hover) and (pointer: fine)').matches &&
  matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (canMagnet) {
  document.querySelectorAll('.primary, .secondary').forEach(btn => {
    btn.addEventListener('pointermove', event => {
      const rect = btn.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      btn.style.transform =
        'translate(' + (dx * 0.3).toFixed(1) + 'px,' + (dy * 0.3).toFixed(1) + 'px)';
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

if (localTimeEl && typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
  let timeFmt = null;
  try {
    timeFmt = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto', timeZoneName: 'short'
    });
  } catch (e) { timeFmt = null; }
  if (timeFmt) {
    const tick = () => {
      const now = new Date();
      localTimeEl.textContent = ' · ' + timeFmt.format(now);
      localTimeEl.setAttribute('datetime', now.toISOString());
    };
    tick();
    setInterval(tick, 30000);
  }
}

// Section deep-links: each section heading carries a link button that copies
// a shareable URL (…/#work). Without JS it degrades to a plain anchor jump.
// Same clipboard strategy as the email copy button; feedback is an instant
// icon swap plus an aria-label update, so reduced-motion users get no animation.
document.querySelectorAll('.heading-anchor').forEach(anchor => {
  anchor.addEventListener('click', async event => {
    event.preventDefault();
    const url = window.location.origin + window.location.pathname +
      anchor.getAttribute('href');
    let ok = true;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers without the Clipboard API.
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    } catch (e) { ok = false; }
    anchor.classList.toggle('copied', ok);
    anchor.setAttribute('aria-label', ok
      ? 'Link copied to clipboard'
      : 'Copy failed. Copy the URL from the address bar instead.');
    clearTimeout(anchor._reset);
    anchor._reset = setTimeout(() => {
      anchor.classList.remove('copied');
      anchor.setAttribute('aria-label', anchor.getAttribute('data-label'));
    }, 2000);
  });
});

// Typewriter in the hero intro: cycles through what Leo builds
// ("web applications", "data pipelines", "ML models", "REST APIs").
// Without JS or with reduced motion the first phrase stays as plain
// static text; the animated word is aria-hidden, so screen readers
// hear the full static list in the visually-hidden span instead.
// Timers pause while the tab is hidden.
const typedWord = document.getElementById('typed-word');
if (typedWord && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const phrases = ['web applications', 'data pipelines', 'ML models', 'REST APIs'];
  let phrase = 0, pos = phrases[0].length, mode = 'hold', timer = null;
  function later(ms, fn) {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  }
  function tick() {
    const current = phrases[phrase];
    if (mode === 'hold') {
      mode = 'deleting';
      later(1600, tick);
      return;
    }
    if (mode === 'deleting') {
      pos -= 1;
      typedWord.textContent = current.slice(0, Math.max(0, pos));
      if (pos <= 0) {
        phrase = (phrase + 1) % phrases.length;
        mode = 'typing';
        later(450, tick);
      } else {
        later(28, tick);
      }
      return;
    }
    pos += 1;
    typedWord.textContent = current.slice(0, pos);
    if (pos >= current.length) {
      mode = 'hold';
      later(1600, tick);
    } else {
      later(60, tick);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(timer); timer = null; }
    else if (timer === null) { later(400, tick); }
  });
  tick();
}
