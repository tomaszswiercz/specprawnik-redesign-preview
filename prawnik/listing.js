const searchForm = document.querySelector('.listing-search');
const searchIssue = document.querySelector('#issue');
const searchCity = document.querySelector('#city');
const scopeInputs = [...document.querySelectorAll('input[name="scope"]')];
const categoryInputs = [...document.querySelectorAll('input[name="category"]')];
const categoryBranches = [...document.querySelectorAll('.filter-branch')];
const helpInputs = [...document.querySelectorAll('input[name="help"]')];
const maxPriceSelect = document.querySelector('#max-price');
const radiusSelect = document.querySelector('#radius');
const professionSelect = document.querySelector('#profession');
const minimumRatingSelect = document.querySelector('#minimum-rating');
const minimumReviewsSelect = document.querySelector('#minimum-reviews');
const sortSelect = document.querySelector('#sort');
const sortField = document.querySelector('.sort-field');
const viewListButton = document.querySelector('#view-list');
const viewMapButton = document.querySelector('#view-map');
const mapPanel = document.querySelector('#map-panel');
const mapCities = document.querySelector('#map-cities');
const cityMapElement = document.querySelector('#city-map');
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
const priceFormat = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
categoryBranches.forEach((branch) => { branch.querySelector('summary').dataset.title = branch.querySelector('summary').textContent.trim(); });

cards.forEach((card) => {
  const entry = serviceCatalog[card.dataset.name];
  if (!entry) return;
  const lowestPrice = Math.min(...entry.services.map((service) => service.price));
  card.dataset.price = String(lowestPrice);

  const details = document.createElement('details');
  details.className = 'result-services';
  const summary = document.createElement('summary');
  summary.textContent = `Wybrane usługi od ${priceFormat.format(lowestPrice)} zł`;
  const count = document.createElement('span');
  count.textContent = 'Zobacz ceny i opcje kontaktu';
  summary.append(count);

  const content = document.createElement('div');
  content.className = 'result-services-content';
  const list = document.createElement('div');
  list.className = 'result-service-list';
  entry.services.forEach((service) => {
    const link = document.createElement('a');
    link.href = service.url;
    link.className = 'result-service-item';
    const title = document.createElement('span');
    title.textContent = service.title;
    const price = document.createElement('strong');
    price.textContent = `${priceFormat.format(service.price)} zł →`;
    link.append(title, price);
    list.append(link);
  });
  const contacts = document.createElement('div');
  contacts.className = 'result-service-contacts';
  const quote = document.createElement('a');
  quote.href = `${entry.profile}?form=true`;
  quote.textContent = 'Zapytaj o wycenę ↗';
  const visit = document.createElement('a');
  visit.href = `${entry.profile}zamow-wizyte/`;
  visit.textContent = 'Umów wizytę ↗';
  contacts.append(quote, visit);
  content.append(list, contacts);
  details.append(summary, content);
  card.append(details);
});

if (window.matchMedia('(max-width: 760px)').matches) filterPanel.open = false;

