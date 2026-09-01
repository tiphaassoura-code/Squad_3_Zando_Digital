/**
 * Signalement d'un produit dans le catalogue.
 *
 * Un badge n'est utile que s'il distingue : il ne s'affiche donc que lorsqu'une
 * information décide de l'achat, et un seul à la fois, par ordre d'importance
 * pour une commerçante — le prix qui baisse d'abord, puis ce qui va manquer,
 * puis ce que les autres achètent.
 */

import { formatNumber, formatPrice, priceTrend } from './format.js'

/** En dessous, le stock restant mérite d'être signalé. */
export const LOW_STOCK = 50

/** Au-dessus, le produit est un habitué des commandes. */
export const POPULAR_ORDERS = 100

export function productBadge(product) {
  const trend = priceTrend(product)

  if (trend.direction === 'down') {
    return { kind: 'drop', icon: 'arrow-down', label: `−${formatPrice(trend.delta)}` }
  }

  if (product.stock <= LOW_STOCK) {
    return { kind: 'low', icon: 'package', label: `Reste ${formatNumber(product.stock)} ${product.stockUnit}` }
  }

  if (product.ordersCount > POPULAR_ORDERS) {
    return { kind: 'popular', icon: 'star', label: 'Très demandé' }
  }

  return null
}

/**
 * Ligne d'évolution affichée sous le prix.
 * Quand le prix baisse, le badge de la photo annonce déjà l'écart : la ligne
 * montre alors le prix de la veille barré, plus parlant qu'un chiffre répété.
 */
export function trendLabel(product) {
  const trend = priceTrend(product)

  if (trend.direction === 'down') {
    return { kind: 'down', before: formatPrice(product.priceYesterday), text: 'hier' }
  }

  if (trend.direction === 'up') {
    return { kind: 'up', icon: 'arrow-up', text: `+${formatPrice(trend.delta)} depuis hier` }
  }

  return { kind: 'flat', icon: 'check', text: 'Prix stable depuis hier' }
}
