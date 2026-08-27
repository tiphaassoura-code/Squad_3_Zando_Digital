import {
  getCategories,
  getProducers,
  createProduct,
  getUser,
  getCart,
} from "../shared/api.js";
import { initPage } from "../shared/page.js";

// Le formulaire envoie une image compacte afin de rester compatible avec json-server.
const form = document.querySelector("[data-product-form]");
const params = new URLSearchParams(window.location.search);
const [user, cart] = await Promise.allSettled([getUser(), getCart()]);
await initPage("producteurs", {
  user: user.value ?? null,
  cartCount: () =>
    (cart.value ?? []).reduce((sum, item) => sum + item.quantity, 0),
});

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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.querySelector("[data-form-message]");
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  message.textContent = "Publication en cours…";
  const values = Object.fromEntries(new FormData(form));
  try {
    const image = await fileToDataUrl(values.image);
    if (!image) {
      submit.disabled = false;
      message.textContent = "Ajoutez une photo du produit avant de publier.";
      return;
    }
    await createProduct({
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      producerId: form.dataset.producerId,
      image,
      thumb: image,
      images: [{ full: image, thumb: image }],
      dailyPrice: true,
      minOrder: 1,
      harvestedAt: "aujourd'hui",
      rating: 0,
      reviews: 0,
      ordersCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    window.location.assign(`/producteurs.html?id=${form.dataset.producerId}`);
  } catch {
    submit.disabled = false;
    message.textContent = "La publication a échoué. Réessayez.";
  }
});

function fileToDataUrl(file) {
  return compressImage(file);
}

function compressImage(file) {
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
          1200 / Math.max(image.naturalWidth, image.naturalHeight),
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
