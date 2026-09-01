/** Pagination du catalogue : bornes du résultat et changement de page. */

import { icon } from '../../shared/icons.js'
import { state, emit, visibleProducts, pageCount } from '../state.js'
import { writeUrl } from '../url.js'
import { formatNumber } from '../../shared/format.js'

let root

export function renderPagination(container) {
  root = container ?? root

  const total = visibleProducts().length
  const pages = pageCount()

  if (state.status !== 'ready' || total <= state.perPage) {
    root.innerHTML = ''
    return
  }

  const first = (state.page - 1) * state.perPage + 1
  const last = Math.min(state.page * state.perPage, total)

  root.innerHTML = `
    <nav class="pagination" aria-label="Pages de résultats">
      <p class="pagination-status">
        Produits <strong>${formatNumber(first)}–${formatNumber(last)}</strong> sur ${formatNumber(total)}
      </p>

      <div class="pagination-controls">
        <button class="pagination-arrow" type="button" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>
          ${icon('chevron-left', 'icon-sm')}<span class="pagination-arrow-label">Précédent</span>
        </button>

        <ul class="pagination-pages">
          ${pageItems(state.page, pages)}
        </ul>

        <button class="pagination-arrow" type="button" data-page="${state.page + 1}" ${state.page === pages ? 'disabled' : ''}>
          <span class="pagination-arrow-label">Suivant</span>${icon('chevron-right', 'icon-sm')}
        </button>
      </div>
    </nav>
  `

  root.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => goToPage(Number(button.dataset.page)))
  })
}

/**
 * Numéros affichés : les premières et dernières pages restent atteignables,
 * le milieu se replie en points de suspension quand la liste s'allonge.
 */
function pageItems(current, pages) {
  const numbers = []

  for (let page = 1; page <= pages; page += 1) {
    const nearEdge = page === 1 || page === pages
    const nearCurrent = Math.abs(page - current) <= 1

    if (nearEdge || nearCurrent) numbers.push(page)
    else if (numbers.at(-1) !== '…') numbers.push('…')
  }

  return numbers.map((entry) => {
    if (entry === '…') return '<li><span class="pagination-gap">…</span></li>'

    const active = entry === current
    return `
      <li>
        <button class="pagination-page" type="button" data-page="${entry}"
                ${active ? 'aria-current="page"' : ''}>
          <span class="sr-only">Page </span>${entry}
        </button>
      </li>
    `
  }).join('')
}

function goToPage(page) {
  const pages = pageCount()
  state.page = Math.min(Math.max(page, 1), pages)

  emit('grid', 'pagination')
  writeUrl({ push: true })

  // La nouvelle page commence en haut de la liste, pas au milieu.
  document.querySelector('#catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
