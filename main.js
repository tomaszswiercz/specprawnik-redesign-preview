const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Otwórz menu' : 'Zamknij menu');
  mainNav.classList.toggle('is-open', !expanded);
});

mainNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Otwórz menu');
    mainNav.classList.remove('is-open');
  }
});

const issueInput = document.getElementById('issue');
document.querySelectorAll('[data-topic]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!issueInput) return;
    issueInput.value = button.dataset.topic;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('szukaj').scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
    window.setTimeout(() => issueInput.focus({ preventScroll: true }), reducedMotion ? 0 : 350);
  });
});

const progressBar = document.querySelector('.scroll-progress');
let progressFrame = 0;
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
  progressFrame = 0;
}
function queueScrollProgress() {
  if (!progressFrame) progressFrame = window.requestAnimationFrame(updateScrollProgress);
}
window.addEventListener('scroll', queueScrollProgress, { passive: true });
window.addEventListener('resize', queueScrollProgress);
queueScrollProgress();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches) {
  const revealElements = [...document.querySelectorAll('.featured-intro, .lawyer-list-item, .paths .section-head, .path-item, .steps .section-head, .steps-list li, .topics-intro, .topic-card, .business-copy, .business-topics, .phone-inner, .lawyers-visual, .lawyers-copy, .faq-layout > div:first-child, .faq-list details')];
  revealElements.forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.top > window.innerHeight - 24) {
      const siblings = [...element.parentElement.children];
      element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element) % 4, 3) * 65}ms`);
      element.classList.add('will-reveal');
    }
  });

  let revealFrame = 0;
  function revealVisible() {
    revealElements.forEach((element) => {
      if (!element.classList.contains('will-reveal') || element.classList.contains('is-visible')) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight + 48 && bounds.bottom > 0) element.classList.add('is-visible');
    });
    revealFrame = 0;
  }
  function queueReveal() {
    if (!revealFrame) revealFrame = window.requestAnimationFrame(revealVisible);
  }
  window.addEventListener('scroll', queueReveal, { passive: true });
  window.addEventListener('resize', queueReveal);
  queueReveal();

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      document.querySelectorAll('.will-reveal').forEach((element) => element.classList.add('is-visible'));
    }
  });
}
