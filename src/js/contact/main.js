import { initPage } from "../shared/page.js";

initPage("contact");

const $ = (name) =>
  document.querySelector(`[data-region="${name}"]`);


/* =========================
   ICÔNES
========================= */

const icons = {
  phone: `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 5c0 9 6 15 15 15l-.5-3.5-4-1-2 2c-2-1-4-3-5-5l2-2-1-4z"/>
    </svg>
  `,

  mail: `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M3 7l9 6 9-6"/>
    </svg>
  `,

  pin: `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 21c5-5 8-8 8-12a8 8 0 10-16 0c0 4 3 7 8 12z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  `,

  clock: `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3"/>
    </svg>
  `,

  head: `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 0118 0"/>
      <rect x="3" y="12" width="4" height="7" rx="1.5"/>
      <rect x="17" y="12" width="4" height="7" rx="1.5"/>
    </svg>
  `,

  shield: `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  `,

  users: `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="8" r="3"/>
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5"/>
      <path d="M16 8h5M18.5 5.5v5"/>
    </svg>
  `,

  chevron: `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  `
};


/* =========================
   FIL D'ARIANE
========================= */

const breadcrumb = $("breadcrumb");

breadcrumb.innerHTML = `
  <nav class="cbread">
    <a href="/index.html">Accueil</a>
    <span>›</span>
    <span>Contact</span>
  </nav>
`;


/* =========================
   HERO
========================= */

const hero = $("hero");

hero.innerHTML = `
  <section class="chero">

    <div class="chero-content">

      <div class="ceyebrow">
        Contactez-nous
      </div>

      <h1>
        Nous sommes là<br>
        pour <span>vous aider.</span>
      </h1>

      <p class="clead">
        Une question, une suggestion ou besoin d'assistance ?
        L'équipe ZANDO est à votre écoute.
      </p>

      <div class="cfeat">
        <span class="cic">
          ${icons.head}
        </span>

        <div>
          <b>Réponse rapide</b>
          <p>
            Nous répondons à toutes vos demandes
            dans les plus brefs délais.
          </p>
        </div>
      </div>

      <div class="cfeat">
        <span class="cic">
          ${icons.shield}
        </span>

        <div>
          <b>Support de qualité</b>
          <p>
            Une équipe dédiée pour vous offrir
            la meilleure expérience.
          </p>
        </div>
      </div>

      <div class="cfeat">
        <span class="cic">
          ${icons.users}
        </span>

        <div>
          <b>À votre écoute</b>
          <p>
            Vos avis nous aident à améliorer
            notre service chaque jour.
          </p>
        </div>
      </div>

    </div>

    <div class="cphoto">
      <span> Photo du producteur</span>
    </div>

  </section>
`;

/*=========================
   PHOTO DU PRODUCTEUR
==========================*/

async function chargerPhoto() {
  try {
    const reponse = await fetch("http://localhost:3001/producers/p1");
    const producteur = await reponse.json();

    const photo = document.querySelector(".cphoto");
    photo.innerHTML = `<img src="${producteur.avatar}" alt="${producteur.name}">`;
  } catch (error) {
    console.log("photo du producteurnon chargée :", error);
  }
}
chargerPhoto();

/* =========================
   FORMULAIRE
========================= */

const formRegion = $("form");

formRegion.innerHTML = `
  <section class="ccard cform">

    <h2>
      Envoyez-nous un message
    </h2>

    <p class="csub">
      Remplissez le formulaire ci-dessous,
      nous vous contacterons dans les plus brefs délais.
    </p>

    <div class="cfield">
      <label for="c-nom">
        Nom complet
      </label>

      <input
        id="c-nom"
        type="text"
        placeholder="Votre nom complet"
      >
    </div>

    <div class="cfield">
      <label for="c-email">
        Email
      </label>

      <input
        id="c-email"
        type="email"
        placeholder="Votre adresse email"
      >
    </div>

    <div class="cfield">
      <label for="c-sujet">
        Sujet
      </label>

      <select id="c-sujet">
        <option value="">
          Sélectionnez un sujet
        </option>

        <option value="commande">
          Une commande
        </option>

        <option value="producteur">
          Devenir producteur
        </option>

        <option value="technique">
          Problème technique
        </option>

        <option value="autre">
          Autre demande
        </option>
      </select>
    </div>

    <div class="cfield">
      <label for="c-msg">
        Message
      </label>

      <textarea
        id="c-msg"
        placeholder="Décrivez votre demande en détail..."
      ></textarea>
    </div>

    <button
      type="button"
      class="cbtn"
      id="c-send"
    >
      Envoyer le message
    </button>

    <div
      class="calert"
      id="c-ok"
      hidden
    >
      Message envoyé !
      Nous vous répondrons sous 24h.
    </div>

  </section>
`;


/* =========================
   COORDONNÉES
========================= */

const coordinates = $("coordonnees");

