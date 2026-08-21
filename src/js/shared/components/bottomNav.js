/**
 * Barre de navigation du bas, affichée sur mobile à la place du menu déroulant.
 * Montée automatiquement par `mountHeader` : aucune page n'a à s'en occuper.
 */

import { icon } from '../icons.js'
import { PAGES } from '../nav.js'

export function mountBottomNav(activePage) {
  document.querySelector('.bottom-nav')?.remove()

  const nav = document.createElement('nav')
  nav.className = 'bottom-nav'
  nav.setAttribute('aria-label', 'Navigation principale')

  nav.innerHTML = PAGES.map((page) => {
    const current = page.id === activePage

    return `
      <a class="bottom-nav-item" href="${page.href}" ${current ? 'aria-current="page"' : ''}>
        ${icon(page.icon)}
        <span>${page.label}</span>
      </a>
    `
  }).join('')

  document.body.append(nav)
}
