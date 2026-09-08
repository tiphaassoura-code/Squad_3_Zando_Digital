import {
  getCategories,
  getProducers,
  createProduct,
  getUser,
  getCart,
} from "../shared/api.js";
import { initPage } from "../shared/page.js";
import { compressImage, setupImagePreview } from "../shared/image.js";

// Formulaire d'ajout de produit
const form = document.querySelector("[data-product-form]");
const params = new URLSearchParams(window.location.search);
const [user, cart] = await Promise.allSettled([getUser(), getCart()]);

await initPage("producteurs", {
  user: user.value ?? null,
  cartCount: () =>
    (cart.value ?? []).reduce((sum, item) => sum + item.quantity, 0),
});

// Initialiser l'aperçu dynamique de l'image sélectionnée
setupImagePreview({
  input: form.querySelector("[data-image-input]"),
  previewContainer: form.querySelector("[data-image-preview]"),
  previewImg: form.querySelector("[data-preview-img]"),
  previewName: form.querySelector("[data-preview-name]"),
  removeButton: form.querySelector("[data-remove-image]"),
});

// Chargement des catégories et du producteur associé
try {
  const [categories, producers] = await Promise.all([
    getCategories(),
    getProducers(),
  ]);
  const producer =
    producers.find((item) => item.id === params.get("producerId")) ??
    producers[0];
  form.dataset.producerId = producer.id;
  form.zone.value = producer.zone;
  form.city.value = producer.city;
  document.querySelector("[data-categories]").innerHTML = categories
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");
  document.querySelector("[data-cancel]").href =
    `/producteurs.html?id=${producer.id}`;
} catch {
  document.querySelector("[data-form-message]").textContent =
    "Impossible de préparer le formulaire.";
}

// Soumission du formulaire avec compression d'image et publication API
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.querySelector("[data-form-message]");
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  message.textContent = "Optimisation et publication en cours…";

  const formData = new FormData(form);
  const rawValues = Object.fromEntries(formData);
  const { image: imageFile, ...values } = rawValues;

  try {
    const [image, thumb] = await Promise.all([
      compressImage(imageFile, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.72,
        maxBytes: 28000,
      }),
      compressImage(imageFile, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.65,
        maxBytes: 10000,
      }),
    ]);

    if (!image) {
      submit.disabled = false;
      message.textContent =
        "Ajoutez une photo valide du produit avant de publier.";
      return;
    }

    const priceNum = Number(values.price);
    const stockNum = Number(values.stock);
    const currentTime = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    await createProduct({
      ...values,
      price: priceNum,
      priceYesterday: priceNum,
      stock: stockNum,
      producerId: form.dataset.producerId,
      image,
      thumb: thumb || image,
      images: [{ full: image, thumb: thumb || image }],
      dailyPrice: true,
      priceUpdatedAt: currentTime,
      variety: values.variety || "Standard",
      conservation: values.conservation || "Frais (3 à 5 jours)",
      minOrder: 1,
      harvestedAt: "aujourd'hui",
      rating: 0,
      reviews: 0,
      ordersCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    message.textContent = "Produit publié avec succès ! Redirection…";
    setTimeout(() => {
      window.location.assign(`/producteurs.html?id=${form.dataset.producerId}`);
    }, 400);
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit :", error);
    submit.disabled = false;
    message.textContent = "La publication a échoué. Veuillez ressayer.";
  }
});