coordinates.innerHTML = `
  <aside class="ccard cinfo">

    <h2>
      Nos coordonnées
    </h2>

    <div class="crow">
      <span class="cic">
        ${icons.phone}
      </span>

      <div>
        <b>Téléphone</b>
        <p>
          +242 06 123 45 67<br>
          Lun - Sam : 8h - 18h
        </p>
      </div>
    </div>

    <div class="crow">
      <span class="cic">
        ${icons.mail}
      </span>

      <div>
        <b>Email</b>
        <p>
          contact@zando.cg<br>
          Nous répondons sous 24h
        </p>
      </div>
    </div>

    <div class="crow">
      <span class="cic">
        ${icons.pin}
      </span>

      <div>
        <b>Adresse</b>
        <p>
          123 Avenue de l'Agriculture<br>
          Kintélé, Brazzaville<br>
          République du Congo
        </p>
      </div>
    </div>

    <div class="crow">
      <span class="cic">
        ${icons.clock}
      </span>

      <div>
        <b>Horaires</b>
        <p>
          Lun - Sam : 8h - 18h<br>
          Dimanche : Fermé
        </p>
      </div>
    </div>

  </aside>
`;


/* =========================
   QUESTIONS FRÉQUENTES
========================= */

const faq = [
  {
    question: "Comment passer une commande sur ZANDO ?",
    answer:
      "Parcourez le Marché, ajoutez les produits au panier, puis validez votre commande. Vous pouvez ensuite suivre son évolution dans l'onglet Commandes."
  },

  {
    question: "Quels sont les frais de livraison ?",
    answer:
      "Les frais dépendent de votre zone. Le montant correspondant à votre commande est indiqué avant sa validation."
  },

  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Nous acceptons notamment Mobile Money avec MTN et Airtel, ainsi que le paiement à la livraison et les espèces au point de collecte."
  },

  {
    question: "Comment devenir producteur partenaire ?",
    answer:
      "Cliquez sur « Devenir producteur », renseignez votre zone de production ainsi que vos produits. Votre demande sera ensuite étudiée par notre équipe."
  }
];

const faqRegion = $("faq");

faqRegion.innerHTML = `
  <section class="ccard cfaq">

    <h2>
      Questions fréquentes
    </h2>

    ${faq
      .map(
        (item, index) => `
          <div
            class="cacc"
            data-index="${index}"
          >

            <button type="button">
              <span>
                ${item.question}
              </span>

              <span class="cchev">
                ${icons.chevron}
              </span>
            </button>

            <div class="cans">
              <p>
                ${item.answer}
              </p>
            </div>

          </div>
        `
      )
      .join("")}

  </section>
`;


/* =========================
   CARTE + POINTS DE VENTE
========================= */

const points =[
  {
    nom : "Kintélé (Siège)",
    lignes: ["123 Avenue de l'Agriculture", "Kintélé, Brazzaville", "+242 06 123 45 67"],
  },
  {
    nom : "Mindouli",
    lignes: ["Marché Central de Mindouli", "Mindouli, Pool", "+242 06 987 65 43"],
  },
  {
    nom : "Madingou",
    lignes: ["Quartier Moukondo", "Madingou, Bouenza", "+242 06 678 90 12"],
  },
];

const mapRegion = $("map");

mapRegion.innerHTML = `
  <section class="ccard cmap">

    <h2>
      Nous sommes proches de vous
    </h2>

    <p class="csub">
      Retrouvez nos bureaux et points de collecte
      dans vos départements.
    </p>

    <div class="cmap-split">

      <iframe
        title="Carte de Kintélé, Brazzaville"
        src="https://www.openstreetmap.org/export/embed.html?bbox=15.25%2C-4.25%2C15.45%2C-4.05&layer=mapnik&marker=-4.13589%2C15.3492"
      ></iframe>

      <div class="cpoints">
        ${points
          .map(
            (points) => `
              <div class="cpoint"> 
                <div class="cpoint-nom">
                  <span class="cic">${icons.pin}</pan>
                  <b>${points.nom}</b>
                </div>
                <p>${points.lignes.join("<br>")}</p>
              </div>
            ` 
          )  
          .join("")
        }
        <a href="#" class="cpoint-all">Voir tous nos points de vente →</a> 
      </div>
    </div>
    

  </section>
`;


/* =========================
   FAQ : OUVRIR / FERMER
========================= */

const faqButtons = document.querySelectorAll(".cacc button");

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {

    const item = button.closest(".cacc");

    item.classList.toggle("open");

  });
});


/* =========================
   FORMULAIRE
========================= */

const sendButton = document.getElementById("c-send");

sendButton.addEventListener("click", async () => {

  const name = document.getElementById("c-nom").value.trim();
  const email = document.getElementById("c-email").value.trim();
  const message = document.getElementById("c-msg").value.trim();

  if (!name || !email || !message) {
    alert("Merci de remplir votre nom, votre email et votre message.");
    return;
  }

  try {
    await fetch("http://localhost:3001/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({
        name,
        email: email,
        message: message,
        date: new Date().toISOString(), 
      })
    })

    document.getElementById("c-ok").hidden = false;

    document.getElementById("c-nom").value = "";
    document.getElementById("c-email").value = "";
    document.getElementById("c-msg").value = "";

  } catch (error) {
    alert("Envoi impossible? Réessayez plus tard.")
    console.errour(error);
  }
  

});