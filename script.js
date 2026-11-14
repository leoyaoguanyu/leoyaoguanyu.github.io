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
// Count badge on each filter button, computed from the real cards so it
// can never drift from the grid (all / software / data). Also sets the
// visible result line from the same counts; no-JS visitors still see the
// static "Showing 5 of 5 projects" line from the HTML.
const projectCountEl = document.querySelector('#project-count');
if (projectCountEl) {
  projectCountEl.textContent = `Showing ${projects.length} of ${projects.length} projects`;
}
filters.forEach(button => {
  const category = button.dataset.filter;
  const total = category === 'all'
    ? projects.length
    : [...projects].filter(project => project.dataset.category === category).length;
  const badge = document.createElement('span');
  badge.className = 'filter-count';
  badge.textContent = `(${total})`;
  button.appendChild(badge);
});
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  // A category pick clears any active tag filter (see tag filter below),
  // so the two filters never contradict each other.
  clearTagFilter();
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
  document.querySelector('#project-count').textContent = `Showing ${count} of ${projects.length} projects`;
  paintToggleAll();
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
  const nextDark = !isDark();
  const applyTheme = () => {
    if (nextDark) { rootEl.dataset.theme = 'dark'; } else { delete rootEl.dataset.theme; }
    try { localStorage.setItem('leo-theme', nextDark ? 'dark' : 'light'); } catch (e) {}
    paintToggle();
  };
  // Circular wipe from the toggle button (evolution #33, View Transitions
  // API): the new theme spreads out from the button instead of swapping
  // instantly. Browsers without the API, and reduced-motion users, keep
  // the instant switch; the system-driven change below never animates.
  // The .35s colour transitions are frozen during the wipe so the
  // captured snapshots show the final colours, not a mid-fade.
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion) { applyTheme(); return; }
  const rect = themeToggle.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  rootEl.classList.add('theme-animating');
  const transition = document.startViewTransition(applyTheme);
  transition.ready.then(() => {
    rootEl.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      { duration: 450, easing: 'ease-out', pseudoElement: '::view-transition-new(root)' }
    );
  }).catch(() => {});
  transition.finished.finally(() => rootEl.classList.remove('theme-animating'));
});
paintToggle();

// Follow the OS theme live, but only while the visitor has never picked
// a theme manually: the toggle above stores 'leo-theme', and a stored
// choice always wins over later system changes. Visitors who never
// touch the toggle see the site track a sunset OS switch (or a
// scheduled dark-mode flip) without reloading. No visual change on
// load, no animation, and the existing theme-transition rules apply.
(function followSystemTheme() {
  var darkQuery = matchMedia('(prefers-color-scheme: dark)');
  function onSystemThemeChange(event) {
    try {
      if (localStorage.getItem('leo-theme')) return;
    } catch (e) {}
    if (event.matches) { rootEl.dataset.theme = 'dark'; }
    else { delete rootEl.dataset.theme; }
    paintToggle();
  }
  if (darkQuery.addEventListener) {
    darkQuery.addEventListener('change', onSystemThemeChange);
  } else if (darkQuery.addListener) {
    darkQuery.addListener(onSystemThemeChange);
  }
})();

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

// 3D tilt: project cards lean toward the pointer like a physical card
// catching the light (evolution #35). Same gate as the spotlight above:
// hover-capable fine pointers only, never for reduced-motion users.
// Angles stay small (max 4deg) so a grid of cards never feels seasick;
// leaving the card resets the angles and the existing .2s transform
// transition eases it flat again, while the hover lift (-3px) is kept in
// the same transform in CSS so the two effects stack.
if (canSpotlight) {
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
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
// Sticky header shadow (evolution #15): the header itself is sticky via
// CSS; this reuses the existing rAF progress update to add a soft shadow
// once the page has scrolled, with no extra scroll listener.
const siteHeader = document.querySelector('header');
// Hero scroll cue (evolution #17): fades out once the reader starts
// scrolling, reusing the existing rAF progress update below.
const scrollCue = document.getElementById('scroll-cue');
if (progressBar) {
  let progressScheduled = false;
  function paintProgress() {
    progressScheduled = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    if (ringFg) ringFg.style.strokeDashoffset = (ringLen * (1 - progress)).toFixed(2);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 600);
    if (scrollCue) scrollCue.classList.toggle('dismissed', window.scrollY > 120);
    if (siteHeader) siteHeader.classList.toggle('scrolled', window.scrollY > 8);
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

// Time-of-day greeting in the hero eyebrow, on Hamilton time (the same
// Toronto clock as the availability badge): "GOOD MORNING · COMPUTER
// SCIENCE · McMASTER UNIVERSITY", afternoon and evening likewise. No-JS
// users keep the static eyebrow text; the greeting only rewrites it when
// Intl is available. Plain text swap, no animation, so reduced-motion
// users see the same static line; re-checked every minute so a page left
// open rolls over the boundary on its own.
const heroEyebrowEl = document.getElementById('hero-eyebrow');
if (heroEyebrowEl && typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
  let hourFmt = null;
  try {
    hourFmt = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', hour12: false, timeZone: 'America/Toronto'
    });
  } catch (e) { hourFmt = null; }
  if (hourFmt) {
    const updateGreeting = () => {
      const hour = Number(hourFmt.format(new Date())) % 24;
      const greeting = hour >= 5 && hour < 12 ? 'GOOD MORNING'
        : hour >= 12 && hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
      heroEyebrowEl.textContent =
        greeting + ' · COMPUTER SCIENCE · McMASTER UNIVERSITY';
    };
    updateGreeting();
    setInterval(updateGreeting, 60000);
  }
}