const normalize = (value) => value.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').trim();
const checkedValues = (inputs) => inputs.filter((input) => input.checked).map((input) => normalize(input.value));
const params = new URLSearchParams(window.location.search);
let mapView = params.get('view') === 'map';
let cityMap;
let mapMarkers;
const cityCoordinates = {
  'Warszawa': [52.2297, 21.0122], 'Kraków': [50.0647, 19.9450],
  'Łódź': [51.7592, 19.4560], 'Poznań': [52.4064, 16.9252],
  'Bolesławiec': [51.26275, 15.56459], 'Katowice': [50.2649, 19.0238],
  'Szczecin': [53.4285, 14.5528], 'Białystok': [53.1325, 23.1688],
  'Rzeszów': [50.0412, 21.9991], 'Toruń': [53.0138, 18.5984],
  'Sandomierz': [50.6826, 21.7480], 'Łomianki': [52.3357, 20.8959],
};
const cityCenterFor = (name) => cityCoordinates[Object.keys(cityCoordinates).find((city) => normalize(city) === normalize(name))];
const distanceKm = ([lat1, lon1], [lat2, lon2]) => {
  const radians = (degrees) => degrees * Math.PI / 180;
  const arc = Math.sin(radians(lat2 - lat1) / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
};
function syncDistanceControls() {
  const hasCity = Boolean(cityCenterFor(searchCity.value));
  radiusSelect.disabled = !hasCity;
  sortSelect.querySelector('option[value="distance"]').disabled = !hasCity;
  if (!hasCity) {
    radiusSelect.value = '50';
    if (sortSelect.value === 'distance') sortSelect.value = 'recommended';
  }
}
searchIssue.value = params.get('q') || '';
searchCity.value = params.get('city') || '';
const initialScope = scopeInputs.find((input) => input.value === params.get('scope'));
if (initialScope) initialScope.checked = true;
for (const input of categoryInputs) input.checked = params.getAll('category').some((value) => normalize(value) === normalize(input.value));
for (const input of helpInputs) input.checked = params.getAll('help').includes(input.value);
for (const [control, key] of [[maxPriceSelect, 'price'], [radiusSelect, 'radius'], [professionSelect, 'profession'], [minimumRatingSelect, 'rating'], [minimumReviewsSelect, 'reviews'], [sortSelect, 'sort']]) {
  if ([...control.options].some((option) => option.value === params.get(key))) control.value = params.get(key);
}
syncDistanceControls();
categoryBranches.forEach((branch) => { if (branch.querySelector('input:checked')) branch.open = true; });

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
  url.searchParams.delete('category');
  url.searchParams.delete('help');
  categoryInputs.filter((input) => input.checked).forEach((input) => url.searchParams.append('category', input.value));
  helpInputs.filter((input) => input.checked).forEach((input) => url.searchParams.append('help', input.value));
  for (const [key, value, defaultValue] of [['price', maxPriceSelect.value, 'all'], ['radius', radiusSelect.value, '50'], ['profession', professionSelect.value, 'all'], ['rating', minimumRatingSelect.value, 'all'], ['reviews', minimumReviewsSelect.value, 'all'], ['sort', sortSelect.value, 'recommended']]) {
    if (value !== defaultValue) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  if (mapView) url.searchParams.set('view', 'map');
  else url.searchParams.delete('view');
  try { window.history.replaceState(null, '', url); } catch { /* Local file previews can reject history updates. */ }
}

function selectCity(city) {
  searchCity.value = city;
  radiusSelect.value = '0';
  syncDistanceControls();
  mapView = false;
  updateURL();
  renderResults();
  document.querySelector('#wyniki').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

function renderCityMap(visible) {
  resultList.hidden = mapView;
  mapPanel.hidden = !mapView || visible.length === 0;
  sortField.hidden = mapView;
  viewListButton.setAttribute('aria-pressed', String(!mapView));
  viewMapButton.setAttribute('aria-pressed', String(mapView));
  if (!mapView || visible.length === 0) return;

  const cityCounts = new Map();
  visible.forEach((card) => cityCounts.set(card.dataset.city, (cityCounts.get(card.dataset.city) || 0) + 1));
  mapCities.replaceChildren(...[...cityCounts].sort((a, b) => a[0].localeCompare(b[0], 'pl')).map(([city, count]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${city} · ${count}`;
    button.addEventListener('click', () => selectCity(city));
    return button;
  }));

  if (!window.L) {
    cityMapElement.hidden = true;
    mapPanel.querySelector('p').textContent = 'Mapa jest chwilowo niedostępna. Wybierz miasto z listy poniżej.';
    return;
  }
  cityMapElement.hidden = false;
  if (!cityMap) {
    cityMap = L.map(cityMapElement, { scrollWheelZoom: false }).setView([52.1, 19.4], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(cityMap);
    mapMarkers = L.layerGroup().addTo(cityMap);
  }
  mapMarkers.clearLayers();
  const bounds = [];
  cityCounts.forEach((count, city) => {
    const coordinates = cityCoordinates[city];
    if (!coordinates) return;
    bounds.push(coordinates);
    const marker = L.marker(coordinates).addTo(mapMarkers);
    marker.bindTooltip(`${city}: ${count} ${count === 1 ? 'profil' : count < 5 ? 'profile' : 'profili'}`);
    marker.on('click', () => selectCity(city));
  });
  requestAnimationFrame(() => {
    cityMap.invalidateSize();
    if (bounds.length) cityMap.fitBounds(bounds, { padding: [45, 45], maxZoom: 8 });
  });
}

function renderResults() {
  const query = normalize(searchIssue.value);
  const city = normalize(searchCity.value);
  const center = cityCenterFor(searchCity.value);
  const radius = radiusSelect.value;
  const scope = scopeInputs.find((input) => input.checked)?.value || 'all';
  const categories = checkedValues(categoryInputs);
  const help = checkedValues(helpInputs);
  const maxPrice = maxPriceSelect.value;
  const profession = professionSelect.value;
  const minimumRating = minimumRatingSelect.value;
  const minimumReviews = minimumReviewsSelect.value;
  const visible = cards.filter((card) => {
    const searchable = normalize(`${card.dataset.name} ${card.dataset.keywords} ${card.textContent}`);
    return (!query || searchable.includes(query))
      && (!city || (center
        ? radius === 'country' || (radius === '0'
          ? normalize(card.dataset.city) === city
          : distanceKm(center, cityCoordinates[card.dataset.city]) <= Number(radius))
        : normalize(card.dataset.city).includes(city)))
      && (scope === 'all' || card.dataset.scope.split(' ').includes(scope))
      && (!categories.length || categories.some((category) => normalize(card.dataset.categories).split(' ').includes(category)))
      && (!help.length || help.some((type) => card.dataset.help.split(' ').includes(type)))
      && (maxPrice === 'all' || Number(card.dataset.price) <= Number(maxPrice))
      && (profession === 'all' || card.dataset.profession === profession)
      && (minimumRating === 'all' || Number(card.dataset.rating) >= Number(minimumRating))
      && (minimumReviews === 'all' || Number(card.dataset.reviews) >= Number(minimumReviews));
  });

  const sorters = {
    recommended: (a, b) => Number(a.dataset.order) - Number(b.dataset.order),
    price: (a, b) => Number(a.dataset.price) - Number(b.dataset.price) || Number(a.dataset.order) - Number(b.dataset.order),
    distance: (a, b) => distanceKm(center, cityCoordinates[a.dataset.city]) - distanceKm(center, cityCoordinates[b.dataset.city]),
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
  renderCityMap(visible);

  const filters = [];
  if (searchIssue.value.trim()) filters.push(['q', `Sprawa: ${searchIssue.value.trim()}`]);
  if (searchCity.value.trim()) filters.push(['city', `${radius === 'country' ? 'Punkt odniesienia' : 'Miasto i okolice'}: ${searchCity.value.trim()}`]);
  if (scope !== 'all') filters.push(['scope', scope === 'private' ? 'Sprawy prywatne' : 'Sprawy firmowe']);
  categoryInputs.filter((input) => input.checked).forEach((input) => filters.push([`category:${input.value}`, input.parentElement.textContent.trim()]));
  helpInputs.filter((input) => input.checked).forEach((input) => filters.push([`help:${input.value}`, input.parentElement.textContent.trim()]));
  if (maxPrice !== 'all') filters.push(['price', maxPriceSelect.selectedOptions[0].textContent]);
  if (radius !== '50' && center) filters.push(['radius', radius === 'country' ? 'Cała Polska' : `${radiusSelect.selectedOptions[0].textContent} od ${searchCity.value.trim()}`]);
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
      if (key.startsWith('category:')) categoryInputs.find((input) => input.value === key.slice(9)).checked = false;
      if (key.startsWith('help:')) helpInputs.find((input) => input.value === key.slice(5)).checked = false;
      if (key === 'price') maxPriceSelect.value = 'all';
      if (key === 'radius') radiusSelect.value = '50';
      if (key === 'profession') professionSelect.value = 'all';
      if (key === 'rating') minimumRatingSelect.value = 'all';
      if (key === 'reviews') minimumReviewsSelect.value = 'all';
      syncDistanceControls();
      updateURL();
      renderResults();
    });
    return button;
  }));
  activeFilters.hidden = filters.length === 0;
  filterTitle.textContent = filters.length ? `Filtry (${filters.length})` : 'Filtry';
  categoryBranches.forEach((branch) => {
    const selected = branch.querySelectorAll('input:checked').length;
    const summary = branch.querySelector('summary');
    summary.textContent = `${summary.dataset.title}${selected ? ` (${selected})` : ''}`;
  });
  quickTopics.forEach((button) => button.setAttribute('aria-pressed', String(categories.includes(normalize(button.dataset.quickCategory)))));
}

function resetFilters() {
  searchForm.reset();
  scopeInputs[0].checked = true;
  categoryInputs.forEach((input) => { input.checked = false; });
  helpInputs.forEach((input) => { input.checked = false; });
  maxPriceSelect.value = 'all';
  radiusSelect.value = '50';
  syncDistanceControls();
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
searchCity.addEventListener('input', () => { syncDistanceControls(); updateURL(); renderResults(); });
scopeInputs.forEach((input) => input.addEventListener('change', () => { updateURL(); renderResults(); }));
categoryInputs.forEach((input) => input.addEventListener('change', () => { updateURL(); renderResults(); }));
helpInputs.forEach((input) => input.addEventListener('change', () => { updateURL(); renderResults(); }));
maxPriceSelect.addEventListener('change', () => { updateURL(); renderResults(); });
radiusSelect.addEventListener('change', () => { updateURL(); renderResults(); });
professionSelect.addEventListener('change', () => { updateURL(); renderResults(); });
minimumRatingSelect.addEventListener('change', () => { updateURL(); renderResults(); });
minimumReviewsSelect.addEventListener('change', () => { updateURL(); renderResults(); });
sortSelect.addEventListener('change', () => { updateURL(); renderResults(); });
viewListButton.addEventListener('click', () => { mapView = false; updateURL(); renderResults(); });
viewMapButton.addEventListener('click', () => { mapView = true; updateURL(); renderResults(); });
document.querySelector('#clear-filters').addEventListener('click', resetFilters);
document.querySelector('#empty-reset').addEventListener('click', resetFilters);
quickTopics.forEach((button) => button.addEventListener('click', () => {
  categoryInputs.forEach((input) => { input.checked = input.value === button.dataset.quickCategory; });
  categoryBranches.forEach((branch) => { if (branch.querySelector('input:checked')) branch.open = true; });
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
  addComparisonDetail(details, 'Wybrana usługa od', `${priceFormat.format(Number(card.dataset.price))} zł`);
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
