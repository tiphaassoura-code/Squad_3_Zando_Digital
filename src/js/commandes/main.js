
import { icon } from "../shared/icons.js"

(() => {
  "use strict";

/* ---------- CONFIG ---------- */
  // Passe à true pour brancher un vrai json-server à la place des données
  // de démo ci-dessous. Adapte API_BASE au besoin.
  const USE_API = true; // json-server est votre backend simulé : on l'utilise réellement
  const API_BASE = "http://localhost:3001"; // adapte le port si besoin
  const USER_ID = "u1";
  const PAGE_SIZE = 3;

  const STATUS_META = {
    en_attente: { label: "En attente", badge: "badge--en_attente" },
    confirmee: { label: "Confirmée", badge: "badge--confirmee" },
    en_cours: { label: "En cours", badge: "badge--en_cours" },
    en_route: { label: "En cours", badge: "badge--en_cours" }, // alias legacy
    livree: { label: "Livrée", badge: "badge--livree" },
    annulee: { label: "Annulée", badge: "badge--annulee" },
  };
  const STATUS_ALIASES = { en_route: "en_cours" };
  const normalizeStatus = (s) => STATUS_ALIASES[s] || s;

  const currency = new Intl.NumberFormat("fr-FR").format;
  const fmtMoney = (n) => `${currency(Math.round(n))} FCFA`;

  /* ---------- DONNÉES DE SECOURS ----------
     Utilisées uniquement si json-server est injoignable (USE_API=true mais
     fetch en échec), pour ne jamais afficher une page vide. */
  const FALLBACK_ORDERS = [
  {
    "id": "CMD-2024-0448",
    "status": "en_cours",
    "createdAt": "2024-05-16T09:32:00",
    "market": "Marché Total",
    "items": [
      {
        "image": "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=400&q=80",
        "name": "Tomates fraîches",
        "producerName": "Jean Moukoko",
        "price": 1500,
        "unit": "panier",
        "quantity": 10
      },
      {
        "image": "https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=400&q=80",
        "name": "Carottes",
        "producerName": "Jean Moukoko",
        "price": 1200,
        "unit": "tas",
        "quantity": 5
      },
      {
        "image": "https://images.unsplash.com/photo-1739159192920-7124e3babcaf?auto=format&fit=crop&w=400&q=80",
        "name": "Poivrons verts",
        "producerName": "Ferme de Mindouli",
        "price": 1800,
        "unit": "panier",
        "quantity": 10
      }
    ],
    "subtotal": 35000,
    "deliveryFee": 2500,
    "total": 37500,
    "timeline": [
      {
        "key": "passee",
        "label": "Commande passée",
        "state": "done"
      },
      {
        "key": "confirmee",
        "label": "Confirmée",
        "state": "done"
      },
      {
        "key": "preparation",
        "label": "En préparation",
        "state": "done"
      },
      {
        "key": "livraison",
        "label": "En livraison",
        "state": "current"
      },
      {
        "key": "livree",
        "label": "Livrée",
        "state": "pending"
      }
    ]
  },
  {
    "id": "CMD-2024-0421",
    "status": "livree",
    "createdAt": "2024-05-10T11:05:00",
    "market": "Marché Poto-Poto",
    "items": [
      {
        "image": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80",
        "name": "Oignons rouges",
        "producerName": "Coopérative Kinkala",
        "price": 1000,
        "unit": "tas",
        "quantity": 8
      },
      {
        "image": "https://images.unsplash.com/photo-1550411294-875307bccdd5?auto=format&fit=crop&w=400&q=80",
        "name": "Légumes feuilles",
        "producerName": "Ferme de Mindouli",
        "price": 800,
        "unit": "botte",
        "quantity": 12
      },
      {
        "image": "https://images.unsplash.com/photo-1784039484509-bedb3e576928?auto=format&fit=crop&w=400&q=80",
        "name": "Aubergines",
        "producerName": "Ferme de Madingou",
        "price": 1200,
        "unit": "panier",
        "quantity": 5
      }
    ],
    "subtotal": 18800,
    "deliveryFee": 2000,
    "total": 20800,
    "timeline": [
      {
        "key": "passee",
        "label": "Commande passée",
        "state": "done"
      },
      {
        "key": "confirmee",
        "label": "Confirmée",
        "state": "done"
      },
      {
        "key": "preparation",
        "label": "En préparation",
        "state": "done"
      },
      {
        "key": "livraison",
        "label": "En livraison",
        "state": "done"
      },
      {
        "key": "livree",
        "label": "Livrée",
        "state": "done"
      }
    ]
  },
  {
    "id": "CMD-2024-0389",
    "status": "confirmee",
    "createdAt": "2024-05-02T08:45:00",
    "market": "Marché Total",
    "items": [
      {
        "image": "https://images.unsplash.com/photo-1546860255-95536c19724e?auto=format&fit=crop&w=400&q=80",
        "name": "Piments frais",
        "producerName": "Jean Moukoko",
        "price": 2000,
        "unit": "tas",
        "quantity": 5
      },
      {
        "image": "https://images.unsplash.com/photo-1611105637889-3afd7295bdbf?auto=format&fit=crop&w=400&q=80",
        "name": "Choux pommés",
        "producerName": "Ferme de Mindouli",
        "price": 800,
        "unit": "pièce",
        "quantity": 10
      }
    ],
    "subtotal": 13000,
    "deliveryFee": 2000,
    "total": 15000,
    "timeline": [
      {
        "key": "passee",
        "label": "Commande passée",
        "state": "done"
      },
      {
        "key": "confirmee",
        "label": "Confirmée",
        "state": "current"
      },
      {
        "key": "preparation",
        "label": "En préparation",
        "state": "pending"
      },
      {
        "key": "livraison",
        "label": "En livraison",
        "state": "pending"
      },
      {
        "key": "livree",
        "label": "Livrée",
        "state": "pending"
      }
    ]
  }
];


  /* ---------- STATE ---------- */
  const state = {
    orders: FALLBACK_ORDERS,
    tab: "toutes",
    page: 1,
    // true tant que l'utilisateur n'a pas encore interagi : on laisse alors
    // le HTML statique (déjà écrit dans le fichier, identique à la maquette)
    // s'afficher tel quel au lieu de le remplacer par un rendu JS.
    pristine: true,
  };

  /* ---------- DOM ref ---------- */
  const $ = (sel) => document.querySelector(sel); 
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    ordersList: $("#ordersList"),
    emptyState: $("#emptyState"),
    emptyTitle: $("#emptyTitle"),
    emptyText: $("#emptyText"),
    pagination: $("#pagination"),
    tabs: $("#statusTabs"),
    orderSearch: $("#orderSearch"),
    sortSelect: $("#sortSelect"),
    modalOverlay: $("#modalOverlay"),
    modalBody: $("#modalBody"),
    modalClose: $("#modalClose"),
    toastContainer: $("#toastContainer"),
    confirmOverlay: $("#confirmOverlay"),
    confirmTitle: $("#confirmTitle"),
    confirmText: $("#confirmText"),
    confirmOk: $("#confirmOk"),
    confirmCancel: $("#confirmCancel"),
    logoutBtn: $("#logoutBtn"),
  };
// la fonction on() est un utilitaire pour attacher des événements aux éléments DOM, avec une vérification de l'existence de l'élément pour éviter les erreurs si l'élément n'est pas trouvé.
  function on(el, event, handler) {
  if (!el) {
    console.warn(`[commande.js] élément manquant pour l'événement "${event}" — ignoré.`);
    return;
  }
  el.addEventListener(event, handler);
}
  /* ---------- OPTIONNEL : fetch json-server ----------
     Désactivé par défaut (USE_API=false). Si activé et que le fetch
     échoue, on retombe silencieusement sur les données de démo : la page
     ne casse jamais, elle affiche toujours quelque chose de correct. */
  async function tryLoadFromApi() {
    if (!USE_API) return;
    try {
      const res = await fetch(`${API_BASE}/orders?userId=${USER_ID}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const orders = await res.json();
      if (Array.isArray(orders) && orders.length) {
        state.orders = orders;
        state.pristine = false;
        renderList();
      }
    } catch (err) {
      console.warn("json-server indisponible, affichage des données de démo :", err.message);
    }
  }

  /* ---------- INIT ---------- */
  function init() {
    bindStaticEvents();
    bindOrderCardEvents(); // active chevron / "voir le détail" sur les 3 cartes statiques déjà dans le HTML
    tryLoadFromApi(); // remplace les 3 commandes de secours par les vraies données json-server dès que le fetch réussit
  }

  /* ---------- FILTER / SORT / PAGINATE ---------- */
  function getFilteredOrders() {
    let list = [...state.orders];

    if (state.tab !== "toutes") { 
      list = list.filter((o) => normalizeStatus(o.status) === state.tab);
    }

    switch (state.sort) {
      case "ancien":
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "montant_desc":
        list.sort((a, b) => b.total - a.total);
        break;
      case "montant_asc":
        list.sort((a, b) => a.total - b.total);
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }

  /* ---------- RENDER: LIST ---------- */
  function renderList() {
    state.pristine = false; // dès qu'on rend en JS, on ne revient plus au HTML statique

    const filtered = getFilteredOrders();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    $$(".tab").forEach((btn) => {
      const active = btn.dataset.status === state.tab;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (filtered.length === 0) {
      els.ordersList.innerHTML = "";
      els.pagination.innerHTML = "";
      els.emptyState.hidden = false;
      const tabLabel = state.tab === "toutes" ? "commande" : (STATUS_META[state.tab]?.label.toLowerCase() || "");
      els.emptyTitle.textContent = `Aucune commande ${state.tab === "toutes" ? "" : tabLabel}`;
      els.emptyText.textContent = "Vous n'avez aucune commande dans cette catégorie pour l'instant.";
      return;
    }

    els.emptyState.hidden = true;
    els.ordersList.innerHTML = pageItems.map(orderCardTemplate).join("");
    renderPagination(totalPages);
    bindOrderCardEvents();
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const hasTime = String(iso).includes("T") || String(iso).includes(":");
    const datePart = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    if (!hasTime) return datePart;
    return datePart + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  function orderCardTemplate(order) {
    const status = normalizeStatus(order.status);
    const meta = STATUS_META[order.status] || STATUS_META[status] || { label: order.status, badge: "badge--en_attente" };
    const hasItems = Array.isArray(order.items) && order.items.length > 0;
    const hasTimeline = Array.isArray(order.timeline) && order.timeline.length > 0;
    // Comme sur la maquette : la timeline inline n'apparaît que pour la
    // commande "en cours" (le suivi détaillé des autres reste dans la modale).
    const showTimeline = status === "en_cours" && hasTimeline;
    const canCancel = status === "en_attente" || status === "confirmee";
    const canReorder = status === "livree" && hasItems;
    const hasFullTotals = typeof order.subtotal === "number";

    return `
    <article class="order-card" data-id="${order.id}">
      <div class="order-card__head">
        <div class="order-card__title">
          <h3>Commande #${order.id}</h3>
          <span class="order-card__date">${formatDate(order.createdAt)}</span>
        </div>
        <div class="order-card__head-right">
          <span class="badge ${meta.badge}">${meta.label}</span>
          <button type="button" class="chevron-btn is-open" data-toggle="${order.id}" aria-label="Afficher/masquer le détail" aria-expanded="true">
            ${icon("chevron-down", "icon--sm")}
          </button>
        </div>
      </div>

      <div class="order-card__collapsible" data-body="${order.id}">
        ${
          hasItems
            ? `<div class="order-card__body">
                <div class="items-grid">${order.items.map(itemTemplate).join("")}</div>
                <div class="order-card__totals">
                  ${
                    hasFullTotals
                      ? `<div class="totals-row"><span>Sous-total</span><span>${fmtMoney(order.subtotal)}</span></div>
                         <div class="totals-row"><span>Livraison</span><span>${order.deliveryFee ? fmtMoney(order.deliveryFee) : "Offerte"}</span></div>`
                      : ""
                  }
                  <div class="totals-row total"><span>Total</span><b>${fmtMoney(order.total)}</b></div>
                  <button type="button" class="order-card__link" data-detail="${order.id}">
                    Voir le détail ${icon("eye", "icon--sm")}
                  </button>
                </div>
              </div>`
            : `<div class="order-card__body order-card__body--simple">
                <p class="order-card__meta-line">${order.itemCount ? `${order.itemCount} article${order.itemCount > 1 ? "s" : ""} · ` : ""}Détail des produits non disponible.</p>
                <div class="order-card__totals">
                  <div class="totals-row total"><span>Total</span><b>${fmtMoney(order.total)}</b></div>
                  <button type="button" class="order-card__link" data-detail="${order.id}">
                    Voir le détail ${icon("eye", "icon--sm")}
                  </button>
                </div>
              </div>`
        }

        ${status === "annulee" ? `<p class="order-card__cancel-note">Annulée${order.cancelReason ? " — " + escapeHTML(order.cancelReason) : ""}</p>` : ""}
        ${showTimeline ? timelineTemplate(order.timeline) : ""}

        ${
          canCancel || canReorder
            ? `<div class="order-card__actions">
                ${canCancel ? `<button type="button" class="btn btn--ghost btn--sm" data-cancel="${order.id}">Annuler la commande</button>` : ""}
                ${canReorder ? `<button type="button" class="btn btn--outline btn--sm" data-reorder="${order.id}">Recommander</button>` : ""}
              </div>`
            : ""
        }
      </div>
    </article>`;
  }

  function itemTemplate(item) {
    return `
    <div class="item">
      <img src="${item.image}" alt="${escapeHTML(item.name)}" loading="lazy">
      <div class="item__info">
        <strong>${escapeHTML(item.name)}</strong>
        <span class="item__producer">${escapeHTML(item.producerName)}</span>
        <span class="item__price">${currency(item.price)} FCFA <span>/ ${item.unit}</span></span>
        <span class="item__qty">Quantité : ${item.quantity} ${item.unit}${item.quantity > 1 ? "s" : ""}</span>
      </div>
    </div>`;
  }

  function timelineTemplate(timeline) {
    return `
    <div class="timeline">
      ${timeline
        .map((step) => {
          let dot;
          if (step.state === "done") dot = icon("check", "icon--sm");
          else if (step.state === "cancelled") dot = icon("x", "icon--sm");
          else if (step.key === "livraison" || (step.state === "current")) dot = icon("truck", "icon--sm");
          else if (step.key === "livree") dot = icon("badge-check", "icon--sm");
          else dot = `<span class="timeline__bullet"></span>`;
          return `
        <div class="timeline__step ${step.state}">
          <span class="timeline__dot">${dot}</span>
          <span class="timeline__label">${step.label}</span>
          <span class="timeline__date">${step.date || ""}</span>
        </div>`;
        })
        .join("")}
    </div>`;
  }

  /* ---------- PAGINATION ---------- */
  function renderPagination(totalPages) {
    const p = state.page;
    if (totalPages <= 1) {
      els.pagination.innerHTML = "";
      return;
    }
    let html = `<button ${p === 1 ? "disabled" : ""} data-page="${p - 1}" aria-label="Page précédente">${icon("chevron-left", "icon--sm")}</button>`;
    paginationRange(p, totalPages).forEach((item) => {
      html += item === "…"
        ? `<span class="pagination__ellipsis">…</span>`
        : `<button class="${item === p ? "is-active" : ""}" data-page="${item}" aria-current="${item === p ? "page" : "false"}">${item}</button>`;
    });
    html += `<button ${p === totalPages ? "disabled" : ""} data-page="${p + 1}" aria-label="Page suivante">${icon("chevron-right", "icon--sm")}</button>`;

    els.pagination.innerHTML = html;
    $$("[data-page]", els.pagination).forEach((btn) =>
      btn.addEventListener("click", () => {
        const page = Number(btn.dataset.page);
        if (page >= 1 && page <= totalPages) {
          state.page = page;
          renderList();
          els.ordersList.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      })
    );
  }

  function paginationRange(current, total) {
    const range = [];
    const delta = 1;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i);
      else if (range[range.length - 1] !== "…") range.push("…");
    }
    return range;
  }

  /* ---------- CARD EVENTS ---------- */
  function bindOrderCardEvents() {
    $$("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggle;
        const body = document.querySelector(`[data-body="${id}"]`);
        const collapsed = body.style.display === "none";
        body.style.display = collapsed ? "" : "none";
        btn.classList.toggle("is-open", !collapsed);
        btn.setAttribute("aria-expanded", collapsed ? "true" : "false");
      });
    });

    $$("[data-detail]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const order = state.orders.find((o) => o.id === btn.dataset.detail);
        if (order) openModal(order);
      });
    });

    $$("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.cancel;
        openConfirm(`Annuler la commande #${id} ?`, "Cette action est définitive. Le producteur sera informé de l'annulation.", () => cancelOrder(id));
      });
    });

    $$("[data-reorder]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const order = state.orders.find((o) => o.id === btn.dataset.reorder);
        if (order) reorder(order);
      });
    });
  }

  /* ---------- ACTIONS: CANCEL / REORDER ----------
     Simulées en local par défaut (aucun backend requis). Si USE_API=true,
     on tente aussi de persister côté json-server, sans bloquer l'UI si ça échoue. */
  async function cancelOrder(id) {
    const order = state.orders.find((o) => o.id === id);
    if (!order) return;
    const hasFullTotals = typeof order.subtotal === "number";
    Object.assign(order, hasFullTotals
      ? { status: "annulee", cancelReason: "Annulée par l'acheteuse", deliveryFee: 0, total: order.subtotal }
      : { status: "annulee", cancelReason: "Annulée par l'acheteuse" });

    if (USE_API) {
      try {
        await fetch(`${API_BASE}/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: order.status, cancelReason: order.cancelReason, deliveryFee: order.deliveryFee, total: order.total }),
        });
      } catch (err) {
        console.warn("Annulation non persistée côté API :", err.message);
      }
    }

    renderList();
    showToast("Commande annulée avec succès.", "success");
  }

  async function reorder(order) {
    if (USE_API) {
      try {
        for (const i of order.items) {
          await fetch(`${API_BASE}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(i),
          });
        }
      } catch (err) {
        console.warn("Ajout au panier non persisté côté API :", err.message);
      }
    }
    showToast(`${order.items.length} produit(s) ajouté(s) au panier.`, "success");
  }

  /* ---------- MODAL ---------- */
  function openModal(order) {
    const status = normalizeStatus(order.status);
    const meta = STATUS_META[order.status] || STATUS_META[status] || { label: order.status, badge: "badge--en_attente" };
    const hasItems = Array.isArray(order.items) && order.items.length > 0;
    const hasTimeline = Array.isArray(order.timeline) && order.timeline.length > 0;
    const hasFullTotals = typeof order.subtotal === "number";

    els.modalBody.innerHTML = `
      <h2 id="modalTitle">Commande #${order.id}</h2>
      <p style="color:var(--ink-500);font-size:.85rem;margin:.3rem 0 1.2rem">${formatDate(order.createdAt)} · <span class="badge ${meta.badge}">${meta.label}</span></p>

      ${
        hasItems
          ? `<div class="items-grid" style="margin-bottom:1.2rem">${order.items.map(itemTemplate).join("")}</div>`
          : `<p style="font-size:.85rem;color:var(--ink-500);margin-bottom:1.2rem">Le détail des produits n'a pas été enregistré pour cette commande.</p>`
      }

      ${status === "annulee" ? `<p class="order-card__cancel-note">Annulée${order.cancelReason ? " — " + escapeHTML(order.cancelReason) : ""}</p>` : hasTimeline ? timelineTemplate(order.timeline) : ""}

      <div style="margin-top:1.4rem;padding-top:1.2rem;border-top:1px solid var(--border);font-size:.86rem;color:var(--ink-700);display:grid;gap:.5rem">
        <div><strong>Marché :</strong> ${escapeHTML(order.market || "—")}</div>
      </div>

      <div class="order-card__totals" style="border:none;padding:1.2rem 0 0">
        ${
          hasFullTotals
            ? `<div class="totals-row"><span>Sous-total</span><span>${fmtMoney(order.subtotal)}</span></div>
               <div class="totals-row"><span>Livraison</span><span>${order.deliveryFee ? fmtMoney(order.deliveryFee) : "Offerte"}</span></div>`
            : ""
        }
        <div class="totals-row total"><span>Total</span><b>${fmtMoney(order.total)}</b></div>
      </div>
    `;
    els.modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    els.modalClose.focus();
  }

  function closeModal() {
    els.modalOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  /* ---------- CONFIRM DIALOG ---------- */
  let confirmCallback = null;
  function openConfirm(title, text, onConfirm) {
    els.confirmTitle.textContent = title;
    els.confirmText.textContent = text;
    confirmCallback = onConfirm;
    els.confirmOverlay.hidden = false;
    els.confirmOk.focus();
  }
  function closeConfirm() {
    els.confirmOverlay.hidden = true;
    confirmCallback = null;
  }

  /* ---------- TOASTS ---------- */
  function showToast(message, type = "default") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "success" ? "toast--success" : type === "error" ? "toast--error" : ""}`;
    toast.textContent = message;
    els.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  /* ---------- UTIL ---------- */
 
  function escapeHTML(str = "") {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }


  /* ---------- STATIC EVENTS ---------- */
  function bindStaticEvents() {
    on(els.tabs,"click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;
      state.tab = btn.dataset.status;
      state.page = 1;
      renderList();
    });


    // La pagination statique du HTML (maquette) est déjà dans le DOM ;
    // si l'utilisateur clique dessus avant toute autre interaction, on
    // bascule sur le rendu JS pour qu'elle devienne vraiment fonctionnelle.
    on(els.pagination,"click", (e) => {
      if (!state.pristine) return; // déjà géré par renderPagination() sinon
      const btn = e.target.closest("[data-page]");
      if (!btn) return;
      const raw = btn.dataset.page;
      state.page = raw === "prev" ? 1 : raw === "next" ? 2 : Number(raw) || 1;
      renderList();
    });

    on(els.modalOverlay,"click", (e) => { if (e.target === els.modalOverlay) closeModal(); });
    on(els.modalClose,"click", closeModal);

    on(els.confirmOverlay,"click", (e) => { if (e.target === els.confirmOverlay) closeConfirm(); });
    on(els.confirmCancel,"click", closeConfirm);
    on(els.confirmOk,"click", () => { if (confirmCallback) confirmCallback(); closeConfirm(); });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!els.modalOverlay.hidden) closeModal();
        if (!els.confirmOverlay.hidden) closeConfirm();
      }
    });

    on(els.logoutBtn,"click", () => {
      showToast("Déconnexion simulée (à relier à votre auth).", "default");
    });
  }

  /* ---------- START ---------- */
  document.addEventListener("DOMContentLoaded", init);
})();
