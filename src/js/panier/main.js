/**
 * Panier — la commande groupée avant validation.
 * Les lignes sont regroupées par producteur : une commande ZANDO part
 * chez plusieurs fermes à la fois.
 */

import * as api from '../shared/api.js'
import { icon } from '../shared/icons.js'
import { formatNumber, formatPrice } from '../shared/format.js'
import { mountHeader, refreshCartCount } from '../shared/components/header.js'
import { initToasts, toast } from '../shared/components/toast.js'

const dom = {
  header: document.querySelector('[data-region="header"]'),
  breadcrumb: document.querySelector('[data-region="breadcrumb"]'),
  cart: document.querySelector('[data-region="cart"]')
}

const data = { cart: [], products: [], producers: [], support: null, user: null }

const countItems = () => data.cart.reduce((total, item) => total + item.quantity, 0)
const findProduct = (id) => data.products.find((product) => product.id === id)

async function start() {
  initToasts()

  try {
    const [cart, products, producers, support, user] = await Promise.all([
      api.getCart(), api.getProducts(), api.getProducers(), api.getSupport(), api.getUser()
    ])
    Object.assign(data, { cart, products, producers, support, user })
  } catch (error) {
    mountHeader(dom.header, { activePage: 'panier', user: null, cartCount: () => 0 })
    dom.cart.innerHTML = state('package-open', 'Le panier ne peut pas être chargé',
      'Lancez `npm run api` puis rechargez la page.')
    return
  }

  mountHeader(dom.header, { activePage: 'panier', user: data.user, cartCount: countItems })
  renderBreadcrumb()
  render()
}

function renderBreadcrumb() {
  dom.breadcrumb.innerHTML = `
    <nav class="breadcrumb" aria-label="Fil d'Ariane">
      <a href="/index.html">Accueil</a>
      ${icon('chevron-right')}
      <a href="/marche.html">Marché</a>
      ${icon('chevron-right')}
      <span aria-current="page">Panier</span>
    </nav>
  `
}

const state = (iconName, title, text, action = '') => `
  <div class="empty-state">
    ${icon(iconName)}
    <h1>${title}</h1>
    <p>${text}</p>
    ${action}
  </div>
`

function render() {
  const lines = data.cart
    .map((item) => ({ item, product: findProduct(item.productId) }))
    .filter((line) => line.product)

  if (!lines.length) {
    dom.cart.innerHTML = state(
      'shopping-cart',
      'Votre panier est vide',
      "Parcourez les prix du jour et composez votre commande groupée.",
      '<a class="btn btn-primary" href="/marche.html">Voir le marché</a>'
    )
    return
  }

  const subtotal = lines.reduce((total, line) => total + line.product.price * line.item.quantity, 0)
  const delivery = subtotal >= data.support.freeDeliveryFrom ? 0 : data.support.deliveryFee
  const groups = groupByProducer(lines)

  dom.cart.innerHTML = `
    <div class="cart">
      <section class="cart-lines" aria-label="Produits du panier">
        <header class="cart-head">
          <h1 class="cart-title">Mon panier <span>(${formatNumber(countItems())} articles)</span></h1>
          <p class="cart-subtitle">${groups.length} ${groups.length > 1 ? 'producteurs' : 'producteur'} · livraison groupée</p>
        </header>

        ${groups.map(renderGroup).join('')}
      </section>

      <aside class="cart-summary">
        <div class="card cart-summary-card">
          <h2 class="panel-section-title">Récapitulatif</h2>

          <dl class="summary-list">
            <dt>Sous-total</dt>
            <dd>${formatPrice(subtotal)}</dd>
            <dt>Livraison</dt>
            <dd>${delivery === 0 ? '<span class="is-free">Offerte</span>' : formatPrice(delivery)}</dd>
          </dl>

          ${delivery > 0 ? `
            <p class="summary-hint">
              ${icon('truck', 'icon-sm')}
              Livraison offerte à partir de ${formatPrice(data.support.freeDeliveryFrom)}
              — il vous manque ${formatPrice(data.support.freeDeliveryFrom - subtotal)}.
            </p>
          ` : ''}

          <p class="summary-total">
            <span>Total</span>
            <strong>${formatPrice(subtotal + delivery)}</strong>
          </p>

          <button class="btn btn-primary btn-block" type="button" data-checkout>
            Valider la commande ${icon('arrow-right', 'icon-sm')}
          </button>
          <a class="btn btn-secondary btn-block" href="/marche.html">Continuer mes achats</a>

          <p class="summary-note">
            ${icon('truck')}
            <span>${data.support.delivery}</span>
          </p>
        </div>
      </aside>
    </div>
  `

  bind()
}

