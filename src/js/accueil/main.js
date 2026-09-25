/**
 * ZANDO — page d'Accueil.
 * Même architecture que les autres pages : données chargées depuis l'API
 * json-server (src/js/shared/api.js), en-tête commun, cartes produit
 * identiques à celles du Marché.
 */

import * as api from '../shared/api.js'
import { icon } from '../shared/icons.js'
import { formatNumber, formatPrice } from '../shared/format.js'
import { mountHeader, refreshCartCount } from '../shared/components/header.js'
import { initToasts, toast } from '../shared/components/toast.js'
import { productCardHTML, markAdded } from './productCard.js'

const FEATURED_COUNT = 6
const ACTIVE_STATUSES = ['en_attente', 'confirmee', 'en_cours']
const ORDER_STATUS_LABELS = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  en_cours: 'En cours',
  livree: 'Livrée',
  annulee: 'Annulée'
}

const dom = {
  header: document.querySelector('[data-region="header"]'),
  hero: document.querySelector('[data-region="hero"]'),
  categories: document.querySelector('[data-region="categories"]'),
  featured: document.querySelector('[data-region="featured"]'),
  producerCta: document.querySelector('[data-region="producer-cta"]'),
  ordersPreview: document.querySelector('[data-region="orders-preview"]'),
  help: document.querySelector('[data-region="help"]'),
  why: document.querySelector('[data-region="why"]')
}

const data = {
  products: [],
  categories: [],
  banner: null,
  user: null,
  cart: [],
  favorites: [],
  orders: [],
  support: null
}

/** Quantité choisie sur chaque carte, hors du cycle de rendu (comme le Marché). */
const quantities = new Map()

const cartCount = () => data.cart.reduce((total, item) => total + item.quantity, 0)
const findProduct = (id) => data.products.find((product) => product.id === id)
const cartItemFor = (productId) => data.cart.find((item) => item.productId === productId)
const favoriteFor = (productId) => data.favorites.find((fav) => fav.productId === productId)

function quantityFor(product) {
  return quantities.get(product.id) ?? product.minOrder
}
function setQuantity(product, value) {
  const clamped = Math.min(Math.max(value, product.minOrder), product.stock)
  quantities.set(product.id, clamped)
  return clamped
}

async function start() {
  initToasts()

  try {
    const [products, categories, banner, user, cart, favorites, orders, support] = await Promise.all([
      api.getProducts(),
      api.getCategories(),
      api.getBanner(),
      api.getUser(),
      api.getCart(),
      api.getFavorites(),
      api.getOrders(),
      api.getSupport()
    ])
    Object.assign(data, { products, categories, banner, user, cart, favorites, orders, support })
  } catch (error) {
    return renderError()
  }

  mountHeader(dom.header, {
    activePage: 'accueil',
    user: data.user,
    cartCount
  })

  renderHero()
  renderCategories()
  renderFeatured()
  renderProducerCta()
  renderOrdersPreview()
  renderHelp()
  renderWhy()

  bindFeatured()
}

function renderError() {
  mountHeader(dom.header, { activePage: 'accueil', user: null, cartCount: () => 0 })

  dom.hero.innerHTML = `
    <div class="empty-state">
      ${icon('package-open')}
      <h1>La page n'a pas pu être chargée</h1>
      <p>L'API ne répond pas sur le port 3001. Lancez <code>npm run api</code> puis rechargez la page.</p>
      <button class="btn btn-primary" type="button" onclick="location.reload()">Recharger</button>
    </div>
  `
}

