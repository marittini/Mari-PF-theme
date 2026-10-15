/** ui: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createUi(deps) {
  const mftModuleState = {
    root: undefined,
    shadow: undefined,
    css: undefined,
    body: undefined,
    html: undefined,
    paths: undefined,
    el: undefined,
    header: undefined,
    brand: undefined,
    logo: undefined,
    headerAgents: undefined,
    brandGroup: undefined,
    refreshButton: undefined,
    main: undefined,
    status: undefined,
    nav: undefined,
    tabs: undefined,
    pausedMedia: undefined,
    visible: undefined,
    navSizeObserver: undefined
  };

  function button(text, fn, cls = 'button') {
    const n = mftModuleState.el('button', cls, text);
    n.type = 'button';
    n.onclick = fn;
    return n;
  }
  
  function icon(key) {
    const n = mftModuleState.el('span', 'icon');
    n.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${mftModuleState.paths[key]}"/></svg>`;
    return n;
  }
  
  function notice(t) {
    mftModuleState.status.textContent = t;
    mftModuleState.status.hidden = !t;
  }
  
  function resumeMedia() {
    for (const v of mftModuleState.pausedMedia) if (v.isConnected) v.play()?.catch(() => {});
    mftModuleState.pausedMedia.clear();
  }
  
  function own() {
    deps.settings.resetSettingsFolds();
    if (deps.nativeUi.state.nativeUiObserver) deps.nativeUi.state.nativeUiObserver.disconnect();
    mftModuleState.html.removeAttribute('data-mft-native-layer');
    if (mftModuleState.root.dataset.native !== 'false') {
      for (const v of document.querySelectorAll('[data-component="AppShell"] video')) if (!v.paused) {
        mftModuleState.pausedMedia.add(v);
        v.pause();
      }
    }
    mftModuleState.html.classList.add('mft-own');
    mftModuleState.root.dataset.native = 'false';
  }
  
  function native() {
    deps.core.stop();
    deps.navigation.state.returnView = deps.navigation.state.view;
    deps.navigation.state.nativeGrace = Date.now() + 180;
    resumeMedia();
    mftModuleState.html.classList.remove('mft-own');
    mftModuleState.root.dataset.native = 'true';
    notice('');
  }
  
  function error(e, retry) {
    if (e.name === 'AbortError' || deps.core.state.disposed) return;
    mftModuleState.main.replaceChildren(mftModuleState.el('h1', '', '불러오지 못했어요'), mftModuleState.el('p', 'muted', '연결 상태를 확인하거나 엔진 기본 화면을 이용해 주세요.'), button('다시 시도', retry), button('설정 열기', () => deps.navigation.openNative('settings'), 'quiet'));
  }

  const initialize = [
    { order: 200, run() {
      mftModuleState.root = document.createElement('div');
    } },
    { order: 400, run() {
      mftModuleState.shadow = mftModuleState.root.attachShadow({
        mode: 'open'
      });
    } },
    { order: 500, run() {
      mftModuleState.css = document.createElement('style');
    } },
    { order: 800, run() {
      mftModuleState.body = document.createElement('div');
    } },
    { order: 1100, run() {
      mftModuleState.html = document.documentElement;
    } },
    { order: 1400, run() {
      mftModuleState.paths = {
        home: 'M3 10 12 3l9 7v10h-6v-7H9v7H3Z',
        chats: 'M4 4h16v13H9l-5 4Z',
        create: 'm5 3 16 16-2 2L3 5Z M17 2v6 M14 5h6',
        my: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2'
      };
    } },
    { order: 1500, run() {
      mftModuleState.el = (tag, cls, text) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
      };
    } },
    { order: 3700, run() {
      mftModuleState.header = mftModuleState.el('header');
    } },
    { order: 3800, run() {
      mftModuleState.brand = button('Marinara', () => deps.navigation.go('home'), 'brand');
    } },
    { order: 3900, run() {
      mftModuleState.logo = mftModuleState.el('img', 'brand-logo');
    } },
    { order: 4000, run() {
      mftModuleState.logo.src = '/logo.png';
    } },
    { order: 4100, run() {
      mftModuleState.logo.alt = '';
    } },
    { order: 4200, run() {
      mftModuleState.logo.decoding = 'async';
    } },
    { order: 4300, run() {
      mftModuleState.brand.prepend(mftModuleState.logo);
    } },
    { order: 4400, run() {
      mftModuleState.headerAgents = mftModuleState.el('div', 'agent-icons');
    } },
    { order: 4500, run() {
      mftModuleState.headerAgents.setAttribute('aria-label', '설치한 앱');
    } },
    { order: 4600, run() {
      mftModuleState.brandGroup = mftModuleState.el('div', 'brand-group');
    } },
    { order: 4700, run() {
      mftModuleState.refreshButton = button('', deps.gestures.refreshCurrentView, 'refresh-icon');
    } },
    { order: 4800, run() {
      mftModuleState.refreshButton.title = '새로고침';
    } },
    { order: 4900, run() {
      mftModuleState.refreshButton.setAttribute('aria-label', '새로고침');
    } },
    { order: 5000, run() {
      mftModuleState.refreshButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2M18 18A8 8 0 0 1 5 16"/></svg>';
    } },
    { order: 5100, run() {
      mftModuleState.brandGroup.append(mftModuleState.brand, mftModuleState.refreshButton);
    } },
    { order: 5200, run() {
      mftModuleState.header.append(mftModuleState.brandGroup, mftModuleState.headerAgents);
    } },
    { order: 5300, run() {
      mftModuleState.main = mftModuleState.el('main');
    } },
    { order: 5400, run() {
      mftModuleState.main.tabIndex = -1;
    } },
    { order: 5500, run() {
      mftModuleState.status = mftModuleState.el('p', 'status');
    } },
    { order: 5600, run() {
      mftModuleState.status.setAttribute('role', 'status');
    } },
    { order: 5700, run() {
      mftModuleState.status.hidden = true;
    } },
    { order: 5800, run() {
      mftModuleState.nav = mftModuleState.el('nav');
    } },
    { order: 5900, run() {
      mftModuleState.nav.setAttribute('aria-label', '주요 메뉴');
    } },
    { order: 6000, run() {
      mftModuleState.tabs = new Map();
    } },
    { order: 6100, run() {
      for (const [k, label] of Object.entries({
        home: '홈',
        chats: '채팅',
        create: '제작',
        my: '마이페이지'
      })) {
        const b = button('', () => deps.navigation.go(k), 'tab');
        b.append(icon(k), mftModuleState.el('span', '', label));
        b.dataset.tab = k;
        mftModuleState.tabs.set(k, b);
        mftModuleState.nav.append(b);
      }
    } },
    { order: 6200, run() {
      mftModuleState.body.append(mftModuleState.header, mftModuleState.main, mftModuleState.status, mftModuleState.nav);
    } },
    { order: 6300, run() {
      document.body.append(mftModuleState.root);
    } },
    { order: 6500, run() {
      mftModuleState.pausedMedia = new Set();
    } },
    { order: 6900, run() {
      mftModuleState.visible = n => n && !n.closest('[aria-hidden="true"],[inert]') && n.getClientRects().length > 0;
    } },
    { order: 13200, run() {
      mftModuleState.html.classList.add('mft-enabled');
    } },
    { order: 13300, run() {
      mftModuleState.navSizeObserver = new ResizeObserver(entries => {
        const h = Math.ceil(entries[0].borderBoxSize?.[0]?.blockSize || mftModuleState.nav.getBoundingClientRect().height);
        if (h > 0) mftModuleState.html.style.setProperty('--mft-nav-height', h + 'px');
      });
    } },
    { order: 13400, run() {
      mftModuleState.navSizeObserver.observe(mftModuleState.nav);
    } }
  ];
  const cleanup = [
    { order: 29, run() {
      mftModuleState.html.removeAttribute('data-mft-native-layer');
    } },
    { order: 41, run() {
      mftModuleState.html.classList.remove('mft-transition');
    } },
    { order: 52, run() {
      mftModuleState.navSizeObserver.disconnect();
    } },
    { order: 58, run() {
      mftModuleState.html.removeAttribute('data-mft-agent');
    } },
    { order: 59, run() {
      mftModuleState.html.removeAttribute('data-mft-alerts');
    } },
    { order: 60, run() {
      mftModuleState.html.classList.remove('mft-enabled');
    } },
    { order: 61, run() {
      mftModuleState.html.style.removeProperty('--mft-nav-height');
    } },
    { order: 69, run() {
      resumeMedia();
    } },
    { order: 70, run() {
      mftModuleState.html.classList.remove('mft-own');
    } },
    { order: 72, run() {
      mftModuleState.root.remove();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, button, icon, notice, resumeMedia, own, native, error };
}
