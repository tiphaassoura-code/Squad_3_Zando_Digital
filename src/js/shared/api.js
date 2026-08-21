/**
 * Client de l'API REST servie par json-server.
 * En développement, Vite redirige /api vers http://localhost:3001 (voir vite.config.js).
 */

const BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} — ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}

/* ---- Lecture ---- */
export const getProducts = () => request('/products')
export const getCategories = () => request('/categories')
export const getProducers = () => request('/producers')
export const getZones = () => request('/zones')
export const getBenefits = () => request('/benefits')
export const getBanner = () => request('/banner')
export const getUser = () => request('/user')
export const getCart = () => request('/cart')
export const getFavorites = () => request('/favorites')
export const getSupport = () => request('/support')

/* ---- Panier : CRUD complet sur la collection /cart ---- */
export const createCartItem = (productId, quantity) =>
  request('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  })

export const updateCartItem = (id, quantity) =>
  request(`/cart/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity })
  })

export const deleteCartItem = (id) => request(`/cart/${id}`, { method: 'DELETE' })

/* ---- Favoris ---- */
export const createFavorite = (productId) =>
  request('/favorites', {
    method: 'POST',
    body: JSON.stringify({ productId })
  })

export const deleteFavorite = (id) => request(`/favorites/${id}`, { method: 'DELETE' })
