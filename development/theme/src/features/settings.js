/** settings: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createSettings(deps) {
  const mftModuleState = {
    settingsFolds: undefined,
    settingsRevealUntil: undefined,
    settingsSearchTarget: undefined
  };

  function setSettingsFold(section, open) {
    const state = mftModuleState.settingsFolds.get(section);
    if (!state) return;
    section.dataset.mftSettingsFold = open ? 'open' : 'closed';
    state.button.textContent = open ? '⌃' : '⌄';
    state.button.title = open ? '접기' : '펼치기';
    state.button.setAttribute('aria-expanded', String(open));
  }
  
  function restoreSettingsFolds() {
    document.removeEventListener('input', onSettingsSearch, true);
    document.removeEventListener('click', onSettingsSearchClick, true);
    for (const [section, state] of mftModuleState.settingsFolds) {
      section.removeAttribute('data-mft-settings-fold');
      state.button.remove();
      if (state.oldId === null) state.content.removeAttribute('id');else state.content.id = state.oldId;
    }
    mftModuleState.settingsFolds.clear();
  }
  
  function revealSettings(scope) {
    for (const [section] of mftModuleState.settingsFolds) if (scope?.contains(section)) setSettingsFold(section, true);
  }
  
  function resetSettingsFolds() {
    mftModuleState.settingsSearchTarget = '';
    mftModuleState.settingsRevealUntil = 0;
    for (const [section] of mftModuleState.settingsFolds) setSettingsFold(section, false);
  }
  
  function onSettingsSearch(e) {
    if (e.target.closest?.('.mari-settings-search-header')) {
      mftModuleState.settingsSearchTarget = '';
      mftModuleState.settingsRevealUntil = 0;
    }
  }
  
  function onSettingsSearchClick(e) {
    const panel = e.target.closest?.('[data-panel-key="settings"]');
    if (!panel) return;
    const b = e.target.closest('button');
    if (!b) return;
    if (b.matches('[role="tab"],[id^="settings-tab-"]') || b.closest('[role="group"].grid-cols-4')) {
      resetSettingsFolds();
      return;
    }
    if (!b.closest('.mari-settings-search-header') || !b.classList.contains('grid')) return;
    const parts = b.lastElementChild?.textContent.split(' / ') || [];
    mftModuleState.settingsSearchTarget = (parts[1] || b.firstElementChild?.textContent || '').trim();
    mftModuleState.settingsRevealUntil = Date.now() + 1500;
    for (const [section, state] of mftModuleState.settingsFolds) if (panel.contains(section) && mftModuleState.settingsSearchTarget && state.title.includes(mftModuleState.settingsSearchTarget)) setSettingsFold(section, true);
  }
  
  function enhanceSettingsFolds(scope) {
    const panels = [...scope.querySelectorAll('[data-panel-key="settings"]')];
    const parentPanel = scope.closest?.('[data-panel-key="settings"]');
    if (parentPanel && !panels.includes(parentPanel)) panels.push(parentPanel);
    for (const panel of panels) {
      for (const [section, state] of mftModuleState.settingsFolds) if (panel.contains(section) && Date.now() < mftModuleState.settingsRevealUntil && mftModuleState.settingsSearchTarget && state.title.includes(mftModuleState.settingsSearchTarget)) setSettingsFold(section, true);
      for (const section of panel.querySelectorAll('section[id^="settings-section-"],#settings-section-roleplay-tracker>section')) {
        const previous = mftModuleState.settingsFolds.get(section);
        if (previous && previous.button.isConnected && previous.content === section.querySelector(':scope>.border-t')) continue;
        if (previous) {
          previous.button.remove();
          deps.nativeUi.state.nativeUiAdditions.delete(previous.button);
          if (previous.oldId === null) previous.content.removeAttribute('id');else previous.content.id = previous.oldId;
          mftModuleState.settingsFolds.delete(section);
        }
        const header = section.querySelector(':scope>div:first-child'),
          content = section.querySelector(':scope>.border-t');
        if (!header || !content) continue;
        const oldId = content.getAttribute('id');
        if (!oldId) content.id = (section.id || 'settings-section-roleplay-tracker') + '-content';
        const title = (header.querySelector('.font-semibold') || header.firstElementChild || header).textContent.trim();
        const toggle = deps.ui.button('⌄', () => setSettingsFold(section, section.dataset.mftSettingsFold !== 'open'), 'mft-settings-fold');
        toggle.setAttribute('aria-controls', content.id);
        toggle.setAttribute('aria-label', (header.textContent.trim().slice(0, 90) || '설정') + ' 펼치기/접기');
        header.append(toggle);
        mftModuleState.settingsFolds.set(section, {
          button: toggle,
          content,
          oldId,
          title
        });
        deps.nativeUi.state.nativeUiAdditions.add(toggle);
        setSettingsFold(section, Date.now() < mftModuleState.settingsRevealUntil && !!mftModuleState.settingsSearchTarget && title.includes(mftModuleState.settingsSearchTarget));
      }
    }
    for (const [section, state] of mftModuleState.settingsFolds) if (!section.isConnected) {
      deps.nativeUi.state.nativeUiAdditions.delete(state.button);
      mftModuleState.settingsFolds.delete(section);
    }
  }

  const initialize = [
    { order: 24500, run() {
      mftModuleState.settingsFolds = new Map();
    } },
    { order: 24600, run() {
      mftModuleState.settingsRevealUntil = 0;
    } },
    { order: 24601, run() {
      mftModuleState.settingsSearchTarget = '';
    } },
    { order: 25400, run() {
      document.addEventListener('input', onSettingsSearch, true);
    } },
    { order: 25500, run() {
      document.addEventListener('click', onSettingsSearchClick, true);
    } }
  ];
  const cleanup = [
    { order: 4, run() {
      restoreSettingsFolds();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, setSettingsFold, restoreSettingsFolds, revealSettings, resetSettingsFolds, onSettingsSearch, onSettingsSearchClick, enhanceSettingsFolds };
}
