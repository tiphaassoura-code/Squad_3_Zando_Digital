/**
 * Amorçage commun d'une page.
 *
 * Monte l'en-tête partagé et lui fournit le compte et le panier. Utilisé tel
 * quel par les pages encore vides ; une page qui a ses propres besoins
 * (recherche, panier interactif) appelle plutôt `mountHeader` directement,
 * comme le fait la page Marché.
 */

import { getUser, getCart } from './api.js'
import { mountHeader } from './components/header.js'

export async function initPage(activePage, options = {}) {
  let user = null
  let count = 0

  // L'en-tête doit s'afficher même si l'API n'est pas démarrée.
  try {
    const [loadedUser, cart] = await Promise.all([getUser(), getCart()])
    user = loadedUser
    count = cart.reduce((total, item) => total + item.quantity, 0)
  } catch {
    user = null
  }

  mountHeader(document.querySelector('[data-region="header"]'), {
    activePage,
    user,
    cartCount: () => count,
    ...options
  })
}
