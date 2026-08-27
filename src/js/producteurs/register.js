import { createProducer, getCart, getUser } from "../shared/api.js";
import { initPage } from "../shared/page.js";

// La photo est convertie en JPEG compact avant son enregistrement dans l'API.
const form = document.querySelector("[data-producer-form]");
const [user, cart] = await Promise.allSettled([getUser(), getCart()]);

await initPage("producteurs", {
  user: user.value ?? null,
  cartCount: () =>
    (cart.value ?? []).reduce((sum, item) => sum + item.quantity, 0),
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.querySelector("[data-form-message]");
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  message.textContent = "Inscription en cours…";

  const values = Object.fromEntries(new FormData(form));
  try {
    const avatar = await fileToDataUrl(values.avatar);
    if (!avatar) {
      submit.disabled = false;
      message.textContent =
        "Ajoutez une photo de profil avant de vous inscrire.";
      return;
    }
    await createProducer({
      ...values,
      avatar,
      verified: false,
      rating: 0,
      reviews: 0,
      ordersCount: 0,
    });
    window.location.assign("/producteurs.html");
  } catch {
    submit.disabled = false;
    message.textContent = "L’inscription a échoué. Réessayez.";
  }
});

function fileToDataUrl(file) {
  if (
    !(file instanceof File) ||
    !file.size ||
    !file.type.startsWith("image/")
  ) {
    return Promise.resolve("");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        const scale = Math.min(
          1,
          800 / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas
          .getContext("2d")
          .drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });
      image.addEventListener("error", () =>
        reject(new Error("Image illisible")),
      );
      image.src = reader.result;
    });
    reader.addEventListener("error", () =>
      reject(new Error("Lecture impossible")),
    );
    reader.readAsDataURL(file);
  });
}
