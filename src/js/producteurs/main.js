import {
  getCart,
  getProducts,
  getProducers,
  getUser,
  getZones,
  getFavorites,
  createProducerFavorite,
  deleteFavorite,
} from "../shared/api.js";
import { initPage } from "../shared/page.js";
import { icon } from "../shared/icons.js";
import { formatNumber, formatRating } from "../shared/format.js";
import { initToasts, toast } from "../shared/components/toast.js";

const root = document.querySelector('[data-region="producer-page"]');
const params = new URLSearchParams(window.location.search);
const activityTypes = [
  "Maraîcher",
  "Fruits",
  "Céréales",
  "Élevage",
  "Apiculture",
  "Bio",
  "Autres",
];
const PAGE_SIZE = 6;

const stars = (rating) =>
  `${icon("star", "star-fill")} ${formatRating(rating)}`;

const cover = (index) => `
  <div class="producer-cover producer-cover-${index % 4}" aria-hidden="true">
    <span>${icon(index % 2 ? "leaf" : "sprout")}</span>
  </div>
`;

function producerCard(producer, products, index, favorites) {
  const count = products.filter(
    (product) => product.producerId === producer.id,
  ).length;
  const favorite = favorites.find((item) => item.producerId === producer.id);

  return `
    <article class="producer-list-card" style="animation-delay:${index * 45}ms">
      ${cover(index)}
      <div class="producer-card-content">
        <div class="producer-avatar-wrap">
          <img src="${producer.avatar}" alt="" width="64" height="64">
          <span class="verified-dot">${icon("badge-check")}</span>
        </div>
        <div class="producer-card-heading">
          <div>
            <h3>${producer.contact}</h3>
            <p>${producer.role}</p>
          </div>
          <span class="producer-rating">
            ${stars(producer.rating)} <small>(${producer.reviews})</small>
          </span>
        </div>
        <p class="producer-card-location">
          ${icon("map-pin", "icon-sm")} ${producer.city}, ${producer.zone}
        </p>
        <div class="producer-card-stats">
          <span>${icon("package", "icon-sm")} <strong>${count}</strong> Produits</span>
          <span>${icon("truck", "icon-sm")} Livraison rapide</span>
          <span>${icon("leaf", "icon-sm")} Agriculture raisonnée</span>
        </div>
        <div class="producer-card-actions">
          <a class="btn btn-secondary btn-block" href="/producteurs.html?id=${producer.id}">
            Voir le profil ${icon("arrow-right", "icon-sm")}
          </a>
          <button
            class="icon-button ${favorite ? "is-favorite" : ""}"
            type="button"
            data-favorite="${producer.id}"
            data-favorite-id="${favorite?.id ?? ""}"
            aria-pressed="${Boolean(favorite)}"
            aria-label="${favorite ? "Retirer" : "Ajouter"} ${producer.contact} aux favoris">
            ${icon("heart")}
          </button>
        </div>
      </div>
    </article>
  `;
}

