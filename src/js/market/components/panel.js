/** Panneau de détail : prix du jour, variation, commande et producteur. */

import { icon } from '../../shared/icons.js'
import { state, emit, findProduct, findProducer, setQuantity, quantityFor } from '../state.js'
import { formatNumber, formatPrice, formatRating, priceTrend } from '../../shared/format.js'
import { stepperHTML } from './productCard.js'

const TREND_ICON = { down: 'arrow-down', up: 'arrow-up', flat: 'check' }

let root
let backdrop
let lastFocused

export function renderPanel(container) {
  root = container ?? root
  const product = state.selectedId ? findProduct(state.selectedId) : null

  if (!product) {
    root.hidden = true
    root.innerHTML = ''
    removeBackdrop()
    return
  }

  const producer = findProducer(product.producerId)
  const trend = priceTrend(product)
  const quantity = state.panelQuantity

  root.hidden = false
  root.innerHTML = `
    <div class="panel-head">
      ${product.dailyPrice ? `<span class="badge badge-daily">${icon('leaf')} Prix du jour</span>` : '<span></span>'}
      <button class="panel-close" type="button" data-close-panel>
        <span class="sr-only">Fermer le détail du produit</span>${icon('x')}
      </button>
    </div>

    <div class="panel-body">
      <div class="panel-media">
        <img src="${product.image}" alt="${product.name} de ${producer.name}, ${product.city}" decoding="async">
      </div>

      <div>
        <h2 class="panel-title">
          <a href="/produit.html?id=${product.id}">${product.name}</a>
        </h2>
        <div class="panel-meta">
          <p class="product-origin">${icon('map-pin')} ${product.zone} — ${product.city}</p>
          <p class="rating">${icon('star')} ${formatRating(product.rating)} <span>(${product.reviews} avis)</span></p>
        </div>
      </div>

      <div class="panel-price">
        <p class="product-price">
          <span class="price-value">${formatNumber(product.price)}</span>
          <span class="price-currency">FCFA</span>
          <span class="price-unit">/ ${product.unit}</span>
        </p>
        <p class="price-trend is-${trend.direction}">
          <span class="price-trend-value">
            ${icon(TREND_ICON[trend.direction], 'icon-sm')}
            ${trend.direction === 'flat' ? 'Prix stable' : `${trend.direction === 'down' ? '−' : '+'}${formatPrice(trend.delta)}`}
          </span>
          <span class="price-trend-label">${trend.direction === 'flat' ? 'depuis hier' : trend.label}</span>
        </p>
      </div>

      <p class="panel-description">${product.description}</p>

      <div class="panel-order">
        <p class="panel-order-label">Quantité — ${formatNumber(product.stock)} ${product.stockUnit} disponibles</p>
        <div class="panel-order-row">
          ${stepperHTML(product, quantity, 'panel')}
          <p class="panel-total">
            <span class="panel-total-label">Total</span>
            <span class="panel-total-value" data-panel-total>${formatPrice(product.price * quantity)}</span>
          </p>
        </div>
        <button class="btn btn-primary btn-block" type="button" data-add-panel="${product.id}">
          Ajouter au panier ${icon('shopping-cart', 'icon-sm')}
        </button>
        <a class="btn btn-secondary btn-block" href="/produit.html?id=${product.id}">
          Voir la fiche complète ${icon('arrow-right', 'icon-sm')}
        </a>
      </div>

      <div>
        <h3 class="panel-section-title" style="margin-bottom: var(--space-3)">Producteur</h3>
        <div class="producer-card">
          <img src="${producer.avatar}" alt="" width="44" height="44">
          <div class="producer-info">
            <p class="producer-name">${producer.name} ${producer.verified ? icon('badge-check') : ''}</p>
            <p class="producer-role">${producer.role}</p>
            <p class="producer-place">${producer.city}, ${producer.zone}</p>
          </div>
          <button class="btn btn-secondary" type="button">Voir le profil</button>
        </div>
      </div>

      <ul class="panel-points">
        <li class="panel-point">${icon('sprout')} Produits récoltés ${product.harvestedAt}</li>
        <li class="panel-point">${icon('handshake')} Sans intermédiaire, prix fixé par le producteur</li>
        <li class="panel-point">${icon('truck')} Livraison rapide sur vos marchés</li>
      </ul>
    </div>
  `

  root.querySelector('[data-close-panel]').addEventListener('click', closePanel)
  ensureBackdrop()
}

/** Recalcule le total sans reconstruire le panneau pendant la saisie. */
export function refreshPanelTotal() {
  const product = findProduct(state.selectedId)
  const node = root?.querySelector('[data-panel-total]')
  if (!product || !node) return

  node.textContent = formatPrice(product.price * state.panelQuantity)
}

export function openPanel(productId, { focus = true } = {}) {
  const product = findProduct(productId)
  if (!product) return

  lastFocused = document.activeElement
  state.selectedId = productId
  // Le panneau reprend la quantité déjà saisie sur la carte du produit.
  state.panelQuantity = setQuantity(product, quantityFor(product))

  document.querySelector('.market').classList.add('has-panel')
  emit('panel', 'grid-selection')

  if (focus) root.querySelector('[data-close-panel]')?.focus({ preventScroll: true })
}

export function closePanel() {
  state.selectedId = null
  document.querySelector('.market').classList.remove('has-panel')
  emit('panel', 'grid-selection')
  lastFocused?.focus?.()
}

function ensureBackdrop() {
  if (backdrop) return

  backdrop = document.createElement('button')
  backdrop.className = 'panel-backdrop'
  backdrop.type = 'button'
  backdrop.setAttribute('aria-label', 'Fermer le détail du produit')
  backdrop.addEventListener('click', closePanel)
  document.body.append(backdrop)
}

function removeBackdrop() {
  backdrop?.remove()
  backdrop = null
}
