/**
 * Synchronisation de l'état du catalogue avec l'URL.
 *
 * Une recherche filtrée devient ainsi partageable, et le bouton Retour du
 * navigateur ramène au résultat précédent au lieu de quitter la page.
 */

import { state, PRICE_CEILING } from './state.js'

const DEFAULTS = { sort: 'price-asc', view: 'grid' }

/** Écrit l'état courant dans la barre d'adresse, sans recharger la page. */
export function writeUrl({ push = false } = {}) {
  const params = new URLSearchParams()
  const { search, category, zones, producers, maxPrice } = state.filters

  if (search) params.set('q', search)
  if (category !== 'all') params.set('categorie', category)
  if (zones.length) params.set('zone', zones.join(','))
  if (producers.length) params.set('producteur', producers.join(','))
  if (maxPrice < PRICE_CEILING) params.set('prixMax', String(maxPrice))
  if (state.sort !== DEFAULTS.sort) params.set('tri', state.sort)
  if (state.view !== DEFAULTS.view) params.set('vue', state.view)
  if (state.page > 1) params.set('page', String(state.page))

  const query = params.toString()
  const url = query ? `${location.pathname}?${query}` : location.pathname

  if (url === location.pathname + location.search) return

  history[push ? 'pushState' : 'replaceState'](null, '', url)
}

/**
 * Applique les paramètres de l'URL à l'état.
 * Les valeurs inconnues sont ignorées : une URL bricolée ne doit pas casser la page.
 */
export function readUrl() {
  const params = new URLSearchParams(location.search)
  const categories = state.categories.map((category) => category.id)
  const zones = state.zones.map((zone) => zone.name)
  const producers = state.producers.map((producer) => producer.id)

  const category = params.get('categorie')
  const sort = params.get('tri')
  const view = params.get('vue')
  const maxPrice = Number(params.get('prixMax'))
  const page = Number(params.get('page'))

  state.filters.search = params.get('q') ?? ''
  state.filters.category = categories.includes(category) ? category : 'all'
  state.filters.zones = (params.get('zone') ?? '').split(',').filter((zone) => zones.includes(zone))
  state.filters.producers = (params.get('producteur') ?? '').split(',').filter((id) => producers.includes(id))
  state.filters.maxPrice = maxPrice >= 500 && maxPrice <= PRICE_CEILING ? maxPrice : PRICE_CEILING

  state.sort = sort && sort in { 'price-asc': 1, 'price-desc': 1, 'name-asc': 1, 'rating-desc': 1, 'stock-desc': 1 }
    ? sort
    : DEFAULTS.sort
  state.view = view === 'list' ? 'list' : DEFAULTS.view
  state.page = page > 0 ? page : 1
}