function renderHero() {
  const title = data.banner?.subtitle ?? 'Des produits frais, des prix justes, plus de revenus pour tous.'
  const eyebrow = data.banner?.title ?? 'Soutenez les producteurs du Pool et de la Bouenza'
  const cover = data.banner?.image

  dom.hero.innerHTML = `
    <div class="hero-content">
      <div class="hero-copy">
        <span class="eyebrow">${icon('sprout', 'icon-sm')} ${eyebrow}</span>
        <h1>${title}</h1>
        <p>
          Les maraîchers du Pool et de la Bouenza publient leurs produits et
          prix du jour. Commandez en gros directement, sans intermédiaires.
        </p>

        <div class="hero-buttons">
          <a class="btn btn-primary" href="/marche.html">${icon('shopping-cart', 'icon-sm')} Découvrir le marché</a>
          <a class="btn btn-secondary" href="/producteurs.html">Voir les producteurs</a>
        </div>

        <div class="hero-features">
          <div class="hero-feature">
            ${icon('badge-check')}
            <span><strong>Prix du jour</strong>Mise à jour quotidienne</span>
          </div>
          <div class="hero-feature">
            ${icon('users')}
            <span><strong>Achat en gros</strong>Commandes groupées</span>
          </div>
          <div class="hero-feature">
            ${icon('truck')}
            <span><strong>Livraison rapide</strong>Sur vos marchés</span>
          </div>
          <div class="hero-feature">
            ${icon('credit-card')}
            <span><strong>Paiement sécurisé</strong>Simple et fiable</span>
          </div>
        </div>
      </div>

      ${cover ? `
        <div class="hero-cover">
          <img src="${cover}" alt="" loading="lazy" decoding="async">
        </div>
      ` : ''}
    </div>
  `
}

function renderCategories() {
  dom.categories.innerHTML = `
    <h2>Catégories</h2>
    <a class="category" href="/marche.html">${icon('layout-grid')}<span>Tous les produits</span></a>
    ${data.categories.map((category) => `
      <a class="category" href="/marche.html?categorie=${category.id}">
        ${icon(categoryIcon(category.id))}<span>${category.name}</span>
      </a>
    `).join('')}
  `
}

const CATEGORY_ICONS = {
  legumes: 'leaf',
  fruits: 'apple',
  tubercules: 'carrot',
  epices: 'flame',
  feuilles: 'leaf',
  cereales: 'wheat'
}
const categoryIcon = (id) => CATEGORY_ICONS[id] ?? 'sprout'

function renderFeatured() {
  const featured = data.products.slice(0, FEATURED_COUNT)

  dom.featured.innerHTML = `
    <div class="section-heading">
      <h2>Produits disponibles aujourd’hui</h2>
      <a href="/marche.html">Voir tout ${icon('arrow-right', 'icon-sm')}</a>
    </div>

    <div class="product-grid" data-region="featured-grid">
      ${featured.map((product) => productCardHTML(product, {
        quantity: quantityFor(product),
        isFavorite: Boolean(favoriteFor(product.id))
      })).join('')}
    </div>
  `
}

function renderProducerCta() {
  dom.producerCta.innerHTML = `
    <div class="producer-icon">${icon('users')}</div>
    <div>
      <strong>Vous êtes producteur ?</strong>
      <p>Rejoignez la plateforme et vendez directement vos produits.</p>
    </div>
    <a class="btn btn-primary" href="/producteurs.html">${icon('sprout', 'icon-sm')} Voir les producteurs</a>
  `
}

function renderOrdersPreview() {
  if (!dom.ordersPreview) return

  const mine = data.orders
    .filter((order) => order.userId === data.user?.id && ACTIVE_STATUSES.includes(order.status))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2)

  dom.ordersPreview.innerHTML = `
    <div class="side-heading">
      <h2>Commandes en cours</h2>
      <a href="/commandes.html">Voir tout</a>
    </div>

    ${mine.length ? mine.map(orderPreviewHTML).join('') : `
      <p class="orders-empty">Aucune commande en cours pour le moment.</p>
    `}

    <a class="track-orders" href="/commandes.html">${icon('truck', 'icon-sm')} Suivre mes commandes</a>
  `
}

function orderPreviewHTML(order) {
  const itemCount = order.items?.length ?? order.itemCount ?? 0
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return `
    <article class="order-item">
      <div class="order-top">
        <strong>${icon('package', 'icon-sm')} Commande #${order.id}</strong>
        <span class="badge is-${order.status}">${ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
      </div>
      <p>${itemCount} article${itemCount > 1 ? 's' : ''} · ${formatPrice(order.total ?? 0)}</p>
      <p>${order.market ? `Livraison : ${order.market}` : `Passée le ${date}`}</p>
    </article>
  `
}

function renderHelp() {
  if (!dom.help || !data.support) return

  dom.help.innerHTML = `
    <div class="help-icon">${icon('headphones')}</div>
    <div>
      <strong>Besoin d'aide ?</strong>
      <p>Contactez-nous au</p>
      <a href="tel:${data.support.phone.replace(/\s+/g, '')}"><b>${data.support.phone}</b></a>
      <small>${data.support.hours}</small>
    </div>
  `
}

