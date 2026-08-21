/** Grille des produits : squelettes de chargement, cartes, état vide. */

import { icon } from '../../shared/icons.js'
import { state, emit, pagedProducts, visibleProducts, findProduct, quantityFor, setQuantity, resetFilters, resetPage } from '../state.js'
import { productCardHTML } from './productCard.js'

let root

export function renderGrid(container) {
  root = container ?? root

  if (state.status === 'loading') return renderSkeletons()
  if (state.status === 'error') return renderError()

  const products = pagedProducts()

  if (!products.length) return renderEmpty()

  root.className = `product-grid ${state.view === 'list' ? 'is-list' : ''}`
  root.innerHTML = products.map(productCardHTML).join('')

  // Relance l'animation d'entrée à chaque reconstruction de la liste.
  root.classList.remove('is-turning')
  void root.offsetWidth
  root.classList.add('is-turning')
}

function renderSkeletons() {
  root.className = 'product-grid'
  root.innerHTML = Array.from({ length: 8 }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-media"></div>
      <div class="skeleton-body">
        <div class="skeleton-line w-70"></div>
        <div class="skeleton-line w-45"></div>
        <div class="skeleton-line w-90"></div>
      </div>
    </div>
  `).join('')
}

function renderEmpty() {
  root.className = 'product-grid'
  root.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1">
      ${icon('package-open')}
      <h3>Aucun produit ne correspond à ces filtres</h3>
      <p>Élargissez la zone de production ou augmentez le prix maximum pour voir plus d'offres du jour.</p>
      <button class="btn btn-secondary" type="button" data-reset-empty>Réinitialiser les filtres</button>
    </div>
  `

  root.querySelector('[data-reset-empty]').addEventListener('click', () => {
    resetFilters()
    resetPage()
    emit('grid', 'filters', 'toolbar', 'header', 'pagination', 'categories', 'url')
  })
}

function renderError() {
  root.className = 'product-grid'
  root.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1">
      ${icon('package-open')}
      <h3>Le catalogue n'a pas pu être chargé</h3>
      <p>L'API ne répond pas sur le port 3001. Lancez <code>npm run api</code> puis rechargez la page.</p>
      <button class="btn btn-primary" type="button" onclick="location.reload()">Recharger</button>
    </div>
  `
}

/**
 * Un seul écouteur pour toute la grille : les cartes sont reconstruites
 * à chaque filtrage, la délégation évite de réattacher des écouteurs.
 */
export function bindGrid(handlers) {
  root.addEventListener('click', (event) => {
    const stepButton = event.target.closest('[data-step]')
    if (stepButton) return handleStep(stepButton)

    const addButton = event.target.closest('[data-add]')
    if (addButton) return handlers.onAdd(addButton.dataset.add, addButton)

    const favButton = event.target.closest('[data-favorite]')
    if (favButton) return handlers.onFavorite(favButton.dataset.favorite, favButton)

    const opener = event.target.closest('[data-open]')
    if (opener) return handlers.onOpen(opener.dataset.open)

    const card = event.target.closest('[data-product]')
    if (card) handlers.onOpen(card.dataset.product)
  })

  root.addEventListener('change', (event) => {
    const input = event.target.closest('.stepper input')
    if (input) handleInput(input)
  })
}

/** Applique + ou − sur le champ quantité voisin. */
export function handleStep(button) {
  const stepper = button.closest('.stepper')
  const product = findProduct(stepper.dataset.for)
  const input = stepper.querySelector('input')
  const next = setQuantity(product, Number(input.value) + Number(button.dataset.step))

  input.value = next
  syncStepper(stepper, product, next)
  syncTwin(stepper, product, next)
}

export function handleInput(input) {
  const stepper = input.closest('.stepper')
  const product = findProduct(stepper.dataset.for)
  const next = setQuantity(product, Number(input.value) || product.minOrder)

  input.value = next
  syncStepper(stepper, product, next)
  syncTwin(stepper, product, next)
}

/**
 * Carte et panneau montrent le même produit : la quantité saisie d'un côté
 * doit se retrouver de l'autre sans reconstruire la grille.
 */
function syncTwin(source, product, quantity) {
  const fromPanel = source.dataset.stepper === 'panel'

  if (fromPanel) {
    state.panelQuantity = quantity
    emit('panel-total')
  }

  document
    .querySelectorAll(`.stepper[data-for="${product.id}"]`)
    .forEach((stepper) => {
      if (stepper === source) return
      stepper.querySelector('input').value = quantity
      syncStepper(stepper, product, quantity)
      if (stepper.dataset.stepper === 'panel') {
        state.panelQuantity = quantity
        emit('panel-total')
      }
    })
}

/** Désactive les boutons aux bornes minOrder / stock. */
export function syncStepper(stepper, product, quantity) {
  stepper.querySelector('[data-step="-1"]').disabled = quantity <= product.minOrder
  stepper.querySelector('[data-step="1"]').disabled = quantity >= product.stock
}

/** Met en évidence la carte ouverte dans le panneau. */
export function highlightSelected() {
  root.querySelectorAll('[data-product]').forEach((card) => {
    card.classList.toggle('is-selected', card.dataset.product === state.selectedId)
  })
}

export const gridQuantity = (product) => quantityFor(product)
