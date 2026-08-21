/** Bandeau d'accroche et arguments de la place de marché. */

import { icon } from '../../shared/icons.js'
import { state } from '../state.js'

export function renderPromo(container) {
  const { banner } = state
  if (!banner) return

  container.innerHTML = `
    <section class="promo" aria-label="Engagement ZANDO">
      <div class="promo-media">
        <img src="${banner.image}" alt="Paniers de légumes récoltés par les producteurs du Pool" loading="lazy" decoding="async">
      </div>

      <div class="promo-text">
        <h2 class="promo-title">${banner.title}</h2>
        <p class="promo-subtitle">${banner.subtitle}</p>
      </div>

      <p class="promo-note">${icon('sprout')} ${state.products.length} produits récoltés cette semaine</p>
    </section>
  `
}

export function renderBreadcrumb(container) {
  container.innerHTML = `
    <nav class="breadcrumb" aria-label="Fil d'Ariane">
      <a href="#accueil">Accueil</a>
      ${icon('chevron-right')}
      <a href="#marche">Marché</a>
      ${icon('chevron-right')}
      <span aria-current="page">Tous les produits</span>
    </nav>
  `
}
