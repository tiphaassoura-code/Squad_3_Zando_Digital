/** Carte produit : photo, prix du jour, quantité et mise au panier. */

import { icon } from '../../shared/icons.js'
import { state, quantityFor, favoriteFor } from '../state.js'
import { formatNumber, formatPrice, formatStock } from '../../shared/format.js'
import { productBadge, trendLabel, LOW_STOCK } from '../../shared/badges.js'

export function productCardHTML(product, index) {
  const quantity = quantityFor(product)
  const isFavorite = Boolean(favoriteFor(product.id))
  const lowStock = product.stock <= LOW_STOCK
  const badge = productBadge(product)
  const trend = trendLabel(product)

  return `
    <article class="product-card ${state.selectedId === product.id ? 'is-selected' : ''}"
             data-product="${product.id}"
             style="animation-delay: ${Math.min(index, 11) * 40}ms">
      <div class="product-media">
        <img src="${product.thumb}" alt="${product.name} — ${product.city}" loading="lazy" decoding="async"
             width="400" height="300">
        ${badge ? `<span class="badge badge-signal is-${badge.kind}">${icon(badge.icon)} ${badge.label}</span>` : ''}
        <button class="fav-button" type="button" data-favorite="${product.id}" aria-pressed="${isFavorite}">
          <span class="sr-only">${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} : ${product.name}</span>
          ${icon('heart', 'icon-sm')}
        </button>
      </div>

      <div class="product-body">
        <div class="product-info">
          <h3 class="product-name">
            <button type="button" data-open="${product.id}" style="all:unset;cursor:pointer">${product.name}</button>
          </h3>
          <p class="product-origin">${icon('map-pin')} ${product.zone} — ${product.city}</p>

          <p class="product-price">
            <span class="price-value">${formatNumber(product.price)}</span>
            <span class="price-currency">FCFA</span>
            <span class="price-unit">/ ${product.unit}</span>
          </p>

          <p class="product-trend is-${trend.kind}">
            ${trend.before
              ? `<s class="product-trend-before">${trend.before}</s> <span>${trend.text}</span>`
              : `${icon(trend.icon, 'icon-sm')} ${trend.text}`}
          </p>

          <p class="product-stock ${lowStock ? 'is-low' : ''}">${formatStock(product)}</p>
        </div>

        <div class="product-actions">
          ${stepperHTML(product, quantity)}
          <button class="btn btn-secondary btn-block" type="button" data-add="${product.id}">
            Ajouter au panier ${icon('shopping-cart', 'icon-sm')}
          </button>
        </div>
      </div>
    </article>
  `
}

/** Sélecteur de quantité réutilisé par la carte et par le panneau de détail. */
export function stepperHTML(product, quantity, scope = 'card') {
  return `
    <div class="stepper" data-stepper="${scope}" data-for="${product.id}">
      <button type="button" data-step="-1" ${quantity <= product.minOrder ? 'disabled' : ''}>
        <span class="sr-only">Retirer une unité</span>${icon('minus', 'icon-sm')}
      </button>
      <input type="number" value="${quantity}" min="${product.minOrder}" max="${product.stock}" step="1"
             aria-label="Quantité en ${product.unit} pour ${product.name}">
      <button type="button" data-step="1" ${quantity >= product.stock ? 'disabled' : ''}>
        <span class="sr-only">Ajouter une unité</span>${icon('plus', 'icon-sm')}
      </button>
    </div>
  `
}

/** Retour visuel court sur le bouton après un ajout réussi. */
export function markAdded(button) {
  const original = button.innerHTML
  button.classList.add('is-added')
  button.innerHTML = `${icon('check', 'icon-sm')} Ajouté`
  button.disabled = true

  setTimeout(() => {
    button.classList.remove('is-added')
    button.innerHTML = original
    button.disabled = false
  }, 1400)
}

export const priceLine = (product) => `${formatPrice(product.price)} / ${product.unit}`
