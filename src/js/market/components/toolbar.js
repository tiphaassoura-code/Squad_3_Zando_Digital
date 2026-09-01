/** Barre de résultats : total, tri, affichage, filtres actifs. */

import { icon } from '../../shared/icons.js'
import { state, emit, visibleProducts, hasActiveFilters, resetFilters, findProducer, resetPage, PRICE_CEILING } from '../state.js'
import { formatNumber, formatPrice } from '../../shared/format.js'
import { openFilters } from './filters.js'

const SORT_LABELS = {
  'price-asc': 'Prix (croissant)',
  'price-desc': 'Prix (décroissant)',
  'name-asc': 'Nom (A–Z)',
  'rating-desc': 'Mieux notés',
  'stock-desc': 'Stock disponible'
}

let root

export function renderToolbar(container) {
  root = container ?? root
  const total = visibleProducts().length

  root.innerHTML = `
    <div class="results-bar">
      <h1 class="results-title">
        ${currentTitle()} <span class="results-count">(${formatNumber(total)})</span>
      </h1>

      <div class="results-tools">
        <button class="btn btn-secondary filters-toggle" type="button" data-open-filters>
          ${icon('sliders', 'icon-sm')} Filtres
        </button>

        <div class="select">
          <label class="sr-only" for="tri">Trier par</label>
          <select id="tri">
            ${Object.entries(SORT_LABELS).map(([value, label]) => `
              <option value="${value}" ${state.sort === value ? 'selected' : ''}>Trier par : ${label}</option>
            `).join('')}
          </select>
          ${icon('chevron-down', 'icon-sm')}
        </div>

        <div class="view-switch" role="group" aria-label="Affichage des produits">
          <button type="button" data-view="grid" aria-pressed="${state.view === 'grid'}">
            <span class="sr-only">Affichage en grille</span>${icon('layout-grid', 'icon-sm')}
          </button>
          <button type="button" data-view="list" aria-pressed="${state.view === 'list'}">
            <span class="sr-only">Affichage en liste</span>${icon('list', 'icon-sm')}
          </button>
        </div>
      </div>
    </div>

    ${renderChips()}
  `

  root.querySelector('#tri').addEventListener('change', (event) => {
    state.sort = event.target.value
    resetPage()
    emit('grid', 'pagination', 'categories', 'url')
  })

  root.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.view = button.dataset.view
      renderToolbar()
      emit('grid', 'categories', 'url')
    })
  })

  root.querySelector('[data-open-filters]').addEventListener('click', openFilters)

  root.querySelectorAll('[data-remove]').forEach((chip) => {
    chip.addEventListener('click', () => {
      removeFilter(chip.dataset.remove, chip.dataset.value)
      resetPage()
      renderToolbar()
      emit('grid', 'filters', 'header', 'pagination', 'categories', 'url')
    })
  })
}

function currentTitle() {
  if (state.filters.search) return `Résultats pour « ${state.filters.search} »`
  if (state.filters.category === 'all') return 'Tous les produits'
  return state.categories.find((c) => c.id === state.filters.category)?.name ?? 'Tous les produits'
}

function renderChips() {
  if (!hasActiveFilters()) return ''

  const chips = []

  if (state.filters.category !== 'all') {
    const category = state.categories.find((c) => c.id === state.filters.category)
    chips.push(chip('category', state.filters.category, category?.name ?? ''))
  }

  state.filters.zones.forEach((zone) => chips.push(chip('zone', zone, zone)))

  state.filters.producers.forEach((id) => {
    chips.push(chip('producer', id, findProducer(id)?.name ?? ''))
  })

  if (state.filters.maxPrice < PRICE_CEILING) {
    chips.push(chip('price', '', `Jusqu'à ${formatPrice(state.filters.maxPrice)}`))
  }

  if (!chips.length) return ''

  return `
    <div class="active-filters">
      ${chips.join('')}
      <button class="chip" type="button" data-remove="all" data-value="">Tout effacer ${icon('x')}</button>
    </div>
  `
}

const chip = (type, value, label) => `
  <button class="chip" type="button" data-remove="${type}" data-value="${value}">
    ${label} ${icon('x')}
  </button>
`

function removeFilter(type, value) {
  if (type === 'all') return resetFilters()
  if (type === 'category') state.filters.category = 'all'
  if (type === 'zone') state.filters.zones = state.filters.zones.filter((z) => z !== value)
  if (type === 'producer') state.filters.producers = state.filters.producers.filter((p) => p !== value)
  if (type === 'price') state.filters.maxPrice = PRICE_CEILING
}
