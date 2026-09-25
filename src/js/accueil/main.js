document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const menuButton = document.getElementById("menu-button");
    const mainNav = document.getElementById("main-nav");

    const searchInput = document.getElementById("search-input");
    const productsGrid = document.getElementById("products-grid");

    const categoryLinks = document.querySelectorAll("[data-category]");
    const productCards = document.querySelectorAll(".product-card");

    const cartCounter = document.getElementById("product");

    const CART_KEY = "zandoCart";
    const FAVORITES_KEY = "zandoFavorites";

    let currentCategory = "all";
    let currentSearch = "";

    // Gestion du menu mobile

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("change", () => {
            mainNav.classList.toggle("menu-open", menuToggle.checked);
        });
    }

    if (menuButton && menuToggle) {
        menuButton.addEventListener("click", () => {
            menuToggle.checked = !menuToggle.checked;
            mainNav.classList.toggle("menu-open", menuToggle.checked);
        });
    }

    document.querySelectorAll(".main-nav a").forEach((link) => {
        link.addEventListener("click", () => {
            if (menuToggle) {
                menuToggle.checked = false;
            }

            if (mainNav) {
                mainNav.classList.remove("menu-open");
            }
        });
    });

    // Lecture du panier

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // Mise à jour du compteur panier

    function updateCartCounter() {
        const cart = getCart();

        const totalQuantity = cart.reduce((total, item) => {
            return total + Number(item.quantity || 0);
        }, 0);

        if (cartCounter) {
            cartCounter.textContent = totalQuantity;
        }
    }

    // Gestion de la recherche et des catégories

    function filterProducts() {
        const search = currentSearch.toLowerCase().trim();

        productCards.forEach((card) => {
            const name = (card.dataset.name || "").toLowerCase();
            const category = (card.dataset.category || "").toLowerCase();
            const content = card.textContent.toLowerCase();

            const matchesCategory =
                currentCategory === "all" ||
                category === currentCategory.toLowerCase();

            const matchesSearch =
                !search ||
                name.includes(search) ||
                category.includes(search) ||
                content.includes(search);

            card.style.display =
                matchesCategory && matchesSearch ? "" : "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            currentSearch = event.target.value;
            filterProducts();
        });
    }

    categoryLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            const category = link.dataset.category;

            if (!category) {
                return;
            }

            currentCategory = category;

            categoryLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            filterProducts();

            const marketSection = document.getElementById("marche");

            if (marketSection && window.innerWidth < 768) {
                marketSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // Gestion des quantités

    document.querySelectorAll(".quantity-plus").forEach((button) => {
        button.addEventListener("click", () => {
            const productId = button.dataset.productId;
            const quantityElement = document.getElementById(
                `quantity-value-${productId}`
            );

            if (!quantityElement) {
                return;
            }

            let quantity = Number(quantityElement.textContent) || 1;

            quantity += 1;

            quantityElement.textContent = quantity;
        });
    });

    document.querySelectorAll(".quantity-minus").forEach((button) => {
        button.addEventListener("click", () => {
            const productId = button.dataset.productId;
            const quantityElement = document.getElementById(
                `quantity-value-${productId}`
            );

            if (!quantityElement) {
                return;
            }

            let quantity = Number(quantityElement.textContent) || 1;

            if (quantity > 1) {
                quantity -= 1;
            }

            quantityElement.textContent = quantity;
        });
    });

    // Ajout au panier

    document.querySelectorAll(".add-cart").forEach((button) => {
        button.addEventListener("click", () => {
            const productId = button.dataset.productId;
            const card = document.querySelector(
                `[data-product-id="${productId}"]`
            );

            if (!card) {
                return;
            }

            const quantityElement = document.getElementById(
                `quantity-value-${productId}`
            );

            const quantity = Number(quantityElement?.textContent) || 1;

            const name = card.dataset.name || "";
            const price = Number(card.dataset.price) || 0;

            const imageElement = document.getElementById(
                `product-image-${productId}`
            );

            const image = imageElement ? imageElement.src : "";

            const cart = getCart();

            const existingProduct = cart.find(
                (item) => String(item.id) === String(productId)
            );

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.push({
                    id: productId,
                    name: name,
                    price: price,
                    quantity: quantity,
                    image: image
                });
            }

            saveCart(cart);
            updateCartCounter();

            const originalText = button.innerHTML;

            button.innerHTML = `
                <i class="fi fi-rr-check"></i>
                Ajouté
            `;

            button.classList.add("added");

            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove("added");
            }, 1200);
        });
    });

    // Gestion des favoris

    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveFavorites(favorites) {
        localStorage.setItem(
            FAVORITES_KEY,
            JSON.stringify(favorites)
        );
    }

    function updateFavoriteButton(button, isFavorite) {
        button.classList.toggle("active", isFavorite);

        const icon = button.querySelector("i");

        if (!icon) {
            return;
        }

        icon.classList.toggle("fi-rr-heart", !isFavorite);
        icon.classList.toggle("fi-sr-heart", isFavorite);
    }

    document.querySelectorAll(".favorite").forEach((button) => {
        const productId = button.dataset.productId;

        const favorites = getFavorites();

        updateFavoriteButton(
            button,
            favorites.includes(String(productId))
        );

        button.addEventListener("click", () => {
            const currentFavorites = getFavorites();
            const id = String(button.dataset.productId);

            const index = currentFavorites.indexOf(id);

            if (index === -1) {
                currentFavorites.push(id);
                updateFavoriteButton(button, true);
            } else {
                currentFavorites.splice(index, 1);
                updateFavoriteButton(button, false);
            }

            saveFavorites(currentFavorites);
        });
    });

    // Afficher tous les produits

    const viewAllProducts = document.getElementById(
        "view-all-products"
    );

    if (viewAllProducts) {
        viewAllProducts.addEventListener("click", (event) => {
            event.preventDefault();

            currentCategory = "all";
            currentSearch = "";

            if (searchInput) {
                searchInput.value = "";
            }

            categoryLinks.forEach((link) => {
                link.classList.remove("active");
            });

            const allCategory = document.getElementById("category-all");

            if (allCategory) {
                allCategory.classList.add("active");
            }

            productCards.forEach((card) => {
                card.style.display = "";
            });
        });
    }

    // Navigation active

    const navLinks = document.querySelectorAll(".main-nav a");

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });

    // Éviter le saut vers le haut avec certains liens

    document.querySelectorAll('a[href="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
        });
    });

    // Initialisation

    updateCartCounter();
    filterProducts();
});