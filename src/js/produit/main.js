/**
 * Fiche produit — `produit.html?id=<identifiant>`.
 * Photos sous plusieurs angles, prix du jour, disponibilité, producteur
 * et produits proches.
 */

import * as api from '../shared/api.js'
import { icon } from '../shared/icons.js'
import { formatNumber, formatPrice, formatRating, priceTrend } from '../shared/format.js'
import { mountHeader, refreshCartCount } from '../shared/components/header.js'
import { initToasts, toast } from '../shared/components/toast.js'
import { renderGallery } from './gallery.js'

const TREND_ICON = { down: 'arrow-down', up: 'arrow-up', flat: 'check' }

const dom = {
  header: document.querySelector('[data-region="header"]'),
  breadcrumb: document.querySelector('[data-region="breadcrumb"]'),
  product: document.querySelector('[data-region="product"]'),
  similar: document.querySelector('[data-region="similar"]')
}

const data = {
  product: null,
  producer: null,
  category: null,
  products: [],
  cart: [],
  favorites: [],
  support: null,
  user: null
}

let quantity = 1

async function start() {
  initToasts()

  const id = new URLSearchParams(location.search).get('id')

  try {
    const [products, producers, categories, cart, favorites, support, user] = await Promise.all([
      api.getProducts(), api.getProducers(), api.getCategories(),
      api.getCart(), api.getFavorites(), api.getSupport(), api.getUser()
    ])

    Object.assign(data, { products, cart, favorites, support, user })
    data.product = products.find((product) => product.id === id)
    data.producer = producers.find((producer) => producer.id === data.product?.producerId)
    data.category = categories.find((category) => category.id === data.product?.categoryId)
  } catch (error) {
    return renderError("La fiche n'a pas pu être chargée", 'Lancez `npm run api` puis rechargez la page.')
  }

  mountHeader(dom.header, {
    activePage: 'marche',
    user: data.user,
    cartCount: () => data.cart.reduce((total, item) => total + item.quantity, 0)
  })

  if (!data.product) {
    return renderError('Produit introuvable', 'Il a peut-être été retiré du catalogue du jour.')
  }

  quantity = data.product.minOrder

  document.title = `${data.product.name} — ZANDO`
  renderBreadcrumb()
  renderProduct()
  renderSimilar()
}

function renderError(title, detail) {
  mountHeader(dom.header, { activePage: 'marche', user: null, cartCount: () => 0 })

  dom.product.innerHTML = `
    <div class="empty-state">
      ${icon('package-open')}
      <h1>${title}</h1>
      <p>${detail}</p>
      <a class="btn btn-primary" href="/marche.html">Retour au marché</a>
    </div>
  `
}

function renderBreadcrumb() {
  const { product, category } = data

  dom.breadcrumb.innerHTML = `
    <nav class="breadcrumb" aria-label="Fil d'Ariane">
      <a href="/index.html">Accueil</a>
      ${icon('chevron-right')}
      <a href="/marche.html">Marché</a>
      ${icon('chevron-right')}
      <a href="/marche.html?categorie=${category?.id ?? ''}">${category?.name ?? 'Catalogue'}</a>
      ${icon('chevron-right')}
      <span aria-current="page">${product.name}</span>
    </nav>
  `
}

