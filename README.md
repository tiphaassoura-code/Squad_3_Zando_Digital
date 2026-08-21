# ZANDO — Squad 3 · Zando Digital

Marketplace agricole reliant les producteurs du Pool et de la Bouenza aux commerçantes
des marchés de Brazzaville. Projet inspiré de Twiga Foods (Kenya).

**Du champ au marché, sans intermédiaire.**

## Ce que contient ce dépôt

Le projet est **multi-pages** : chaque écran est un fichier `.html` à la racine,
tous construits sur une base commune (design system, en-tête, notifications).

| Page | Fichier | État |
|------|---------|------|
| Accueil | `index.html` | En-tête seul, corps à construire |
| Marché | `marche.html` | Livrée — catalogue, filtres, pagination |
| Produit | `produit.html?id=…` | Livrée — photos, prix du jour, producteur |
| Panier | `panier.html` | Livrée — commande groupée par producteur |
| Producteurs | `producteurs.html` | En-tête seul, corps à construire |
| Commandes | `commandes.html` | En-tête seul, corps à construire |
| À propos | `a-propos.html` | En-tête seul, corps à construire |
| Contact | `contact.html` | En-tête seul, corps à construire |

Toutes les pages du menu existent déjà : la navigation fonctionne d'un bout à
l'autre, et chacun développe la sienne dans le `<main>` laissé vide.

**Marché** : catalogue du jour, bande de catégories en filtre rapide, filtres par
zone, producteur et prix, tri, vue grille ou liste, aperçu latéral d'un produit,
mise au panier et pagination (12 produits par page).

Chaque carte porte au plus **un badge**, et seulement quand l'information décide
de l'achat — prix en baisse, stock qui s'épuise, produit très demandé. Un badge
affiché partout ne distinguerait rien. Sous le prix, la ligne d'évolution montre
le prix de la veille barré quand il a baissé : l'écart se lit sans le calculer.
La logique tient dans `src/js/shared/badges.js`, avec ses deux seuils.

L'état du catalogue est **inscrit dans l'URL** (`?categorie=legumes&zone=Pool&…`) :
un résultat filtré se partage par simple lien, et le bouton Retour du navigateur
ramène au résultat précédent.

**Produit** : galerie des photos sous plusieurs angles, prix du jour et son évolution,
disponibilité, fiche du producteur, caractéristiques et produits similaires.
La page se lit avec l'identifiant en paramètre — `produit.html?id=1`.

**Panier** : lignes regroupées par producteur, quantités modifiables, suppression,
frais de livraison et total.

## Démarrer

```bash
npm install
npm run dev
```

`npm run dev` suffit : il lance **les deux serveurs en même temps**, pas besoin
de démarrer l'API séparément.

| Service          | URL                     | Rôle                                  |
|------------------|-------------------------|---------------------------------------|
| Frontend (Vite)  | http://localhost:5173   | La page Marché                        |
| API (json-server)| http://localhost:3001   | API REST générée depuis `db.json`     |

Vite redirige `/api/*` vers le port 3001, donc le frontend appelle simplement
`/api/products`. `npm run api` et `npm run web` existent si vous préférez un
terminal par service, mais ce n'est pas nécessaire.

## L'API simulée

`db.json` est la seule source de données. json-server le transforme en API REST
complète sans écrire une ligne de code serveur :

| Méthode | Route              | Effet                                  |
|---------|--------------------|----------------------------------------|
| GET     | `/products`        | Catalogue complet                      |
| GET     | `/products/1`      | Un produit                             |
| GET     | `/categories`      | Catégories du catalogue                |
| GET     | `/producers`       | Fiches producteurs                     |
| GET     | `/zones`           | Zones de production                    |
| GET     | `/cart`            | Contenu du panier                      |
| POST    | `/cart`            | Ajouter une ligne au panier            |
| PATCH   | `/cart/:id`        | Modifier une quantité                  |
| DELETE  | `/cart/:id`        | Retirer une ligne                      |
| GET     | `/support`         | Téléphone, horaires, frais de livraison |
| POST    | `/favorites`       | Ajouter un favori                      |
| DELETE  | `/favorites/:id`   | Retirer un favori                      |

Les écritures sont persistées directement dans `db.json` : redémarrer le serveur
conserve le panier. Pour repartir des données d'origine, restaurer le fichier
avec `git checkout db.json`.

Quand l'équipe voudra un vrai backend, Node.js + Express pourra remplacer
json-server en gardant exactement les mêmes routes — le frontend n'aura pas à changer.

## Organisation du code

Ce qui est dans `shared/` sert à toutes les pages ; le reste appartient à une page.

