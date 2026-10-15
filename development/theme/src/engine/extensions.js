/** extensions: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createExtensions(deps) {
  const mftModuleState = {
    installedMeta: undefined,
    installedMetaAt: undefined,
    installedMetaPending: undefined,
    agentRender: undefined
  };

  function agentShortcuts() {
    const box = deps.ui.state.el('div', 'tool-grid');
    for (const name of ['Noodle', 'Gacha Forge', 'Slurp']) box.append(deps.ui.button(name, () => openAgent(name), 'tool'));
    box.append(deps.ui.button('모든 에이전트', () => deps.navigation.openNative('agents'), 'tool'));
    deps.ui.state.main.append(box);
  }
  
  function retryNative(fn, done) {
    let count = 0;
    const ticket = deps.core.state.epoch;
    function step() {
      if (ticket !== deps.core.state.epoch || deps.core.state.disposed) return;
      let result;
      try { result = fn(); } catch (error) {
        deps.navigation.routeFailure(error, () => retryNative(fn, done));
        return;
      }
      if (result) {
        done?.(result);
        return;
      }
      if (count < 7) deps.core.later(step, [50, 80, 120, 180, 280, 450, 700][count++]);else {
        deps.navigation.routeFailure(Error('메뉴 연결을 찾지 못했어요. 기능 설치 상태를 확인해 주세요.'), () => retryNative(fn, done));
      }
    }
    step();
  }
  
  async function setEngineTheme(value) {
    const direct = deps.adapter.engineActions().setTheme;
    if (direct) {
      direct(value);
      return;
    }
    const signal = deps.navigation.beginRoute('theme');
    try {
      const a = await deps.navigation.actionsReady(signal);
      if (signal.aborted) return false;
      deps.navigation.clearLayers(a);
      a.openRightPanel('settings');
      await deps.navigation.waitEngine(() => deps.adapter.engineActions().setTheme || deps.adapter.engineActions().setSettingsTab, signal, 5000);
      if (signal.aborted) return;
      const set = deps.adapter.engineActions().setTheme;
      if (set) set(value);else {
        deps.adapter.engineActions().setSettingsTab('appearance');
        const select = await deps.navigation.waitEngine(() => document.querySelector('#settings-control-theme-mode select'), signal);
        if (signal.aborted) return;
        const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
        setter.call(select, value);
        select.dispatchEvent(new Event('change', {
          bubbles: true
        }));
      }
      deps.navigation.clearLayers(deps.adapter.engineActions());
      deps.navigation.state.bridgeBusy = false;
      deps.ui.state.html.classList.remove('mft-transition');
      deps.navigation.state.routeIntent = 'own';
      deps.ui.own();
      deps.theme.syncTheme();
      deps.ui.notice('');
    } catch (e) {
      deps.navigation.routeFailure(e, () => setEngineTheme(value), signal);
    }
  }
  
  async function openAgent(name) {
    const signal = deps.navigation.beginRoute('agent');
    deps.navigation.state.agentActive = true;
    try {
      if (!deps.navigation.engineHome()) throw Error('기존 방을 닫지 못해 에이전트를 열지 못했어요.');
      const aliases = {
        Noodle: ['noodle', '누들'],
        'Gacha Forge': ['gachaforge', '가챠포지'],
        Slurp: ['slurp', 'slurp2', '슬러프', '슬럽']
      }[name] || [];
      const norm = x => x.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
      const button = await deps.navigation.waitEngine(() => {
        const buttons = [...document.querySelectorAll('[data-component="HomeBrowserHub.TabList"] [role="tab"]')];
        return buttons.find(b => !b.disabled && (aliases.includes(norm(b.id.replace('marinara-home-tab-', ''))) || aliases.some(a => norm(b.getAttribute('aria-label') || b.textContent).includes(a))));
      }, signal, 2500);
      if (signal.aborted) return;
      button.click();
      // Sending a click does not prove that the engine selected the requested tab.
      await deps.navigation.waitEngine(() => {
        const selected = document.getElementById(button.id);
        return selected?.getAttribute('aria-selected') === 'true' ? selected : null;
      }, signal, 2500);
      deps.navigation.finishRoute('agent', signal);
    } catch (error) {
      deps.navigation.routeFailure(error, () => openAgent(name), signal);
    }
  }
  
  function runExtension(target) {
    deps.navigation.state.navController?.abort();
    const c = new AbortController();
    deps.navigation.state.navController = c;
    deps.navigation.state.routeIntent = 'extension';
    const panels = new Set(document.querySelectorAll('[data-panel-key][aria-hidden="false"]'));
    target.click();
    // Toggles and portal dialogs stay over My. Only a real engine panel takes over the canvas.
    deps.navigation.waitEngine(() => [...document.querySelectorAll('[data-panel-key][aria-hidden="false"]')].find(panel => !panels.has(panel)), c.signal, 1200).then(() => {
      if (!c.signal.aborted && deps.navigation.state.routeIntent === 'extension') {
        deps.ui.native();
        deps.history.armNativeBack();
      }
    }).catch(() => {});
  }
  
  function extensionShortcuts() {
    const box = deps.ui.state.el('div', 'tool-grid');
    deps.ui.state.main.append(box);
    // Discover only on opening My; execute the original React/extension button.
    const bar = document.querySelector('[data-component="TopBar"]');
    const builtIn = '[data-tour],[data-topbar-hover-key],[data-topbar-more]';
    const buttons = bar ? [...bar.querySelectorAll('button')].filter(b => !b.matches(builtIn) && !b.disabled && !b.closest('[role="menu"]')) : [];
    for (const target of buttons) {
      const label = target.getAttribute('aria-label') || target.title || target.textContent.trim() || '확장 버튼';
      const proxy = deps.ui.button(label, () => {
        const current = target.isConnected ? target : [...document.querySelectorAll('[data-component=\"TopBar\"] button')].find(b => (b.getAttribute('aria-label') || b.title || b.textContent.trim()) === label);
        if (current && !current.disabled) runExtension(current);
      }, 'tool');
      const svg = target.querySelector('svg');
      if (svg) {
        const n = svg.cloneNode(true);
        n.removeAttribute('id');
        n.setAttribute('aria-hidden', 'true');
        proxy.prepend(n);
      }
      box.append(proxy);
    }
    for (const widget of document.querySelectorAll('div.fixed.touch-none')) {
      const youtube = [...widget.querySelectorAll('svg')].some(n => [...n.classList].some(c => c.toUpperCase().includes('[#FF0000]')));
      if (youtube) {
        const target = widget.querySelector('button');
        if (target) box.append(deps.ui.button('유튜브 플레이어', () => {
          runExtension(target);
        }, 'tool'));
      }
    }
    if (!buttons.length) box.append(deps.ui.state.el('p', 'muted', '상단바에 등록된 확장 버튼이 없어요.'));
    const overflow = bar?.querySelector('[data-topbar-more]');
    if (overflow) box.append(deps.ui.button('추가 확장 메뉴', () => {
      runExtension(overflow);
    }, 'tool'));
  }
  
  async function homeAgents(box) {
    const render = ++mftModuleState.agentRender;
    try {
      const data = mftModuleState.installedMeta && Date.now() - mftModuleState.installedMetaAt < 60000 ? mftModuleState.installedMeta : await (mftModuleState.installedMetaPending ||= deps.data.jsonRequest('/capability-packages/installed').finally(() => mftModuleState.installedMetaPending = null));
      mftModuleState.installedMeta = data;
      mftModuleState.installedMetaAt = Date.now();
      if (deps.core.state.disposed || render !== mftModuleState.agentRender) return;
      const rows = Array.isArray(data) ? data : data.items || data.packages || [];
      const norm = x => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const entries = [];
      for (const [name, id] of [['Noodle', 'noodle'], ['Slurp', 'slurp'], ['Gacha Forge', 'gacha-forge']]) {
        const item = rows.find(r => {
          const key = norm(r.id || r.manifest?.id);
          return (id === 'slurp' ? ['slurp', 'slurp2'] : id === 'gacha-forge' ? ['gachaforge'] : ['noodle']).includes(key) && r.enabled !== false && (!r.status || r.status === 'active' || r.status === 'restart-required' && r.previousManifest);
        });
        if (!item) continue;
        const b = deps.ui.button('', () => openAgent(name), 'agent-icon');
        b.title = name;
        b.setAttribute('aria-label', name);
        const paths = item.manifest?.contributions?.homeBrowserTab?.iconPaths;
        const existing = [...document.querySelectorAll('[data-component="HomeBrowserHub.TabList"] [role="tab"]')].find(n => norm(n.id.replace('marinara-home-tab-', '')) === norm(item.id || item.manifest?.id));
        const image = existing?.querySelector('img');
        if (image) b.append(image.cloneNode(true));else if (paths?.length) {
          const im = deps.ui.state.el('img');
          im.src = '/api/capability-packages/' + encodeURIComponent(item.id || item.manifest.id) + '/assets/' + paths[0].split('/').map(encodeURIComponent).join('/') + '?v=' + encodeURIComponent(item.version || '');
          im.alt = '';
          b.append(im);
        } else {
          const svg = existing?.querySelector('svg');
          if (!svg) continue;
          b.append(svg.cloneNode(true));
        }
        entries.push(b);
      }
      box.replaceChildren(...entries);
    } catch {
      if (!deps.core.state.disposed && render === mftModuleState.agentRender) box.replaceChildren();
    }
  }
  // Same compact catalog route as the official home widget; select one stable daily ID.

  const initialize = [
    { order: 18000, run() {
      mftModuleState.installedMeta = null;
    } },
    { order: 18001, run() {
      mftModuleState.installedMetaAt = 0;
    } },
    { order: 18002, run() {
      mftModuleState.installedMetaPending = null;
    } },
    { order: 18003, run() {
      mftModuleState.agentRender = 0;
    } }
  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, agentShortcuts, retryNative, setEngineTheme, openAgent, runExtension, extensionShortcuts, homeAgents };
}