// Rendu complet de la page répertoire avec l'en-tête, les filtres et la liste
function renderDirectory(producers, products, zones, favorites) {
  const locations = zones.flatMap((zone) => zone.districts).slice(0, 6);

  const heroSection = `
    <section class="directory-hero">
      <div class="directory-hero-copy">
        <h1>Découvrez les producteurs locaux qui nourrissent votre communauté</h1>
        <p>Des producteurs vérifiés, des produits frais et une vente directe sans intermédiaire.</p>
        <label class="directory-search field">
          ${icon("search")}
          <span class="sr-only">Rechercher un producteur</span>
          <input type="search" data-search placeholder="Rechercher un producteur, une localité...">
        </label>
        <div class="activity-chips">
          ${activityTypes
            .map(
              (type, index) => `
              <button
                type="button"
                class="activity-chip ${index === 0 ? "is-active" : ""}"
                data-type-chip="${type}">
                ${icon(index < 2 ? "sprout" : "package", "icon-sm")} ${type}
              </button>
            `,
            )
            .join("")}
        </div>
      </div>
      <div class="join-card">
        <span>${icon("handshake")}</span>
        <strong>Rejoignez notre réseau de producteurs</strong>
        <small>Développez votre activité et touchez plus de clients.</small>
        <a class="btn btn-primary" href="/devenir-producteur.html">Devenir producteur</a>
      </div>
    </section>
  `;

  const statsData = [
    ["users", String(producers.length), "Producteurs vérifiés"],
    ["map-pin", "42", "Villages couverts"],
    ["package", "12k+", "Produits disponibles"],
    ["star", "4.8/5", "Note moyenne des producteurs"],
  ];

  const statsSection = `
    <section class="directory-stats" aria-label="Chiffres du réseau">
      ${statsData
        .map(
          ([name, value, label]) => `
          <div>
            ${icon(name)}
            <strong>${value}</strong>
            <small>${label}</small>
          </div>
        `,
        )
        .join("")}
    </section>
  `;

  const filterAside = `
    <button class="directory-filter-toggle btn btn-secondary" type="button" data-filter-toggle>
      ${icon("sliders-horizontal", "icon-sm")} Filtres
    </button>
    <button class="directory-filter-backdrop" type="button" data-filter-close aria-label="Fermer les filtres"></button>
    <aside class="directory-filters">
      <div class="filter-title">
        <strong>Filtres</strong>
        <div>
          <button class="filter-close" type="button" data-filter-close aria-label="Fermer">×</button>
          <button type="button" data-reset>Réinitialiser</button>
        </div>
      </div>
      <fieldset>
        <legend>Localisation</legend>
        <label class="field filter-search">
          ${icon("search")}
          <input type="search" data-location placeholder="Rechercher une localité...">
        </label>
        ${locations
          .map(
            (location) => `
            <label class="check-option">
              <input type="checkbox" data-location-option value="${location}">
              <span>${location}</span>
            </label>
          `,
          )
          .join("")}
      </fieldset>
      <fieldset>
        <legend>Type d'activité</legend>
        ${activityTypes
          .map(
            (type) => `
            <label class="check-option">
              <input type="checkbox" data-type-option value="${type}">
              <span>${type}</span>
            </label>
          `,
          )
          .join("")}
      </fieldset>
      <fieldset>
        <legend>Certification</legend>
        <label class="check-option">
          <input type="checkbox" data-certified>
          <span>Producteur vérifié</span>
        </label>
        <label class="check-option">
          <input type="checkbox">
          <span>Agriculture raisonnée</span>
        </label>
      </fieldset>
      <button class="btn btn-secondary btn-block" type="button" data-filter-close>
        Voir les résultats (${producers.length})
      </button>
    </aside>
  `;

  const resultsSection = `
    <section class="directory-results">
      <div class="results-toolbar">
        <div>
          <p class="eyebrow">Le réseau MABOKO</p>
          <h2>Tous les producteurs <small>(${producers.length})</small></h2>
        </div>
        <label class="sort-select">
          Trier par
          <select data-sort>
            <option value="rating">Les mieux notés</option>
            <option value="orders">Les plus actifs</option>
            <option value="name">Nom</option>
          </select>
        </label>
        <div class="directory-view-toggle" role="group" aria-label="Affichage">
          <button type="button" class="is-active" data-view="grid" aria-label="Vue grille">
            ${icon("layout-grid", "icon-sm")}
          </button>
          <button type="button" data-view="list" aria-label="Vue liste">
            ${icon("list", "icon-sm")}
          </button>
        </div>
      </div>
      <div class="producer-list" data-producer-list></div>
      <button class="btn btn-ghost load-more" type="button" data-load-more>
        Charger plus de producteurs ${icon("chevron-down", "icon-sm")}
      </button>
    </section>
  `;

  const joinSection = `
    <section class="directory-join">
      <div>
        <p class="eyebrow">Vous êtes producteur ?</p>
        <h2>Rejoignez MABOKO et développez votre activité.</h2>
        <p>Accédez à plus de clients et vendez vos produits sans intermédiaire.</p>
        <a class="btn btn-primary" href="/devenir-producteur.html">Devenir producteur</a>
      </div>
      <div class="join-benefits">
        <span>${icon("clipboard-list")} Inscription gratuite</span>
        <span>${icon("handshake")} Zéro commission au début</span>
        <span>${icon("truck")} Accompagnement personnalisé</span>
      </div>
    </section>
  `;

  root.innerHTML = `
    ${heroSection}
    ${statsSection}
    <div class="directory-layout">
      ${filterAside}
      ${resultsSection}
    </div>
    ${joinSection}
  `;

  root
    .querySelector(".directory-hero h1")
    ?.classList.add("directory-hero-title");

  bindDirectory(producers, products, favorites ?? []);
}

