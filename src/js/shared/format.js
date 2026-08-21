/** Formatage des valeurs affichées (français, FCFA). */

const nf = new Intl.NumberFormat('fr-FR')

/** 15000 -> "15 000" (espace insécable fine pour éviter les retours à la ligne). */
export const formatNumber = (value) => nf.format(value).replace(/ |\s/g, ' ')

/** Prix complet avec devise : "1 500 FCFA". */
export const formatPrice = (value) => `${formatNumber(value)} FCFA`

/** Note à une décimale : 4.8 -> "4,8". */
export const formatRating = (value) => value.toFixed(1).replace('.', ',')

/** Écart de prix par rapport à la veille. */
export function priceTrend(product) {
  const delta = product.price - product.priceYesterday

  if (delta === 0) return { direction: 'flat', delta: 0, label: 'stable depuis hier' }

  return {
    direction: delta < 0 ? 'down' : 'up',
    delta: Math.abs(delta),
    label: 'par rapport à hier'
  }
}

/** "120 paniers disponibles" — pluriel géré par les données. */
export const formatStock = (product) => `Disponible : ${formatNumber(product.stock)} ${product.stockUnit}`
