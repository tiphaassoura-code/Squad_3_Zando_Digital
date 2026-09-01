/**
 * Colonne de filtres.
 * Chaque compteur est calculé en ignorant sa propre facette : cocher « Pool »
 * ne doit pas ramener les autres zones à zéro.
 */

import { icon } from '../../shared/icons.js'
import {
  state, emit, filterProducts, resetFilters, hasActiveFilters, resetPage, PRICE_CEILING
} from '../state.js'
import { formatNumber } from '../../shared/format.js'

let root

const countBy = (except, predicate) => filterProducts(except).filter(predicate).length

export function renderFilters(container) {
  root = container ?? root

  const categoryPool = filterProducts('category')
  const zonePool = filterProducts('zones')
  const producerPool = filterProducts('producers')

  const producerList = state.producers
    .filter((producer) => producer.name.toLowerCase().includes(state.producerQuery.toLowerCase()))
  const visibleProducers = state.producersExpanded ? producerList : producerList.slice(0, 4)

  root.innerHTML = `
    <div class="filters-head">
      <h2>Filtres</h2>
      <div style="display:flex;align-items:center;gap:var(--space-2)">
        <button class="filters-reset" type="button" data-reset ${hasActiveFilters() ? '' : 'disabled'}>Réinitialiser</button>
        <button class="panel-close filters-close" type="button" data-close>
          <span class="sr-only">Fermer les filtres</span>${icon('x')}
        </button>
      </div>
    </div>

    ${group('categories', 'Catégories', `
      ${option('radio', 'categorie', 'all', 'Tous les produits', categoryPool.length, state.filters.category === 'all')}
      ${state.categories.map((category) => option(
        'radio', 'categorie', category.id, category.name,
        countBy('category', (p) => p.categoryId === category.id),
        state.filters.category === category.id
      )).join('')}
    `)}

    ${group('zones', 'Zone de production', `
      ${state.zones.map((zone) => option(
        'checkbox', 'zone', zone.name, zone.name,
        countBy('zones', (p) => p.zone === zone.name),
        state.filters.zones.includes(zone.name)
      )).join('')}
    `)}

    ${group('producers', 'Producteurs', `
      <div class="filter-search">
        <label class="field">
          <span class="sr-only">Rechercher un producteur</span>
          ${icon('search', 'icon-sm')}
          <input type="search" data-producer-query placeholder="Rechercher un producteur…" value="${state.producerQuery}">
        </label>
      </div>
      ${visibleProducers.map((producer) => option(
        'checkbox', 'producteur', producer.id, producer.name,
        countBy('producers', (p) => p.producerId === producer.id),
        state.filters.producers.includes(producer.id)
      )).join('')}
      ${producerList.length === 0 ? '<p class="product-stock">Aucun producteur à ce nom.</p>' : ''}
      ${producerList.length > 4 ? `<button class="filter-more" type="button" data-more>${state.producersExpanded ? 'Voir moins' : 'Voir plus'}</button>` : ''}
    `)}

    ${group('price', 'Prix (FCFA)', `
      <div class="price-slider">
        <input class="price-range" type="range" min="500" max="${PRICE_CEILING}" step="100"
               value="${state.filters.maxPrice}" data-range
               aria-label="Prix maximum en FCFA">
      </div>
      <div class="price-inputs">
        <label class="price-input">Min <input type="number" value="0" readonly tabindex="-1"></label>
        <label class="price-input">Max <input type="number" data-max min="500" max="${PRICE_CEILING}" step="100" value="${state.filters.maxPrice}"></label>
      </div>
    `)}
  `

  bind()
}

function group(id, title, body) {
  const open = state.openGroups[id]
  return `
    <section class="filter-group" data-group="${id}" data-open="${open}">
      <button class="filter-group-head" type="button" data-toggle="${id}" aria-expanded="${open}">
        ${title}${icon('chevron-down', 'icon-sm')}
      </button>
      <div class="filter-group-body">${body}</div>
    </section>
  `
}

function option(type, name, value, label, count, checked) {
  return `
    <label class="filter-option">
      <input type="${type}" name="${name}" value="${value}" ${checked ? 'checked' : ''}>
      <span class="filter-option-label">${label}</span>
      <span class="filter-option-count">${formatNumber(count)}</span>
    </label>
  `
}

function bind() {
  root.querySelectorAll('[data-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.toggle
      state.openGroups[id] = !state.openGroups[id]
      const section = root.querySelector(`[data-group="${id}"]`)
      section.dataset.open = state.openGroups[id]
      button.setAttribute('aria-expanded', state.openGroups[id])
    })
  })

  root.querySelectorAll('input[name="categorie"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.filters.category = input.value
      apply()
    })
  })

  root.querySelectorAll('input[name="zone"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.filters.zones = toggleValue(state.filters.zones, input.value, input.checked)
      apply()
    })
  })

  root.querySelectorAll('input[name="producteur"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.filters.producers = toggleValue(state.filters.producers, input.value, input.checked)
      apply()
    })
  })

  const query = root.querySelector('[data-producer-query]')
  query?.addEventListener('input', () => {
    state.producerQuery = query.value
    renderFilters()
    const next = root.querySelector('[data-producer-query]')
    next.focus()
    next.setSelectionRange(next.value.length, next.value.length)
  })

  root.querySelector('[data-more]')?.addEventListener('click', () => {
    state.producersExpanded = !state.producersExpanded
    renderFilters()
  })

  const range = root.querySelector('[data-range]')
  const maxInput = root.querySelector('[data-max]')

  range.addEventListener('input', () => {
    state.filters.maxPrice = Number(range.value)
    maxInput.value = range.value
  })
  range.addEventListener('change', apply)

  maxInput.addEventListener('change', () => {
    const value = Math.min(Math.max(Number(maxInput.value) || PRICE_CEILING, 500), PRICE_CEILING)
    state.filters.maxPrice = value
    maxInput.value = value
    range.value = value
    apply()
  })

  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    resetFilters()
    resetPage()
    renderFilters()
    emit('grid', 'toolbar', 'header', 'pagination', 'categories', 'url')
  })

  root.querySelector('[data-close]')?.addEventListener('click', closeFilters)
}

const toggleValue = (list, value, checked) =>
  checked ? [...list, value] : list.filter((item) => item !== value)

function apply() {
  resetPage()
  renderFilters()
  emit('grid', 'toolbar', 'pagination', 'categories', 'url')
}

export function openFilters() {
  state.ui.filtersOpen = true
  root.classList.add('is-open')
  document.body.dataset.locked = 'true'
  root.querySelector('[data-close]')?.focus()
  ensureBackdrop()
}

export function closeFilters() {
  state.ui.filtersOpen = false
  root.classList.remove('is-open')
  delete document.body.dataset.locked
  document.querySelector('[data-filters-backdrop]')?.remove()
}

function ensureBackdrop() {
  if (document.querySelector('[data-filters-backdrop]')) return

  const backdrop = document.createElement('button')
  backdrop.className = 'panel-backdrop'
  backdrop.type = 'button'
  backdrop.dataset.filtersBackdrop = 'true'
  backdrop.setAttribute('aria-label', 'Fermer les filtres')
  backdrop.addEventListener('click', closeFilters)
  document.body.append(backdrop)
}
