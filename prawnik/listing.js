const searchForm = document.querySelector('.listing-search');
const searchIssue = document.querySelector('#issue');
const searchCity = document.querySelector('#city');
const scopeInputs = [...document.querySelectorAll('input[name="scope"]')];
const categorySelect = document.querySelector('#category');
const helpSelect = document.querySelector('#help-type');
const professionSelect = document.querySelector('#profession');
const minimumRatingSelect = document.querySelector('#minimum-rating');
const minimumReviewsSelect = document.querySelector('#minimum-reviews');
const sortSelect = document.querySelector('#sort');
const cards = [...document.querySelectorAll('.result-card')];
const resultList = document.querySelector('#result-list');
const resultCount = document.querySelector('#result-count');
const activeFilters = document.querySelector('#active-filters');
const emptyState = document.querySelector('#no-results');
const filterPanel = document.querySelector('.filter-panel');
const filterTitle = document.querySelector('#filter-title');
const quickTopics = [...document.querySelectorAll('[data-quick-category]')];
const compareDock = document.querySelector('#compare-dock');
const compareCount = document.querySelector('#compare-count');
const compareFeedback = document.querySelector('#compare-feedback');
const compareOpen = document.querySelector('#compare-open');
const compareDialog = document.querySelector('#compare-dialog');
const compareGrid = document.querySelector('#compare-grid');
const selectedCards = new Set();

if (window.matchMedia('(max-width: 760px)').matches) filterPanel.open = false;

const normalize = (value) => value.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const params = new URLSearchParams(window.location.search);
searchIssue.value = params.get('q') || '';
searchCity.value = params.get('city') || '';
const initialScope = scopeInputs.find((input) => input.value === params.get('scope'));
if (initialScope) initialScope.checked = true;
for (const [control, key] of [[categorySelect, 'category'], [helpSelect, 'help'], [professionSelect, 'profession'], [minimumRatingSelect, 'rating'], [minimumReviewsSelect, 'reviews'], [sortSelect, 'sort']]) {
  if ([...control.options].some((option) => option.value === params.get(key))) control.value = params.get(key);
}

