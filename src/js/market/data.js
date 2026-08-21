/** Chargement des données de la page Marché. */

import * as api from '../shared/api.js'

/**
 * Charge en une fois tout ce dont la page Marché a besoin.
 */
export async function loadMarket() {
  const [products, categories, producers, zones, benefits, banner, user, cart, favorites] =
    await Promise.all([
      api.getProducts(),
      api.getCategories(),
      api.getProducers(),
      api.getZones(),
      api.getBenefits(),
      api.getBanner(),
      api.getUser(),
      api.getCart(),
      api.getFavorites()
    ])

  return { products, categories, producers, zones, benefits, banner, user, cart, favorites }
}
