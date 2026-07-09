/**
 * Bottom Navigation Component
 * 
 * Three tabs: Home, Summary, Settings. Always visible on main screens.
 */

import { navigateTo } from '../router.js';

export function renderBottomNav(activeTab) {
  return `
    <div class="bottom-nav" role="navigation" aria-label="Main navigation">
      <button class="bottom-nav__item ${activeTab === 'home' ? 'bottom-nav__item--active' : ''}" 
              id="nav-home" 
              aria-label="Daily habits" 
              aria-current="${activeTab === 'home' ? 'page' : 'false'}">
        <span class="bottom-nav__icon" aria-hidden="true">🏠</span>
        <span>Today</span>
      </button>
      <button class="bottom-nav__item ${activeTab === 'summary' ? 'bottom-nav__item--active' : ''}" 
              id="nav-summary" 
              aria-label="Weekly summary"
              aria-current="${activeTab === 'summary' ? 'page' : 'false'}">
        <span class="bottom-nav__icon" aria-hidden="true">📊</span>
        <span>Summary</span>
      </button>
      <button class="bottom-nav__item ${activeTab === 'settings' ? 'bottom-nav__item--active' : ''}" 
              id="nav-settings" 
              aria-label="Settings"
              aria-current="${activeTab === 'settings' ? 'page' : 'false'}">
        <span class="bottom-nav__icon" aria-hidden="true">⚙️</span>
        <span>Settings</span>
      </button>
    </div>
  `;
}

export function bindNavEvents() {
  document.getElementById('nav-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('nav-summary')?.addEventListener('click', () => navigateTo('weekly-summary'));
  document.getElementById('nav-settings')?.addEventListener('click', () => navigateTo('settings'));
}