const WHY_ITEMS = [
  { icon: 'trending-up', title: 'Plus de revenus', text: 'Les producteurs gagnent plus en vendant directement.' },
  { icon: 'tags', title: 'Meilleurs prix', text: 'Des prix plus justes grâce à la suppression des intermédiaires.' },
  { icon: 'leaf', title: 'Produits frais', text: 'Des produits frais récoltés du jour, directement des champs.' },
  { icon: 'users', title: 'Soutien local', text: "Vous soutenez l'agriculture locale et l'économie de nos régions." }
]

function renderWhy() {
  dom.why.innerHTML = `
    <div class="why-heading"><h2>Pourquoi choisir ZANDO ?</h2></div>
    <div class="why-grid">
      ${WHY_ITEMS.map((item) => `
        <article class="why-card">
          <div class="why-icon">${icon(item.icon)}</div>
          <div><strong>${item.title}</strong><p>${item.text}</p></div>
        </article>
      `).join('')}
    </div>
  `
}

/** Un seul écouteur délégué sur la grille, comme productGrid.js côté Marché. */
function bindFeatured() {
  const grid = dom.featured.querySelector('[data-region="featured-grid"]')
  if (!grid) return

  grid.addEventListener('click', (event) => {
    const stepButton = event.target.closest('[data-step]')
    if (stepButton) return handleStep(stepButton)

    const addButton = event.target.closest('[data-add]')
    if (addButton) return addToCart(addButton.dataset.add, addButton)

    const favButton = event.target.closest('[data-favorite]')
    if (favButton) return toggleFavorite(favButton.dataset.favorite, favButton)
  })

  grid.addEventListener('change', (event) => {
    const input = event.target.closest('.stepper input')
    if (input) handleInput(input)
  })
}

function handleStep(button) {
  const stepper = button.closest('.stepper')
  const product = findProduct(stepper.dataset.for)
  const input = stepper.querySelector('input')
  const next = setQuantity(product, Number(input.value) + Number(button.dataset.step))

  input.value = next
  syncStepper(stepper, product, next)
}

function handleInput(input) {
  const stepper = input.closest('.stepper')
  const product = findProduct(stepper.dataset.for)
  const next = setQuantity(product, Number(input.value) || product.minOrder)

  input.value = next
  syncStepper(stepper, product, next)
}

function syncStepper(stepper, product, quantity) {
  stepper.querySelector('[data-step="-1"]').disabled = quantity <= product.minOrder
  stepper.querySelector('[data-step="1"]').disabled = quantity >= product.stock
}

async function addToCart(productId, button) {
  const product = findProduct(productId)
  if (!product) return

  const quantity = quantityFor(product)
  const existing = cartItemFor(productId)

  button.disabled = true

  try {
    if (existing) {
      const total = Math.min(existing.quantity + quantity, product.stock)
      const updated = await api.updateCartItem(existing.id, total)
      Object.assign(existing, updated)
      toast(`${product.name} — panier mis à jour`, `${formatNumber(total)} ${product.stockUnit} au total`)
    } else {
      const created = await api.createCartItem(productId, quantity)
      data.cart.push(created)
      toast(`${product.name} ajouté au panier`, `${formatNumber(quantity)} ${quantity > 1 ? product.stockUnit : product.unit}`)
    }

    refreshCartCount()
    markAdded(button)
  } catch (error) {
    button.disabled = false
    toast('Ajout impossible', "L'API ne répond pas, réessayez.", 'package-open')
    console.error(error)
  }
}

async function toggleFavorite(productId, button) {
  const existing = favoriteFor(productId)
  const nextState = !existing

  button.setAttribute('aria-pressed', String(nextState))
  button.classList.remove('is-popping')
  void button.offsetWidth
  button.classList.add('is-popping')

  try {
    if (existing) {
      await api.deleteFavorite(existing.id)
      data.favorites = data.favorites.filter((fav) => fav.id !== existing.id)
    } else {
      data.favorites.push(await api.createFavorite(productId))
    }
  } catch (error) {
    button.setAttribute('aria-pressed', String(!nextState))
    toast('Favori non enregistré', "L'API ne répond pas, réessayez.", 'package-open')
    console.error(error)
  }
}

start()
