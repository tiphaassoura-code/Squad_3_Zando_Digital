/**
 * ZANDO — page Marché.
 * Charge les données depuis l'API json-server, monte les composants et
 * relie les actions du catalogue au panier.
 */

import * as api from "../shared/api.js";
import { loadMarket } from "./data.js";
import {
  state,
  emit,
  subscribe,
  findProduct,
  cartItemFor,
  favoriteFor,
  quantityFor,
  visibleProducts,
  cartCount,
  resetPage,
} from "./state.js";
import { formatNumber } from "../shared/format.js";

import {
  mountHeader,
  refreshCartCount,
  setHeaderSearch,
} from "../shared/components/header.js";
import { renderPromo, renderBreadcrumb } from "./components/promo.js";
import { renderCategories } from "./components/categories.js";
import { renderFilters, closeFilters } from "./components/filters.js";
import { renderToolbar } from "./components/toolbar.js";
import {
  renderGrid,
  bindGrid,
  highlightSelected,
  handleStep,
  handleInput,
} from "./components/productGrid.js";
import { renderPagination } from "./components/pagination.js";
import { readUrl, writeUrl } from "./url.js";
import {
  renderPanel,
  refreshPanelTotal,
  openPanel,
  closePanel,
} from "./components/panel.js";
import { initToasts, toast } from "../shared/components/toast.js";
import { markAdded } from "./components/productCard.js";

const dom = {
  header: document.querySelector('[data-region="header"]'),
  promo: document.querySelector('[data-region="promo"]'),
  breadcrumb: document.querySelector('[data-region="breadcrumb"]'),
  categories: document.querySelector('[data-region="categories"]'),
  filters: document.querySelector('[data-region="filters"]'),
  toolbar: document.querySelector('[data-region="toolbar"]'),
  grid: document.querySelector('[data-region="grid"]'),
  pagination: document.querySelector('[data-region="pagination"]'),
  panel: document.querySelector('[data-region="panel"]'),
};

async function start() {
  initToasts();
  renderGrid(dom.grid);
  bindGrid({ onAdd: addToCart, onFavorite: toggleFavorite, onOpen: openPanel });

  try {
    const data = await loadMarket();
    Object.assign(state, data, { status: "ready" });
  } catch (error) {
    state.status = "error";
    state.error = error;
    setupHeader();
    renderGrid();
    console.error("Chargement du marché impossible :", error);
    return;
  }

  // L'URL fait foi au chargement : un lien partagé rouvre le même résultat.
  readUrl();

  setupHeader();
  renderPromo(dom.promo);
  renderBreadcrumb(dom.breadcrumb);
  renderCategories(dom.categories);
  renderFilters(dom.filters);
  renderToolbar(dom.toolbar);
  renderGrid();
  renderPagination(dom.pagination);
  renderPanel(dom.panel);

  wireSubscriptions();
  wirePanel();
  wirePanelBreakpoint();
  wireGlobalKeys();
  openFirstProductOnWideScreen();
}

/**
 * Sur un grand écran, le détail occupe une troisième colonne : l'ouvrir d'emblée
 * montre le prix du jour et le producteur sans clic. En dessous, il deviendrait
 * un tiroir superposé — on laisse alors la grille libre.
 */
function openFirstProductOnWideScreen() {
  if (!window.matchMedia("(min-width: 1561px)").matches) return;

  const first = visibleProducts()[0];
  if (first) openPanel(first.id, { focus: false });
}

/** Le panneau vit hors de la grille : il lui faut ses propres écouteurs. */
function wirePanel() {
  dom.panel.addEventListener("click", (event) => {
    const step = event.target.closest("[data-step]");
    if (step) return handleStep(step);

    const add = event.target.closest("[data-add-panel]");
    if (add) return addToCart(add.dataset.addPanel, add);
  });

  dom.panel.addEventListener("change", (event) => {
    const input = event.target.closest(".stepper input");
    if (input) handleInput(input);
  });
}

