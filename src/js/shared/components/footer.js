/**
 * Pied de page commun à toutes les pages.
 * Reprend les pages du menu (src/js/shared/nav.js) : un seul endroit à
 * modifier pour que la navigation reste identique partout.
 *
 *   mountFooter(document.querySelector('[data-region="footer"]'))
 */

import { logoMark } from '../logo.js'
import { PAGES } from '../nav.js'
import { icon } from '../icons.js'

export function mountFooter(container, options = {}) {
  if (!container) return

  const year = new Date().getFullYear()
  const support = options.support ?? null

  container.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <a class="footer-logo" href="/index.html">
          ${logoMark('footer-mark')}
          <span>
            <strong>ZANDO</strong>
            <small>Du champ au marché, sans intermédiaire</small>
          </span>
        </a>
        ${support?.phone ? `
          <p class="footer-contact">
            ${icon('phone', 'icon-sm')}
            <a href="tel:${support.phone.replace(/\s+/g, '')}">${support.phone}</a>
          </p>
        ` : ''}
      </div>

      <nav class="footer-nav" aria-label="Pages du site">
        ${PAGES.map((page) => page.href
          ? `<a href="${page.href}">${page.label}</a>`
          : `<span class="is-soon" aria-disabled="true" title="Page à venir">${page.label}</span>`
        ).join('')}
      </nav>

      <p class="footer-copyright">© ${year} ZANDO. Tous droits réservés.</p>
    </div>
  `
}