// Last-updated stamp in the footer: read the newest commit date from the
// public GitHub API and show "Updated Nov 7, 2026" as a link to that
// commit, so a recruiter can see at a glance that the site is actively
// maintained. No API key, no build step, no animation; if fetch or the
// API fails, the element stays hidden and the footer looks exactly as
// before. The date is shown in the site's home timezone (Toronto).
const lastUpdatedEl = document.getElementById('last-updated');
if (lastUpdatedEl && typeof fetch === 'function' && typeof Intl !== 'undefined' &&
    typeof Intl.DateTimeFormat === 'function') {
  fetch('https://api.github.com/repos/leoyaoguanyu/leoyaoguanyu.github.io/commits?per_page=1')
    .then(response => {
      if (!response.ok) throw new Error('GitHub API ' + response.status);
      return response.json();
    })
    .then(commits => {
      const latest = Array.isArray(commits) ? commits[0] : null;
      const date = latest && latest.commit && latest.commit.committer &&
        latest.commit.committer.date;
      const parsed = date ? new Date(date) : null;
      if (!latest || !latest.html_url || !parsed || isNaN(parsed)) return;
      const stamp = new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Toronto'
      }).format(parsed);
      lastUpdatedEl.textContent = 'Updated ' + stamp;
      lastUpdatedEl.href = latest.html_url;
      lastUpdatedEl.removeAttribute('hidden');
    })
    .catch(() => { /* stay hidden; the footer is unchanged */ });
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
// ("web applications", "data pipelines", "dashboards", "ML models", "REST APIs").
// Without JS or with reduced motion the first phrase stays as plain
// static text; the animated word is aria-hidden, so screen readers
// hear the full static list in the visually-hidden span instead.
// Timers pause while the tab is hidden.
const typedWord = document.getElementById('typed-word');
if (typedWord && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const phrases = ['web applications', 'data pipelines', 'dashboards', 'ML models', 'REST APIs'];
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

// Animated metric counter: the sentiment card's headline F1 (0.7817, the
// value reported in that project's README) counts up from 0 once the
// number scrolls into view, using rAF with an ease-out curve so it lands
// exactly on the reported value. It runs a single time; no-JS and
// prefers-reduced-motion users keep the static final value from the HTML,
// and a beforeprint hook forces the final value so paper never shows 0.
const metricValue = document.querySelector('[data-count-to]');
if (metricValue) {
  const countTarget = parseFloat(metricValue.dataset.countTo);
  const countDecimals = parseInt(metricValue.dataset.countDecimals || '0', 10);
  let countFinished = false;
  const finishCount = () => {
    countFinished = true;
    metricValue.textContent = countTarget.toFixed(countDecimals);
  };
  window.addEventListener('beforeprint', finishCount);
  if ('IntersectionObserver' in window &&
      matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const counterIo = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || countFinished) return;
        counterIo.disconnect();
        const duration = 1200;
        const start = performance.now();
        const step = now => {
          if (countFinished) return;
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          metricValue.textContent = (countTarget * eased).toFixed(countDecimals);
          if (progress < 1) { requestAnimationFrame(step); }
          else { finishCount(); }
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counterIo.observe(metricValue);
  }
}

// Animated delay chart: the featured e-commerce card's five review-score
// bars grow from the baseline once the chart scrolls into view, staggered
// left to right (CSS transition-delays), so the on-time vs late gap reads
// as a reveal rather than a static picture. Runs once; no-JS and
// prefers-reduced-motion users keep the full bars from the HTML/CSS, and
// a beforeprint hook forces the grown state so paper never shows flat bars.
const delayBars = document.querySelector('.delay-bars');
if (delayBars) {
  window.addEventListener('beforeprint', () => delayBars.classList.add('grown'));
  if ('IntersectionObserver' in window &&
      matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const barsIo = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          delayBars.classList.add('grown');
          barsIo.disconnect();
        }
      });
    }, { threshold: 0.4 });
    barsIo.observe(delayBars);
  }
}