/** Branche l'en-tête commun sur l'état de cette page. */
function setupHeader() {
  mountHeader(dom.header, {
    activePage: "marche",
    user: state.user,
    cartCount,
    search: {
      value: state.filters.search,
      onChange: (value) => {
        state.filters.search = value;
        resetPage();
        emit("grid", "filters", "toolbar", "pagination", "categories", "url");
      },
      onClear: () => {
        state.filters.search = "";
        resetPage();
        emit("grid", "filters", "toolbar", "pagination", "categories", "url");
      },
    },
  });
}

function wireSubscriptions() {
  (["header"], () => setHeaderSearch(state.filters.search));
  subscribe(["filters"], () => renderFilters());
  subscribe(["toolbar"], () => renderToolbar());
  subscribe(["grid"], () => {
    renderGrid();
    highlightSelected();
  });
  subscribe(["pagination"], () => renderPagination());
  subscribe(["categories"], () => renderCategories());
  subscribe(["url"], () => writeUrl());

  // Retour arrière : on relit l'URL et on reconstruit l'affichage.
  window.addEventListener("popstate", () => {
    readUrl();
    renderCategories();
    renderFilters();
    renderToolbar();
    renderGrid();
    renderPagination();
    setHeaderSearch(state.filters.search);
  });
  subscribe(["grid-selection"], highlightSelected);
  subscribe(["panel"], () => renderPanel());
  subscribe(["panel-total"], refreshPanelTotal);
}

/**
 * En dessous du seuil, le panneau devient un tiroir qui masque le catalogue :
 * on le referme plutôt que de le laisser recouvrir la grille au redimensionnement.
 */
function wirePanelBreakpoint() {
  const wide = window.matchMedia("(min-width: 1561px)");

  wide.addEventListener("change", (event) => {
    if (!event.matches && state.selectedId) closePanel();
  });
}

function wireGlobalKeys() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (state.selectedId) closePanel();
    if (state.ui.filtersOpen) closeFilters();
  });
}

/**
 * Ajout au panier : POST si le produit n'y est pas encore, PATCH sinon.
 * L'API json-server reste la source de vérité du panier.
 */
async function addToCart(productId, button) {
  const product = findProduct(productId);
  if (!product) return;

  const scope = button.dataset.addPanel ? "panel" : "card";
  const quantity =
    scope === "panel" ? state.panelQuantity : quantityFor(product);
  const existing = cartItemFor(productId);

  button.disabled = true;

  try {
    if (existing) {
      const total = Math.min(existing.quantity + quantity, product.stock);
      const updated = await api.updateCartItem(existing.id, total);
      Object.assign(existing, updated);
      toast(
        `${product.name} — panier mis à jour`,
        `${formatNumber(total)} ${product.stockUnit} au total`,
      );
    } else {
      const created = await api.createCartItem(productId, quantity);
      state.cart.push(created);
      toast(
        `${product.name} ajouté au panier`,
        `${formatNumber(quantity)} ${quantity > 1 ? product.stockUnit : product.unit}`,
      );
    }

    refreshCartCount();
    markAdded(button);
  } catch (error) {
    button.disabled = false;
    toast(
      "Ajout impossible",
      "L'API ne répond pas, réessayez.",
      "package-open",
    );
    console.error(error);
  }
}

/** Favori : POST pour ajouter, DELETE pour retirer. */
async function toggleFavorite(productId, button) {
  const existing = favoriteFor(productId);
  const nextState = !existing;

  button.setAttribute("aria-pressed", String(nextState));
  button.classList.remove("is-popping");
  void button.offsetWidth;
  button.classList.add("is-popping");

  try {
    if (existing) {
      await api.deleteFavorite(existing.id);
      state.favorites = state.favorites.filter((fav) => fav.id !== existing.id);
    } else {
      state.favorites.push(await api.createFavorite(productId));
    }
  } catch (error) {
    button.setAttribute("aria-pressed", String(!nextState));
    toast(
      "Favori non enregistré",
      "L'API ne répond pas, réessayez.",
      "package-open",
    );
    console.error(error);
  }
}

start();
