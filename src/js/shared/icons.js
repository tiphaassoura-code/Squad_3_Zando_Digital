/**
 * Icônes Lucide — style outline uniquement, une seule famille sur tout le projet.
 * Les icônes sont importées nommément pour que le bundle ne contienne que celles utilisées.
 */

import {
  createElement,
  Apple,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Carrot,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  ChevronRight,
  Flame,
  Handshake,
  Heart,
  House,
  LayoutGrid,
  Leaf,
  List,
  MapPin,
  Minus,
  Package,
  PackageOpen,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sprout,
  Store,
  Trash2,
  Star,
  Truck,
  Wheat,
  X
} from 'lucide'

const ICONS = {
  apple: Apple,
  'arrow-down': ArrowDown,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'badge-check': BadgeCheck,
  carrot: Carrot,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'circle-help': CircleHelp,
  'clipboard-list': ClipboardList,
  'chevron-right': ChevronRight,
  flame: Flame,
  handshake: Handshake,
  heart: Heart,
  house: House,
  'layout-grid': LayoutGrid,
  leaf: Leaf,
  list: List,
  'map-pin': MapPin,
  minus: Minus,
  package: Package,
  'package-open': PackageOpen,
  phone: Phone,
  plus: Plus,
  search: Search,
  'shopping-cart': ShoppingCart,
  sliders: SlidersHorizontal,
  sprout: Sprout,
  store: Store,
  trash: Trash2,
  star: Star,
  truck: Truck,
  wheat: Wheat,
  x: X
}

/**
 * Renvoie le balisage SVG d'une icône, prêt à être inséré dans un template.
 * @param {string} name  clé de la table ICONS
 * @param {string} [extraClass]  modificateur de taille ou de couleur
 */
export function icon(name, extraClass = '') {
  const node = ICONS[name]
  if (!node) return ''

  const svg = createElement(node)
  svg.setAttribute('class', `icon ${extraClass}`.trim())
  svg.setAttribute('aria-hidden', 'true')
  svg.removeAttribute('width')
  svg.removeAttribute('height')

  return svg.outerHTML
}