// Gestion des interactions : filtres, pagination, favoris et bascule de vue
function bindDirectory(producers, products, favorites = []) {
  const list = root.querySelector("[data-producer-list]");
  const loadMore = root.querySelector("[data-load-more]");
  let visible = PAGE_SIZE;

  // Filtrage et tri selon les critères sélectionnés
  const filtered = () => {
    const query = root.querySelector("[data-search]").value.toLowerCase();
    const locations = [
      ...root.querySelectorAll("[data-location-option]:checked"),
    ].map((input) => input.value);
    const types = [...root.querySelectorAll("[data-type-option]:checked")].map(
      (input) => input.value,
    );
    const certified = root.querySelector("[data-certified]").checked;
    const sort = root.querySelector("[data-sort]").value;

    const normalize = (value) =>
      String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    // Synonymes et mots-clés associés à chaque filière
    const activityWords = {
      Maraîcher: ["maraicher", "legume", "horticole"],
      Fruits: ["fruit", "arboricole", "verger"],
      Céréales: ["cereal", "mais", "ble", "riz", "mil", "sorgho"],
      Élevage: ["elevage", "eleveur", "bovin", "ovin", "volaille", "porc"],
      Apiculture: ["apiculture", "apiculteur", "miel", "abeille"],
      Bio: ["bio", "biologique"],
    };

    const categoryActivities = {
      legumes: "Maraîcher",
      fruits: "Fruits",
      cereales: "Céréales",
    };

    // Vérifie si le rôle ou les produits du producteur correspondent au type d'activité
    const matchesActivity = (producer, type) => {
      const words = activityWords[type] ?? [];
      const producerProducts = products
        .filter((product) => product.producerId === producer.id)
        .flatMap((product) => [
          product.name,
          categoryActivities[normalize(product.categoryId)] ??
            product.categoryId,
        ]);
      const haystack = normalize(
        [
          producer.role,
          producer.name,
          producer.contact,
          ...producerProducts,
        ].join(" "),
      );
      return words.some((word) => haystack.includes(normalize(word)));
    };

    return producers
      .filter(
        (producer) =>
          (!query ||
            `${producer.contact} ${producer.city} ${producer.zone}`
              .toLowerCase()
              .includes(query)) &&
          (!locations.length || locations.includes(producer.city)) &&
          (!types.length ||
            types.some((type) =>
              type === "Autres"
                ? !Object.keys(activityWords).some((knownType) =>
                    matchesActivity(producer, knownType),
                  )
                : matchesActivity(producer, type),
            )) &&
          (!certified || producer.verified),
      )
      .sort((a, b) =>
        sort === "name"
          ? a.contact.localeCompare(b.contact)
          : sort === "orders"
            ? b.ordersCount - a.ordersCount
            : b.rating - a.rating,
      );
  };

  // Met à jour la liste des producteurs affichés
  const refresh = (reset = false) => {
    if (reset) visible = PAGE_SIZE;
    const items = filtered();
    list.innerHTML =
      items
        .slice(0, visible)
        .map((producer, index) =>
          producerCard(producer, products, index, favorites),
        )
        .join("") ||
      '<p class="empty-state">Aucun producteur ne correspond à vos critères.</p>';
    loadMore.hidden = items.length <= visible;
  };

  // Écouteurs de recherche et de tri
  root
    .querySelectorAll("input, [data-sort]")
    .forEach((input) => input.addEventListener("input", () => refresh(true)));

  // Puces de sélection rapide d'activité
  root.querySelectorAll("[data-type-chip]").forEach((chip) =>
    chip.addEventListener("click", () => {
      chip.classList.toggle("is-active");
      const input = [...root.querySelectorAll("[data-type-option]")].find(
        (item) => item.value === chip.dataset.typeChip,
      );
      input.checked = chip.classList.contains("is-active");
      refresh(true);
    }),
  );

  // Bouton de réinitialisation des filtres
  root.querySelector("[data-reset]").addEventListener("click", () => {
    root.querySelectorAll("input").forEach((input) => {
      input.checked = false;
      input.value = "";
    });
    root
      .querySelectorAll("[data-type-chip]")
      .forEach((chip, index) =>
        chip.classList.toggle("is-active", index === 0),
      );
    refresh(true);
  });

  // Bouton « Charger plus » : ajoute les nouvelles cartes sans recharger la page
  loadMore.addEventListener("click", (event) => {
    event.preventDefault();
    const items = filtered();
    const start = visible;
    visible += PAGE_SIZE;
    const newItems = items.slice(start, visible);
    if (newItems.length) {
      const newCardsHTML = newItems
        .map((producer, index) =>
          producerCard(producer, products, start + index, favorites),
        )
        .join("");
      list.insertAdjacentHTML("beforeend", newCardsHTML);
    }
    loadMore.hidden = items.length <= visible;
  });

  // Gestion asynchrone des favoris au clic
  list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-favorite]");
    if (!button) return;
    event.preventDefault();
    button.disabled = true;

    const producerId = button.dataset.favorite;
    const producer = producers.find((p) => p.id === producerId);
    const producerName = producer?.contact || "Producteur";

    try {
      if (button.dataset.favoriteId) {
        await deleteFavorite(button.dataset.favoriteId);
        const index = favorites.findIndex(
          (item) => item.id === button.dataset.favoriteId,
        );
        if (index !== -1) favorites.splice(index, 1);
        button.dataset.favoriteId = "";
        button.classList.remove("is-favorite");
        button.setAttribute("aria-pressed", "false");
        button.setAttribute(
          "aria-label",
          `Ajouter ${producerName} aux favoris`,
        );
        toast(`${producerName} retiré des favoris`, "", "heart");
      } else {
        const fav = await createProducerFavorite(producerId);
        favorites.push(fav);
        button.dataset.favoriteId = fav.id;
        button.classList.add("is-favorite");
        button.setAttribute("aria-pressed", "true");
        button.setAttribute(
          "aria-label",
          `Retirer ${producerName} des favoris`,
        );
        toast(`${producerName} ajouté aux favoris`, "", "heart");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris :", error);
      toast(
        "Favori non enregistré",
      );
    } finally {
      button.disabled = false;
    }
  });

  const toggleFilters = (open) => {
    root.querySelector(".directory-filters").classList.toggle("is-open", open);
    root
      .querySelector(".directory-filter-backdrop")
      .classList.toggle("is-visible", open);
    root.classList.toggle("directory-filters-open", open);
  };

  root
    .querySelector("[data-filter-toggle]")
    .addEventListener("click", () => toggleFilters(true));

  root
    .querySelectorAll("[data-filter-close]")
    .forEach((button) =>
      button.addEventListener("click", () => toggleFilters(false)),
    );

  // Bascule entre la vue grille et la vue liste
  root.querySelectorAll("[data-view]").forEach((button) =>
    button.addEventListener("click", () => {
      list.classList.toggle("is-list", button.dataset.view === "list");
      root
        .querySelectorAll("[data-view]")
        .forEach((item) => item.classList.toggle("is-active", item === button));
    }),
  );

  refresh(true);
}

// Chargement initial des données depuis l'API et routage (répertoire vs profil)
async function load() {
  initToasts();
  try {
    const [producers, products, zones, favorites] = await Promise.all([
      getProducers(),
      getProducts(),
      getZones(),
      getFavorites(),
    ]);
    if (params.has("id")) {
      const producer =
        producers.find((item) => item.id === params.get("id")) || producers[0];
      const module = await import("./profile.js");
      module.renderProfile(
        root,
        producer,
        products.filter((product) => product.producerId === producer.id),
      );
    } else {
      renderDirectory(producers, products, zones, favorites);
    }
  } catch {
    root.innerHTML =
      '<p class="empty-state">Impossible de charger les producteurs pour le moment.</p>';
  }
}

// Initialisation globale de la page (en-tête, session utilisateur et panier)
const [user, cart] = await Promise.allSettled([getUser(), getCart()]);

await initPage("producteurs", {
  user: user.status === "fulfilled" ? user.value : null,
  cartCount: () =>
    cart.status === "fulfilled"
      ? cart.value.reduce((total, item) => total + item.quantity, 0)
      : 0,
  search: {
    value: "",
    onChange: (value) =>
      root.querySelector("[data-search]")?.setAttribute("value", value),
  },
});

load();
