import { createProducer, getCart, getUser } from "../shared/api.js";
import { initPage } from "../shared/page.js";
import { compressImage, setupImagePreview } from "../shared/image.js";

// Formulaire d'inscription d'un nouveau producteur
const form = document.querySelector("[data-producer-form]");
const [user, cart] = await Promise.allSettled([getUser(), getCart()]);

await initPage("producteurs", {
  user: user.value ?? null,
  cartCount: () =>
    (cart.value ?? []).reduce((sum, item) => sum + item.quantity, 0),
});

// Initialiser l'aperçu dynamique de la photo de profil
setupImagePreview({
  input: form.querySelector("[data-image-input]"),
  previewContainer: form.querySelector("[data-image-preview]"),
  previewImg: form.querySelector("[data-preview-img]"),
  previewName: form.querySelector("[data-preview-name]"),
  removeButton: form.querySelector("[data-remove-image]"),
});

// Traitement de l'inscription et création via l'API
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.querySelector("[data-form-message]");
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  message.textContent = "Optimisation et inscription en cours…";

  const formData = new FormData(form);
  const rawValues = Object.fromEntries(formData);
  const { avatar: avatarFile, ...values } = rawValues;

  try {
    const avatar = await compressImage(avatarFile, {
      maxWidth: 256,
      maxHeight: 256,
      quality: 0.75,
      maxBytes: 22000,
    });

    if (!avatar) {
      submit.disabled = false;
      message.textContent =
        "Ajoutez une photo de profil valide avant de vous inscrire.";
      return;
    }

    await createProducer({
      ...values,
      avatar,
      verified: false,
      rating: 0,
      reviews: 0,
      ordersCount: 0,
      since: String(new Date().getFullYear()),
    });

    message.textContent = "Inscription réussie ! Redirection…";
    setTimeout(() => {
      window.location.assign("/producteurs.html");
    }, 400);
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    submit.disabled = false;
    message.textContent = "L’inscription a échoué. Veuillez réessayer";
  }
});
