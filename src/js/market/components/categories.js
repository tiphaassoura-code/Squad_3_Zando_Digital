import { icon } from "../../shared/icons.js";
import { state, emit, filterProducts, resetPage } from "../state.js";
import { formatNumber } from "../../shared/format.js";

let root;

export function renderCategories(container) {
  root = container ?? root;
  if (state.status !== "ready") return;

  const pool = filterProducts("category");
  const countFor = (id) =>
    pool.filter((product) => product.categoryId === id).length;

  const entries = [
    {
      id: "all",
      name: "Tous les produits",
      icon: "layout-grid",
      count: pool.length,
    },
    ...state.categories.map((category) => ({
      ...category,
      count: countFor(category.id),
    })),
  ];

  root.innerHTML = `
    <nav class="categories" aria-label="Catégories">
      <ul class="categories-list">
        ${entries
          .map(
            (entry) => `
          <li>
            <button class="category-chip" type="button" data-category="${entry.id}"
                    ${state.filters.category === entry.id ? 'aria-current="true"' : ""}
                    ${entry.count === 0 && entry.id !== "all" ? "disabled" : ""}>
              ${icon(entry.icon)}
              <span class="category-chip-name">${entry.name}</span>
              <span class="category-chip-count">${formatNumber(entry.count)}</span>
            </button>
          </li>
        `,
          )
          .join("")}
      </ul>
    </nav>
  `;

  root.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.category = button.dataset.category;
      resetPage();
      emit("grid", "filters", "toolbar", "categories", "pagination", "url");
    });
  });
}
