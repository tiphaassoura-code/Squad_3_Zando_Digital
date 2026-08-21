/** Notifications brèves après une action sur le panier. */

import { icon } from '../icons.js'

const DURATION = 3200
let stack

export function initToasts() {
  stack = document.createElement('div')
  stack.className = 'toasts'
  stack.setAttribute('role', 'status')
  stack.setAttribute('aria-live', 'polite')
  document.body.append(stack)
}

/**
 * @param {string} title  ce qui vient de se passer
 * @param {string} [detail]  précision utile (quantité, total…)
 * @param {string} [iconName]
 */
export function toast(title, detail = '', iconName = 'check') {
  const node = document.createElement('div')
  node.className = 'toast'
  node.innerHTML = `
    ${icon(iconName)}
    <p class="toast-text"><strong>${title}</strong>${detail ? `<span>${detail}</span>` : ''}</p>
  `

  stack.append(node)

  setTimeout(() => {
    node.classList.add('is-leaving')
    node.addEventListener('animationend', () => node.remove(), { once: true })
  }, DURATION)
}