// Clickable tech tags: the tag chips on each project card filter the grid
// by that technology, so a recruiter can jump straight to the Python work
// (or React, or SQL) instead of scanning every card. Clicking the active
// tag again clears the filter; picking a category above also clears it
// (the category handler calls clearTagFilter). The chips are plain <span>s
// in the HTML and only become buttons here, so no-JS visitors keep the
// static labels. The visible result line names the active tag and keeps
// its aria-live announcements; every chip carrying the active tag lights
// up, since the same technology appears on several cards. No animation,
// so reduced-motion users see the same static filter; dark theme and
// print are handled by the matching CSS rules.
const tagButtons = [];
document.querySelectorAll('.project .tags span').forEach(span => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = span.textContent;
  button.setAttribute('aria-pressed', 'false');
  span.replaceWith(button);
  tagButtons.push(button);
});
let activeTag = null;
const tagResultLine = document.querySelector('#project-count');
function paintTagButtons() {
  tagButtons.forEach(btn => {
    const pressed = activeTag !== null && btn.textContent === activeTag;
    btn.classList.toggle('active', pressed);
    btn.setAttribute('aria-pressed', String(pressed));
    btn.setAttribute('aria-label', pressed
      ? 'Show all projects (clear ' + btn.textContent + ' filter)'
      : 'Show only projects using ' + btn.textContent);
  });
}
function clearTagFilter() {
  if (activeTag === null) return;
  activeTag = null;
  paintTagButtons();
}
function applyTagFilter(tag) {
  activeTag = activeTag === tag ? null : tag;
  // A tag filter replaces the category filter: reset the category buttons
  // to "All work" so the two filters never contradict each other.
  filters.forEach(item => {
    const selected = item.dataset.filter === 'all';
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  let count = 0;
  projects.forEach(project => {
    const tags = [...project.querySelectorAll('.tags button')].map(el => el.textContent);
    project.hidden = activeTag !== null && !tags.includes(activeTag);
    if (!project.hidden) count += 1;
  });
  if (tagResultLine) {
    tagResultLine.textContent = activeTag === null
      ? 'Showing ' + count + ' of ' + projects.length + ' projects'
      : 'Showing ' + count + ' of ' + projects.length + ' projects · ' + activeTag;
  }
  paintTagButtons();
  paintToggleAll();
}
tagButtons.forEach(button => button.addEventListener('click', () => applyTagFilter(button.textContent)));

// Expand/collapse all project details: one click opens (or closes) every
// visible project's <details>, so a recruiter can read all five write-ups
// without opening each card by hand. The button is created here, so no-JS
// visitors never see a dead control; it sits in its own toolbar row above
// the result line. Its label follows the real state — "Collapse all" only
// when every visible card is open — and repaints whenever a card is toggled
// by hand (the 'toggle' listener below) or the category/tag filters change
// which cards are visible (those handlers call paintToggleAll; this
// function declaration is hoisted, so the earlier handlers can reach it,
// and they only ever run on clicks, after this whole script has evaluated).
// Only visible cards are toggled, so a filtered view is never disturbed by
// hidden cards. Native <details> keyboard and screen-reader behaviour is
// untouched; aria-expanded on the button mirrors the all-open state.
const projectDetails = [...document.querySelectorAll('.project details')];
const detailsToggleBtn = document.createElement('button');
const detailsToolbar = document.createElement('div');
const projectCountLine = document.querySelector('#project-count');
function visibleDetails() {
  return projectDetails.filter(detail => !detail.closest('.project').hidden);
}
function paintToggleAll() {
  const visible = visibleDetails();
  const allOpen = visible.length > 0 && visible.every(detail => detail.open);
  detailsToggleBtn.textContent = allOpen ? 'Collapse all' : 'Expand all';
  detailsToggleBtn.setAttribute('aria-expanded', String(allOpen));
}
if (projectDetails.length > 0 && projectCountLine) {
  detailsToggleBtn.type = 'button';
  detailsToggleBtn.className = 'details-toggle';
  detailsToggleBtn.setAttribute('aria-label',
    'Expand or collapse all project details');
  detailsToolbar.className = 'details-toolbar';
  detailsToolbar.appendChild(detailsToggleBtn);
  projectCountLine.before(detailsToolbar);
  detailsToggleBtn.addEventListener('click', () => {
    const visible = visibleDetails();
    const open = !(visible.length > 0 && visible.every(detail => detail.open));
    visible.forEach(detail => { detail.open = open; });
    paintToggleAll();
  });
  projectDetails.forEach(detail => detail.addEventListener('toggle', paintToggleAll));
  paintToggleAll();
}
