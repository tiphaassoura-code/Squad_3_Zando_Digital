/**
 * Galerie de la fiche produit : une photo principale et les autres angles
 * en vignettes, navigables au clic comme aux flèches.
 */

import { icon } from '../shared/icons.js'

let root
let images = []
let index = 0

export function renderGallery(container, product) {
  root = container ?? root
  images = product.images ?? []
  index = 0

  draw(product)
}

function draw(product) {
  const current = images[index]

  root.innerHTML = `
    <div class="gallery">
      <figure class="gallery-main">
        <img src="${current.full}" alt="${product.name} — vue ${index + 1} sur ${images.length}" decoding="async">
        ${product.dailyPrice ? `<span class="badge badge-daily">${icon('leaf')} Prix du jour</span>` : ''}
        <button class="fav-button" type="button" data-favorite="${product.id}" aria-pressed="false">
          <span class="sr-only">Ajouter ${product.name} aux favoris</span>${icon('heart', 'icon-sm')}
        </button>
      </figure>

      ${images.length > 1 ? `
        <div class="gallery-strip">
          <button class="gallery-arrow" type="button" data-move="-1" aria-label="Photo précédente" ${index === 0 ? 'disabled' : ''}>
            ${icon('chevron-left', 'icon-sm')}
          </button>

          <ul class="gallery-thumbs">
            ${images.map((image, position) => `
              <li>
                <button class="gallery-thumb" type="button" data-index="${position}"
                        aria-label="Voir la photo ${position + 1} sur ${images.length}"
                        ${position === index ? 'aria-current="true"' : ''}>
                  <img src="${image.thumb}" alt="" loading="lazy" decoding="async">
                </button>
              </li>
            `).join('')}
          </ul>

          <button class="gallery-arrow" type="button" data-move="1" aria-label="Photo suivante" ${index === images.length - 1 ? 'disabled' : ''}>
            ${icon('chevron-right', 'icon-sm')}
          </button>
        </div>
      ` : ''}
    </div>
  `

  root.querySelectorAll('[data-index]').forEach((button) => {
    button.addEventListener('click', () => {
      index = Number(button.dataset.index)
      draw(product)
    })
  })

  root.querySelectorAll('[data-move]').forEach((button) => {
    button.addEventListener('click', () => {
      index = Math.min(Math.max(index + Number(button.dataset.move), 0), images.length - 1)
      draw(product)
    })
  })
}
