import { icon } from "../shared/icons.js";
import { formatNumber, formatPrice, formatRating } from "../shared/format.js";

// Liste des zones de production couvertes par le producteur
const productionZones = (producer) => [
  ...new Set([
    `${producer.city}, ${producer.zone}`,
    producer.zone === "Pool" ? "Mindouli, Pool" : "Madingou, Bouenza",
    producer.zone === "Pool" ? "Madingou, Bouenza" : "Mouyondzi, Bouenza",
  ]),
];

// Caractéristiques et détails de l'exploitation
const informationRows = (producer) => [
  ["package", "Type d'exploitation", "Exploitation familiale"],
  [
    "sprout",
    "Surface cultivée",
    `${producer.zone === "Pool" ? "3" : "4"} hectares`,
  ],
  ["leaf", "Méthodes", "Agriculture raisonnée"],
  ["badge-check", "Certification", "Aucune pour le moment"],
];

// Rendu de la fiche profil complète d'un producteur
export function renderProfile(root, producer, products) {
  const stat = (name, value, label) => `
    <div class="producer-stat">
      ${icon(name)}
      <strong>${value}</strong>
      <span>${label}</span>
    </div>
  `;

  const zones = productionZones(producer);

  const cards = products
    .map(
      (product, index) => `
      <article class="producer-product ${index > 4 ? "is-extra-product" : ""}">
        <a class="producer-product-media" href="/produit.html?id=${product.id}">
          <img src="${product.thumb || product.image}" alt="${product.name}" loading="lazy">
          <span class="badge badge-daily">
            ${icon("sprout", "icon-sm")} Prix du jour
          </span>
        </a>
        <div class="producer-product-body">
          <h3>
            <a href="/produit.html?id=${product.id}">${product.name}</a>
          </h3>
          <p class="product-origin">
            ${icon("map-pin", "icon-sm")} ${product.city} · ${product.zone}
          </p>
          <p class="producer-product-price">
            ${formatPrice(product.price)} <span>/ ${product.unit}</span>
          </p>
          <p class="producer-product-stock">
            Disponible : ${formatNumber(product.stock)} ${product.stockUnit}
          </p>
          <a class="btn btn-secondary btn-block" href="/produit.html?id=${product.id}">
            Voir le produit ${icon("arrow-right", "icon-sm")}
          </a>
        </div>
      </article>
    `,
    )
    .join("");

  const details = informationRows(producer)
    .map(
      ([name, title, value]) => `
      <div>
        <dt>${icon(name)} ${title}</dt>
        <dd>${value}</dd>
      </div>
    `,
    )
    .join("");

  root.innerHTML = `
    <nav class="producer-breadcrumb" aria-label="Fil d'Ariane">
      <a href="/index.html">Accueil</a>
      ${icon("chevron-right", "icon-sm")}
      <a href="/producteurs.html">Producteurs</a>
      ${icon("chevron-right", "icon-sm")}
      <span>${producer.contact}</span>
    </nav>

    <section class="producer-hero" aria-labelledby="producer-name">
      <div class="producer-hero-portrait">
        <img
          class="producer-portrait"
          src="${producer.avatar}"
          alt="Portrait de ${producer.contact}"
          width="112"
          height="112">
        <a class="btn btn-primary producer-contact" href="/contact.html">
          ${icon("phone", "icon-sm")} Contacter
        </a>
      </div>
      <div class="producer-hero-content">
        <h1 id="producer-name">
          ${producer.contact} ${producer.verified ? icon("badge-check", "verified") : ""}
        </h1>
        <p class="producer-role">${producer.role}</p>
        <p class="producer-location">
          ${icon("map-pin", "icon-sm")} ${producer.city}, ${producer.zone}
        </p>
        <div class="producer-rating">
          <span>${icon("star", "star-fill")} ${formatRating(producer.rating)}</span>
          <span>(${producer.reviews} avis)</span>
          <span class="rating-separator"></span>
          <span>${formatNumber(producer.ordersCount)} commandes</span>
        </div>
        <p class="producer-bio">${producer.bio}</p>
        <ul class="producer-highlights">
          <li>${icon("sprout")} Produits frais du jour</li>
          <li>${icon("package")} Récoltés ce matin</li>
          <li>${icon("handshake")} Sans intermédiaire</li>
        </ul>
      </div>
    </section>

    <div class="producer-layout">
      <section class="producer-main" aria-labelledby="products-title">
        <div class="section-heading">
          <div>
            <h2 id="products-title">Ses produits <small>(${products.length})</small></h2>
          </div>
          <a class="btn btn-secondary" href="/ajouter-produit.html?producerId=${producer.id}">
            ${icon("plus", "icon-sm")} Ajouter un produit
          </a>
        </div>
        <div class="producer-products">
          ${cards || '<p class="empty-state">Aucun produit publié pour le moment.</p>'}
        </div>
        ${
          products.length > 5
            ? `<button class="view-all-products" type="button" data-view-all>
                Voir tous ses produits ${icon("arrow-right", "icon-sm")}
              </button>`
            : ""
        }
      </section>

      <aside class="producer-sidebar">
        <section class="info-card stats-card">
          <h2>En chiffres</h2>
          <div class="stats-grid">
            ${stat("package", formatNumber(producer.ordersCount), "commandes")}
            ${stat("star", formatRating(producer.rating), "note")}
            ${stat("sprout", products.length, "produits")}
            ${stat("clipboard-list", producer.since, "depuis")}
          </div>
        </section>

        <section class="info-card">
          <h2>Zones de production</h2>
          <ul class="production-zones">
            ${zones
              .map(
                (zone, index) => `
                <li>
                  ${icon("map-pin", "icon-sm")}
                  <span>${zone}</span>
                  ${index === 0 ? "<em>Principale</em>" : ""}
                </li>
              `,
              )
              .join("")}
          </ul>
        </section>

        <section class="info-card">
          <h2>Informations</h2>
          <dl class="detail-list">${details}</dl>
        </section>
      </aside>
    </div>
  `;

  root.querySelector("[data-view-all]")?.addEventListener("click", (event) => {
    root
      .querySelectorAll(".is-extra-product")
      .forEach((card) => card.classList.add("is-visible"));
    event.currentTarget.remove();
  });
}
