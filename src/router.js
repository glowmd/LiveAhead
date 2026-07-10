/**
 * LiveAhead — Screen Router
 * 
 * In-memory router with history stack for back navigation
 * and smooth crossfade transitions between screens.
 */

const app = document.getElementById('app');
let currentScreen = null;
let currentNav = null;
let currentScreenName = null;
let screenRenderers = {};
let navigationHistory = [];

export function registerScreen(name, renderFn) {
  screenRenderers[name] = renderFn;
}

export function navigateTo(screenName, options = {}) {
  const renderFn = screenRenderers[screenName];
  if (!renderFn) {
    console.error(`LiveAhead: Unknown screen "${screenName}"`);
    return;
  }

  // Push current screen to history (unless navigating back or replacing)
  if (!options._isBack && currentScreenName && currentScreenName !== screenName) {
    navigationHistory.push(currentScreenName);
  }

  currentScreenName = screenName;

  // Remove current nav if any
  if (currentNav) {
    currentNav.remove();
    currentNav = null;
  }

  // Build new screen content
  const { html, nav, onMount } = renderFn(options);

  // Crossfade transition
  if (currentScreen) {
    currentScreen.style.transition = 'opacity 200ms ease, transform 200ms ease';
    currentScreen.style.opacity = '0';
    currentScreen.style.transform = 'translateY(6px)';
    setTimeout(() => {
      app.innerHTML = '';
      mountScreen(html, nav, onMount);
    }, 180);
  } else {
    app.innerHTML = '';
    mountScreen(html, nav, onMount);
  }
}

export function goBack() {
  if (navigationHistory.length === 0) return;
  const prevScreen = navigationHistory.pop();
  navigateTo(prevScreen, { _isBack: true });
}

export function canGoBack() {
  return navigationHistory.length > 0;
}

export function clearHistory() {
  navigationHistory = [];
}

export function getCurrentScreenName() {
  return currentScreenName;
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
    requestAnimationFrame(() => onMount());
  }
}