/** Une ligne par produit, regroupée sous sa ferme d'origine. */
function groupByProducer(lines) {
  const groups = new Map()

  lines.forEach((line) => {
    const id = line.product.producerId
    if (!groups.has(id)) groups.set(id, [])
    groups.get(id).push(line)
  })

  return [...groups].map(([producerId, items]) => ({
    producer: data.producers.find((producer) => producer.id === producerId),
    items
  }))
}

function renderGroup({ producer, items }) {
  const total = items.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0)

  return `
    <section class="cart-group">
      <header class="cart-group-head">
        <img src="${producer.avatar}" alt="" width="36" height="36">
        <span>
          <span class="cart-group-name">${producer.name}</span>
          <span class="cart-group-place">${producer.city}, ${producer.zone}</span>
        </span>
        <span class="cart-group-total">${formatPrice(total)}</span>
      </header>

      <ul class="cart-list">
        ${items.map(renderLine).join('')}
      </ul>
    </section>
  `
}

function renderLine({ item, product }) {
  return `
    <li class="cart-line" data-line="${item.id}">
      <a class="cart-line-media" href="/produit.html?id=${product.id}">
        <img src="${product.thumb}" alt="${product.name}" loading="lazy" decoding="async">
      </a>

      <div class="cart-line-info">
        <a class="cart-line-name" href="/produit.html?id=${product.id}">${product.name}</a>
        <p class="cart-line-price">${formatPrice(product.price)} / ${product.unit}</p>
        <p class="cart-line-stock">Disponible : ${formatNumber(product.stock)} ${product.stockUnit}</p>
      </div>

      <div class="cart-line-quantity">
        <div class="stepper" data-for="${product.id}">
          <button type="button" data-step="-1" ${item.quantity <= product.minOrder ? 'disabled' : ''}>
            <span class="sr-only">Retirer une unité</span>${icon('minus', 'icon-sm')}
          </button>
          <input type="number" value="${item.quantity}" min="${product.minOrder}" max="${product.stock}"
                 aria-label="Quantité de ${product.name}">
          <button type="button" data-step="1" ${item.quantity >= product.stock ? 'disabled' : ''}>
            <span class="sr-only">Ajouter une unité</span>${icon('plus', 'icon-sm')}
          </button>
        </div>
      </div>

      <p class="cart-line-total">${formatPrice(product.price * item.quantity)}</p>

      <button class="cart-line-remove" type="button" data-remove="${item.id}">
        <span class="sr-only">Retirer ${product.name} du panier</span>${icon('trash', 'icon-sm')}
      </button>
    </li>
  `
}

function bind() {
  dom.cart.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]')
    if (step) {
      const line = step.closest('[data-line]')
      const input = line.querySelector('input')
      return changeQuantity(line.dataset.line, Number(input.value) + Number(step.dataset.step))
    }

    const remove = event.target.closest('[data-remove]')
    if (remove) return removeLine(remove.dataset.remove)

    if (event.target.closest('[data-checkout]')) return checkout()
  })

  dom.cart.addEventListener('change', (event) => {
    const input = event.target.closest('.stepper input')
    if (!input) return

    const line = input.closest('[data-line]')
    changeQuantity(line.dataset.line, Number(input.value))
  })
}

async function changeQuantity(lineId, value) {
  const item = data.cart.find((entry) => entry.id === lineId)
  const product = findProduct(item.productId)
  const quantity = Math.min(Math.max(value, product.minOrder), product.stock)

  if (quantity === item.quantity) return render()

  try {
    Object.assign(item, await api.updateCartItem(lineId, quantity))
    render()
    refreshCartCount()
  } catch (error) {
    toast('Quantité non enregistrée', "L'API ne répond pas, réessayez.", 'package-open')
    console.error(error)
  }
}

async function removeLine(lineId) {
  const item = data.cart.find((entry) => entry.id === lineId)
  const product = findProduct(item.productId)
  const node = dom.cart.querySelector(`[data-line="${lineId}"]`)

  node?.classList.add('is-leaving')

  try {
    await api.deleteCartItem(lineId)
    data.cart = data.cart.filter((entry) => entry.id !== lineId)
    render()
    refreshCartCount()
    toast(`${product.name} retiré du panier`, '', 'trash')
  } catch (error) {
    node?.classList.remove('is-leaving')
    toast('Suppression impossible', "L'API ne répond pas, réessayez.", 'package-open')
    console.error(error)
  }
}

/** La commande elle-même appartient à l'écran Commandes, pas encore développé. */
function checkout() {
  toast(
    'Commande prête à être envoyée',
    "La validation arrivera avec l'écran Commandes.",
    'clipboard-list'
  )
}

start()
