/**
 * LiveAhead — Screen Router
 * 
 * Simple in-memory router with smooth crossfade transitions.
 * Screens: welcome → goal-selection → routine-builder → home → weekly-summary → settings
 */

const app = document.getElementById('app');
let currentScreen = null;
let currentNav = null;
let screenRenderers = {};

export function registerScreen(name, renderFn) {
  screenRenderers[name] = renderFn;
}

export function navigateTo(screenName, options = {}) {
  const renderFn = screenRenderers[screenName];
  if (!renderFn) {
    console.error(`LiveAhead: Unknown screen "${screenName}"`);
    return;
  }

  // Remove current nav if any
  if (currentNav) {
    currentNav.remove();
    currentNav = null;
  }

  // Build new screen content
  const { html, nav, onMount } = renderFn(options);

  // Crossfade transition
  if (currentScreen) {
    currentScreen.style.opacity = '0';
    currentScreen.style.transform = 'translateY(8px)';
    setTimeout(() => {
      app.innerHTML = '';
      mountScreen(html, nav, onMount);
    }, 200);
  } else {
    app.innerHTML = '';
    mountScreen(html, nav, onMount);
  }
}

function mountScreen(html, nav, onMount) {
  const container = document.createElement('div');
  container.innerHTML = html;
  const screen = container.firstElementChild;
  app.appendChild(screen);
  currentScreen = screen;

  if (nav) {
    const navEl = document.createElement('nav');
    navEl.innerHTML = nav;
    const navNode = navEl.firstElementChild;
    app.appendChild(navNode);
    currentNav = navNode;
  }

  if (onMount) {
    // Wait for DOM to be ready
    requestAnimationFrame(() => onMount());
  }
}

export function getCurrentScreen() {
  return currentScreen;
}
