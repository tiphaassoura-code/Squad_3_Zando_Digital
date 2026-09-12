/**
 * Utilitaires pour le traitement des images côté client :
 * - Compression adaptative en JPEG pour respecter la limite de charge (100 Ko) de l'API json-server.
 * - Gestion de l'aperçu dynamique dans les formulaires.
 */

/**
 * Compresse une image vers un Data URL (base64) JPEG compact.
 * Ajuste automatiquement les dimensions et la qualité pour garantir
 * que la taille finale reste sous `maxBytes` (par exemple 30 Ko).
 *
 * @param {File} file - Fichier sélectionné par l'utilisateur
 * @param {object} options
 * @param {number} [options.maxWidth=600] - Largeur max cible
 * @param {number} [options.maxHeight=600] - Hauteur max cible
 * @param {number} [options.quality=0.75] - Qualité JPEG initiale (0.1 à 1.0)
 * @param {number} [options.maxBytes=35000] - Taille brute max visée (~35 Ko pour laisser de la marge au json-server)
 * @returns {Promise<string>} Data URL base64 ou chaîne vide
 */
export function compressImage(
  file,
  { maxWidth = 600, maxHeight = 600, quality = 0.75, maxBytes = 35000 } = {},
) {
  if (
    !(file instanceof File) ||
    !file.size ||
    !file.type.startsWith("image/")
  ) {
    return Promise.resolve("");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        let q = quality;
        let scale = Math.min(
          1,
          maxWidth / img.naturalWidth,
          maxHeight / img.naturalHeight,
        );
        let width = Math.max(1, Math.round(img.naturalWidth * scale));
        let height = Math.max(1, Math.round(img.naturalHeight * scale));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let dataUrl = "";
        let attempts = 0;
        // La longueur de la chaîne base64 vaut environ 1.37 * taille binaire
        const maxStringLength = Math.round(maxBytes * 1.37);

        while (attempts < 6) {
          canvas.width = width;
          canvas.height = height;

          // Fond blanc pour les images transparentes (PNG/WebP) lors de la conversion en JPEG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          dataUrl = canvas.toDataURL("image/jpeg", q);

          if (dataUrl.length <= maxStringLength) {
            break;
          }

          // Réduction progressive si l'image dépasse la taille maximale autorisée
          q = Math.max(0.45, q - 0.1);
          width = Math.max(1, Math.round(width * 0.82));
          height = Math.max(1, Math.round(height * 0.82));
          attempts++;
        }

        resolve(dataUrl);
      };

      img.onerror = () =>
        reject(
          new Error("Format d'image non lisible. Utilisez JPG, PNG ou WebP."),
        );
      img.src = reader.result;
    };

    reader.onerror = () =>
      reject(new Error("Impossible de charger le fichier image sélectionné."));
    reader.readAsDataURL(file);
  });
}

/**
 * Configure l'affichage de l'aperçu instantané de l'image sélectionnée dans un formulaire.
 *
 * @param {object} elements
 * @param {HTMLInputElement} elements.input - Input type="file"
 * @param {HTMLElement} elements.previewContainer - Conteneur de l'aperçu
 * @param {HTMLImageElement} elements.previewImg - Balise <img> pour l'aperçu
 * @param {HTMLElement} [elements.previewName] - Balise texte pour le nom du fichier
 * @param {HTMLButtonElement} [elements.removeButton] - Bouton pour changer/supprimer l'image
 */
export function setupImagePreview({
  input,
  previewContainer,
  previewImg,
  previewName,
  removeButton,
}) {
  if (!input || !previewContainer || !previewImg) return;

  const showPreview = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    if (previewName) {
      previewName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} Ko)`;
    }
    previewContainer.hidden = false;
    input.classList.add("has-file");
  };

  const clearPreview = () => {
    input.value = "";
    previewImg.src = "";
    if (previewName) previewName.textContent = "";
    previewContainer.hidden = true;
    input.classList.remove("has-file");
  };

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) {
      showPreview(file);
    } else {
      clearPreview();
    }
  });

  if (removeButton) {
    removeButton.addEventListener("click", () => {
      clearPreview();
      input.click();
    });
  }
}