function renderProduct() {
  const { product, producer, category, support } = data
  const trend = priceTrend(product)

  dom.product.innerHTML = `
    <article class="product-detail">
      <div class="product-detail-media" data-region="gallery"></div>

      <div class="product-detail-main">
        <p class="product-kind">${category?.name ?? 'Produit'} frais</p>
        <h1 class="product-detail-title">${product.name}</h1>
        <p class="product-origin">${icon('map-pin')} ${product.zone} — ${product.city}</p>

        <p class="product-detail-meta">
          <span class="rating">${icon('star')} ${formatRating(product.rating)} <span>(${product.reviews} avis)</span></span>
          <span class="product-detail-sep"></span>
          <span>${formatNumber(product.ordersCount)} commandes</span>
        </p>

        <div class="product-detail-price">
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

        ${product.dailyPrice ? `
          <p class="daily-note">
            ${icon('badge-check')}
            <span>
              <strong>Prix du jour</strong>
              <span>Mis à jour ce matin à ${product.priceUpdatedAt}</span>
            </span>
          </p>
        ` : ''}

        <p class="product-detail-description">${product.description}</p>

        <ul class="product-guarantees">
          <li>${icon('sprout')} Fraîcheur garantie</li>
          <li>${icon('leaf')} Récolté ${product.harvestedAt}</li>
          <li>${icon('handshake')} Sans intermédiaire</li>
        </ul>

        <div class="product-order">
          <div class="product-order-stock">
            <p class="panel-order-label">Quantité disponible</p>
            <p class="stock-value">${icon('package')} <strong>${formatNumber(product.stock)}</strong> ${product.stockUnit}</p>
            <p class="stock-note">Commande minimum : ${product.minOrder} ${product.unit}</p>
          </div>

          <div class="product-order-quantity">
            <p class="panel-order-label">Quantité</p>
            <div class="stepper" data-stepper="detail">
              <button type="button" data-step="-1"><span class="sr-only">Retirer une unité</span>${icon('minus', 'icon-sm')}</button>
              <input type="number" value="${quantity}" min="${product.minOrder}" max="${product.stock}"
                     aria-label="Quantité en ${product.unit}">
              <button type="button" data-step="1"><span class="sr-only">Ajouter une unité</span>${icon('plus', 'icon-sm')}</button>
            </div>
          </div>
        </div>

        <div class="product-total">
          <span>Total</span>
          <span class="product-total-amount">
            <strong data-total>${formatPrice(product.price * quantity)}</strong>
            <span data-total-detail>${formatPrice(product.price)} × ${quantity} ${unitLabel(product, quantity)}</span>
          </span>
        </div>

        <div class="product-cta">
          <button class="btn btn-primary btn-block" type="button" data-add>
            ${icon('shopping-cart', 'icon-sm')} Ajouter au panier
          </button>
          <button class="btn btn-secondary btn-block" type="button" data-favorite-cta>
            ${icon('heart', 'icon-sm')} Garder en favori
          </button>
        </div>
      </div>

      <aside class="product-detail-aside">
        <section class="card product-aside-card">
          <h2 class="panel-section-title">Producteur</h2>
          <div class="producer-card">
            <img src="${producer.avatar}" alt="" width="44" height="44">
            <div class="producer-info">
              <p class="producer-name">${producer.contact} ${producer.verified ? icon('badge-check') : ''}</p>
              <p class="producer-role">${producer.role}</p>
              <p class="producer-place">${producer.city}, ${producer.zone}</p>
            </div>
          </div>
          <a class="btn btn-secondary btn-block" href="/producteurs.html">Voir le profil du producteur</a>

          <ul class="producer-stats">
            <li>${icon('star')}<strong>${formatRating(producer.rating)}/5</strong><span>${producer.reviews} avis</span></li>
            <li>${icon('package')}<strong>${formatNumber(producer.ordersCount)}</strong><span>commandes</span></li>
            <li>${icon('sprout')}<strong>Depuis ${producer.since}</strong><span>sur ZANDO</span></li>
          </ul>
        </section>

        <section class="card product-aside-card">
          <h2 class="panel-section-title">Informations produit</h2>
          <dl class="spec-list">
            ${spec('Catégorie', category?.name ?? '—')}
            ${spec('Variété', product.variety)}
            ${spec('Origine', `${product.zone} — ${product.city}`)}
            ${spec('Récolte', product.harvestedAt)}
            ${spec('Conservation', product.conservation)}
          </dl>

          <p class="info-note">
            ${icon('truck')}
            <span><strong>Livraison</strong>${support.delivery}</span>
          </p>
        </section>

        <section class="card product-aside-card">
          <p class="info-note is-plain">
            ${icon('phone')}
            <span>
              <strong>Besoin d'aide ?</strong>
              Contactez-nous au <a class="info-link" href="tel:${support.phone.replace(/\s/g, '')}">${support.phone}</a>
              <span>${support.hours}</span>
            </span>
          </p>
        </section>
      </aside>
    </article>
  `

  renderGallery(dom.product.querySelector('[data-region="gallery"]'), product)
  bindProduct()
}

const spec = (label, value) => `<dt>${label}</dt><dd>${value}</dd>`

/** « 1 panier » mais « 10 paniers » : le pluriel vient des données. */
const unitLabel = (product, quantity) => (quantity > 1 ? product.stockUnit : product.unit)

