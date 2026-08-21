/**
 * En-tête commun à toutes les pages.
 *
 * Le composant ne connaît ni le catalogue ni le panier : la page lui passe ce
 * qu'il doit afficher et ce qu'il doit appeler. Une page sans recherche omet
 * simplement l'option `search`.
 *
 *   mountHeader(document.querySelector('.header'), {
 *     activePage: 'marche',
 *     user,
 *     cartCount: () => 12,
 *     search: { value: '', onChange: (v) => {}, onClear: () => {} }
 *   })
 */

import { icon } from '../icons.js'
import { logoMark } from '../logo.js'
import { PAGES } from '../nav.js'
import { mountBottomNav } from './bottomNav.js'

const SEARCH_DEBOUNCE = 220

let root
let config = {}
let searchTimer

export function mountHeader(container, options = {}) {
  root = container
  config = options
  render()
  // Sur mobile, la navigation vit en bas de l'écran plutôt que dans l'en-tête.
  mountBottomNav(options.activePage)
}

function render() {
  const { activePage, user, search } = config
  const count = typeof config.cartCount === 'function' ? config.cartCount() : 0

  root.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="/index.html">
        ${logoMark('brand-mark')}
        <span>
          <span class="brand-name">ZANDO</span>
          <span class="brand-tagline">Du champ au marché, sans intermédiaire</span>
        </span>
      </a>

      <nav class="nav" aria-label="Navigation principale">
        ${PAGES.map((page) => navLink(page, activePage)).join('')}
      </nav>

      ${search ? searchField(search) : ''}

      <div class="header-actions">
        <a class="cart-button" href="/panier.html" ${activePage === 'panier' ? 'aria-current="page"' : ''}>
          ${icon('shopping-cart')}
          <span class="cart-button-label">Panier</span>
          <span class="badge badge-count">${count}</span>
        </a>

        ${user ? userChip(user) : ''}
      </div>
    </div>
  `

  bind()
}

/** Une page pas encore livrée reste visible, mais annoncée comme telle. */
function navLink(page, activePage) {
  const current = page.id === activePage

  if (!page.href) {
    return `<span class="nav-link is-soon" aria-disabled="true" title="Page à venir">${page.label}</span>`
  }

  return `<a class="nav-link" href="${page.href}" ${current ? 'aria-current="page"' : ''}>${page.label}</a>`
}

const searchField = (search) => `
  <div class="header-search">
    <label class="field">
      <span class="sr-only">${search.label ?? 'Rechercher un produit ou un producteur'}</span>
      ${icon('search')}
      <input type="search" id="recherche" autocomplete="off"
             placeholder="${search.placeholder ?? 'Rechercher un produit, un producteur…'}"
             value="${search.value ?? ''}">
      ${search.value ? clearButton() : ''}
    </label>
  </div>
`

const clearButton = () =>
  `<button class="search-clear" type="button" data-clear><span class="sr-only">Effacer la recherche</span>${icon('x', 'icon-sm')}</button>`

const userChip = (user) => `
  <button class="user-chip" type="button">
    <img src="${user.avatar}" alt="" width="36" height="36">
    <span class="user-chip-text">
      <span class="user-chip-name">${user.name}</span>
      <span class="user-chip-role">${user.role}</span>
    </span>
    ${icon('chevron-down', 'icon-sm')}
  </button>
`

function bind() {
  const input = root.querySelector('#recherche')
  if (!input) return

  input.addEventListener('input', (event) => {
    const value = event.target.value
    clearTimeout(searchTimer)
    // Laisse la frappe se terminer avant de prévenir la page.
    searchTimer = setTimeout(() => {
      config.search.value = value
      config.search.onChange?.(value)
      toggleClearButton(value)
    }, SEARCH_DEBOUNCE)
  })

  bindClear()
}

function bindClear() {
  root.querySelector('[data-clear]')?.addEventListener('click', () => {
    config.search.value = ''
    render()
    config.search.onClear?.()
    root.querySelector('#recherche')?.focus()
  })
}

/** Ajoute ou retire la croix sans reconstruire le champ en cours de frappe. */
function toggleClearButton(value) {
  const label = root.querySelector('.header-search .field')
  const existing = label.querySelector('[data-clear]')

  if (value && !existing) {
    label.insertAdjacentHTML('beforeend', clearButton())
    bindClear()
  } else if (!value && existing) {
    existing.remove()
  }
}

/** Met à jour le compteur du panier et le fait réagir. */
export function refreshCartCount() {
  const button = root?.querySelector('.cart-button')
  if (!button) return

  button.querySelector('.badge-count').textContent =
    typeof config.cartCount === 'function' ? config.cartCount() : 0

  button.classList.remove('is-bumping')
  void button.offsetWidth
  button.classList.add('is-bumping')
}

/** Reflète une valeur de recherche décidée par la page. */
export function setHeaderSearch(value) {
  if (!config.search) return
  config.search.value = value
  render()
}
