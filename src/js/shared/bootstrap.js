/**
 * Point d'entrée des pages qui n'ont pas encore leur propre script.
 * L'écran à mettre en avant dans la navigation est lu sur `<body data-page="…">`.
 *
 * Quand vous développez votre page, remplacez ce script par le vôtre
 * (`src/js/<votre-page>/main.js`) et appelez `initPage` depuis celui-ci.
 */

import { initPage } from './page.js'

initPage(document.body.dataset.page)