```
db.json                     Données + API REST
index.html                  Accueil
marche.html                 Page Marché
producteurs.html            Écrans encore vides : en-tête + <main> à remplir
commandes.html
a-propos.html
contact.html
vite.config.js              Serveur de dev, proxy /api, pages détectées seules
src/
  styles/
    tokens.css              Variables du design system ZANDO
    base.css                Reset, typographie, boutons, champs
    patterns.css            Trames de fond (sillons, semis)
    header.css              En-tête commun
    bottom-nav.css          Navigation mobile fixée en bas
    toast.css               Notifications communes
    shared.css              ← feuille à lier depuis toute nouvelle page
    market/                 Styles de la page Marché
    produit/                Styles de la fiche produit
    panier/                 Styles du panier
  js/
    shared/
      api.js                Appels REST
      format.js             Prix, nombres, variation de prix
      icons.js              Icônes Lucide
      nav.js                Liste des pages du menu (libellé, lien, icône)
      badges.js             Signalement d'un produit et évolution du prix
      page.js               Amorçage commun (monte l'en-tête)
      bootstrap.js          Script des pages pas encore développées
      components/header.js  En-tête commun
      components/bottomNav.js  Navigation mobile fixée en bas
      components/toast.js   Notifications
    market/                 main, state, data, url et composants de la page Marché
    produit/                fiche produit et sa galerie
    panier/                 page panier
```

**La feuille de style se lie depuis le `<head>`**, jamais depuis le JavaScript :
sinon la page s'affiche une fraction de seconde sans style avant d'être habillée.

```html
<link rel="stylesheet" href="/src/styles/shared.css">
```

## Développer votre page

Votre écran existe déjà : il affiche l'en-tête et un `<main>` vide.

1. **Créer vos fichiers** : `src/js/producteurs/main.js` et
   `src/styles/producteurs/index.css`. La feuille commence par
   `@import "../shared.css";` — tokens, en-tête et notifications viennent avec.
2. **Brancher la page** dans son fichier HTML : ajoutez votre feuille après
   `shared.css` et remplacez le script d'amorçage par le vôtre.

   ```html
   <link rel="stylesheet" href="/src/styles/producteurs/index.css">
   ...
   <script type="module" src="/src/js/producteurs/main.js"></script>
   ```
3. **Monter l'en-tête** depuis votre `main.js` :

   ```js
   import { initPage } from '../shared/page.js'

   await initPage('producteurs')   // l'identifiant vient de shared/nav.js
   ```

   `initPage` récupère le compte et le panier, met le bon lien en surbrillance
   et installe la navigation du bas. Si votre page a besoin de plus (recherche,
   panier interactif), appelez `mountHeader` directement, comme le fait
   `src/js/market/main.js`.

Pour un écran **hors du menu** (panier, détail produit, profil producteur),
créez son `.html` à la racine : le build le détecte tout seul. Ajoutez-le à
`src/js/shared/nav.js` uniquement s'il doit apparaître dans la navigation.

## Design system

Toutes les valeurs viennent du document *ZANDO — Design System & Variables CSS*
(couleurs, typographie Inter, espacements, rayons, ombres) et sont déclarées dans
`src/styles/tokens.css`. Icônes : Lucide, style outline. Photos : Unsplash.

**Motifs** : deux trames empruntées au champ, définies dans
`src/styles/patterns.css` — les sillons d'une parcelle labourée (bandes
obliques) et l'alignement des semis (points réguliers). Le fond des pages reste
uni : les trames ne marquent que quatre surfaces choisies.

| Trame | Où |
|-------|-----|
| Semis | Bandeau d'accroche du marché, encadré « Prix du jour » de la fiche produit, écrans vides (panier vide, aucun résultat, produit introuvable) |
| Sillons | Allées entre les cartes du catalogue et de la colonne producteur, section « Produits similaires », en-tête de groupe producteur dans le panier |

Dans le catalogue comme dans la colonne producteur de la fiche, la trame est posée
sur le conteneur : les cartes étant opaques, elle n'apparaît que dans les gouttières
qui les séparent. Elle y est un cran plus marquée (`--pattern-furrow` redéfini
localement), parce qu'un espace de 16 à 24 px laisse peu de place au motif pour se
lire.

Deux variables règlent l'intensité pour tout le projet : `--pattern-furrow` et
`--pattern-seed`. Les trames sont décoratives et n'apparaissent jamais devant
une photo, un prix ou un texte.

**Navigation** : sur desktop, les liens sont dans l'en-tête. Sous 900 px, ils passent
dans une barre fixée en bas de l'écran, à la manière d'une application mobile —
l'en-tête ne garde alors que la marque, le panier et le compte. Il n'y a pas de menu
déroulant à ouvrir. Sous 340 px, la barre n'affiche plus que les icônes, les libellés
restant lus par les lecteurs d'écran.

Points respectés côté qualité : navigation au clavier avec focus visible, contrastes
conformes, cibles tactiles d'au moins 44 px (56 px pour les onglets du bas), images en
chargement différé, squelettes pendant le chargement, marge basse tenant compte des
barres système (`safe-area-inset`) et animations désactivées si le système demande
moins de mouvement.

## Équipe

| Rôle | Membre |
|------|--------|
| Lead Dev / Architecture | |
| Backend — catalogue & commandes | |
| Backend — notifications SMS | |
| Frontend — espace producteurs | |
| Frontend — espace acheteurs | |
| QA & Tests / Déploiement | |

BAYENDA Excel Arden · Miere Onka Joseph · Meuric De Ndossa Lys De Sharon ·
ISSOKO Ulrich · ASSOURA Nice Tiphaine · MASSAMBA Berenis Jorhelvi
