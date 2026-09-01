/**
 * État de la page Marché.
 * Un composant s'abonne aux sujets qui le concernent ; une action ne notifie
 * que les sujets réellement touchés, ce qui évite de reconstruire toute la page.
 */

export const PRICE_CEILING = 10000;

export const state = {
  status: "loading",
  error: null,

  products: [],
  categories: [],
  producers: [],
  zones: [],
  benefits: [],
  banner: null,
  user: null,
  cart: [],
  favorites: [],

  filters: {
    search: "",
    category: "all",
    zones: [],
    producers: [],
    maxPrice: PRICE_CEILING,
  },

  producerQuery: "",
  producersExpanded: false,
  openGroups: { categories: true, zones: true, producers: true, price: true },

  sort: "price-asc",
  view: "grid",
  selectedId: null,

  page: 1,
  perPage: 12,

  /** Quantité choisie sur chaque carte, hors du cycle de rendu. */
  quantities: new Map(),
  panelQuantity: 1,

  ui: { filtersOpen: false, navOpen: false },
};

const subscribers = [];

/** @param {string[]} topics @param {Function} handler */
export function subscribe(topics, handler) {
  subscribers.push({ topics, handler });
}

/** Notifie les composants abonnés à au moins un des sujets donnés. */
export function emit(...topics) {
  subscribers
    .filter((sub) => sub.topics.some((topic) => topics.includes(topic)))
    .forEach((sub) => sub.handler());
}

/* ---------- Sélecteurs ---------- */

const matchesSearch = (product, query, producers) => {
  if (!query) return true;

  const producer = producers.find((p) => p.id === product.producerId);
  const haystack = [
    product.name,
    product.city,
    product.zone,
    producer?.name,
    producer?.contact,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
};

/**
 * Applique les filtres, en pouvant en ignorer un.
 * Ignorer une facette permet d'en calculer les compteurs sans qu'elle s'exclue elle-même.
 */
export function filterProducts(except = null) {
  const { search, category, zones, producers, maxPrice } = state.filters;

  return state.products.filter((product) => {
    if (except !== "search" && !matchesSearch(product, search, state.producers))
      return false;
    if (
      except !== "category" &&
      category !== "all" &&
      product.categoryId !== category
    )
      return false;
    if (except !== "zones" && zones.length && !zones.includes(product.zone))
      return false;
    if (
      except !== "producers" &&
      producers.length &&
      !producers.includes(product.producerId)
    )
      return false;
    if (except !== "price" && product.price > maxPrice) return false;
    return true;
  });
}

const SORTS = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name, "fr"),
  "rating-desc": (a, b) => b.rating - a.rating,
  "stock-desc": (a, b) => b.stock - a.stock,
};

/** Produits filtrés puis triés — l'ensemble du résultat, toutes pages confondues. */
export function visibleProducts() {
  return filterProducts().sort(SORTS[state.sort] ?? SORTS["price-asc"]);
}

/** Nombre de pages nécessaires pour le résultat courant. */
export const pageCount = () =>
  Math.max(1, Math.ceil(visibleProducts().length / state.perPage));

/** La tranche de produits affichée dans la grille. */
export function pagedProducts() {
  const all = visibleProducts();
  const start = (state.page - 1) * state.perPage;
  return all.slice(start, start + state.perPage);
}

/**
 * Revient à la première page.
 * À appeler dès qu'un filtre, un tri ou une recherche change : rester page 3
 * d'un résultat qui n'en compte plus qu'une donnerait une grille vide.
 */
export function resetPage() {
  state.page = 1;
}

export const findProduct = (id) => state.products.find((p) => p.id === id);
export const findProducer = (id) => state.producers.find((p) => p.id === id);

export const cartCount = () =>
  state.cart.reduce((total, item) => total + item.quantity, 0);
export const cartItemFor = (productId) =>
  state.cart.find((item) => item.productId === productId);
export const favoriteFor = (productId) =>
  state.favorites.find((fav) => fav.productId === productId);

/**
 * Quantité en cours de saisie sur une carte.
 * On démarre à la commande minimum : c'est à l'acheteuse d'augmenter.
 */
export function quantityFor(product) {
  return state.quantities.get(product.id) ?? product.minOrder;
}

export function setQuantity(product, value) {
  const clamped = Math.min(Math.max(value, product.minOrder), product.stock);
  state.quantities.set(product.id, clamped);
  return clamped;
}

/** true si au moins un filtre s'écarte de la valeur par défaut. */
export function hasActiveFilters() {
  const { search, category, zones, producers, maxPrice } = state.filters;
  return (
    Boolean(search) ||
    category !== "all" ||
    zones.length > 0 ||
    producers.length > 0 ||
    maxPrice < PRICE_CEILING
  );
}

export function resetFilters() {
  state.filters = {
    search: "",
    category: "all",
    zones: [],
    producers: [],
    maxPrice: PRICE_CEILING,
  };
  state.producerQuery = "";
}