function bindProduct() {
  const { product } = data

  dom.product.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]')
    if (step) return changeQuantity(Number(step.dataset.step))

    if (event.target.closest('[data-add]')) return addToCart(event.target.closest('[data-add]'))
    if (event.target.closest('[data-favorite], [data-favorite-cta]')) return toggleFavorite()
  })

  dom.product.querySelector('.stepper input').addEventListener('change', (event) => {
    setQuantity(Number(event.target.value) || product.minOrder)
  })

  syncFavorite()
}

const changeQuantity = (delta) => setQuantity(quantity + delta)

function setQuantity(value) {
  const { product } = data
  quantity = Math.min(Math.max(value, product.minOrder), product.stock)

  const stepper = dom.product.querySelector('.stepper')
  stepper.querySelector('input').value = quantity
  stepper.querySelector('[data-step="-1"]').disabled = quantity <= product.minOrder
  stepper.querySelector('[data-step="1"]').disabled = quantity >= product.stock

  dom.product.querySelector('[data-total]').textContent = formatPrice(product.price * quantity)
  dom.product.querySelector('[data-total-detail]').textContent =
    `${formatPrice(product.price)} × ${quantity} ${unitLabel(product, quantity)}`
}

async function addToCart(button) {
  const { product } = data
  const existing = data.cart.find((item) => item.productId === product.id)

  button.disabled = true

  try {
    if (existing) {
      const total = Math.min(existing.quantity + quantity, product.stock)
      Object.assign(existing, await api.updateCartItem(existing.id, total))
      toast(`${product.name} — panier mis à jour`, `${formatNumber(total)} ${product.stockUnit} au total`)
    } else {
      data.cart.push(await api.createCartItem(product.id, quantity))
      toast(`${product.name} ajouté au panier`, `${formatNumber(quantity)} ${quantity > 1 ? product.stockUnit : product.unit}`)
    }

    refreshCartCount()
  } catch (error) {
    toast('Ajout impossible', "L'API ne répond pas, réessayez.", 'package-open')
    console.error(error)
  } finally {
    button.disabled = false
  }
}

async function toggleFavorite() {
  const { product } = data
  const existing = data.favorites.find((favorite) => favorite.productId === product.id)

  try {
    if (existing) {
      await api.deleteFavorite(existing.id)
      data.favorites = data.favorites.filter((favorite) => favorite.id !== existing.id)
      toast(`${product.name} retiré des favoris`, '', 'heart')
    } else {
      data.favorites.push(await api.createFavorite(product.id))
      toast(`${product.name} gardé en favori`, '', 'heart')
    }

    syncFavorite()
  } catch (error) {
    toast('Favori non enregistré', "L'API ne répond pas, réessayez.", 'package-open')
    console.error(error)
  }
}

function syncFavorite() {
  const isFavorite = data.favorites.some((favorite) => favorite.productId === data.product.id)

  dom.product.querySelector('[data-favorite]')?.setAttribute('aria-pressed', String(isFavorite))
  const cta = dom.product.querySelector('[data-favorite-cta]')
  if (cta) cta.innerHTML = `${icon('heart', 'icon-sm')} ${isFavorite ? 'Retirer des favoris' : 'Garder en favori'}`
}

/** Même catégorie d'abord, complétée par la même zone de production. */
function renderSimilar() {
  const { product, products } = data

  const sameCategory = products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
  const sameZone = products.filter((item) => item.id !== product.id && item.zone === product.zone && item.categoryId !== product.categoryId)
  const similar = [...sameCategory, ...sameZone].slice(0, 4)

  if (!similar.length) return

  dom.similar.innerHTML = `
    <section class="similar">
      <h2 class="similar-title">Produits similaires</h2>
      <ul class="similar-grid">
        ${similar.map((item) => `
          <li>
            <a class="similar-card" href="/produit.html?id=${item.id}">
              <img src="${item.thumb}" alt="${item.name}" loading="lazy" decoding="async">
              <span class="similar-info">
                <span class="similar-name">${item.name}</span>
                <span class="similar-origin">${item.zone} — ${item.city}</span>
                <span class="product-price">
                  <span class="price-value">${formatNumber(item.price)}</span>
                  <span class="price-currency">FCFA</span>
                  <span class="price-unit">/ ${item.unit}</span>
                </span>
              </span>
            </a>
          </li>
        `).join('')}
      </ul>
    </section>
  `
}

start()