function updateURL() {
  const url = new URL(window.location.href);
  const query = searchIssue.value.trim();
  const city = searchCity.value.trim();
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  if (city) url.searchParams.set('city', city);
  else url.searchParams.delete('city');
  const scope = scopeInputs.find((input) => input.checked)?.value || 'all';
  if (scope !== 'all') url.searchParams.set('scope', scope);
  else url.searchParams.delete('scope');
  for (const [key, value, defaultValue] of [['category', categorySelect.value, 'all'], ['help', helpSelect.value, 'all'], ['profession', professionSelect.value, 'all'], ['rating', minimumRatingSelect.value, 'all'], ['reviews', minimumReviewsSelect.value, 'all'], ['sort', sortSelect.value, 'recommended']]) {
    if (value !== defaultValue) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  try { window.history.replaceState(null, '', url); } catch { /* Local file previews can reject history updates. */ }
}

function renderResults() {
  const query = normalize(searchIssue.value);
  const city = normalize(searchCity.value);
  const scope = scopeInputs.find((input) => input.checked)?.value || 'all';
  const category = normalize(categorySelect.value);
  const help = helpSelect.value;
  const profession = professionSelect.value;
  const minimumRating = minimumRatingSelect.value;
  const minimumReviews = minimumReviewsSelect.value;
  const visible = cards.filter((card) => {
    const searchable = normalize(`${card.dataset.name} ${card.dataset.keywords} ${card.textContent}`);
    return (!query || searchable.includes(query))
      && (!city || normalize(card.dataset.city).includes(city))
      && (scope === 'all' || card.dataset.scope.split(' ').includes(scope))
      && (category === 'all' || normalize(card.dataset.categories).split(' ').includes(category))
      && (help === 'all' || card.dataset.help.split(' ').includes(help))
      && (profession === 'all' || card.dataset.profession === profession)
      && (minimumRating === 'all' || Number(card.dataset.rating) >= Number(minimumRating))
      && (minimumReviews === 'all' || Number(card.dataset.reviews) >= Number(minimumReviews));
  });

  const sorters = {
    recommended: (a, b) => Number(a.dataset.order) - Number(b.dataset.order),
    rating: (a, b) => Number(b.dataset.rating) - Number(a.dataset.rating) || Number(b.dataset.reviews) - Number(a.dataset.reviews),
    reviews: (a, b) => Number(b.dataset.reviews) - Number(a.dataset.reviews),
    name: (a, b) => a.dataset.name.split(' ').at(-1).localeCompare(b.dataset.name.split(' ').at(-1), 'pl'),
  };
  cards.sort(sorters[sortSelect.value] || sorters.recommended).forEach((card) => {
    card.hidden = !visible.includes(card);
    resultList.append(card);
  });

  const count = visible.length;
  resultCount.textContent = `${count} ${count === 1 ? 'przykładowy profil' : count > 1 && count < 5 ? 'przykładowe profile' : 'przykładowych profili'}`;
  emptyState.hidden = count !== 0;

  const filters = [];
  if (searchIssue.value.trim()) filters.push(['q', `Sprawa: ${searchIssue.value.trim()}`]);
  if (searchCity.value.trim()) filters.push(['city', `Miasto: ${searchCity.value.trim()}`]);
  if (scope !== 'all') filters.push(['scope', scope === 'private' ? 'Sprawy prywatne' : 'Sprawy firmowe']);
  if (category !== 'all') filters.push(['category', categorySelect.selectedOptions[0].textContent]);
  if (help !== 'all') filters.push(['help', helpSelect.selectedOptions[0].textContent]);
  if (profession !== 'all') filters.push(['profession', professionSelect.selectedOptions[0].textContent]);
  if (minimumRating !== 'all') filters.push(['rating', minimumRatingSelect.selectedOptions[0].textContent]);
  if (minimumReviews !== 'all') filters.push(['reviews', minimumReviewsSelect.selectedOptions[0].textContent]);
  activeFilters.replaceChildren(...filters.map(([key, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Usuń filtr: ${label}`);
    button.append(document.createTextNode(label));
    const cross = document.createElement('span');
    cross.setAttribute('aria-hidden', 'true');
    cross.textContent = '×';
    button.append(cross);
    button.addEventListener('click', () => {
      if (key === 'q') searchIssue.value = '';
      if (key === 'city') searchCity.value = '';
      if (key === 'scope') scopeInputs[0].checked = true;
      if (key === 'category') categorySelect.value = 'all';
      if (key === 'help') helpSelect.value = 'all';
      if (key === 'profession') professionSelect.value = 'all';
      if (key === 'rating') minimumRatingSelect.value = 'all';
      if (key === 'reviews') minimumReviewsSelect.value = 'all';
      updateURL();
      renderResults();
    });
    return button;
  }));
  activeFilters.hidden = filters.length === 0;
  filterTitle.textContent = filters.length ? `Filtry (${filters.length})` : 'Filtry';
  quickTopics.forEach((button) => button.setAttribute('aria-pressed', String(normalize(button.dataset.quickCategory) === category)));
}

function resetFilters() {
  searchForm.reset();
  scopeInputs[0].checked = true;
  categorySelect.value = 'all';
  helpSelect.value = 'all';
  professionSelect.value = 'all';
  minimumRatingSelect.value = 'all';
  minimumReviewsSelect.value = 'all';
  sortSelect.value = 'recommended';
  updateURL();
  renderResults();
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  updateURL();
  renderResults();
  document.querySelector('#wyniki').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
searchIssue.addEventListener('input', () => { updateURL(); renderResults(); });
searchCity.addEventListener('input', () => { updateURL(); renderResults(); });
scopeInputs.forEach((input) => input.addEventListener('change', () => { updateURL(); renderResults(); }));
categorySelect.addEventListener('change', () => { updateURL(); renderResults(); });
helpSelect.addEventListener('change', () => { updateURL(); renderResults(); });
professionSelect.addEventListener('change', () => { updateURL(); renderResults(); });
minimumRatingSelect.addEventListener('change', () => { updateURL(); renderResults(); });
minimumReviewsSelect.addEventListener('change', () => { updateURL(); renderResults(); });
sortSelect.addEventListener('change', () => { updateURL(); renderResults(); });
document.querySelector('#clear-filters').addEventListener('click', resetFilters);
document.querySelector('#empty-reset').addEventListener('click', resetFilters);
quickTopics.forEach((button) => button.addEventListener('click', () => {
  categorySelect.value = button.dataset.quickCategory;
  searchIssue.value = '';
  scopeInputs[0].checked = true;
  updateURL();
  renderResults();
  document.querySelector('#wyniki').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}));
renderResults();

let compareNotice = '';
function updateCompare() {
  const count = selectedCards.size;
  compareDock.hidden = count === 0;
  compareCount.textContent = `${count} ${count === 1 ? 'wybrany profil' : 'wybrane profile'}`;
  compareFeedback.textContent = compareNotice || (count < 2 ? 'Dodaj jeszcze jeden profil, aby je zestawić.' : 'Gotowe do porównania. Możesz wybrać maksymalnie 3 profile.');
  compareOpen.disabled = count < 2;
  cards.forEach((card) => {
    const button = card.querySelector('.result-compare');
    const selected = selectedCards.has(card);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', selected ? `Usuń ${card.dataset.name} z porównania` : button.dataset.addLabel);
    button.textContent = selected ? '✓ W porównaniu' : '+ Porównaj';
  });
}

cards.forEach((card) => {
  const button = card.querySelector('.result-compare');
  button.dataset.addLabel = button.getAttribute('aria-label');
  button.addEventListener('click', () => {
    if (selectedCards.has(card)) selectedCards.delete(card);
    else if (selectedCards.size < 3) selectedCards.add(card);
    else {
      compareNotice = 'Możesz wybrać maksymalnie 3 profile.';
      updateCompare();
      return;
    }
    compareNotice = '';
    updateCompare();
  });
});

document.querySelector('#compare-clear').addEventListener('click', () => {
  selectedCards.clear();
  compareNotice = '';
  updateCompare();
});

function addComparisonDetail(list, label, value) {
  const row = document.createElement('div');
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value;
  row.append(term, description);
  list.append(row);
}

function buildComparisonCard(card) {
  const person = document.createElement('article');
  person.className = 'compare-person';
  const head = document.createElement('div');
  head.className = 'compare-person-head';
  const portrait = card.querySelector('.result-portrait img').cloneNode(true);
  portrait.alt = '';
  const identity = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = card.dataset.name;
  const role = document.createElement('span');
  role.textContent = card.querySelector('.result-topline>span').textContent;
  identity.append(name, role);
  head.append(portrait, identity);
  const details = document.createElement('dl');
  addComparisonDetail(details, 'Ocena klientów', `${card.dataset.rating.replace('.', ',')} / 5 · ${card.dataset.reviews} opinii`);
  addComparisonDetail(details, 'Zakres pomocy', [...card.querySelectorAll('.result-tags span')].map((tag) => tag.textContent).join(', '));
  addComparisonDetail(details, 'O profilu', card.querySelector('.result-description').textContent);
  const link = document.createElement('a');
  link.href = card.querySelector('.result-primary').href;
  link.textContent = 'Zobacz profil →';
  person.append(head, details, link);
  return person;
}

compareOpen.addEventListener('click', () => {
  if (selectedCards.size < 2) return;
  compareGrid.replaceChildren(...[...selectedCards].map(buildComparisonCard));
  compareDialog.showModal();
});
document.querySelector('#compare-close').addEventListener('click', () => compareDialog.close());
compareDialog.addEventListener('click', (event) => { if (event.target === compareDialog) compareDialog.close(); });
updateCompare();
