/** theme: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createTheme(deps) {
  const mftModuleState = {
    themes: undefined,
    themeObserver: undefined,
    accentPaint: undefined,
    themePaintSignature: undefined,
    previousAccent: undefined,
    previousBanner: undefined,
    themeStateObserver: undefined
  };

  function isolate() {
    for (const n of mftModuleState.themes.keys()) if (!n.isConnected) mftModuleState.themes.delete(n);
    const s = document.getElementById('marinara-custom-theme');
    if (s && !mftModuleState.themes.has(s)) {
      mftModuleState.themes.set(s, s.getAttribute('media'));
      s.setAttribute('media', 'not all');
    }
  }
  
  function syncTheme() {
    const accent = deps.ui.state.html.style.getPropertyValue('--marinara-app-accent-static').trim();
    const paintSignature = accent + '|' + deps.ui.state.html.dataset.theme;
    if (paintSignature === mftModuleState.themePaintSignature) return;
    mftModuleState.themePaintSignature = paintSignature;
    const valid = deps.design.state.previewAccent || (accent && CSS.supports('color', accent) ? accent : '');
    if (valid !== mftModuleState.accentPaint || valid) {
      mftModuleState.accentPaint = valid;
      if (valid) {
        deps.ui.state.html.style.setProperty('--mft-user-accent', valid);
        deps.ui.state.html.style.setProperty('--mft-user-banner', `color-mix(in srgb, ${valid} 12%, ${deps.ui.state.html.dataset.theme === 'dark' ? '#111113' : '#f5f5f8'})`);
      } else {
        deps.ui.state.html.style.removeProperty('--mft-user-accent');
        deps.ui.state.html.style.removeProperty('--mft-user-banner');
      }
    }
    const dark = deps.ui.state.html.dataset.theme === 'dark';
    deps.ui.state.body.dataset.dark = String(dark);
    deps.ui.state.root.dataset.scheme = dark ? 'dark' : 'light';
    if (deps.navigation.state.view === 'my' && deps.ui.state.root.dataset.native !== 'true') {
      deps.ui.state.main.querySelectorAll('.color-settings .chip').forEach((b, i) => b.dataset.active = String(i === (dark ? 1 : 0)));
      const trigger = deps.ui.state.main.querySelector('.color-trigger');
      if (trigger) trigger.style.background = deps.design.pickerColor();
    }
  }

  const initialize = [
    { order: 1101, run() {
      mftModuleState.themes = new Map();
    } },
    { order: 2100, run() {
      isolate();
    } },
    { order: 2200, run() {
      mftModuleState.themeObserver = new MutationObserver(isolate);
    } },
    { order: 2300, run() {
      mftModuleState.themeObserver.observe(document.head, {
        childList: true
      });
    } },
    { order: 12500, run() {
      mftModuleState.accentPaint = '';
    } },
    { order: 12501, run() {
      mftModuleState.themePaintSignature = '';
    } },
    { order: 12600, run() {
      mftModuleState.previousAccent = deps.ui.state.html.style.getPropertyValue('--mft-user-accent');
    } },
    { order: 12700, run() {
      mftModuleState.previousBanner = deps.ui.state.html.style.getPropertyValue('--mft-user-banner');
    } },
    { order: 12900, run() {
      mftModuleState.themeStateObserver = new MutationObserver(syncTheme);
    } },
    { order: 13000, run() {
      mftModuleState.themeStateObserver.observe(deps.ui.state.html, {
        attributes: true,
        attributeFilter: ['data-theme', 'style']
      });
    } },
    { order: 13100, run() {
      syncTheme();
    } }
  ];
  const cleanup = [
    { order: 30, run() {
      if (mftModuleState.previousAccent) deps.ui.state.html.style.setProperty('--mft-user-accent', mftModuleState.previousAccent);else deps.ui.state.html.style.removeProperty('--mft-user-accent');
    } },
    { order: 31, run() {
      if (mftModuleState.previousBanner) deps.ui.state.html.style.setProperty('--mft-user-banner', mftModuleState.previousBanner);else deps.ui.state.html.style.removeProperty('--mft-user-banner');
    } },
    { order: 50, run() {
      mftModuleState.themeObserver.disconnect();
    } },
    { order: 51, run() {
      mftModuleState.themeStateObserver.disconnect();
    } },
    { order: 64, run() {
      for (const [s, media] of mftModuleState.themes) if (s.isConnected && s.getAttribute('media') === 'not all') {
        if (media === null) s.removeAttribute('media');else s.setAttribute('media', media);
      }
    } },
    { order: 68, run() {
      mftModuleState.themes.clear();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, isolate, syncTheme };
}
