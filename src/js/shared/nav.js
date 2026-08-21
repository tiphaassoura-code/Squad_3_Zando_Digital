/**
 * Pages du site et leur ordre dans la navigation.
 *
 * Pour brancher une nouvelle page : créer `<nom>.html` à la racine, déclarer
 * son entrée dans vite.config.js, puis remplacer son `href` ci-dessous par
 * le chemin du fichier. Un href à null affiche le lien comme « à venir ».
 * Les pages du menu existent toutes : celles qui ne sont pas encore développées
 * affichent l'en-tête et un corps vide, prêt à recevoir leur contenu.
 *
 * `icon` sert à la barre de navigation du bas, affichée sur mobile.
 */
export const PAGES = [
  { id: 'accueil',     label: 'Accueil',     href: '/index.html',       icon: 'house' },
  { id: 'marche',      label: 'Marché',      href: '/marche.html',      icon: 'store' },
  { id: 'producteurs', label: 'Producteurs', href: '/producteurs.html', icon: 'sprout' },
  { id: 'commandes',   label: 'Commandes',   href: '/commandes.html',   icon: 'clipboard-list' },
  { id: 'a-propos',    label: 'À propos',    href: '/a-propos.html',    icon: 'circle-help' },
  { id: 'contact',     label: 'Contact',     href: '/contact.html',     icon: 'phone' }
]

