/**
 * Marque Zando : une feuille dont la matière est évidée à la forme de la
 * République du Congo. Les deux signes n'en font qu'un — la carte n'est pas
 * posée à côté de la feuille, elle est découpée dedans.
 *
 * Le tracé du pays vient des contours géographiques réels, simplifiés pour
 * l'usage logo. Le symbole est posé en SVG dans la page plutôt qu'en image :
 * il hérite ainsi de la couleur du texte, se met à l'échelle sans perte et
 * reste net sur un fond vert comme sur un fond clair. La découpe se fait au
 * masque : le fond de la page traverse la feuille, quel qu'il soit.
 *
 * Les fichiers autonomes (papier, réseaux, favicon) sont dans `public/`.
 */

/** Contour du pays, repère 84 × 100. */
const CONGO = 'M21.7 97.1L17.4 93.2L14.0 95.1L9.4 100.0L0.0 87.9L8.7 81.6L4.4 74.1L8.3 71.2L16.0 69.8L16.9 64.8L23.0 70.2L33.1 70.7L36.6 65.3L38.0 57.7L36.8 48.8L31.4 42.1L36.3 28.9L33.5 26.6L25.0 27.5L21.8 21.6L22.6 16.7L37.0 17.1L55.3 22.8L56.1 16.7L62.1 6.0L68.9 0.0L76.6 1.9L84.0 2.6L83.3 9.4L79.9 15.5L77.6 22.7L76.2 32.8L76.8 39.2L74.9 43.2L74.7 47.4L73.3 51.0L65.8 56.5L60.6 62.4L55.7 73.5L56.0 82.9L39.8 99.2L35.5 97.2L34.8 94.0L28.6 93.9L24.7 98.2L21.7 97.1Z'

/** Le limbe de la feuille, repère 100 × 100. */
const LIMBE = 'M54 5C82 28 84 62 49 88 15 62 23 28 54 5Z'

/** Le pays, réduit et centré dans le limbe avec une marge régulière. */
const CARTE = 'translate(33.36 25.00) scale(0.4200)'

/** Un identifiant par instance : plusieurs marques peuvent cohabiter sur une page. */
let compteur = 0

/**
 * @param {string} [extraClass] modificateur de taille ou de couleur
 * @returns {string} le symbole, décoratif : le nom de la marque est porté par le texte voisin
 */
export function logoMark(extraClass = '') {
  const id = `zando-decoupe-${++compteur}`
  return `
    <svg class="${`logo-mark ${extraClass}`.trim()}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
        <rect width="100" height="100" fill="#fff"/>
        <path d="${CONGO}" transform="${CARTE}" fill="#000"/>
      </mask>
      <path d="${LIMBE}" fill="currentColor" mask="url(#${id})"/>
      <path d="M49 88C47 92 45 95 42 97" fill="none" stroke="currentColor"
            stroke-width="5" stroke-linecap="round"/>
    </svg>`
}
