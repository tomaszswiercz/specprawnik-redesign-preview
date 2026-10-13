const searchForm = document.querySelector('.listing-search');
const searchIssue = document.querySelector('#issue');
const searchCity = document.querySelector('#city');
const scopeInputs = [...document.querySelectorAll('input[name="scope"]')];
const categorySelect = document.querySelector('#category');
const helpSelect = document.querySelector('#help-type');
const sortSelect = document.querySelector('#sort');
const cards = [...document.querySelectorAll('.result-card')];
const resultList = document.querySelector('#result-list');
const resultCount = document.querySelector('#result-count');
const activeFilters = document.querySelector('#active-filters');
const emptyState = document.querySelector('#no-results');
const filterPanel = document.querySelector('.filter-panel');
const filterTitle = document.querySelector('#filter-title');

if (window.matchMedia('(max-width: 760px)').matches) filterPanel.open = false;

const normalize = (value) => value.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const params = new URLSearchParams(window.location.search);
searchIssue.value = params.get('q') || '';
searchCity.value = params.get('city') || '';
const initialScope = scopeInputs.find((input) => input.value === params.get('scope'));
if (initialScope) initialScope.checked = true;

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
  try { window.history.replaceState(null, '', url); } catch { /* Local file previews can reject history updates. */ }
}

function renderResults() {
  const query = normalize(searchIssue.value);
  const city = normalize(searchCity.value);
  const scope = scopeInputs.find((input) => input.checked)?.value || 'all';
  const category = normalize(categorySelect.value);
  const help = helpSelect.value;
  const visible = cards.filter((card) => {
    const searchable = normalize(`${card.dataset.name} ${card.dataset.keywords} ${card.textContent}`);
    return (!query || searchable.includes(query))
      && (!city || normalize(card.dataset.city).includes(city))
      && (scope === 'all' || card.dataset.scope.split(' ').includes(scope))
      && (category === 'all' || normalize(card.dataset.categories).split(' ').includes(category))
      && (help === 'all' || card.dataset.help.split(' ').includes(help));
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

  const labels = [];
  if (searchIssue.value.trim()) labels.push(`Sprawa: ${searchIssue.value.trim()}`);
  if (searchCity.value.trim()) labels.push(`Miasto: ${searchCity.value.trim()}`);
  if (scope !== 'all') labels.push(scope === 'private' ? 'Sprawy prywatne' : 'Sprawy firmowe');
  if (category !== 'all') labels.push(categorySelect.selectedOptions[0].textContent);
  if (help !== 'all') labels.push(helpSelect.selectedOptions[0].textContent);
  activeFilters.replaceChildren(...labels.map((label) => {
    const item = document.createElement('span');
    item.textContent = label;
    return item;
  }));
  activeFilters.hidden = labels.length === 0;
  filterTitle.textContent = labels.length ? `Filtry (${labels.length})` : 'Filtry';
}

function resetFilters() {
  searchForm.reset();
  scopeInputs[0].checked = true;
  categorySelect.value = 'all';
  helpSelect.value = 'all';
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
searchIssue.addEventListener('input', renderResults);
searchCity.addEventListener('input', renderResults);
scopeInputs.forEach((input) => input.addEventListener('change', () => { updateURL(); renderResults(); }));
categorySelect.addEventListener('change', renderResults);
helpSelect.addEventListener('change', renderResults);
sortSelect.addEventListener('change', renderResults);
document.querySelector('#clear-filters').addEventListener('click', resetFilters);
document.querySelector('#empty-reset').addEventListener('click', resetFilters);
renderResults();
