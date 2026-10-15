(/* Marinara Platform 0.31.4 — generated; edit src/ and styles/. */
function(){
"use strict";
// Source: src/ui/shell.js
/** ui: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createUi(deps) {
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

// Source: src/ui/theme.js
/** theme: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createTheme(deps) {
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

// Source: src/core/data.js
/** data: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createData(deps) {
  const mftModuleState = {
    cache: undefined,
    viewRequests: undefined,
    request: undefined,
    refreshWriteQueued: undefined,
    resourceFetch: undefined,
    inflight: new Map()
  };

  function resourceFetchWrapper(input, init) {
    const result = mftModuleState.resourceFetch.call(this, input, init);
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (!['PATCH', 'PUT', 'DELETE', 'POST'].includes(method)) return result;
    let url;
    try {
      url = new URL(input instanceof Request ? input.url : String(input), location.origin);
    } catch {
      return result;
    }
    if (url.origin !== location.origin || !/^\/api\/characters(?:\/personas|\/persona-groups|\/groups)?(?:\/[^/]+)?$/.test(url.pathname) || url.pathname.endsWith('/summaries')) return result;
    return result.then(response => {
      if (!deps.core.state.disposed && response.ok) {
        mftModuleState.cache.clear();
        deps.tags.state.tagOptionCache.clear();
        if (!mftModuleState.refreshWriteQueued) {
          mftModuleState.refreshWriteQueued = true;
          queueMicrotask(() => {
            mftModuleState.refreshWriteQueued = false;
            if (deps.core.state.disposed || deps.ui.state.root.dataset.native === 'true' || deps.navigation.state.bridgeBusy) return;
            if (deps.navigation.state.view === 'home') deps.catalog.loadHome();else if (deps.navigation.state.view === 'personas') deps.catalog.personaGallery();
          });
        }
      }
      return response;
    });
  }
  
  function compact(x) {
    return {
      id: String(x.id),
      name: String(x.name || '이름 없는 캐릭터'),
      title: (String(x.title || '').trim() || String(x.comment || '').trim()).slice(0, 200),
      summary: '',
      creator: String(x.creator || '').slice(0, 100),
      tags: Array.isArray(x.tags) ? x.tags.slice(0, 12).map(String) : [],
      avatarPath: x.avatarPath || x.avatarUrl || '',
      avatarCrop: x.avatarCrop || null,
      favorite: !!x.favorite
    };
  }
  
  async function get(path, ticket, convert = x => x, options = {}) {
    const readOnly = !options.method || options.method.toUpperCase() === 'GET';
    const shareable = readOnly && Object.keys(options).length === 0;
    const old = readOnly && mftModuleState.cache.get(path);
    if (old && Date.now() - old.time < 60000) {
      mftModuleState.cache.delete(path);
      mftModuleState.cache.set(path, old);
      return old.data;
    }
    const pending = shareable && mftModuleState.inflight.get(path);
    if (pending && pending.ticket === ticket && !pending.controller.signal.aborted) return pending.promise;
    const c = new AbortController();
    const entry = { ticket, controller: c, promise: null };
    const run = async () => {
      mftModuleState.viewRequests.add(c);
      mftModuleState.request = c;
      const deadline = deps.core.later(() => c.abort(new DOMException('Request timeout', 'TimeoutError')), 15000);
      try {
        const res = await fetch('/api' + path.split('?mft=')[0], {
          signal: c.signal,
          credentials: 'same-origin',
          ...options
        });
        if (!res.ok) throw Error('HTTP ' + res.status);
        const raw = await res.json();
        if (deps.core.state.disposed || ticket !== deps.core.state.epoch) throw new DOMException('Stale', 'AbortError');
        const data = convert(raw);
        if (readOnly) mftModuleState.cache.set(path, {
          time: Date.now(),
          data
        });
        while (mftModuleState.cache.size > 12) mftModuleState.cache.delete(mftModuleState.cache.keys().next().value);
        return data;
      } finally {
        clearTimeout(deadline);
        deps.core.state.timers.delete(deadline);
        mftModuleState.viewRequests.delete(c);
        if (mftModuleState.request === c) mftModuleState.request = null;
        if (mftModuleState.inflight.get(path) === entry) mftModuleState.inflight.delete(path);
      }
    };
    entry.promise = run();
    if (shareable) mftModuleState.inflight.set(path, entry);
    return entry.promise;
  }

  async function jsonRequest(path, method = 'GET', data, signal, fresh = false) {
    const res = await fetch('/api' + path, {
      signal,
      cache: fresh ? 'no-store' : 'default',
      method,
      credentials: 'same-origin',
      headers: data ? {
        'Content-Type': 'application/json'
      } : undefined,
      body: data ? JSON.stringify(data) : undefined
    });
    if (!res.ok) throw Error('저장하지 못했어요 (' + res.status + ')');
    return res.status === 204 ? null : res.json();
  }

  const initialize = [
    { order: 1102, run() {
      mftModuleState.cache = new Map();
    } },
    { order: 1104, run() {
      mftModuleState.viewRequests = new Set();
    } },
    { order: 1302, run() {
      mftModuleState.request = null;
    } },
    { order: 8700, run() {
      mftModuleState.refreshWriteQueued = false;
    } },
    { order: 8800, run() {
      mftModuleState.resourceFetch = window.fetch;
    } },
    { order: 9000, run() {
      window.fetch = resourceFetchWrapper;
    } }
  ];
  const cleanup = [
    { order: 34, run() {
      if (window.fetch === resourceFetchWrapper) window.fetch = mftModuleState.resourceFetch;
    } },
    { order: 65, run() {
      mftModuleState.cache.clear();
      mftModuleState.inflight.clear();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, resourceFetchWrapper, compact, get, jsonRequest };
}

// Source: src/core/runtime.js
/** core: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createCore(deps) {
  const mftModuleState = {
    timers: undefined,
    disposed: undefined,
    epoch: undefined,
    bootstrapTimers: undefined
  };

  function later(fn, ms) {
    const t = setTimeout(() => {
      mftModuleState.timers.delete(t);
      if (!mftModuleState.disposed) fn();
    }, ms);
    mftModuleState.timers.add(t);
    return t;
  }
  
  function stop() {
    deps.translations.state.translationObserver?.disconnect();
    deps.translations.state.translationConnected = false;
    deps.tags.closeTagMenu();
    deps.design.clearColorPreview();
    for (const c of deps.data.state.viewRequests) c.abort();
    deps.data.state.viewRequests.clear();
    deps.updates.state.chatRefreshRequest?.abort();
    if (deps.convo.state.splitTask) {
      clearTimeout(deps.convo.state.splitTask);
      mftModuleState.timers.delete(deps.convo.state.splitTask);
      deps.convo.state.splitTask = null;
    }
    deps.previews.state.previewObserver?.disconnect();
    for (const c of deps.previews.state.previewRequests) c.abort();
    deps.convo.state.splitObserver?.disconnect();
    deps.convo.state.splitConnected = false;
    deps.avatars.state.cropTimer = null;
    deps.avatars.state.cropRequest?.abort();
    mftModuleState.epoch++;
    deps.data.state.request?.abort();
    deps.data.state.request = null;
    for (const t of mftModuleState.timers) clearTimeout(t);
    mftModuleState.timers.clear();
    deps.avatars.state.imageObserver?.disconnect();
  }
  
  function bindLater(fn, ms) {
    const t = setTimeout(() => {
      mftModuleState.bootstrapTimers.delete(t);
      if (!mftModuleState.disposed) fn();
    }, ms);
    mftModuleState.bootstrapTimers.add(t);
    return t;
  }

  const initialize = [
    { order: 300, run() {
      deps.ui.state.root.id = 'mft-root';
    } },
    { order: 600, run() {
      deps.ui.state.css.textContent = ":host{all:initial!important;position:fixed!important;inset:0!important;z-index:80!important;display:block!important;pointer-events:none!important;color-scheme:light!important;direction:ltr!important}.app{--bg:#f5f5f8;--surface:#eeeef3;--ink:#16161d;--muted:#81818e;--line:#e5e5ee;--accent:#6656ec;--banner:#e6e2fa;font:inherit;line-height:1.55;color:var(--ink);letter-spacing:-.35px;pointer-events:auto;position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:var(--bg);color-scheme:light}.app[data-dark=true]{--bg:#111113;--surface:#202023;--ink:#f6f6fa;--muted:#9999a4;--line:#2b2b30;--banner:#272042;color-scheme:dark}*{box-sizing:border-box}button,input{font:inherit;color:inherit}button{cursor:pointer;border:0;background:none;text-align:left}button:focus-visible,input:focus-visible{outline:3px solid var(--accent);outline-offset:3px}button:disabled{opacity:.5}button:active{opacity:.75}header{padding:calc(16px + env(safe-area-inset-top,0px)) max(20px,calc((100vw - 1020px)/2)) 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{font-size:1.4375rem;font-weight:800;white-space:nowrap}.brand:first-letter{color:var(--accent)}main{overflow:auto;overscroll-behavior:contain;padding:10px max(20px,calc((100vw - 1020px)/2)) 36px;scrollbar-width:thin;min-width:0}h1{font-size:1.5625rem;line-height:1.4;margin:15px 0 24px;letter-spacing:-1px}h2{font-size:1.25rem;line-height:1.4;margin:26px 0 16px}p{margin:8px 0}.muted,small{color:var(--muted)}.search{width:100%;padding:13px 17px;border:1px solid var(--line);border-radius:16px;background:var(--surface);outline-offset:0;margin:8px 0 18px}.banner{position:relative;background:linear-gradient(110deg,var(--banner),var(--surface));border:1px solid var(--line);border-radius:24px;padding:24px;overflow:hidden;margin-bottom:22px}.banner h1{white-space:pre-line;margin:8px 0;font-size:1.6875rem}.banner h2{margin:10px 0}.spark{position:absolute;right:25px;top:25px;font-size:5.125rem;color:var(--accent);line-height:1}.chips{display:flex;gap:8px;align-items:center;background:var(--surface);border-radius:25px;padding:6px;margin:10px 0 28px;flex-wrap:wrap}.chip,.button,.primary,.quiet{border-radius:19px;padding:10px 15px}.chip[data-active=true],.chip:not([data-active]),.primary{background:var(--accent);color:white}.quiet{color:var(--muted)}.button{background:var(--surface)}.shelf{margin:20px 0 32px}.rail{display:flex;gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding-bottom:8px;scroll-snap-type:x proximity}.card{flex:0 0 clamp(156px,39vw,210px);width:clamp(156px,39vw,210px);padding:0;scroll-snap-align:start;min-width:0}.art{position:relative;width:100%;aspect-ratio:1;border-radius:17px;background:linear-gradient(135deg,var(--banner),var(--surface));display:grid;place-items:center;font-size:2.75rem;color:var(--accent);overflow:hidden;margin-bottom:10px}.art img,.hero img{position:absolute;width:100%;height:100%;inset:0;object-fit:cover}.card strong{font-size:1.0rem;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.summary{color:var(--muted);font-size:0.8125rem;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.tags{font-size:0.8125rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.card small{font-size:0.75rem}.pager{display:flex;gap:12px;justify-content:center}.chat-row{display:flex;align-items:center;width:100%;gap:14px;padding:18px 0}.chat-row>div:nth-child(2){min-width:0;flex:1}.chat-row .summary{white-space:nowrap;display:block;text-overflow:ellipsis;margin:5px 0}.round{display:grid;place-items:center;flex:0 0 56px;height:56px;border-radius:50%;background:var(--banner);color:var(--accent);font-size:1.4375rem}.menu-row{display:flex;align-items:center;justify-content:space-between;gap:20px;width:100%;padding:22px 16px;border-bottom:1px solid var(--line)}.menu-row p{font-size:0.8125rem;margin:5px 0 0}.primary{display:block;text-align:center;width:100%;font-size:1.0rem;font-weight:700;margin-top:16px}.hero{position:relative;aspect-ratio:1.25;max-height:500px;border-radius:22px;overflow:hidden;display:grid;place-items:center;background:var(--banner);font-size:5.0rem;color:var(--accent)}.description{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.9}.detail-actions{display:flex;align-items:center;gap:12px}.detail-actions .primary{margin:0;flex:1}.status{position:absolute;bottom:100px;left:20px;right:20px;background:var(--ink);color:var(--bg);padding:16px;border-radius:16px;font-size:0.8125rem;z-index:2}.status[hidden],[hidden]{display:none!important}nav{display:flex;justify-content:space-around;background:var(--bg);border-top:1px solid var(--line);border-radius:25px 25px 0 0;padding:9px max(8px,calc((100vw - 800px)/2)) calc(8px + env(safe-area-inset-bottom,0px));gap:10px}.tab{display:flex;flex:1;align-items:center;flex-direction:column;justify-content:center;gap:2px;min-height:49px;color:var(--muted);font-size:0.75rem}.tab[data-active=true]{color:var(--accent);font-weight:700}.icon{display:block;height:26px}.icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}:host([data-native=true]) .app{background:transparent;pointer-events:none;display:block}:host([data-native=true]) header,:host([data-native=true]) main{display:none}:host([data-native=true]) nav{display:var(--mft-native-nav-display,flex);position:absolute;bottom:0;left:0;right:0;pointer-events:auto}:host([data-native=true]) .status{pointer-events:auto}@media(min-width:800px){.banner{min-height:180px}.banner h1{font-size:2.0rem}.rail{gap:22px}.card{flex-basis:210px;width:210px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}\n/* v0.3: same home layout; flexible viewport, navigation and media geometry. */\n:host{top:var(--mari-visual-viewport-offset-top,0px)!important;bottom:auto!important;height:var(--mari-visual-viewport-height,100dvh)!important;max-width:100vw!important}\n.app{font-family:inherit;min-width:0;min-height:0;overflow:hidden}\n.app[data-dark=true]{--accent:#7969fa}\nmain{min-height:0;overflow-x:hidden}\nheader{min-width:0;padding-inline:max(16px,calc((100vw - 1020px)/2))}\n.brand{font-size:1.3125rem;overflow:hidden;text-overflow:ellipsis}\n.hero{aspect-ratio:1;max-height:none}\n.round{position:relative;overflow:hidden}\n.round img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\nnav{padding-top:6px;padding-bottom:calc(5px + env(safe-area-inset-bottom,0px))}\n.tab{min-height:44px}\n.mode-tabs{display:flex;gap:8px;border-bottom:1px solid var(--line);margin:10px 0 18px}\n.mode-tab{flex:1;padding:12px;text-align:center;color:var(--muted);border-bottom:2px solid transparent}\n.mode-tab[aria-selected=true]{border-color:var(--accent);color:var(--accent);font-weight:700}\n.tool-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0 28px}\n.tool{border:1px solid var(--line);border-radius:16px;background:var(--surface);padding:16px;font-size:0.875rem;text-align:center;min-height:54px}\n.color-settings .chip{margin-right:8px}\n:host([data-native=true]) .app{pointer-events:none}\n:host([data-native=true]) nav{display:var(--mft-native-nav-display,flex)}\n@media(max-width:360px){.brand{font-size:1.1875rem}header{gap:6px}main{padding-inline:14px}.banner{padding:20px}.spark{font-size:4.0rem;right:12px}.banner h1{font-size:1.5rem}.card{flex-basis:144px;width:144px}}\n/* v0.4 official static logo; readable Markdown; compact integration shortcuts. */\n.brand{display:flex;align-items:center;gap:8px}.brand-logo{width:30px;height:30px;object-fit:contain}\n.description{white-space:normal}.description p{white-space:pre-wrap}.description h2,.description h3,.description h4{margin:18px 0 8px}.description ul,.description ol{padding-left:24px}.description pre{overflow:auto;padding:12px;background:var(--surface);border-radius:10px;white-space:pre-wrap}.description code{font-family:inherit;background:var(--surface);border-radius:4px;padding:2px 4px}.description blockquote{border-left:3px solid var(--accent);margin:12px 0;padding-left:12px;color:var(--muted)}.description a{color:var(--accent);overflow-wrap:anywhere}.tool svg{display:block;margin:0 auto 6px;width:22px;height:22px;fill:none;stroke:currentColor}\n.banner-logo{width:84px;height:84px;object-fit:contain;font-size:0;opacity:.85;right:20px;top:30px}\n@media(max-width:360px){.banner-logo{width:60px;height:60px;right:12px;top:35px}.banner h1{font-size:1.4375rem}}\n/* v0.6: compact galleries, horizontal settings, equal chat switch. */\n.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 14px;margin:20px 0}.gallery-card{padding:0;min-width:0}.gallery-card strong{display:block;text-align:center;font-size:0.875rem;overflow:hidden;text-overflow:ellipsis}.gallery .art{margin-bottom:8px}.agent-icons{display:flex;gap:5px;align-items:center}.agent-icon{display:grid;place-items:center;width:36px;height:36px;padding:5px;background:transparent}.agent-icon img{width:27px;height:27px;object-fit:contain}.chat-switch{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:4px;border-radius:12px;background:var(--surface);margin:12px 0}.chat-switch>button{text-align:center;min-width:0}.chat-switch>button:nth-child(n+3){display:none}.color-settings{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:22px 0}.color-settings h2{margin:0;font-size:0.9375rem}.color-settings .chip{margin:0;padding:7px 13px}.split-toggle{display:flex;align-items:center;gap:10px;margin:24px 0;font-size:0.875rem}.split-toggle input{accent-color:var(--accent)}.chat-item{display:flex;align-items:center;gap:6px}.chat-item .chat-row{flex:1;min-width:0}.folder-move{color:var(--muted);font-size:0.6875rem;padding:8px}.folder-bar{display:flex;gap:8px;align-items:center;margin:12px 0}.folder-bar select,.inline-dialog select{min-width:0;flex:1;background:var(--surface);color:var(--ink);padding:10px;border:1px solid var(--line);border-radius:10px}.inline-dialog{border:1px solid var(--line);border-radius:16px;padding:14px;background:var(--bg)}.folder-edit{display:flex;gap:4px;margin:8px 0;flex-wrap:wrap}.folder-edit input{min-width:0;flex:1;border:1px solid var(--line);border-radius:8px;background:var(--surface);padding:8px}.banner{display:grid;grid-template-columns:minmax(0,1fr) 84px;align-items:center;gap:8px}.banner small{grid-column:1}.banner h1{grid-column:1;margin:8px 0}.banner-logo{grid-column:2;grid-row:1/3;position:static;align-self:center;width:84px;height:84px}.alerts{position:absolute;right:12px;top:85px;z-index:90;display:flex;flex-direction:column;gap:8px;max-width:min(310px,85vw);pointer-events:auto}.alert{display:flex;align-items:center;gap:10px;border-radius:14px;background:var(--bg);box-shadow:0 3px 14px #0002;border:1px solid var(--line);padding:10px;font-size:0.8125rem;color:var(--ink)}.alert .round{width:38px;height:38px;flex-basis:38px;font-size:0.9375rem}.unread{position:absolute;top:0;right:calc(50% - 28px);background:var(--accent);color:white;font-size:0.625rem;padding:1px 5px;border-radius:12px}.tab{position:relative}main,.rail{scrollbar-width:none}main::-webkit-scrollbar,.rail::-webkit-scrollbar{display:none}\n@media(min-width:1024px){.app{grid-template-columns:92px minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}header{grid-column:2;grid-row:1;padding-inline:32px}main{grid-column:2;grid-row:2;padding-inline:max(32px,calc((100vw - 1050px)/2))}nav{grid-column:1;grid-row:1/3;flex-direction:column;justify-content:flex-start;padding:24px 8px;border-top:0;border-right:1px solid var(--line);border-radius:0;gap:18px}.tab{flex:0 0 auto;min-height:62px}.gallery{grid-template-columns:repeat(4,minmax(0,1fr))}:host([data-native=true]) nav{top:0;bottom:0;left:0;right:auto;width:92px}.alerts{right:24px;top:20px}}\n:host([data-native=true]) .alerts{display:none}\n.banner{display:block}.banner:has(.banner-logo){display:grid}\n.chat-unread{flex:none;border-radius:12px;padding:1px 6px;font-size:0.6875rem;background:var(--accent);color:white}\n.brand-group{display:flex;align-items:center;gap:5px;min-width:0}.refresh-icon{display:grid;place-items:center;width:28px;height:28px;flex:none;padding:5px;color:var(--muted);border-radius:50%}.refresh-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.refresh-icon:hover{background:var(--surface);color:var(--accent)}\n.gallery-card .card-name{font-size:1.0rem}.daily-pick{position:relative;border:1px solid var(--line);border-radius:22px;padding:18px;background:linear-gradient(135deg,var(--banner),var(--bg));overflow:hidden}.daily-pick h2{font-size:1.125rem;margin:0 0 18px;line-height:1.55}.daily-decor{display:inline-block;color:var(--accent);font-size:1.4375rem;margin-left:8px;letter-spacing:4px;opacity:.65}.daily-pick .rail{justify-content:center}.daily-pick .card{flex-basis:min(72vw,280px);width:min(72vw,280px)}\n/* Message-style notifications are visible over both theme pages and native chats. */\n.alerts,:host([data-native=true]) .alerts{display:flex!important;position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);right:12px;left:12px;max-width:440px;margin-left:auto;gap:8px;pointer-events:none}.alert-row{pointer-events:auto}.alert-row .alert{box-shadow:0 5px 22px #0002;border-radius:16px;padding:13px 32px 13px 14px;gap:12px}.alert .round{width:44px;height:44px;flex-basis:44px}.notification-copy{min-width:0;flex:1;text-align:left}.notification-copy strong{display:block;font-size:0.875rem;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.notification-copy p{margin:3px 0 0;font-size:0.8125rem;line-height:1.45;color:var(--muted)}.alert-dismiss{top:8px;right:6px;font-size:1.25rem}\n@media(max-width:360px){header .agent-icons{gap:0}header .agent-icon{width:27px;height:28px}header .agent-icon img,header .agent-icon svg{width:23px;height:23px}.brand-group{gap:2px}.brand{font-size:1.125rem}.brand-logo{width:25px;height:25px}.refresh-icon{width:25px;height:25px;padding:4px}}\n/* 0.7: aligned card labels, optional metadata and installed apps in the header. */\nheader .agent-icons{margin-left:auto;flex-shrink:0;gap:4px}header .agent-icon{width:32px;height:32px;padding:3px}header .agent-icon img,header .agent-icon svg{width:26px;height:26px}.chips{flex-wrap:nowrap}.chips .chip{flex:1;min-width:0;text-align:center;padding:9px 6px;font-size:0.8125rem;white-space:nowrap}.card,.gallery-card{align-self:flex-start}.card .card-name,.gallery-card .card-name{display:flex;align-items:center;min-height:2.9em;line-height:1.45;margin:0;text-align:left}.gallery-card .card-name{justify-content:center;text-align:center}.card-title{color:var(--muted);font-size:0.8125rem;line-height:1.55;margin:4px 0;overflow-wrap:anywhere}.gallery-card .summary,.gallery-card .card-title{text-align:center}.profile-heading{min-height:88px;display:flex;flex-direction:column;justify-content:center;gap:4px;margin:16px 0 22px}.profile-heading h1{margin:0}.profile-heading p{margin:0}.color-settings{justify-content:space-between;flex-wrap:nowrap;gap:8px}.theme-choices{display:flex;align-items:center;gap:6px;margin-left:auto}.color-settings strong{white-space:nowrap}.folder-bar .button{font-size:0.75rem;white-space:nowrap;padding:9px 10px}.folder-bar select{font:inherit;font-size:0.8125rem}.has-unread strong{color:var(--accent)}.alert-row{position:relative;display:flex;flex-wrap:wrap;gap:5px}.alert-row .alert{flex:1;min-width:0;padding-right:25px}.alert-dismiss{position:absolute;right:4px;top:2px;font-size:1.25rem;color:var(--muted);padding:2px 7px}.alert-row .button,.alert-row .quiet{font-size:0.75rem;padding:6px 10px}\n\n/* 0.10: centered daily feature with portrait orbit effects. */\n.daily-pick h2{text-align:center}.daily-pick .card-name{justify-content:center;text-align:center}.daily-pick .card-title,.daily-pick .tags,.daily-pick small{text-align:center}.daily-pick .card{overflow:visible}.daily-pick .rail{overflow:visible;padding:24px 10px 10px}.daily-portrait{position:relative;margin-bottom:10px}.daily-portrait .art{margin:0;box-shadow:0 8px 30px #6656ec18}.daily-effects{position:absolute;inset:-20px;pointer-events:none}.daily-effects>span{position:absolute;left:calc(8% + var(--i)*12%);top:calc(12% + var(--i)*10%);width:13px;height:13px;animation:daily-shimmer 3.6s ease-in-out infinite;animation-delay:calc(var(--i)*-.48s);filter:drop-shadow(0 0 5px #b4a2ff88)}.daily-star{background:linear-gradient(145deg,#d9cbff,#8e77f1);clip-path:polygon(50% 0,62% 36%,100% 50%,62% 64%,50% 100%,38% 64%,0 50%,38% 36%)}.daily-heart{background:#efa2be;clip-path:path('M 6.5 12 C 4 9 0 7 0 3.8 C 0 0 4.5 -1 6.5 2 C 8.5 -1 13 0 13 3.8 C 13 7 9 9 6.5 12 Z')}.daily-effects>span:nth-child(2){left:90%;top:4%}.daily-effects>span:nth-child(3){left:-1%;top:44%}.daily-effects>span:nth-child(4){left:98%;top:50%}.daily-effects>span:nth-child(5){left:13%;top:98%}.daily-effects>span:nth-child(6){left:84%;top:91%}.daily-effects>span:nth-child(7){left:5%;top:6%}.daily-effects>span:nth-child(8){left:52%;top:-3%}@keyframes daily-shimmer{0%,100%{opacity:.15;transform:translateY(5px) scale(.6) rotate(-12deg)}45%{opacity:.95;transform:translateY(-7px) scale(1.1) rotate(12deg)}70%{opacity:.45;transform:translateY(-2px) scale(.8) rotate(0)}}@media(prefers-reduced-motion:reduce){.daily-effects>span{animation:none;opacity:.65}}\n\n/* Horizontal toast dismissal does not participate in tab swipes or unread state. */\n.alert-row{touch-action:pan-y;will-change:auto}.alert-row:active{user-select:none}\n\n:host([data-suspended]) .daily-effects>span{animation-play-state:paused!important}.daily-effects>span{filter:none}\n\n/* 0.13: compact labels, static engine accent and plain avatar loading surfaces. */\n.app{--accent:var(--mft-user-accent,#6656ec);--banner:var(--mft-user-banner,#e6e2fa)}.app[data-dark=true]{--accent:var(--mft-user-accent,#7969fa);--banner:var(--mft-user-banner,#272042)}\n.card .card-name,.gallery-card .card-name{min-height:1.45em}.card-title{margin-top:2px;margin-bottom:0}.art,.hero,.round{background:var(--accent);color:transparent}.persona-folder h2{margin-bottom:12px}.persona-folder .gallery{margin-top:10px}.mode-tab{position:relative}.mode-unread{display:inline-block;vertical-align:middle;margin-left:5px;padding:0 5px;min-width:17px;border-radius:9px;background:var(--accent);color:white;font-size:0.625rem;line-height:17px}\n.daily-heart{background:color-mix(in srgb,var(--accent) 35%,#efa2be)}.daily-star{background:color-mix(in srgb,var(--accent) 60%,#fff)}\n\n/* 0.14: inherit the engine/user typography and make preferences local to My. */\n:host{font-family:inherit!important;font-size:inherit!important}.app{font-family:var(--font-user,inherit);font-size:1rem}\n.theme-preferences{margin:12px 0 24px}.preference-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid var(--line)}.preference-controls{display:flex;align-items:center;gap:8px}.main-color{width:36px;height:32px;padding:2px;border:1px solid var(--line);border-radius:9px;background:var(--surface);cursor:pointer}.preference-controls .quiet{font-size:.8125rem;padding:6px 8px}.banner-toggle{accent-color:var(--accent);width:18px;height:18px;margin:0}\n.persona-folder{margin-block:28px 34px}.persona-folder+.persona-folder{padding-top:20px;border-top:1px solid var(--line)}.persona-folder h2{margin:0 0 16px}.persona-folder .gallery{row-gap:32px;column-gap:16px;margin-top:0}.gallery-card{padding-bottom:6px}.gallery-card .art{margin-bottom:10px}\n.brand-group{flex:1;min-width:0;gap:4px}.brand{min-width:0;flex:0 1 auto}.brand-logo{flex:none}.refresh-icon{width:22px;height:22px;padding:3px;flex:0 0 22px}.refresh-icon svg{width:14px;height:14px}@media(max-width:360px){.refresh-icon{width:20px;height:20px;flex-basis:20px;padding:3px}.refresh-icon svg{width:13px;height:13px}}\n\n/* 0.15: in-app pointer/keyboard color picker; engine writes only on Apply. */\n.color-picker[hidden]{display:none}.color-picker{padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--card);max-width:420px;margin:10px 0 18px}.color-trigger{width:36px;height:32px;border:2px solid var(--line);border-radius:9px;padding:0;cursor:pointer}.color-plane{height:180px;position:relative;border-radius:10px;background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent),var(--picker-hue);touch-action:none;cursor:crosshair;outline-offset:3px}.color-point{position:absolute;width:14px;height:14px;border:2px solid white;border-radius:50%;box-shadow:0 0 0 1px #333;transform:translate(-50%,-50%);pointer-events:none}.hue-slider{width:100%;height:18px;margin:16px 0;appearance:none;border-radius:10px;background:linear-gradient(to right,red,#ff0,#0f0,#0ff,#00f,#f0f,red)}.hue-slider::-webkit-slider-thumb{appearance:none;width:22px;height:22px;background:white;border:1px solid #777;border-radius:50%}.hue-slider::-moz-range-thumb{width:20px;height:20px;background:white;border:1px solid #777;border-radius:50%}.color-fields{display:flex;gap:5px;align-items:center}.color-fields input{font:inherit;min-width:0;padding:7px 4px;border:1px solid var(--line);border-radius:7px;background:var(--surface);color:var(--ink);width:46px}.color-fields .main-color{width:86px;height:auto;font-size:.8125rem}.color-preview{width:24px;height:24px;flex:none;border-radius:50%;border:1px solid var(--line)}.color-presets{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px}.color-swatch{width:23px;height:23px;border-radius:50%;border:1px solid var(--line);padding:0}.picker-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.home-folder{margin-block:28px}\n.picker-actions .primary{width:auto;margin:0;padding:9px 18px}.color-fields input{width:38px}.color-fields .main-color{width:74px}.color-picker{background:var(--bg)}\n\n.color-fields{align-items:flex-end}.color-field{display:flex;flex-direction:column;min-width:0;gap:3px}.color-field>span{font-size:.625rem;color:var(--muted)}.color-fields input{font-size:.75rem;appearance:textfield;-moz-appearance:textfield}.color-fields input::-webkit-inner-spin-button,.color-fields input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.color-preview{margin-bottom:7px}\n\n/* 0.18: keep the two equal chat choices, slightly reduce vertical space. */\n.chat-switch{padding:3px;margin-block:9px}.chat-switch>button{padding-block:7px;line-height:1.4}\n\n/* 0.21: persona gallery uses the same left-aligned text as Home. */\n.persona-folder .gallery-card .card-name{justify-content:flex-start;text-align:left}.persona-folder .gallery-card :is(.card-title,.tags,.summary){text-align:left}\n.home-folder,.unfiled{padding-top:20px;border-top:1px solid var(--line);margin-top:28px}\n\n\n/* 0.23: gallery = grid; scroll = horizontal portrait rail. */\n.view-select{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px 10px;max-width:50%;min-width:0}.view-preference strong{min-width:0}\nmain[data-catalog-view=\"gallery\"] .shelf:not(.daily-pick) .rail{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px;overflow:visible}\nmain[data-catalog-view=\"gallery\"] .shelf:not(.daily-pick) .card{width:100%;min-width:0;flex-basis:auto}\nmain[data-catalog-view=\"scroll\"] .persona-folder .gallery{display:flex;overflow-x:auto;gap:16px;scroll-snap-type:x proximity;overscroll-behavior-x:contain;scrollbar-width:none;padding-bottom:8px}\nmain[data-catalog-view=\"scroll\"] .persona-folder .gallery-card{flex:0 0 44%;width:44%;min-width:0;scroll-snap-align:start}\n@media(min-width:1024px){main[data-catalog-view=\"gallery\"] .shelf:not(.daily-pick) .rail{grid-template-columns:repeat(4,minmax(0,1fr))}main[data-catalog-view=\"scroll\"] .persona-folder .gallery-card{flex-basis:23%;width:23%}}\n.spacing-setting{display:grid;grid-template-columns:1fr auto;gap:10px;margin:22px 0;font:inherit}.spacing-setting input{grid-column:1/-1;width:100%;accent-color:var(--accent)}.spacing-setting output{grid-row:1;grid-column:2;color:var(--muted)}.typography-preview{padding:16px;border:1px solid var(--line);border-radius:14px;white-space:pre-line;letter-spacing:var(--chat-letter-spacing,0px);line-height:var(--chat-line-height,1.8)}\n\n.typography-preview{padding-inline:var(--rp-text-padding,16px)}\n\n/* 0.29: three consistent design groups. */\n.theme-preferences{display:grid;gap:18px}.design-group{border:1px solid var(--line);border-radius:16px;background:var(--bg);padding:16px;min-width:0}.design-group h2{font-size:1rem;margin:0 0 6px}.design-description{color:var(--muted);font-size:.8125rem;line-height:1.6;margin:0 0 12px}.design-group .preference-row{padding:12px 0}.design-group .preference-row:last-child{border-bottom:0}.design-group .spacing-setting{margin:0;padding:14px 0;border-bottom:1px solid var(--line)}.design-group .typography-preview{margin:16px 0 0}.typography-preview p{margin:0}.translation-size-preview{margin-top:10px!important;font-size:max(1px,calc(1em - var(--translation-reduction,0px)));color:var(--muted)}\n\n.page-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}\n.page-heading h1{min-width:0;margin-right:auto}\n.help-open{flex-shrink:0;font:inherit;color:var(--accent);white-space:nowrap}\n.help-content{max-width:760px;margin-inline:auto;overflow-wrap:anywhere}\n.help-content h2{margin-top:1.5em}\n.help-content p,.help-content li{line-height:1.7}\n.help-content pre{overflow-x:auto;max-width:100%;padding:12px;background:var(--surface);border-radius:12px}\n.help-content a{color:var(--accent);text-decoration:underline}\n";
    } },
    { order: 700, run() {
      deps.ui.state.shadow.append(deps.ui.state.css);
    } },
    { order: 900, run() {
      deps.ui.state.body.className = 'app';
    } },
    { order: 1000, run() {
      deps.ui.state.shadow.append(deps.ui.state.body);
    } },
    { order: 1103, run() {
      mftModuleState.timers = new Set();
    } },
    { order: 1300, run() {
      mftModuleState.disposed = false;
    } },
    { order: 1301, run() {
      mftModuleState.epoch = 0;
    } },
    { order: 14500, run() {
      mftModuleState.bootstrapTimers = new Set();
    } }
  ];
  const cleanup = [
    { order: 0, run() {
      mftModuleState.disposed = true;
    } },
    { order: 17, run() {
      for (const n of document.querySelectorAll('[data-mft-hint]')) {
        if (n.dataset.mftOldTitle) n.title = n.dataset.mftOldTitle;else n.removeAttribute('title');
        delete n.dataset.mftOldTitle;
        delete n.dataset.mftHint;
      }
    } },
    { order: 22, run() {
      document.querySelectorAll('.mft-writing-tools').forEach(n => n.remove());
    } },
    { order: 25, run() {
      document.querySelectorAll('[data-mft-writing]').forEach(n => n.removeAttribute('data-mft-writing'));
    } },
    { order: 42, run() {
      stop();
    } },
    { order: 55, run() {
      for (const t of mftModuleState.bootstrapTimers) clearTimeout(t);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, later, stop, bindLater };
}

// Source: src/engine/navigation.js
/** navigation: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createNavigation(deps) {
  const mftModuleState = {
    engineHomeIntent: undefined,
    agentActive: undefined,
    bridgeBusy: undefined,
    view: undefined,
    returnView: undefined,
    nativeGrace: undefined,
    nativeOrigin: undefined,
    restoreScrollTarget: undefined,
    navController: undefined,
    routeIntent: undefined,
    roomId: undefined,
    expectedEnginePops: undefined,
    expectedEnginePopUntil: undefined,
    engineOverlayOwned: undefined
  };

  function waitEngine(test, signal, ms = 8000) {
    return new Promise((resolve, reject) => {
      const shell = document.querySelector('[data-component="AppShell"]') || document.body;
      let observer, timeout;
      function finish(error, value) {
        observer?.disconnect();
        clearTimeout(timeout);
        signal?.removeEventListener('abort', cancel);
        error ? reject(error) : resolve(value);
      }
      function check() {
        if (signal?.aborted) return cancel();
        try {
          const r = test();
          if (r) finish(null, r);
        } catch (e) {
          finish(e);
        }
      }
      function cancel() {
        finish(new DOMException('Cancelled', 'AbortError'));
      }
      observer = new MutationObserver(check);
      observer.observe(shell, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-chat-mode', 'data-chat-id', 'aria-hidden', 'data-chat-surface-active']
      });
      timeout = setTimeout(() => finish(Error('화면 연결이 완료되지 않았어요. 다시 시도해 주세요.')), ms);
      signal?.addEventListener('abort', cancel, {
        once: true
      });
      check();
    });
  }
  
  function beginRoute(intent) {
    if (intent !== 'theme' && deps.ui.state.root.dataset.native !== 'true') mftModuleState.nativeOrigin = {
      view: mftModuleState.view,
      card: deps.catalog.state.detailCard,
      scroll: deps.ui.state.main.scrollTop,
      chatMode: deps.chats.state.chatMode,
      chatsAll: deps.chats.state.chatsAll,
      folderFilter: deps.chats.state.folderFilter
    };
    mftModuleState.navController?.abort();
    mftModuleState.navController = new AbortController();
    deps.core.stop();
    mftModuleState.routeIntent = intent;
    mftModuleState.bridgeBusy = true;
    deps.history.state.nativeBackArmed = false;
    deps.ui.own();
    deps.ui.state.html.classList.add('mft-transition');
    deps.ui.notice('화면을 여는 중…');
    return mftModuleState.navController.signal;
  }
  
  function finishRoute(intent) {
    mftModuleState.bridgeBusy = false;
    mftModuleState.routeIntent = intent;
    deps.ui.state.html.toggleAttribute('data-mft-agent', intent === 'agent');
    deps.ui.state.html.dataset.mftNativeLayer = intent;
    deps.ui.native();
    deps.ui.state.html.classList.remove('mft-transition');
    deps.ui.notice('');
    deps.history.armNativeBack();
    deps.nativeUi.bindNativeUi();
    if (intent === 'chat') {
      deps.notifications.acknowledgeUnread(mftModuleState.roomId);
      deps.chats.rememberChatVisit(mftModuleState.roomId);
      deps.avatars.scheduleCrops();
      deps.convo.bindSplits();
    }
    deps.history.installBackWatcher();
  }
  
  function routeFailure(error, retry) {
    if (error.name === 'AbortError') return;
    deps.ui.state.html.classList.remove('mft-transition');
    mftModuleState.bridgeBusy = false;
    mftModuleState.routeIntent = 'own';
    deps.ui.notice(error.message);
    const b = deps.ui.button('연결 다시 시도', retry, 'button');
    deps.ui.state.main.append(b);
  }
  
  async function actionsReady(signal) {
    return waitEngine(() => {
      const a = deps.adapter.engineActions();
      return a.setActiveChatId && a.openRightPanel && a.setSidebarOpen && a.closeAllDetails && a.closeRightPanel ? a : null;
    }, signal, 2500);
  }
  
  function clearLayers(a) {
    if (history.state?.marinaraOverlay) {
      mftModuleState.expectedEnginePops = 1;
      mftModuleState.expectedEnginePopUntil = Date.now() + 1500;
      deps.core.bindLater(() => {
        if (Date.now() >= mftModuleState.expectedEnginePopUntil) mftModuleState.expectedEnginePops = 0;
      }, 1550);
    }
    mftModuleState.engineOverlayOwned = false;
    a.closeAllDetails();
    a.closeRightPanel();
    a.setSidebarOpen(false);
  }
  
  async function openNative(key) {
    const signal = beginRoute('panel');
    try {
      const a = await actionsReady(signal);
      if (signal.aborted) return false;
      clearLayers(a);
      if (key === 'chats') {
        if (a.requestChatModeShortcut) a.requestChatModeShortcut(deps.chats.state.chatMode);else a.setSidebarOpen(true);
      } else a.openRightPanel(key);
      await waitEngine(() => key === 'chats' ? [...document.querySelectorAll('[data-component="ChatSidebar"]')].find(deps.ui.state.visible) : document.querySelector(`[data-panel-key="${CSS.escape(key)}"][aria-hidden="false"]`), signal);
      if (signal.aborted) return false;
      finishRoute('panel');
      return true;
    } catch (e) {
      routeFailure(e, () => openNative(key));
      return false;
    }
  }
  
  async function bridge(kind, item, start = false) {
    const signal = beginRoute(kind === 'chat' ? 'chat' : 'detail');
    deps.avatars.state.nativeCharacterIds = kind === 'chat' ? item.characterIds || [] : [item.id];
    try {
      const fast = deps.adapter.engineNavigator();
      if (!start && kind !== 'chat' && fast) {
        fast({
          kind: 'resource',
          resource: kind === 'persona' ? 'persona' : 'character',
          id: item.id
        });
        await waitEngine(() => [...document.querySelectorAll('.mari-editor-shell,[data-component="MobileDetailSheet"]')].find(n => !n.closest('[aria-hidden="true"]')), signal);
        if (!signal.aborted) finishRoute('detail');
        return;
      }
      const a = await actionsReady(signal);
      if (signal.aborted) return false;
      clearLayers(a);
      if (kind === 'chat') {
        deps.chats.state.chatMode = item.mode || deps.chats.state.chatMode;
        deps.adapter.prepareChat(a);
        if (!item.fromNotification || !deps.notifications.nativeNotificationAction(item.id, 'onNavigate')) a.setActiveChatId(item.id);
        await waitEngine(() => deps.adapter.roomReady(item.id, item.mode || 'conversation'), signal);
        if (signal.aborted) return;
        mftModuleState.roomId = item.id;
        finishRoute('chat');
      } else {
        if (kind === 'persona' && !a.openPersonaDetail) {
          a.openRightPanel('personas');
          await waitEngine(() => deps.adapter.engineActions().openPersonaDetail, signal, 5000);
          Object.assign(a, deps.adapter.engineActions());
          a.closeRightPanel();
        }
        if (start && !a.openModal || !start && !a.openCharacterDetail) {
          a.openRightPanel('characters');
          await waitEngine(() => {
            const next = deps.adapter.engineActions();
            return next.openModal && next.openCharacterDetail ? next : null;
          }, signal, 5000);
          Object.assign(a, deps.adapter.engineActions());
          a.closeRightPanel();
        }
        if (signal.aborted) return;
        if (start) {
          const active = deps.adapter.activeSession();
          const previousRoomId = active.known ? active.id : deps.adapter.chatSurface()?.id || null;
          a.setActiveChatId(null);
          mftModuleState.routeIntent = 'start';
          deps.ui.state.html.classList.remove('mft-transition');
          mftModuleState.bridgeBusy = false;
          deps.ui.native();
          deps.ui.state.html.dataset.mftNativeLayer = 'start';
          deps.ui.notice('');
          a.openModal('start-character-chat', {
            characterId: item.id,
            characterName: item.name
          });
          deps.launch.begin(signal, previousRoomId);
        } else {
          const navigate = deps.adapter.engineNavigator();
          if (navigate) navigate({
            kind: 'resource',
            resource: kind === 'persona' ? 'persona' : 'character',
            id: item.id
          });else if (kind === 'persona') a.openPersonaDetail(item.id);else a.openCharacterDetail(item.id);
          await waitEngine(() => [...document.querySelectorAll('[data-component="MobileDetailSheet"],[data-component="DetailEditor"],.mari-editor-shell')].find(n => !n.closest('[aria-hidden="true"]')), signal);
          finishRoute('detail');
        }
      }
    } catch (e) {
      routeFailure(e, () => bridge(kind, item, start));
    }
  }
  
  function engineHome() {
    const a = deps.adapter.engineActions();
    if (!a.setActiveChatId) return false;
    clearLayers(a);
    a.setActiveChatId(null);
    mftModuleState.roomId = null;
    return true;
  }
  
  async function settings(tab, done) {
    const signal = beginRoute('panel');
    try {
      const a = await actionsReady(signal);
      if (signal.aborted) return false;
      clearLayers(a);
      a.openRightPanel('settings');
      await waitEngine(() => deps.adapter.engineActions().setSettingsTab, signal, 5000);
      deps.adapter.engineActions().setSettingsTab(tab);
      await waitEngine(() => document.getElementById('settings-tab-' + tab), signal);
      finishRoute('panel');
      if (done) deps.extensions.retryNative(done);
    } catch (e) {
      routeFailure(e, () => settings(tab, done));
    }
  }
  
  function go(k, fromHistory = false) {
    mftModuleState.nativeOrigin = null;
    if (k !== 'home') {
      deps.history.state.exitUntil = 0;
      clearTimeout(deps.history.state.exitTimer);
      deps.core.state.timers.delete(deps.history.state.exitTimer);
    }
    if (deps.ui.state.root.dataset.native === 'true') {
      deps.data.state.cache.clear();
      deps.extensions.state.installedMetaAt = 0;
      if (!mftModuleState.bridgeBusy) engineHome();
    }
    mftModuleState.navController?.abort();
    deps.ui.state.html.classList.remove('mft-transition');
    mftModuleState.routeIntent = 'own';
    mftModuleState.roomId = null;
    mftModuleState.agentActive = false;
    deps.ui.state.html.removeAttribute('data-mft-agent');
    mftModuleState.bridgeBusy = false;
    deps.history.state.nativeBackArmed = false;
    if (!fromHistory && !mftModuleState.expectedEnginePops) deps.history.remember({
      kind: 'tab',
      tab: k
    });
    deps.core.stop();
    mftModuleState.view = k;
    deps.ui.own();
    deps.convo.bindSplits();
    deps.ui.notice('');
    for (const [key, b] of deps.ui.state.tabs) {
      b.dataset.active = String(key === (['design', 'help'].includes(k) ? 'my' : k));
      if (key === (['design', 'help'].includes(k) ? 'my' : k)) b.setAttribute('aria-current', 'page');else b.removeAttribute('aria-current');
    }
    deps.ui.state.main.scrollTop = 0;
    if (k === 'home') deps.catalog.loadHome();else {
      deps.extensions.homeAgents(deps.ui.state.headerAgents);
      if (k === 'chats') deps.chats.chats();else if (k === 'design') deps.hub.designScreen();else if (k === 'help') deps.help.show();else deps.hub.hub(k);
    }
    deps.history.installBackWatcher();
  }
  // The action adapter is resolved on explicit navigation. Message observation is scoped to active split rendering.
  
  function onModeClick(e) {
    // The native launch flow owns mode selection and setup until it is complete.
    if (mftModuleState.routeIntent === 'start') return;
    if (deps.ui.state.root.dataset.native === 'true' && mftModuleState.routeIntent !== 'chat') queueMicrotask(deps.nativeUi.bindNativeUi);
    const sidebarClose = e.target.closest?.('[data-component="ChatSidebar"] .mari-sidebar-header button:has(svg.lucide-x)');
    if (sidebarClose) {
      if (mftModuleState.routeIntent !== 'chat') {
        deps.data.state.cache.clear();
        queueMicrotask(() => go('chats', true));
      }
      return;
    }
    const close = e.target.closest?.('.mari-right-panel-header button');
    if (close?.querySelector('svg.lucide-x')) {
      if (mftModuleState.routeIntent !== 'chat') queueMicrotask(deps.gestures.returnFromNative);
      return;
    }
    if (deps.ui.state.root.dataset.native === 'true' && e.target.closest?.('button,[role="tab"]')) {
      if (mftModuleState.routeIntent === 'chat' && e.target.closest('[data-message-id],.mari-modal,[role="dialog"]')) return;
      deps.avatars.scheduleCrops();
      deps.core.later(() => {
        if (mftModuleState.agentActive || mftModuleState.bridgeBusy || deps.ui.state.root.dataset.native !== 'true') return;
        if ([...document.querySelectorAll('[aria-hidden="false"][data-panel-key],[role="dialog"],[data-component="ChatSidebar"]')].some(deps.ui.state.visible)) return;
        if (deps.ui.state.visible(document.querySelector('[data-chat-mode]'))) {
          mftModuleState.routeIntent = 'chat';
          const nextId = document.querySelector('[data-chat-composer]')?.dataset.chatId || mftModuleState.roomId;
          if (nextId !== mftModuleState.roomId) deps.chats.rememberChatVisit(nextId);
          mftModuleState.roomId = nextId;
          deps.convo.bindSplits();
          deps.history.armNativeBack();
        }
      }, 400);
    }
  }

  const initialize = [
    { order: 1200, run() {
      mftModuleState.engineHomeIntent = false;
    } },
    { order: 1202, run() {
      mftModuleState.agentActive = false;
    } },
    { order: 1203, run() {
      mftModuleState.bridgeBusy = false;
    } },
    { order: 1304, run() {
      mftModuleState.view = 'home';
    } },
    { order: 1305, run() {
      mftModuleState.returnView = 'home';
    } },
    { order: 1306, run() {
      mftModuleState.nativeGrace = 0;
    } },
    { order: 7400, run() {
      mftModuleState.nativeOrigin = null;
    } },
    { order: 7401, run() {
      mftModuleState.restoreScrollTarget = null;
    } },
    { order: 7500, run() {
      mftModuleState.navController = null;
    } },
    { order: 7501, run() {
      mftModuleState.routeIntent = 'own';
    } },
    { order: 7502, run() {
      mftModuleState.roomId = null;
    } },
    { order: 7503, run() {
      mftModuleState.expectedEnginePops = 0;
    } },
    { order: 7504, run() {
      mftModuleState.expectedEnginePopUntil = 0;
    } },
    { order: 7505, run() {
      mftModuleState.engineOverlayOwned = false;
    } },
    { order: 16100, run() {
      document.addEventListener('load', deps.avatars.onImageLoad, true);
    } },
    { order: 16200, run() {
      document.addEventListener('click', onModeClick, true);
    } }
  ];
  const cleanup = [
    { order: 40, run() {
      mftModuleState.navController?.abort();
    } },
    { order: 45, run() {
      document.removeEventListener('click', onModeClick, true);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, waitEngine, beginRoute, finishRoute, routeFailure, actionsReady, clearLayers, openNative, bridge, engineHome, settings, go, onModeClick };
}

// Source: src/engine/history.js
/** history: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createHistory(deps) {
  const mftModuleState = {
    nativeBackArmed: undefined,
    historyOwned: undefined,
    historyToken: undefined,
    closeWatcher: undefined,
    exitUntil: undefined,
    exitTimer: undefined
  };

  function armNativeBack() {
    if (deps.ui.state.root.dataset.native !== 'true' || deps.core.state.disposed) return;
    if (history.state?.marinaraOverlay) {
      deps.navigation.state.engineOverlayOwned = deps.navigation.state.routeIntent !== 'chat';
      if (deps.navigation.state.engineOverlayOwned) mftModuleState.nativeBackArmed = false;
      return;
    }
    deps.navigation.state.engineOverlayOwned = false;
    try {
      const state = {
        mft: mftModuleState.historyToken,
        route: {
          kind: 'native'
        }
      };
      if (history.state?.mft === mftModuleState.historyToken) history.replaceState({
        ...history.state,
        ...state
      }, '');else history.pushState(state, '');
      mftModuleState.nativeBackArmed = true;
      mftModuleState.historyOwned = true;
    } catch {}
  }
  
  function remember(route) {
    if (deps.core.state.disposed) return;
    try {
      const current = history.state;
      if (current?.mft === mftModuleState.historyToken) {
        history.replaceState({
          ...current,
          route
        }, '');
      } else {
        history.pushState({
          mft: mftModuleState.historyToken,
          route
        }, '');
      }
      mftModuleState.historyOwned = true;
    } catch {}
  }
  
  function onBack(event) {
    if (Date.now() < mftModuleState.exitUntil && deps.ui.state.root.dataset.native !== 'true' && deps.navigation.state.view === 'home') return;
    if (deps.navigation.state.routeIntent === 'start') return;
    if (deps.navigation.state.routeIntent === 'extension' && document.querySelector('[role="dialog"],.mari-modal')) return;
    if (deps.navigation.state.expectedEnginePops && Date.now() < deps.navigation.state.expectedEnginePopUntil) {
      deps.navigation.state.expectedEnginePops--;
      return;
    }
    deps.navigation.state.expectedEnginePops = 0;
    if (deps.navigation.state.bridgeBusy) return;
    if (deps.ui.state.root.dataset.native === 'true') {
      // A native popup cleanup pops its sentinel back onto our room entry. It is
      // not a room back press: leave it to the engine's pendingSelfPops handler.
      if (event.state?.marinaraOverlay || event.state?.mft === mftModuleState.historyToken && event.state.route?.kind === 'native') {
        deps.navigation.state.engineOverlayOwned = false;
        return;
      }
      if (deps.navigation.state.engineOverlayOwned) {
        deps.navigation.state.engineOverlayOwned = false;
        queueMicrotask(() => {
          if (!deps.core.state.disposed) {
            deps.gestures.returnFromNative();
          }
        });
        return;
      }
      // Let engine overlay sentinels dismiss inner dialogs first; room sentinel belongs to this extension.
  
      event.stopImmediatePropagation();
      mftModuleState.nativeBackArmed = false;
      deps.gestures.returnFromNative();
      return;
    }
    if (['design', 'help'].includes(deps.navigation.state.view)) {
      event.stopImmediatePropagation();
      deps.navigation.go('my', true);
      return;
    }
    if (deps.navigation.state.view === 'personas') {
      event.stopImmediatePropagation();
      deps.navigation.go('create', true);
      return;
    }
    if (deps.navigation.state.view === 'detail' && deps.catalog.state.detailCard?.isPersona) {
      event.stopImmediatePropagation();
      deps.catalog.personaGallery();
      return;
    }
    if (!mftModuleState.historyOwned) return;
    event.stopImmediatePropagation();
    mftModuleState.historyOwned = false;
    const r = event.state?.mft === mftModuleState.historyToken ? event.state.route : null;
    if (r?.kind === 'detail') deps.catalog.detail(r.card, true);else deps.navigation.go(r?.tab || 'home', true);
  }
  
  function onNativeHome(event) {
    const b = event.target.closest?.('[data-component="TopBar"] [data-topbar-hover-key="home"]');
    if (!b || deps.navigation.state.engineHomeIntent || deps.navigation.state.routeIntent === 'extension') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    deps.navigation.go('home');
  }
  
  function installBackWatcher() {
    mftModuleState.closeWatcher?.destroy();
    mftModuleState.closeWatcher = null;
    if (deps.core.state.disposed || !deps.gestures.state.phone.matches || typeof window.CloseWatcher !== 'function' || Date.now() < mftModuleState.exitUntil) return;
    try {
      mftModuleState.closeWatcher = new CloseWatcher();
      mftModuleState.closeWatcher.addEventListener('close', () => {
        mftModuleState.closeWatcher = null;
        const modal = [...document.querySelectorAll('.mari-modal')].filter(deps.ui.state.visible).at(-1);
        const close = modal?.querySelector('button:has(svg.lucide-x)');
        if (close) {
          if (history.state?.marinaraOverlay) {
            deps.navigation.state.expectedEnginePops++;
            deps.navigation.state.expectedEnginePopUntil = Date.now() + 75;
          }
          close.click();
          queueMicrotask(installBackWatcher);
          return;
        }
        if (deps.ui.state.root.dataset.native === 'true' || deps.navigation.state.view !== 'home') {
          if (deps.ui.state.root.dataset.native === 'true') deps.gestures.returnFromNative();else if (deps.navigation.state.view === 'detail' && deps.catalog.state.detailCard?.isPersona) deps.catalog.personaGallery();else if (['design', 'help'].includes(deps.navigation.state.view)) deps.navigation.go('my', true);else if (deps.navigation.state.view === 'personas') deps.navigation.go('create', true);else deps.navigation.go('home', true);
          queueMicrotask(installBackWatcher);
        } else {
          mftModuleState.exitUntil = Date.now() + 2200;
          deps.ui.notice('뒤로가기를 한 번 더 누르면 종료합니다.');
          if (history.state?.mft === mftModuleState.historyToken) queueMicrotask(() => history.back());
          mftModuleState.exitTimer = deps.core.later(() => {
            mftModuleState.exitUntil = 0;
            deps.ui.notice('');
            installBackWatcher();
          }, 2200);
        }
      });
    } catch {}
  }

  const initialize = [
    { order: 1201, run() {
      mftModuleState.nativeBackArmed = false;
    } },
    { order: 13500, run() {
      mftModuleState.historyOwned = false;
    } },
    { order: 13600, run() {
      mftModuleState.historyToken = 'mft-' + Date.now();
    } },
    { order: 13900, run() {
      window.addEventListener('popstate', onBack, true);
    } },
    { order: 14100, run() {
      document.addEventListener('click', onNativeHome, true);
    } },
    { order: 23200, run() {
      mftModuleState.closeWatcher = null;
    } },
    { order: 23201, run() {
      mftModuleState.exitUntil = 0;
    } },
    { order: 23202, run() {
      mftModuleState.exitTimer = null;
    } }
  ];
  const cleanup = [
    { order: 35, run() {
      mftModuleState.closeWatcher?.destroy();
    } },
    { order: 56, run() {
      window.removeEventListener('popstate', onBack, true);
    } },
    { order: 57, run() {
      document.removeEventListener('click', onNativeHome, true);
    } },
    { order: 71, run() {
      if (history.state?.mft === mftModuleState.historyToken) {
        const {
          mft,
          route,
          ...rest
        } = history.state;
        history.replaceState(rest, '');
      }
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, armNativeBack, remember, onBack, onNativeHome, installBackWatcher };
}

// Source: src/features/avatars.js
/** avatars: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createAvatars(deps) {
  const mftModuleState = {
    nativeCharacterIds: undefined,
    imageObserver: undefined,
    cropTimer: undefined,
    cropRequest: undefined,
    cropOriginals: undefined,
    nativeCrops: undefined
  };

  function observeImages() {
    if (deps.navigation.state.restoreScrollTarget?.view === deps.navigation.state.view) {
      deps.ui.state.main.scrollTop = deps.navigation.state.restoreScrollTarget.scroll;
      deps.navigation.state.restoreScrollTarget = null;
    }
    if (!mftModuleState.imageObserver) mftModuleState.imageObserver = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) {
        const im = e.target;
        im.src = im.dataset.src;
        im.removeAttribute('data-src');
        mftModuleState.imageObserver.unobserve(im);
      }
    }, {
      root: deps.ui.state.main,
      rootMargin: '80px'
    });
    deps.ui.state.main.querySelectorAll('img[data-src]').forEach(n => mftModuleState.imageObserver.observe(n));
  }
  
  function cropStyle(im, crop) {
    if (!crop || typeof crop !== 'object') return;
    const finite = v => typeof v === 'number' && Number.isFinite(v);
    if (['srcX', 'srcY', 'srcWidth', 'srcHeight'].every(k => finite(crop[k]))) {
      const {
        srcX: x,
        srcY: y,
        srcWidth: w,
        srcHeight: h
      } = crop;
      if (w < .01 || h < .01 || w > 1 || h > 1 || x < 0 || y < 0 || x + w > 1.001 || y + h > 1.001) return;
      Object.assign(im.style, {
        width: 100 / w + '%',
        height: 100 / h + '%',
        left: -x / w * 100 + '%',
        top: -y / h * 100 + '%',
        maxWidth: 'none',
        maxHeight: 'none',
        objectFit: 'fill'
      });
    } else if (finite(crop.zoom) && crop.zoom >= 1 && crop.zoom <= 20) {
      const x = finite(crop.offsetX) ? Math.max(-100, Math.min(100, crop.offsetX)) : 0,
        y = finite(crop.offsetY) ? Math.max(-100, Math.min(100, crop.offsetY)) : 0;
      if (crop.fullImage) im.style.objectFit = 'contain';
      if (crop.zoom > 1 || crop.fullImage) im.style.transform = `scale(${crop.zoom}) translate(${x}%, ${y}%)`;
    }
  }
  
  function avatar(path, name, cls = 'art', crop = null) {
    const wrap = deps.ui.state.el('div', cls);
    wrap.setAttribute('aria-label', name);
    if (path) {
      try {
        const u = new URL(path, location.origin);
        if (u.origin === location.origin && /^https?:$/.test(u.protocol)) {
          const im = deps.ui.state.el('img');
          im.alt = '';
          im.loading = 'lazy';
          im.decoding = 'async';
          im.dataset.src = u.href;
          cropStyle(im, crop);
          im.onerror = () => im.remove();
          wrap.append(im);
        }
      } catch {}
    }
    return wrap;
  }
  
  function scheduleCrops() {
    if (mftModuleState.cropTimer || deps.core.state.disposed || document.hidden || !document.querySelector('[data-chat-mode="roleplay"]')) return;
    mftModuleState.cropTimer = deps.core.later(() => {
      mftModuleState.cropTimer = null;
      refreshNativeCrops();
    }, 100);
  }
  
  function imageKey(path) {
    try {
      return new URL(path, location.origin).pathname;
    } catch {
      return '';
    }
  }
  // Match current persona identity and displayed photo before falling back to an older message snapshot.
  
  function applyNativeCrops() {
    for (const im of document.querySelectorAll('[data-chat-mode="roleplay"] :is(.mari-message-avatar,.rpg-avatar-panel,.rpg-avatar-panel-media,.mari-roleplay-avatar-panel-rail) img')) {
      const persona = deps.adapter.personaCropForImage(im),
        crop = persona.found ? persona.crop : mftModuleState.nativeCrops.get(imageKey(im.getAttribute('src')));
      if (!crop) continue;
      if (!mftModuleState.cropOriginals.has(im)) mftModuleState.cropOriginals.set(im, im.getAttribute('style'));
      im.style.inset = 'auto';
      cropStyle(im, crop);
      const frame = im.parentElement,
        box = frame?.getBoundingClientRect();
      if (box && Math.abs(box.width - box.height) > 1 && im.naturalWidth && im.naturalHeight && ['srcX', 'srcY', 'srcWidth', 'srcHeight'].every(k => Number.isFinite(crop[k])) && crop.srcWidth > 0 && crop.srcHeight > 0) {
        const scale = Math.max(box.width / (im.naturalWidth * crop.srcWidth), box.height / (im.naturalHeight * crop.srcHeight));
        const w = im.naturalWidth * scale,
          h = im.naturalHeight * scale;
        Object.assign(im.style, {
          width: w + 'px',
          height: h + 'px',
          left: (box.width - w * crop.srcWidth) / 2 - w * crop.srcX + 'px',
          top: (box.height - h * crop.srcHeight) / 2 - h * crop.srcY + 'px',
          objectFit: 'fill',
          transform: 'none'
        });
      }
      im.style.position = 'absolute';
      im.dataset.mftCrop = 'true';
    }
    for (const n of mftModuleState.cropOriginals.keys()) if (!n.isConnected) mftModuleState.cropOriginals.delete(n);
  }
  
  async function refreshNativeCrops() {
    if (deps.ui.state.root.dataset.native !== 'true') return;
    applyNativeCrops();
    const ids = [...new Set([...mftModuleState.nativeCharacterIds, ...[...document.querySelectorAll('[data-chat-mode="roleplay"] [data-card-css]')].map(n => n.dataset.cardCss).filter(Boolean)])].slice(0, 180);
    if (!ids.length) return;
    const key = ids.join(',');
    if (mftModuleState.nativeCrops.lastIds === key) {
      applyNativeCrops();
      return;
    }
    mftModuleState.cropRequest?.abort();
    const c = new AbortController();
    mftModuleState.cropRequest = c;
    try {
      const res = await fetch('/api/characters/summaries', {
        method: 'POST',
        credentials: 'same-origin',
        signal: c.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids
        })
      });
      if (!res.ok) return;
      const rows = await res.json();
      if (deps.core.state.disposed) return;
      for (const r of rows) if (r.avatarUrl && r.avatarCrop) mftModuleState.nativeCrops.set(imageKey(r.avatarUrl), r.avatarCrop);
      mftModuleState.nativeCrops.lastIds = key;
      applyNativeCrops();
    } catch (e) {/* Images retain the engine fallback on request failure. */} finally {
      if (mftModuleState.cropRequest === c) mftModuleState.cropRequest = null;
    }
  }
  
  function onImageLoad(e) {
    if (deps.ui.state.root.dataset.native === 'true' && e.target instanceof HTMLImageElement && e.target.closest('[data-chat-mode="roleplay"] :is(.mari-message-avatar,.rpg-avatar-panel,.rpg-avatar-panel-media,.mari-roleplay-avatar-panel-rail)')) scheduleCrops();
  }

  const initialize = [
    { order: 1204, run() {
      mftModuleState.nativeCharacterIds = [];
    } },
    { order: 1312, run() {
      mftModuleState.imageObserver = void 0;
    } },
    { order: 15200, run() {
      mftModuleState.cropTimer = null;
    } },
    { order: 15201, run() {
      mftModuleState.cropRequest = null;
    } },
    { order: 15300, run() {
      mftModuleState.cropOriginals = new Map();
    } },
    { order: 15301, run() {
      mftModuleState.nativeCrops = new Map();
    } }
  ];
  const cleanup = [
    { order: 43, run() {
      mftModuleState.cropRequest?.abort();
    } },
    { order: 44, run() {
      document.removeEventListener('load', onImageLoad, true);
    } },
    { order: 49, run() {
      for (const [n, old] of mftModuleState.cropOriginals) if (n.isConnected) {
        if (old === null) n.removeAttribute('style');else n.setAttribute('style', old);
        n.removeAttribute('data-mft-crop');
      }
    } },
    { order: 67, run() {
      mftModuleState.nativeCrops.clear();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, observeImages, cropStyle, avatar, scheduleCrops, imageKey, applyNativeCrops, refreshNativeCrops, onImageLoad };
}

// Source: src/features/catalog.js
/** catalog: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createCatalog(deps) {
  const mftModuleState = {
    searchTimer: undefined,
    pageOffset: undefined,
    query: undefined,
    filter: undefined,
    detailCard: undefined,
    personaOffset: undefined,
    personaSearch: undefined
  };

  function card(c) {
    const b = deps.ui.button('', () => detail(c), 'card');
    b.dataset.characterId = c.id;
    b.append(deps.avatars.avatar(c.avatarPath, c.name, 'art', c.avatarCrop), deps.ui.state.el('strong', 'card-name', c.name));
    if (c.title) b.append(deps.ui.state.el('p', 'card-title', c.title));
    if (c.tags.length) b.append(deps.ui.state.el('p', 'tags', c.tags.slice(0, 3).map(t => '#' + t).join(' ')));
    if (c.creator) b.append(deps.ui.state.el('small', 'muted', '@' + c.creator));
    return b;
  }
  
  function section(title, items) {
    const s = deps.ui.state.el('section', 'shelf');
    if (title) s.append(deps.ui.state.el('h2', '', title));
    const row = deps.ui.state.el('div', 'rail');
    items.forEach(c => row.append(card(c)));
    s.append(row);
    return s;
  }
  
  // Regroup cards without recreating loaded portraits or click handlers.
  function groupedSections(rows, groups, persona = false) {
    const main = deps.ui.state.main;
    const previous = [...main.querySelectorAll(persona ? '.persona-folder' : '.shelf:not(.daily-pick)')];
    const pool = new Map();
    for (const block of previous) for (const node of block.querySelectorAll(persona ? '[data-persona-id]' : '[data-character-id]')) {
      const id = persona ? node.dataset.personaId : node.dataset.characterId;
      if (!pool.has(id)) pool.set(id, []);
      pool.get(id).push(node);
    }
    const grouped = new Set(), sections = [];
    for (const group of groups) {
      let ids = persona ? group.personaIds : group.characterIds;
      try { if (typeof ids === 'string') ids = JSON.parse(ids); } catch { ids = []; }
      const members = new Set(Array.isArray(ids) ? ids.map(String) : []);
      const items = rows.filter(c => members.has(String(c.id)));
      if (!items.length) continue;
      items.forEach(c => grouped.add(String(c.id)));
      sections.push([group.name || '이름 없는 폴더', items, false]);
    }
    const unfiled = rows.filter(c => !grouped.has(String(c.id)));
    if (unfiled.length) sections.unshift([persona ? '페르소나' : '캐릭터', unfiled, true]);
    const fragment = document.createDocumentFragment();
    for (const [title, items, unfiled] of sections) {
      const block = deps.ui.state.el('section', persona ? 'persona-folder' : 'shelf ' + (unfiled ? 'unfiled' : 'home-folder'));
      block.append(deps.ui.state.el('h2', '', title));
      const grid = deps.ui.state.el('div', persona ? 'gallery' : 'rail');
      for (const c of items) {
        let node = pool.get(String(c.id))?.shift();
        if (!node && !persona) node = card(c);
        if (!node) {
          node = deps.ui.button('', () => detail(c), 'gallery-card');
          node.dataset.personaId = c.id;
          node.append(deps.avatars.avatar(c.avatarPath, c.name, 'art', c.avatarCrop), deps.ui.state.el('strong', 'card-name', c.name));
          if (c.title) node.append(deps.ui.state.el('p', 'card-title', c.title));
          if (c.tags.length) node.append(deps.ui.state.el('p', 'tags', c.tags.map(t => '#' + t).join(' ')));
        }
        grid.append(node);
      }
      block.append(grid);
      fragment.append(block);
    }
    previous.forEach(node => node.remove());
    main.insertBefore(fragment, main.querySelector('.pager'));
  }

  function dailySection(c) {
    const sectionNode = section('오늘 당신을 만나러 온 캐릭터입니다.', [c]);
    sectionNode.classList.add('daily-pick');
    const cardNode = sectionNode.querySelector('.card'),
      frame = deps.ui.state.el('div', 'daily-portrait'),
      art = cardNode.querySelector('.art');
    art.before(frame);
    frame.append(art);
    const effects = deps.ui.state.el('span', 'daily-effects');
    effects.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 8; i++) {
      const mote = deps.ui.state.el('span', i % 3 === 0 ? 'daily-heart' : 'daily-star');
      mote.style.setProperty('--i', i);
      effects.append(mote);
    }
    frame.append(effects);
    return sectionNode;
  }
  
  function officialBannerLogo() {
    const n = deps.ui.state.el('img', 'spark banner-logo');
    n.src = '/logo.png';
    n.alt = '';
    n.decoding = 'async';
    return n;
  }
  
  function homeChrome() {
    deps.ui.state.main.dataset.catalogView = deps.design.state.homeView;
    deps.ui.state.main.replaceChildren();
    const search = deps.ui.state.el('input', 'search');
    search.type = 'search';
    search.placeholder = '캐릭터 이름이나 태그 검색';
    search.setAttribute('aria-label', '캐릭터 검색');
    search.value = mftModuleState.query;
    search.oninput = () => {
      clearTimeout(mftModuleState.searchTimer);
      deps.core.state.timers.delete(mftModuleState.searchTimer);
      mftModuleState.searchTimer = deps.core.later(() => {
        mftModuleState.query = search.value.trim();
        mftModuleState.pageOffset = 0;
        loadHome();
      }, 280);
    };
    const banner = deps.ui.state.el('section', 'banner');
    banner.append(deps.ui.state.el('small', '', '나만의 이야기, 여기서부터'), deps.ui.state.el('h1', '', '오늘은 누구와\n이야기할까요?'), officialBannerLogo());
    const chips = deps.ui.state.el('div', 'chips');
    for (const [k, label] of [['', '둘러보기'], ['favorites', '즐겨찾기'], ['daily', '오늘의 캐릭터']]) {
      const b = deps.ui.button(label, () => {
        mftModuleState.filter = k;
        mftModuleState.pageOffset = 0;
        loadHome();
      }, 'chip');
      b.dataset.active = String(mftModuleState.filter === k);
      chips.append(b);
    }
    deps.extensions.homeAgents(deps.ui.state.headerAgents);
    deps.ui.state.main.append(search);
    if (deps.design.state.showHomeBanner) deps.ui.state.main.append(banner);
    deps.ui.state.main.append(chips);
    return search;
  }
  
  async function loadHome() {
    deps.core.stop();
    deps.ui.own();
    const ticket = deps.core.state.epoch;
    const focused = deps.ui.state.shadow.activeElement?.classList.contains('search');
    const input = homeChrome();
    if (focused) {
      input.focus();
      input.setSelectionRange?.(input.value.length, input.value.length);
    }
    const loading = deps.ui.state.el('p', 'muted', '캐릭터를 불러오는 중…');
    deps.ui.state.main.append(loading);
    try {
      if (mftModuleState.filter === 'daily') {
        const c = await deps.daily.characterOfDay(ticket);
        if (ticket !== deps.core.state.epoch) return;
        loading.remove();
        deps.ui.state.main.append(c ? dailySection(c) : deps.ui.state.el('p', 'muted', '라이브러리에 캐릭터가 없어요.'));
        deps.avatars.observeImages();
        return;
      }
      let homeGroups = null;
      const groupsPromise = !mftModuleState.query && !mftModuleState.filter
        ? deps.data.get('/characters/groups/list', ticket, x => Array.isArray(x) ? x : []).catch(() => []).then(groups => homeGroups = groups)
        : Promise.resolve(homeGroups = []);
      const p = await deps.data.get('/characters/catalog?' + new URLSearchParams({
        limit: '12',
        offset: String(mftModuleState.pageOffset),
        sort: 'newest',
        search: mftModuleState.query,
        ...(mftModuleState.filter ? {
          favoriteFilter: mftModuleState.filter
        } : {})
      }), ticket, x => ({
        items: (x.items || []).map(deps.data.compact),
        hasMore: !!x.hasMore
      }));
      if (ticket !== deps.core.state.epoch) return;
      loading.remove();
      if (!p.items.length) deps.ui.state.main.append(deps.ui.state.el('h2', '', '아직 캐릭터가 없어요'), deps.ui.state.el('p', 'muted', '검색어를 바꾸거나 제작에서 캐릭터를 추가해 주세요.'));else if (mftModuleState.query || mftModuleState.filter) deps.ui.state.main.append(section(mftModuleState.query ? '검색 결과' : '즐겨찾는 캐릭터', p.items));else {
        groupedSections(p.items, homeGroups || []);
        if (homeGroups === null) groupsPromise.then(groups => {
          if (ticket !== deps.core.state.epoch || deps.core.state.disposed) return;
          groupedSections(p.items, groups);
          deps.avatars.observeImages();
        });
      }
      const pager = deps.ui.state.el('div', 'pager');
      if (mftModuleState.pageOffset) pager.append(deps.ui.button('이전 캐릭터', () => {
        mftModuleState.pageOffset = Math.max(0, mftModuleState.pageOffset - 12);
        loadHome();
      }));
      if (p.hasMore) pager.append(deps.ui.button('다음 캐릭터', () => {
        mftModuleState.pageOffset += 12;
        loadHome();
      }));
      deps.ui.state.main.append(pager);
      deps.avatars.observeImages();
    } catch (e) {
      if (ticket === deps.core.state.epoch) deps.ui.error(e, loadHome);
    }
  }
  
  async function detail(c, fromHistory = false) {
    mftModuleState.detailCard = c;
    deps.navigation.state.view = 'detail';
    if (!fromHistory) deps.history.remember({
      kind: 'detail',
      card: c
    });
    deps.core.stop();
    deps.ui.own();
    const ticket = deps.core.state.epoch;
    deps.ui.state.main.replaceChildren(deps.ui.button(c.isPersona ? '‹ 페르소나' : '‹ 홈으로', () => c.isPersona ? personaGallery() : deps.navigation.go('home'), 'quiet'), deps.avatars.avatar(c.avatarPath, c.name, 'hero', c.avatarCrop));
    const heading = deps.ui.state.el('section', 'profile-heading');
    heading.append(deps.ui.state.el('h1', '', c.name));
    if (c.title) heading.append(deps.ui.state.el('p', 'card-title', c.title));
    if (c.tags.length) heading.append(deps.ui.state.el('p', 'tags', c.tags.map(t => '#' + t).join(' ')));
    if (c.creator) heading.append(deps.ui.state.el('p', 'muted', '@' + c.creator));
    deps.ui.state.main.append(heading);
    const actions = deps.ui.state.el('div', 'detail-actions');
    actions.append(...(c.isPersona ? [] : [deps.ui.button('대화 시작', () => deps.navigation.bridge('character', c, true), 'primary')]), deps.ui.button('편집', () => deps.navigation.bridge(c.isPersona ? 'persona' : 'character', c), 'quiet'));
    const description = deps.ui.state.el('div', 'description', '소개를 불러오는 중…');
    deps.ui.state.main.append(actions, deps.ui.state.el('h2', '', '소개'), description);
    deps.avatars.observeImages();
    try {
      const d = await deps.data.get('/characters/' + (c.isPersona ? 'personas/' : '') + encodeURIComponent(c.id), ticket, x => {
        let d = x.data ?? x;
        try {
          if (typeof d === 'string') d = JSON.parse(d);
        } catch {
          d = {};
        }
        d = d?.data || d || x;
        const notes = d.creator_notes ?? d.creatorNotes ?? x.creatorNotes ?? x.creator_notes;
        return typeof notes === 'string' && notes.trim() ? notes.slice(0, 50000) : '등록된 소개가 없어요.';
      });
      if (ticket === deps.core.state.epoch) deps.markdown.renderMarkdown(description, d);
    } catch (e) {
      if (e.name !== 'AbortError') description.textContent = '소개를 불러오지 못했어요. 잠시 후 다시 열어 주세요.';
    }
  }
  
  async function personaGallery() {
    deps.core.stop();
    deps.ui.own();
    deps.navigation.state.view = 'personas';
    deps.ui.state.main.dataset.catalogView = deps.design.state.personaView;
    const ticket = deps.core.state.epoch;
    deps.ui.state.main.replaceChildren(deps.ui.button('‹ 제작', () => deps.navigation.go('create'), 'quiet'), deps.ui.state.el('h1', '', '페르소나'));
    const search = deps.ui.state.el('input', 'search');
    search.placeholder = '페르소나 검색';
    search.value = mftModuleState.personaSearch;
    search.onchange = () => {
      mftModuleState.personaSearch = search.value.trim();
      mftModuleState.personaOffset = 0;
      personaGallery();
    };
    deps.ui.state.main.append(search, deps.ui.button('새 페르소나 · 관리', () => deps.navigation.openNative('personas'), 'quiet'));
    try {
      let groups = null;
      const groupsPromise = deps.data.get('/characters/persona-groups/list', ticket, x => Array.isArray(x) ? x : []).catch(() => []).then(value => groups = value);
      const data = await deps.data.get('/characters/personas/list?' + new URLSearchParams({
        limit: '24',
        offset: String(mftModuleState.personaOffset),
        search: mftModuleState.personaSearch
      }), ticket);
      if (ticket !== deps.core.state.epoch) return;
      const rows = (Array.isArray(data) ? data : data.items || []).map(r => ({
        ...deps.data.compact(r), isPersona: true,
        avatarCrop: r.avatarCrop || r.data?.extensions?.avatarCrop
      }));
      groupedSections(rows, groups || [], true);
      if (groups === null) groupsPromise.then(value => {
        if (ticket !== deps.core.state.epoch || deps.core.state.disposed) return;
        groupedSections(rows, value, true);
        deps.avatars.observeImages();
      });
      const pager = deps.ui.state.el('div', 'pager');
      if (mftModuleState.personaOffset) pager.append(deps.ui.button('이전', () => {
        mftModuleState.personaOffset = Math.max(0, mftModuleState.personaOffset - 24);
        personaGallery();
      }));
      if (data.hasMore) pager.append(deps.ui.button('다음', () => {
        mftModuleState.personaOffset += 24;
        personaGallery();
      }));
      deps.ui.state.main.append(pager);
      deps.avatars.observeImages();
    } catch (e) {
      if (ticket === deps.core.state.epoch) deps.ui.error(e, personaGallery);
    }
  }
  // Filters read the same saved engine folders. All mutations run through native controls.

  const initialize = [
    { order: 1303, run() {
      mftModuleState.searchTimer = null;
    } },
    { order: 1309, run() {
      mftModuleState.pageOffset = 0;
    } },
    { order: 1310, run() {
      mftModuleState.query = '';
    } },
    { order: 1311, run() {
      mftModuleState.filter = '';
    } },
    { order: 17300, run() {
      mftModuleState.detailCard = null;
    } },
    { order: 17301, run() {
      mftModuleState.personaOffset = 0;
    } },
    { order: 17302, run() {
      mftModuleState.personaSearch = '';
    } }
  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, card, section, dailySection, officialBannerLogo, homeChrome, loadHome, detail, personaGallery };
}

// Source: src/features/chats.js
/** chats: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createChats(deps) {
  const mftModuleState = {
    chatMode: undefined,
    chatsAll: undefined,
    chatRegistry: undefined,
    chatVisits: undefined,
    folderFilter: undefined,
    folderRows: undefined,
    roomRows: undefined
  };

  function rememberChatVisit(id) {
    if (!id) return;
    mftModuleState.chatVisits.delete(id);
    mftModuleState.chatVisits.set(id, Date.now());
    while (mftModuleState.chatVisits.size > 100) mftModuleState.chatVisits.delete(mftModuleState.chatVisits.keys().next().value);
    try {
      localStorage.setItem('mft-chat-visits', JSON.stringify([...mftModuleState.chatVisits]));
    } catch {}
  }
  
  function normalizedChat(c, latest) {
    let ids = c.characterIds;
    try {
      if (typeof ids === 'string') ids = JSON.parse(ids);
    } catch {
      ids = [];
    }
    return {
      ...deps.notifications.chatUnreadMetadata(c),
      lastMessageAt: c.lastMessageAt || c.updatedAt || c.createdAt || '',
      folderId: c.folderId || null,
      id: String(c.id),
      name: String(c.name || '이름 없는 대화'),
      mode: c.mode,
      characterIds: Array.isArray(ids) ? ids.slice(0, 6).filter(x => typeof x === 'string') : [],
      preview: String(latest?.content ?? c.lastMessage?.content ?? c.latestMessage?.content ?? '').slice(0, 140)
    };
  }
  
  function ingestChats(rows, complete = false) {
    if (complete) {
      const ids = new Set(rows.map(c => c.id));
      for (const id of mftModuleState.chatRegistry.keys()) if (!ids.has(id)) mftModuleState.chatRegistry.delete(id);
    }
    for (const c of rows) mftModuleState.chatRegistry.set(c.id, c);
  }
  
  function orderedChats(rows, all) {
    const list = [...rows];
    if (!all) {
      const ids = new Set(list.map(c => c.id));
      for (const [id] of mftModuleState.chatVisits) {
        const c = mftModuleState.chatRegistry.get(id);
        if (c && !ids.has(id)) {
          list.push(c);
          ids.add(id);
        }
      }
      list.sort((a, b) => (mftModuleState.chatVisits.get(b.id) || 0) - (mftModuleState.chatVisits.get(a.id) || 0));
    } else list.sort((a, b) => (Date.parse(b.lastMessageAt) || 0) - (Date.parse(a.lastMessageAt) || 0) || a.id.localeCompare(b.id));
    return list;
  }
  
  function hydrateSavedUnread(force = false) {
    if (deps.notifications.state.unreadHydration) return deps.notifications.state.unreadHydration.promise;
    const controller = new AbortController();
    deps.notifications.state.unreadHydration = controller;
    const deadline = setTimeout(() => controller.abort(), 12000);
    controller.promise = (async () => {
      try {
        const cached = !force && deps.updates.state.queryCache?.find?.({
          queryKey: ['chats', 'list'],
          exact: true
        })?.state?.data;
        const raw = Array.isArray(cached) && cached.length ? cached : await deps.data.jsonRequest('/chats', 'GET', undefined, controller.signal, force);
        if (deps.core.state.disposed || !Array.isArray(raw)) return;
        const normalized = raw.map(c => normalizedChat(c));
        ingestChats(normalized, true);
        deps.data.state.cache.set('/chats', {
          time: Date.now(),
          data: normalized
        });
        deps.notifications.syncUnreadBadges(deps.notifications.unreadSnapshot(deps.notifications.notificationSnapshot()));
      } catch {} finally {
        clearTimeout(deadline);
        if (deps.notifications.state.unreadHydration === controller) deps.notifications.state.unreadHydration = null;
      }
    })();
    return controller.promise;
  }
  
  async function chats(all = mftModuleState.chatsAll) {
    mftModuleState.chatsAll = all;
    deps.core.stop();
    deps.ui.own();
    const ticket = deps.core.state.epoch;
    deps.ui.state.main.replaceChildren(deps.ui.state.el('h1', '', '채팅'));
    const modes = deps.ui.state.el('div', 'mode-tabs');
    modes.setAttribute('role', 'tablist');
    modes.setAttribute('aria-label', '대화 모드');
    for (const [k, label] of [['conversation', '대화'], ['roleplay', '롤플레이'], ['game', '게임']]) {
      const b = deps.ui.button(label, () => {
        mftModuleState.chatMode = k;
        mftModuleState.folderFilter = '';
        chats(all);
      }, 'mode-tab');
      b.dataset.mode = k;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', label);
      b.setAttribute('aria-selected', String(k === mftModuleState.chatMode));
      modes.append(b);
    }
    deps.ui.state.main.append(modes);
    const controls = deps.ui.state.el('div', 'chat-switch');
    controls.append(deps.ui.button('최근 대화', () => chats(false), all ? 'quiet' : 'chip'), deps.ui.button('전체 대화', () => chats(true), all ? 'chip' : 'quiet'));
    deps.ui.state.main.append(controls);
    const loading = deps.ui.state.el('p', 'muted', '대화 목록을 불러오는 중…');
    deps.ui.state.main.append(loading);
    try {
      const rows = await deps.data.get(all ? '/chats' : '/chats/home-feed', ticket, x => (all ? Array.isArray(x) ? x : [] : x.recentChats || []).map(r => normalizedChat(all ? r : r.chat, all ? null : r.latestMessage)));
      if (ticket !== deps.core.state.epoch) return;
      loading.remove();
      ingestChats(rows, all);
      const selected = orderedChats(rows, all).filter(r => r.mode === mftModuleState.chatMode && (!all || !mftModuleState.folderFilter || (mftModuleState.folderFilter === 'unfiled' ? !r.folderId : r.folderId === mftModuleState.folderFilter)));
      if (!selected.length) deps.ui.state.main.append(deps.ui.state.el('p', 'muted', all ? '이 모드의 대화가 없어요. 홈에서 캐릭터를 골라 보세요.' : '최근 대화에 이 모드가 없어요. 전체 대화에서 찾아보세요.'));
      let offset = 0;
      const list = deps.ui.state.el('div', 'chat-list');
      deps.ui.state.main.append(list);
      mftModuleState.roomRows = rows;
      if (all) chatFolders(ticket, rows);
      const more = deps.ui.button('더 보기', () => renderPage(), 'quiet');
      deps.ui.state.main.append(more);
      async function renderPage() {
        more.disabled = true;
        const slice = selected.slice(offset, offset + 30),
          avatars = [],
          currentNotes = deps.notifications.unreadSnapshot(deps.notifications.notificationSnapshot());
        for (const c of slice) {
          const b = deps.ui.button('', () => deps.navigation.bridge('chat', c), 'chat-row');
          b.dataset.roomId = c.id;
          const note = currentNotes.get(c.id);
          if (note) b.classList.add('has-unread');
          const copy = deps.ui.state.el('div');
          copy.append(deps.ui.state.el('strong', '', c.name), deps.ui.state.el('p', 'summary', c.preview || '불러오는 중…'));
          copy.lastChild.dataset.previewId = c.id;
          const holder = deps.avatars.avatar('', c.name, 'round');
          b.append(holder, copy, deps.ui.state.el('span', 'muted', '›'));
          if (note) b.append(deps.ui.state.el('span', 'chat-unread', String(note)));
          const row = deps.ui.state.el('div', 'chat-item');
          row.append(b);
          list.append(row);
          avatars.push([holder, c]);
        }
        deps.previews.fillPreviews(slice, ticket);
        offset += 30;
        more.hidden = offset >= selected.length;
        const ids = [...new Set(slice.flatMap(c => c.characterIds))].slice(0, 180);
        if (!ids.length) {
          more.disabled = false;
          return;
        }
        try {
          const key = '/characters/summaries';
          const found = await deps.data.get(key + '?mft=' + encodeURIComponent(ids.join(',')), ticket, x => Array.isArray(x) ? x : [], {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ids
            })
          });
          if (ticket !== deps.core.state.epoch) return;
          const map = new Map(found.map(x => [x.id, x]));
          for (const [holder, c] of avatars) {
            const ch = c.characterIds.map(id => map.get(id)).find(x => x?.avatarUrl);
            if (ch) holder.replaceWith(deps.avatars.avatar(ch.avatarUrl, ch.name || c.name, 'round', ch.avatarCrop));
          }
          deps.avatars.observeImages();
        } catch (e) {
          if (e.name !== 'AbortError' && ticket === deps.core.state.epoch) deps.ui.notice('프로필 사진을 불러오지 못했어요. 대화는 열 수 있어요.');
        } finally {
          more.disabled = false;
        }
      }
      renderPage();
      deps.notifications.syncUnreadBadges(deps.notifications.unreadSnapshot(deps.notifications.notificationSnapshot()));
    } catch (e) {
      if (ticket === deps.core.state.epoch) deps.ui.error(e, () => chats(all));
    }
  }
  
  // Filters read the same saved engine folders. All mutations run through native controls.
  async function chatFolders(ticket, rows) {
    mftModuleState.roomRows = rows;
    const bar = deps.ui.state.el('div', 'folder-bar');
    bar.append(deps.ui.button('대화·폴더 관리', () => {
      deps.data.state.cache.clear();
      deps.navigation.openNative('chats');
    }, 'button'));
    deps.ui.state.main.insertBefore(bar, deps.ui.state.main.querySelector('.chat-list'));
    try {
      const data = await deps.data.jsonRequest('/chat-folders');
      if (ticket !== deps.core.state.epoch) return;
      mftModuleState.folderRows = Array.isArray(data) ? data : [];
      const select = deps.ui.state.el('select');
      select.setAttribute('aria-label', '대화 폴더');
      select.append(new Option('모든 폴더', ''), new Option('미분류', 'unfiled'));
      for (const f of mftModuleState.folderRows.filter(f => f.mode === mftModuleState.chatMode)) select.append(new Option(f.name, f.id));
      select.value = mftModuleState.folderFilter;
      select.onchange = () => {
        mftModuleState.folderFilter = select.value;
        chats(mftModuleState.chatsAll);
      };
      bar.prepend(select);
    } catch {/* Native management remains available when a filter request fails. */}
  }

  const initialize = [
    { order: 1307, run() {
      mftModuleState.chatMode = 'conversation';
    } },
    { order: 1308, run() {
      mftModuleState.chatsAll = false;
    } },
    { order: 10400, run() {
      mftModuleState.chatRegistry = new Map();
    } },
    { order: 10600, run() {
      mftModuleState.chatVisits = new Map();
    } },
    { order: 10700, run() {
      try {
        const saved = JSON.parse(localStorage.getItem('mft-chat-visits') || '[]');
        if (Array.isArray(saved)) mftModuleState.chatVisits = new Map(saved.filter(x => Array.isArray(x) && typeof x[0] === 'string' && Number.isFinite(x[1])).slice(0, 100));
      } catch {}
    } },
    { order: 17303, run() {
      mftModuleState.folderFilter = '';
    } },
    { order: 17304, run() {
      mftModuleState.folderRows = [];
    } },
    { order: 17305, run() {
      mftModuleState.roomRows = [];
    } }
  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, rememberChatVisit, normalizedChat, ingestChats, orderedChats, hydrateSavedUnread, chats, chatFolders };
}

// Source: src/features/design.js
/** design: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createDesign(deps) {
  const mftModuleState = {
    showHomeBanner: undefined,
    homeView: undefined,
    personaView: undefined,
    chatLetterSpacing: undefined,
    chatLineHeight: undefined,
    roleplayPadding: undefined,
    translationReduction: undefined,
    previousLetterSpacing: undefined,
    previousLineHeight: undefined,
    previousRpPadding: undefined,
    previousTranslationReduction: undefined,
    previewAccent: undefined,
    previewFrame: undefined
  };

  function applyChatTypography() {
    deps.ui.state.html.style.setProperty('--mft-translation-reduction', mftModuleState.translationReduction + 'px');
    deps.ui.state.body.style.setProperty('--translation-reduction', mftModuleState.translationReduction + 'px');
    if (mftModuleState.roleplayPadding !== null) {
      deps.ui.state.html.style.setProperty('--mft-rp-text-padding', mftModuleState.roleplayPadding + 'px');
      deps.ui.state.body.style.setProperty('--rp-text-padding', mftModuleState.roleplayPadding + 'px');
    }
    deps.ui.state.html.style.setProperty('--mft-chat-letter-spacing', mftModuleState.chatLetterSpacing + 'px');
    deps.ui.state.html.style.setProperty('--mft-chat-line-height', String(mftModuleState.chatLineHeight));
    deps.ui.state.body.style.setProperty('--chat-letter-spacing', mftModuleState.chatLetterSpacing + 'px');
    deps.ui.state.body.style.setProperty('--chat-line-height', String(mftModuleState.chatLineHeight));
  }
  
  function pickerColor() {
    const value = (deps.theme.state.accentPaint || '#6656ec').trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    if (/^#[0-9a-f]{3}$/i.test(value)) return '#' + [...value.slice(1)].map(c => c + c).join('');
    const rgb = value.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
    return rgb ? '#' + rgb.slice(1, 4).map(n => Math.round(Math.min(255, Math.max(0, +n))).toString(16).padStart(2, '0')).join('') : '#6656ec';
  }
  
  async function setMainColor(value) {
    const direct = deps.adapter.engineActions().setAppAccentColor;
    if (direct) {
      direct(value);
      return;
    }
    const signal = deps.navigation.beginRoute('theme');
    try {
      const actions = await deps.navigation.actionsReady(signal);
      if (signal.aborted) return;
      deps.navigation.clearLayers(actions);
      actions.openRightPanel('settings');
      await deps.navigation.waitEngine(() => deps.adapter.engineActions().setSettingsTab, signal, 5000);
      deps.adapter.engineActions().setSettingsTab('appearance');
      const set = await deps.navigation.waitEngine(() => deps.adapter.engineActions().setAppAccentColor, signal, 5000);
      if (signal.aborted) return;
      set(value);
      deps.navigation.clearLayers(deps.adapter.engineActions());
      deps.navigation.state.bridgeBusy = false;
      deps.ui.state.html.classList.remove('mft-transition');
      deps.navigation.state.routeIntent = 'own';
      deps.ui.own();
      deps.ui.notice('');
    } catch (error) {
      deps.navigation.routeFailure(error, () => setMainColor(value));
    }
  }
  
  function liveColorPreview(color) {
    if (color === mftModuleState.previewAccent) return;
    mftModuleState.previewAccent = color;
    if (mftModuleState.previewFrame) return;
    mftModuleState.previewFrame = requestAnimationFrame(() => {
      mftModuleState.previewFrame = 0;
      if (deps.core.state.disposed || !mftModuleState.previewAccent) return;
      deps.ui.state.html.style.setProperty('--mft-user-accent', mftModuleState.previewAccent);
      deps.ui.state.html.style.setProperty('--mft-user-banner', `color-mix(in srgb, ${mftModuleState.previewAccent} 12%, ${deps.ui.state.html.dataset.theme === 'dark' ? '#111113' : '#f5f5f8'})`);
      const trigger = deps.ui.state.main.querySelector('.color-trigger');
      if (trigger) trigger.style.background = mftModuleState.previewAccent;
    });
  }
  
  function clearColorPreview() {
    if (mftModuleState.previewFrame) cancelAnimationFrame(mftModuleState.previewFrame);
    mftModuleState.previewFrame = 0;
    if (!mftModuleState.previewAccent) return;
    mftModuleState.previewAccent = '';
    deps.theme.state.themePaintSignature = '';
    if (!deps.core.state.disposed) deps.theme.syncTheme();
  }
  
  function colorPicker() {
    const panel = deps.ui.state.el('section', 'color-picker');
    panel.hidden = true;
    panel.setAttribute('aria-label', '지향색 선택');
    let hue = 0,
      sat = 0,
      val = 0,
      draft = pickerColor();
    const pad = deps.ui.state.el('div', 'color-plane');
    pad.tabIndex = 0;
    pad.setAttribute('role', 'slider');
    pad.setAttribute('aria-label', '채도와 밝기');
    const point = deps.ui.state.el('span', 'color-point');
    pad.append(point);
    const slider = deps.ui.state.el('input', 'hue-slider');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '360';
    slider.step = '1';
    slider.setAttribute('aria-label', '색조');
    const fields = deps.ui.state.el('div', 'color-fields'),
      hex = deps.ui.state.el('input', 'main-color');
    hex.type = 'text';
    hex.maxLength = 7;
    hex.setAttribute('aria-label', 'HEX');
    const rgb = [0, 1, 2].map(i => {
      const n = deps.ui.state.el('input');
      n.type = 'number';
      n.min = '0';
      n.max = '255';
      n.step = '1';
      n.setAttribute('aria-label', ['R', 'G', 'B'][i]);
      return n;
    });
    for (const [i, input] of [hex, ...rgb].entries()) {
      const label = deps.ui.state.el('label', 'color-field');
      label.append(deps.ui.state.el('span', '', ['HEX', 'R', 'G', 'B'][i]), input);
      fields.append(label);
    }
    const preview = deps.ui.state.el('span', 'color-preview');
    preview.setAttribute('aria-label', '선택한 색상');
    fields.append(preview);
    const hsvHex = () => {
      const c = val * sat,
        x = c * (1 - Math.abs(hue / 60 % 2 - 1)),
        m = val - c,
        channels = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
      return '#' + channels.map(n => Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('');
    };
    const render = () => {
      draft = hsvHex();
      hex.value = draft;
      rgb.forEach((n, i) => n.value = parseInt(draft.slice(1 + i * 2, 3 + i * 2), 16));
      slider.value = String(hue);
      pad.style.setProperty('--picker-hue', `hsl(${hue} 100% 50%)`);
      point.style.left = sat * 100 + '%';
      point.style.top = (1 - val) * 100 + '%';
      pad.setAttribute('aria-valuetext', `채도 ${Math.round(sat * 100)}%, 밝기 ${Math.round(val * 100)}%`);
      preview.style.background = draft;
      if (!panel.hidden) liveColorPreview(draft);
    };
    const fromHex = color => {
      if (!/^#[0-9a-f]{6}$/i.test(color)) return false;
      const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255),
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        d = max - min;
      hue = d ? (max === r ? (g - b) / d % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 : hue;
      if (hue < 0) hue += 360;
      sat = max ? d / max : 0;
      val = max;
      render();
      return true;
    };
    const move = e => {
      const box = pad.getBoundingClientRect();
      sat = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width));
      val = 1 - Math.max(0, Math.min(1, (e.clientY - box.top) / box.height));
      render();
    };
    pad.onpointerdown = e => {
      if (e.button !== 0) return;
      pad.setPointerCapture(e.pointerId);
      move(e);
    };
    pad.onpointermove = e => {
      if (pad.hasPointerCapture(e.pointerId)) move(e);
    };
    pad.onkeydown = e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      sat = Math.max(0, Math.min(1, sat + (e.key === 'ArrowRight' ? .01 : e.key === 'ArrowLeft' ? -.01 : 0)));
      val = Math.max(0, Math.min(1, val + (e.key === 'ArrowUp' ? .01 : e.key === 'ArrowDown' ? -.01 : 0)));
      render();
    };
    slider.oninput = () => {
      hue = Number(slider.value);
      render();
    };
    hex.oninput = () => {
      if (/^#[0-9a-f]{6}$/i.test(hex.value)) fromHex(hex.value);
    };
    hex.onchange = () => {
      if (!fromHex(hex.value)) {
        hex.setCustomValidity('#RRGGBB 형식으로 입력해 주세요.');
        hex.reportValidity();
      } else hex.setCustomValidity('');
    };
    rgb.forEach(n => n.oninput = n.onchange = () => fromHex('#' + rgb.map(x => Math.round(Math.max(0, Math.min(255, Number(x.value) || 0))).toString(16).padStart(2, '0')).join('')));
    const presets = deps.ui.state.el('div', 'color-presets');
    for (const color of ['#e35a75', '#e58f38', '#c0a52d', '#78973b', '#27a698', '#449ac2', '#6656ec', '#a76bc5', '#cf71a8', '#33343b']) {
      const b = deps.ui.button('', () => fromHex(color), 'color-swatch');
      b.style.background = color;
      b.setAttribute('aria-label', color);
      presets.append(b);
    }
    const actions = deps.ui.state.el('div', 'picker-actions'),
      cancel = deps.ui.button('취소', () => {
        clearColorPreview();
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }, 'quiet'),
      apply = deps.ui.button('적용', async () => {
        if (!fromHex(hex.value)) return;
        apply.disabled = true;
        await setMainColor(draft);
        clearColorPreview();
        apply.disabled = false;
        trigger.style.background = pickerColor();
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }, 'primary');
    actions.append(cancel, apply);
    panel.append(pad, slider, fields, presets, actions);
    const trigger = deps.ui.button('', () => {
      panel.hidden = !panel.hidden;
      trigger.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) fromHex(pickerColor());else clearColorPreview();
    }, 'color-trigger');
    trigger.style.background = pickerColor();
    trigger.setAttribute('aria-label', '지향색 선택 열기');
    trigger.setAttribute('aria-expanded', 'false');
    fromHex(draft);
    return {
      panel,
      trigger
    };
  }
  
  function saveDesignPreferences() {
    try {
      localStorage.setItem('mft-preferences', JSON.stringify({
        showHomeBanner: mftModuleState.showHomeBanner,
        homeView: mftModuleState.homeView,
        personaView: mftModuleState.personaView,
        chatLetterSpacing: mftModuleState.chatLetterSpacing,
        chatLineHeight: mftModuleState.chatLineHeight,
        roleplayPadding: mftModuleState.roleplayPadding,
        translationReduction: mftModuleState.translationReduction
      }));
    } catch {}
  }
  
  function themePreferences() {
    const section = deps.ui.state.el('section', 'theme-preferences');
    const group = (key, title, description) => {
      const box = deps.ui.state.el('section', 'design-group');
      box.dataset.designGroup = key;
      box.append(deps.ui.state.el('h2', '', title), deps.ui.state.el('p', 'design-description', description));
      section.append(box);
      return box;
    };
    const colors = group('color', '색상', '아이콘과 사용자 말풍선에 적용할 지향색입니다.');
    const picker = colorPicker(),
      row = deps.ui.state.el('div', 'preference-row');
    row.append(deps.ui.state.el('strong', '', '지향색'), picker.trigger);
    colors.append(row, picker.panel);
    const library = group('library', '홈·라이브러리', '갤러리는 격자, 스크롤은 좌우로 넘기는 카드입니다.');
    const banner = deps.ui.state.el('label', 'preference-row');
    banner.append(deps.ui.state.el('strong', '', '홈 배너 표시'));
    const toggle = deps.ui.state.el('input', 'banner-toggle');
    toggle.type = 'checkbox';
    toggle.checked = mftModuleState.showHomeBanner;
    toggle.onchange = () => {
      mftModuleState.showHomeBanner = toggle.checked;
      saveDesignPreferences();
    };
    banner.append(toggle);
    library.append(banner);
    for (const [kind, label, current] of [['home', '홈 보기', mftModuleState.homeView], ['personas', '페르소나 라이브러리 보기', mftModuleState.personaView]]) {
      const setting = deps.ui.state.el('label', 'preference-row view-preference');
      setting.append(deps.ui.state.el('strong', '', label));
      const select = deps.ui.state.el('select', 'view-select');
      select.setAttribute('aria-label', label);
      select.dataset.viewPreference = kind;
      for (const [value, text] of [['gallery', '갤러리'], ['scroll', '스크롤']]) {
        const option = deps.ui.state.el('option', '', text);
        option.value = value;
        select.append(option);
      }
      select.value = current;
      select.onchange = () => {
        if (kind === 'home') mftModuleState.homeView = select.value;else mftModuleState.personaView = select.value;
        saveDesignPreferences();
      };
      setting.append(select);
      library.append(setting);
    }
    const chat = group('chat', '채팅 글자·여백', '원문 크기는 순정 설정을 따릅니다. 번역 크기 차이는 별도 표시 번역문에만 적용됩니다.');
    for (const [key, label, min, max, step, value] of [['chatLetterSpacing', '채팅 자간', -1, 4, .1, mftModuleState.chatLetterSpacing], ['chatLineHeight', '채팅 행간', 1.2, 2.8, .05, mftModuleState.chatLineHeight], ['translationReduction', '별도 번역문 크기 줄이기', 0, 12, 1, mftModuleState.translationReduction], ['roleplayPadding', '롤플레이 말풍선 좌우 여백', 0, 40, 1, mftModuleState.roleplayPadding ?? 6]]) {
      const row = deps.ui.state.el('label', 'spacing-setting'),
        caption = deps.ui.state.el('strong', '', label),
        input = deps.ui.state.el('input');
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = value;
      input.dataset.spacingSetting = key;
      input.setAttribute('aria-label', label);
      const output = deps.ui.state.el('output', '', key !== 'chatLineHeight' ? value + 'px' : String(value));
      input.oninput = () => {
        if (key === 'chatLetterSpacing') mftModuleState.chatLetterSpacing = Number(input.value);else if (key === 'chatLineHeight') mftModuleState.chatLineHeight = Number(input.value);else if (key === 'translationReduction') mftModuleState.translationReduction = Number(input.value);else mftModuleState.roleplayPadding = Number(input.value);
        output.textContent = key !== 'chatLineHeight' ? input.value + 'px' : input.value;
        applyChatTypography();
      };
      input.onchange = saveDesignPreferences;
      row.append(caption, input, output);
      chat.append(row);
    }
    const preview = deps.ui.state.el('div', 'typography-preview');
    preview.append(deps.ui.state.el('p', '', '원문: 글자와 여백을 편안하게 조절하세요.'), deps.ui.state.el('p', 'translation-size-preview', '번역문: 선택한 px만큼 작은 크기로 표시됩니다.'));
    chat.append(preview);
    return section;
  }

  const initialize = [
    { order: 2400, run() {
      mftModuleState.showHomeBanner = true;
    } },
    { order: 2401, run() {
      mftModuleState.homeView = 'scroll';
    } },
    { order: 2402, run() {
      mftModuleState.personaView = 'gallery';
    } },
    { order: 2403, run() {
      mftModuleState.chatLetterSpacing = 0;
    } },
    { order: 2404, run() {
      mftModuleState.chatLineHeight = 1.8;
    } },
    { order: 2405, run() {
      mftModuleState.roleplayPadding = null;
    } },
    { order: 2406, run() {
      mftModuleState.translationReduction = 0;
    } },
    { order: 2500, run() {
      try {
        const prefs = JSON.parse(localStorage.getItem('mft-preferences') || '{}');
        mftModuleState.showHomeBanner = prefs.showHomeBanner !== false;
        mftModuleState.homeView = prefs.homeView === 'gallery' ? 'gallery' : 'scroll';
        mftModuleState.personaView = prefs.personaView === 'scroll' ? 'scroll' : 'gallery';
        mftModuleState.chatLetterSpacing = Math.min(4, Math.max(-1, Number(prefs.chatLetterSpacing) || 0));
        mftModuleState.chatLineHeight = Math.min(2.8, Math.max(1.2, Number(prefs.chatLineHeight) || 1.8));
        mftModuleState.translationReduction = Math.min(12, Math.max(0, Number(prefs.translationReduction) || 0));
        if (typeof prefs.roleplayPadding === 'number' && Number.isFinite(prefs.roleplayPadding)) mftModuleState.roleplayPadding = Math.min(40, Math.max(0, prefs.roleplayPadding));
      } catch {}
    } },
    { order: 2600, run() {
      mftModuleState.previousLetterSpacing = deps.ui.state.html.style.getPropertyValue('--mft-chat-letter-spacing');
    } },
    { order: 2601, run() {
      mftModuleState.previousLineHeight = deps.ui.state.html.style.getPropertyValue('--mft-chat-line-height');
    } },
    { order: 2602, run() {
      mftModuleState.previousRpPadding = deps.ui.state.html.style.getPropertyValue('--mft-rp-text-padding');
    } },
    { order: 2603, run() {
      mftModuleState.previousTranslationReduction = deps.ui.state.html.style.getPropertyValue('--mft-translation-reduction');
    } },
    { order: 2800, run() {
      applyChatTypography();
    } },
    { order: 3100, run() {
      mftModuleState.previewAccent = '';
    } },
    { order: 3101, run() {
      mftModuleState.previewFrame = 0;
    } }
  ];
  const cleanup = [
    { order: 3, run() {
      for (const [key, value] of [['--mft-chat-letter-spacing', mftModuleState.previousLetterSpacing], ['--mft-chat-line-height', mftModuleState.previousLineHeight], ['--mft-rp-text-padding', mftModuleState.previousRpPadding], ['--mft-translation-reduction', mftModuleState.previousTranslationReduction]]) {
        if (value) deps.ui.state.html.style.setProperty(key, value);else deps.ui.state.html.style.removeProperty(key);
      }
    } },
    { order: 23, run() {
      if (mftModuleState.previewFrame) cancelAnimationFrame(mftModuleState.previewFrame);
    } },
    { order: 24, run() {
      mftModuleState.previewFrame = 0;
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, applyChatTypography, pickerColor, setMainColor, liveColorPreview, clearColorPreview, colorPicker, saveDesignPreferences, themePreferences };
}

// Source: src/engine/adapter.js
/** adapter: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createAdapter(deps) {
  const mftModuleState = {
    actionNames: undefined
  };

  function nativeTarget(key) {
    return document.querySelector(`[data-component="TopBar"] [data-tour="${key === 'chats' ? 'sidebar-toggle' : 'panel-' + key}"]`);
  }
  // Engine action adapter. Full-page extensions lack a public navigation API.
  // Read existing useSyncExternalStore action snapshots; never mutate React hooks or store objects.
  
  function engineActions() {
    const out = {},
      seen = new Set();
    const anchors = document.querySelectorAll('[data-component="TopBar"],[data-component="AppShell"],[data-panel-key],[data-panel-key]>*,[data-component="CharactersPanelScroll"],[data-component="ChatSidebar"],#settings-control-app-accent-color');
    function accept(v) {
      if (typeof v === 'function' && mftModuleState.actionNames.has(v.name)) out[v.name] = v;else if (v && typeof v === 'object') for (const name of mftModuleState.actionNames) if (typeof v[name] === 'function') out[name] = v[name];
    }
    for (const node of anchors) {
      const key = Object.keys(node).find(k => k.startsWith('__reactFiber$'));
      let f = key ? node[key] : null;
      for (let depth = 0; f && depth < 24; depth++, f = f.return) {
        for (const branch of [f, f.alternate]) {
          if (!branch || seen.has(branch)) continue;
          seen.add(branch);
          let h = branch.memoizedState;
          for (let i = 0; h && i < 160; i++, h = h.next) {
            accept(h.memoizedState);
            for (const snapshot of [h.queue, h.memoizedState]) if (snapshot && typeof snapshot === 'object') {
              accept(snapshot.value);
              if (typeof snapshot.getSnapshot === 'function' && 'value' in snapshot) {
                try {
                  accept(snapshot.getSnapshot());
                } catch {}
              }
            }
          }
        }
      }
    }
    return out;
  }
  
  function surfaceHasChatId(node, id) {
    if (!node) return false;
    const key = Object.keys(node).find(k => k.startsWith('__reactFiber$'));
    let f = key ? node[key] : null;
    let top = f;
    while (top?.return) top = top.return;
    if (top?.stateNode?.current && top.stateNode.current !== top) f = f?.alternate;
    for (let depth = 0; f && depth < 28; depth++, f = f.return) {
      const p = f.memoizedProps;
      if (p && (p.activeChatId === id || p.chatId === id || p.chat?.id === id)) return true;
    }
    return false;
  }
  
  function activeSession() {
    try { return { known: true, id: localStorage.getItem('marinara-active-chat-id') || null }; }
    catch { return { known: false, id: null }; }
  }

  function chatSurface(expectedId) {
    if (expectedId === null) return null;
    for (const surface of document.querySelectorAll('[data-chat-mode]')) {
      if (surface.closest('[hidden],[aria-hidden="true"]')) continue;
      const composer = surface.querySelector('[data-chat-composer][data-chat-id]');
      const explicit = composer?.dataset.chatId;
      if (explicit && (!expectedId || explicit === expectedId)) return { surface, id: explicit, mode: surface.dataset.chatMode };
      if (expectedId && surfaceHasChatId(surface, expectedId)) return { surface, id: expectedId, mode: surface.dataset.chatMode };
      if (expectedId) continue;
      let id = null;
      eachHook(surface, value => {
        const candidate = value?.activeChatId || value?.chatId || value?.chat?.id;
        if (typeof candidate === 'string' && surfaceHasChatId(surface, candidate)) { id = candidate; return true; }
        return false;
      });
      if (id) return { surface, id, mode: surface.dataset.chatMode };
    }
    return null;
  }

  function roomReady(id, mode) {
    const active = activeSession();
    if (active.known && active.id !== id) return false;
    if (document.querySelector('[data-component="ChatArea.RestoringChat"]')) return false;
    const chat = chatSurface(id);
    if (chat && (!mode || chat.mode === mode)) return true;
    // Setup / world-intro screens have no composer or data-chat-mode. Match their actual room props.
    if (mode !== 'game') return false;
    const center = document.querySelector('[data-component="CenterContent"]');
    const candidates = [...document.querySelectorAll('[data-component="GameSetupWizard"],[data-component="GameSurface.MessagesLoading"]')];
    let level = center ? [...center.children] : [];
    for (let depth = 0; depth < 3 && candidates.length < 48; depth++) {
      candidates.push(...level.slice(0, 48 - candidates.length));
      level = level.flatMap(n => [...n.children]).slice(0, 24);
    }
    return candidates.some(n => surfaceHasChatId(n, id));
  }

  function prepareChat(a) {
    a.setPendingNewChatMode?.(null);
    a.setShouldOpenSettings?.(false);
    a.setShouldOpenWizard?.(false);
    a.setShouldOpenWizardInShortcutMode?.(false);
    a.setSetupActive?.(false);
  }
  
  // Match current persona identity and displayed photo before falling back to an older message snapshot.
  function personaCropForImage(im) {
    let node = im,
      f = null;
    for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
      const key = Object.keys(node).find(k => k.startsWith('__reactFiber$'));
      if (key) {
        f = node[key];
        break;
      }
    }
    const shown = deps.avatars.imageKey(im.getAttribute('src'));
    for (let depth = 0; f && depth < 32; depth++, f = f.return) {
      const p = f.memoizedProps;
      if (!p?.message || typeof p.message !== 'object') continue;
      if (p.message.role !== 'user') return {
        found: false
      };
      let extra = p.message.extra;
      try {
        if (typeof extra === 'string') extra = JSON.parse(extra);
      } catch {
        extra = null;
      }
      const saved = extra?.personaSnapshot,
        current = p.personaInfo;
      const samePhoto = persona => {
        const url = persona?.avatarUrl || persona?.avatarPath;
        return !!url && deps.avatars.imageKey(url) === shown;
      };
      const sameIdentity = !saved?.personaId || !current?.id || saved.personaId === current.id;
      if (current?.avatarCrop && sameIdentity && samePhoto(current)) return {
        found: true,
        crop: current.avatarCrop
      };
      if (saved?.avatarCrop && samePhoto(saved)) return {
        found: true,
        crop: saved.avatarCrop
      };
      return {
        found: true,
        crop: null
      };
    }
    return {
      found: false
    };
  }
  
  // Existing engine navigation callback provides an ID route when a named action is not selected in a hook.
  function engineNavigator() {
    const node = document.querySelector('[data-component="HomeBrowserHub"]');
    if (!node) return null;
    const key = Object.keys(node).find(k => k.startsWith('__reactFiber$'));
    let root = key ? node[key] : null;
    while (root?.return && !root.memoizedProps?.onProfessorChatOpenChange) root = root.return;
    if (!root) return null;
    const stack = [root];
    let count = 0;
    while (stack.length && count++ < 2400) {
      const f = stack.pop();
      const p = f?.memoizedProps;
      if (typeof p?.onNavigate === 'function' && typeof p?.onResolve === 'function' && typeof p?.onOpenProfessor === 'function') return p.onNavigate;
      if (f?.child) stack.push(f.child);
      if (f?.sibling && f !== root) stack.push(f.sibling);
    }
    return null;
  }
  // Native notifications mount lazily and return null while empty. Read live store snapshots,
  // not the previous render's memoized Map, and fall back to original notification props.
  
  function eachHook(node, accept, children = false) {
    const key = Object.keys(node || {}).find(k => k.startsWith('__reactFiber$'));
    let f = key ? node[key] : null;
    const seen = new Set(),
      stack = [];
    for (let d = 0; f && d < 18; d++, f = f.return) stack.push(f);
    let steps = 0;
    while (stack.length && steps++ < 600) {
      const item = stack.shift();
      if (!item || seen.has(item)) continue;
      seen.add(item);
      for (const branch of [item, item.alternate]) {
        if (!branch) continue;
        if (accept(branch.memoizedProps, null) === true) return true;
        for (let h = branch.memoizedState, i = 0; h && i < 120; h = h.next, i++) {
          for (const state of [h.queue, h.memoizedState]) {
            if (state && typeof state.getSnapshot === 'function') {
              try {
                if (accept(state.getSnapshot(), () => state.getSnapshot()) === true) return true;
              } catch {}
            }
            if (accept(state?.value, null) === true) return true;
          }
          if (accept(h.memoizedState, null) === true) return true;
        }
      }
      if (children) {
        if (item.child) stack.push(item.child);
        if (item.sibling) stack.push(item.sibling);
      }
    }
    return false;
  }
  
  function liveBubble(node) {
    const key = Object.keys(node || {}).find(k => k.startsWith('__reactFiber$'));
    let f = key ? node[key] : null;
    let top = f;
    while (top?.return) top = top.return;
    if (top?.stateNode?.current && top.stateNode.current !== top) f = f?.alternate;
    for (let d = 0; f && d < 18; d++, f = f.return) {
      const p = f.memoizedProps;
      if (p?.isStreaming === true || p?.ctx?.isStreaming === true) return true;
    }
    return false;
  }

  const initialize = [
    { order: 7100, run() {
      mftModuleState.actionNames = new Set(['setActiveChatId', 'setSidebarOpen', 'closeRightPanel', 'openRightPanel', 'closeAllDetails', 'openModal', 'openCharacterDetail', 'setSettingsTab', 'openPersonaDetail', 'openAgentCatalog', 'setTheme', 'requestChatModeShortcut', 'setPendingNewChatMode', 'setShouldOpenSettings', 'setShouldOpenWizard', 'setShouldOpenWizardInShortcutMode', 'setSetupActive', 'setAppAccentColor']);
    } }
  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, nativeTarget, engineActions, surfaceHasChatId, chatSurface, activeSession, roomReady, prepareChat, personaCropForImage, engineNavigator, eachHook, liveBubble };
}

// Source: src/features/notifications.js
/** notifications: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createNotifications(deps) {
  const mftModuleState = {
    unreadHydration: undefined,
    notificationObserver: undefined,
    notificationRail: undefined,
    notificationGetter: undefined,
    notificationSignature: undefined,
    alertTray: undefined,
    unreadGetter: undefined,
    retainedUnread: undefined,
    readUnreadVersions: undefined,
    readLiveCounts: undefined,
    unreadStorageSignature: undefined,
    dismissedToasts: undefined,
    toastClocks: undefined,
    notificationsQueued: undefined
  };

  function notificationSnapshot() {
    const center = document.querySelector('[data-component="CenterContent"]') || document.querySelector('[data-component="TopBar"]')?.parentElement;
    const rail = center?.querySelector('[class~="pointer-events-none"][class~="absolute"][class~="right-3"]');
    if (rail !== mftModuleState.notificationRail) {
      mftModuleState.notificationObserver?.disconnect();
      mftModuleState.notificationRail = rail;
      if (rail) {
        mftModuleState.notificationObserver = new MutationObserver(scheduleNotifications);
        mftModuleState.notificationObserver.observe(rail, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['title', 'aria-label']
        });
      }
    }
    let notes = null;
    const accept = (value, getter) => {
      const map = value?.chatNotifications instanceof Map ? value.chatNotifications : value;
      if (map instanceof Map && (value?.chatNotifications instanceof Map || [...map.values()].some(x => x?.chatId && x?.characterName))) {
        notes = map;
        if (getter) mftModuleState.notificationGetter = () => {
          const next = getter();
          return next?.chatNotifications instanceof Map ? next.chatNotifications : next;
        };
        return true;
      }
      return false;
    };
    if (mftModuleState.notificationGetter) {
      try {
        const live = mftModuleState.notificationGetter();
        if (live instanceof Map) notes = live;
      } catch {
        mftModuleState.notificationGetter = null;
      }
    }
    if (!notes && rail) deps.adapter.eachHook(rail, accept);
    if (!notes) for (const anchor of document.querySelectorAll('[data-component="ChatSidebar"],[data-component="TopBar"],[data-component="AppShell"]')) {
      if (deps.adapter.eachHook(anchor, accept)) break;
    }
    if (!notes && rail) {
      notes = new Map();
      deps.adapter.eachHook(rail, value => {
        if (value?.notif?.chatId) notes.set(value.notif.chatId, value.notif);
        return false;
      }, true);
    }
    return notes || new Map();
  }
  
  function nativeNotificationAction(id, key) {
    if (!mftModuleState.notificationRail) return false;
    let action = null;
    deps.adapter.eachHook(mftModuleState.notificationRail, p => {
      if (p?.notif?.chatId === id && typeof p[key] === 'function') {
        action = p[key];
        return true;
      }
      return false;
    }, true);
    if (!action) return false;
    action();
    return true;
  }
  
  function notificationCopy(n) {
    const copy = deps.ui.state.el('div', 'notification-copy');
    copy.append(deps.ui.state.el('strong', '', n.characterName), deps.ui.state.el('p', '', n.kind === 'call' ? '전화가 왔어요.' : '메세지가 도착했습니다.'));
    return copy;
  }
  
  function saveUnreadLedger() {
    const value = JSON.stringify({
      counts: [...mftModuleState.retainedUnread].slice(-500),
      read: [...mftModuleState.readUnreadVersions].slice(-500)
    });
    if (value === mftModuleState.unreadStorageSignature) return;
    mftModuleState.unreadStorageSignature = value;
    try {
      localStorage.setItem('mft-unread-ledger', value);
    } catch {}
  }
  
  function chatUnreadMetadata(c) {
    let metadata = c.metadata;
    try {
      if (typeof metadata === 'string') metadata = JSON.parse(metadata);
    } catch {
      metadata = null;
    }
    return {
      unreadCount: Math.max(0, Number(metadata?.autonomousUnreadCount) || 0),
      unreadVersion: String(metadata?.autonomousUnreadAt || '')
    };
  }
  
  function acknowledgeUnread(id) {
    if (!id) return;
    mftModuleState.readLiveCounts.set(id, mftModuleState.retainedUnread.get(id) || 0);
    mftModuleState.retainedUnread.delete(id);
    const c = deps.chats.state.roomRows.find(c => c.id === id) || deps.chats.state.chatRegistry.get(id);
    if (c) mftModuleState.readUnreadVersions.set(id, c.unreadVersion + ':' + c.unreadCount);
    saveUnreadLedger();
    syncUnreadBadges(unreadSnapshot(new Map()));
  }
  
  function persistedUnread(c) {
    const lastVisit = deps.chats.state.chatVisits.get(c.id) || 0,
      arrival = Date.parse(c.unreadVersion) || 0;
    return c.unreadCount > 0 && (!arrival || arrival > lastVisit) && mftModuleState.readUnreadVersions.get(c.id) !== c.unreadVersion + ':' + c.unreadCount;
  }
  
  function unreadSnapshot(notes) {
    let live;
    const accept = (value, getter, raw = false) => {
      const counts = value?.unreadCounts instanceof Map ? value.unreadCounts : raw && value instanceof Map && value.size && [...value.values()].every(n => typeof n === 'number') ? value : null;
      if (!(counts instanceof Map)) return false;
      live = counts;
      if (getter) mftModuleState.unreadGetter = () => {
        const next = getter();
        return next?.unreadCounts instanceof Map ? next.unreadCounts : next;
      };
      return true;
    };
    if (mftModuleState.unreadGetter) try {
      const counts = mftModuleState.unreadGetter();
      if (counts instanceof Map) live = counts;else mftModuleState.unreadGetter = null;
    } catch {
      mftModuleState.unreadGetter = null;
    }
    if (!live) for (const anchor of document.querySelectorAll('[data-component="ChatSidebar"],[data-component="TopBar"],[data-component="AppShell"]')) {
      if (deps.adapter.eachHook(anchor, (value, getter) => accept(value, getter, anchor.dataset.component === 'ChatSidebar'))) break;
    }
    const active = !document.hidden && deps.ui.state.root.dataset.native === 'true' && deps.navigation.state.routeIntent === 'chat' && !deps.navigation.state.bridgeBusy ? deps.navigation.state.roomId : null;
    if (live) for (const [id, value] of live) {
      const count = Math.max(0, Number(value) || 0);
      if (count === 0) {
        mftModuleState.readLiveCounts.delete(id);
        continue;
      }
      if (id === active || count <= (mftModuleState.readLiveCounts.get(id) || 0)) continue;
      mftModuleState.retainedUnread.set(id, Math.max(mftModuleState.retainedUnread.get(id) || 0, count));
    }
    for (const [id, n] of notes) if (id !== active) {
      const count = Number(n.count) || 1;
      if (count <= (mftModuleState.readLiveCounts.get(id) || 0)) continue;
      mftModuleState.retainedUnread.set(id, Math.max(mftModuleState.retainedUnread.get(id) || 0, count));
      mftModuleState.readUnreadVersions.delete(id);
    }
    for (const c of deps.chats.state.chatRegistry.values()) if (c.id !== active && persistedUnread(c)) mftModuleState.retainedUnread.set(c.id, Math.max(mftModuleState.retainedUnread.get(c.id) || 0, c.unreadCount));
    if (active) mftModuleState.retainedUnread.delete(active);
    saveUnreadLedger();
    return new Map(mftModuleState.retainedUnread);
  }
  
  function syncUnreadBadges(counts) {
    if (deps.navigation.state.view === 'chats' && deps.ui.state.root.dataset.native !== 'true') for (const tab of deps.ui.state.main.querySelectorAll('.mode-tab')) {
      let total = 0;
      for (const [id, count] of counts) if ((deps.chats.state.chatRegistry.get(id) || deps.chats.state.roomRows.find(c => c.id === id))?.mode === tab.dataset.mode) total += count;
      let badge = tab.querySelector('.mode-unread');
      if (total) {
        if (!badge) {
          badge = deps.ui.state.el('span', 'mode-unread');
          badge.setAttribute('aria-hidden', 'true');
          tab.append(badge);
        }
        const text = total > 99 ? '99+' : String(total);
        if (badge.textContent !== text) badge.textContent = text;
      } else badge?.remove();
    }
    const count = [...counts.values()].reduce((sum, n) => sum + n, 0);
    let badge = deps.ui.state.tabs.get('chats').querySelector('.unread');
    if (count) {
      if (!badge) {
        badge = deps.ui.state.el('span', 'unread');
        deps.ui.state.tabs.get('chats').append(badge);
      }
      const text = count > 99 ? '99+' : String(count);
      if (badge.textContent !== text) badge.textContent = text;
    } else badge?.remove();
    if (deps.navigation.state.view === 'chats' && deps.ui.state.root.dataset.native !== 'true') for (const row of deps.ui.state.main.querySelectorAll('.chat-row')) {
      const count = counts.get(row.dataset.roomId) || 0;
      row.classList.toggle('has-unread', count > 0);
      let badge = row.querySelector('.chat-unread');
      if (count) {
        if (!badge) {
          badge = deps.ui.state.el('span', 'chat-unread');
          row.append(badge);
        }
        if (badge.textContent !== String(count)) badge.textContent = String(count);
      } else badge?.remove();
    }
  }
  
  function toastLifetime(id, n, row) {
    const key = toastKey(n);
    let clock = mftModuleState.toastClocks.get(id);
    if (clock?.key !== key) {
      if (clock) clearTimeout(clock.timer);
      clock = {
        key,
        expires: Date.now() + 5200,
        timer: null
      };
      mftModuleState.toastClocks.set(id, clock);
    }
    if (n.kind === 'call') return;
    if (clock.expires <= Date.now()) {
      row.remove();
      return;
    }
    clearTimeout(clock.timer);
    clock.timer = setTimeout(() => {
      if (deps.core.state.disposed) return;
      clock.timer = null;
      for (const item of mftModuleState.alertTray.querySelectorAll('.alert-row')) if (item.dataset.toastId === id) item.remove();
    }, clock.expires - Date.now());
  }
  
  function toastKey(n) {
    return JSON.stringify([n.count, n.kind, n.callId, n.characterName]);
  }
  
  function dismissToast(id, n, row) {
    mftModuleState.dismissedToasts.set(id, toastKey(n));
    row.remove();
    nativeNotificationAction(id, 'onDismiss');
  }
  
  function bindToastSwipe(row, id, n) {
    let gesture = null,
      blockClickUntil = 0;
    const reset = () => {
      row.style.removeProperty('transform');
      row.style.removeProperty('opacity');
    };
    row.addEventListener('click', e => {
      if (performance.now() < blockClickUntil) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);
    row.addEventListener('pointerdown', e => {
      if (e.isPrimary === false || e.button !== 0) return;
      gesture = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        width: row.getBoundingClientRect().width,
        dragging: false
      };
    });
    row.addEventListener('pointermove', e => {
      if (!gesture || e.pointerId !== gesture.id) return;
      const dx = e.clientX - gesture.x,
        dy = e.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
          gesture = null;
          return;
        }
        if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        gesture.dragging = true;
        try {
          row.setPointerCapture?.(e.pointerId);
        } catch {/* A cancelled pointer needs no capture. */}
      }
      row.style.transform = `translateX(${dx}px)`;
      row.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / gesture.width));
    });
    row.addEventListener('pointerup', e => {
      if (!gesture || e.pointerId !== gesture.id) return;
      const g = gesture;
      gesture = null;
      if (g.dragging) {
        blockClickUntil = performance.now() + 600;
        const dx = e.clientX - g.x;
        if (Math.abs(dx) >= Math.min(80, g.width * .25)) {
          dismissToast(id, n, row);
          return;
        }
      }
      reset();
    });
    const cancel = () => {
      gesture = null;
      reset();
    };
    row.addEventListener('pointercancel', cancel);
    row.addEventListener('lostpointercapture', cancel);
  }
  
  function scheduleNotifications() {
    if (deps.core.state.disposed || document.hidden || mftModuleState.notificationsQueued) return;
    mftModuleState.notificationsQueued = true;
    queueMicrotask(() => {
      mftModuleState.notificationsQueued = false;
      syncNotifications();
    });
  }
  
  function refreshUnreadSources() {
    // React may remount its stores while the browser is suspended.
    mftModuleState.notificationGetter = null;
    mftModuleState.unreadGetter = null;
    syncNotifications();
  }

  function syncNotifications() {
    if (deps.core.state.disposed || document.hidden) return;
    deps.updates.bindQueryUpdates();
    const notes = notificationSnapshot();
    for (const id of mftModuleState.dismissedToasts.keys()) if (!notes.has(id)) mftModuleState.dismissedToasts.delete(id);
    for (const [id, clock] of mftModuleState.toastClocks) if (!notes.has(id)) {
      clearTimeout(clock.timer);
      mftModuleState.toastClocks.delete(id);
    }
    const unread = unreadSnapshot(notes);
    syncUnreadBadges(unread);
    const signature = JSON.stringify([...notes].map(([id, n]) => [id, n.characterName, n.avatarUrl, n.avatarCrop, n.count, n.kind, n.callId]));
    deps.ui.state.html.toggleAttribute('data-mft-alerts', notes.size > 0);
    if (signature === mftModuleState.notificationSignature) return;
    mftModuleState.notificationSignature = signature;
    deps.updates.queueChatRefresh();
    mftModuleState.alertTray.replaceChildren();
    for (const [id, n] of notes) {
      if (mftModuleState.dismissedToasts.get(id) === toastKey(n)) continue;
      const row = deps.ui.state.el('div', 'alert-row');
      bindToastSwipe(row, n.chatId || id, n);
      const b = deps.ui.button('', () => {
        deps.data.state.cache.clear();
        deps.navigation.bridge('chat', {
          id: n.chatId || id,
          mode: 'conversation',
          characterIds: [],
          fromNotification: true
        });
      }, 'alert');
      b.append(deps.avatars.avatar(n.avatarUrl || '', n.characterName, 'round', n.avatarCrop), notificationCopy(n));
      const im = b.querySelector('img[data-src]');
      if (im) {
        im.src = im.dataset.src;
        im.removeAttribute('data-src');
      }
      row.append(b, deps.ui.button('×', () => dismissToast(n.chatId || id, n, row), 'alert-dismiss'));
      if (n.kind === 'call' && n.callId) {
        row.append(deps.ui.button('받기', () => nativeNotificationAction(n.chatId || id, 'onAcceptCall'), 'button'), deps.ui.button('거절', () => nativeNotificationAction(n.chatId || id, 'onDeclineCall'), 'quiet'));
      }
      row.dataset.toastId = id;
      mftModuleState.alertTray.append(row);
      toastLifetime(id, n, row);
    }
  }
  // Listen to the engine's existing query cache. Refresh only a visible extension list,
  // and keep selection/scroll while requests are batched. Never navigate from data events.

  const initialize = [
    { order: 10500, run() {
      mftModuleState.unreadHydration = null;
    } },
    { order: 18600, run() {
      mftModuleState.notificationObserver = null;
    } },
    { order: 18601, run() {
      mftModuleState.notificationRail = null;
    } },
    { order: 18602, run() {
      mftModuleState.notificationGetter = null;
    } },
    { order: 18603, run() {
      mftModuleState.notificationSignature = '';
    } },
    { order: 18700, run() {
      mftModuleState.alertTray = deps.ui.state.el('aside', 'alerts');
    } },
    { order: 18800, run() {
      mftModuleState.alertTray.setAttribute('aria-live', 'polite');
    } },
    { order: 18900, run() {
      deps.ui.state.body.append(mftModuleState.alertTray);
    } },
    { order: 19400, run() {
      mftModuleState.unreadGetter = null;
    } },
    { order: 19500, run() {
      mftModuleState.retainedUnread = new Map();
    } },
    { order: 19501, run() {
      mftModuleState.readUnreadVersions = new Map();
    } },
    { order: 19502, run() {
      mftModuleState.readLiveCounts = new Map();
    } },
    { order: 19600, run() {
      mftModuleState.unreadStorageSignature = '';
    } },
    { order: 19700, run() {
      try {
        const saved = JSON.parse(localStorage.getItem('mft-unread-ledger') || '{}');
        for (const [id, count] of saved.counts || []) if (typeof id === 'string' && Number(count) > 0) mftModuleState.retainedUnread.set(id, Math.min(9999, Number(count)));
        for (const [id, version] of saved.read || []) if (typeof id === 'string') mftModuleState.readUnreadVersions.set(id, String(version));
      } catch {}
    } },
    { order: 20400, run() {
      mftModuleState.dismissedToasts = new Map();
    } },
    { order: 20401, run() {
      mftModuleState.toastClocks = new Map();
    } },
    { order: 20900, run() {
      mftModuleState.notificationsQueued = false;
    } }
  ];
  const cleanup = [
    { order: 26, run() {
      for (const clock of mftModuleState.toastClocks.values()) clearTimeout(clock.timer);
    } },
    { order: 27, run() {
      mftModuleState.toastClocks.clear();
    } },
    { order: 28, run() {
      mftModuleState.unreadHydration?.abort();
    } },
    { order: 37, run() {
      mftModuleState.notificationObserver?.disconnect();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, notificationSnapshot, nativeNotificationAction, notificationCopy, saveUnreadLedger, chatUnreadMetadata, acknowledgeUnread, persistedUnread, unreadSnapshot, syncUnreadBadges, toastLifetime, toastKey, dismissToast, bindToastSwipe, scheduleNotifications, syncNotifications, refreshUnreadSources };
}

// Source: src/ui/hub.js
/** hub: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createHub(deps) {
  const mftModuleState = {

  };

  function menu(key, title, description) {
    const b = deps.ui.button('', () => key === 'personas' ? deps.catalog.personaGallery() : deps.navigation.openNative(key), 'menu-row');
    const copy = deps.ui.state.el('div');
    copy.append(deps.ui.state.el('strong', '', title), deps.ui.state.el('p', 'muted', description));
    b.append(copy, deps.ui.state.el('span', '', '›'));
    return b;
  }
  
  function hub(k) {
    const heading = deps.ui.state.el('div', 'page-heading');
    heading.append(deps.ui.state.el('h1', '', k === 'create' ? '제작' : '마이페이지'));
    if (k === 'my') {
      const help = deps.ui.button('도움말', () => deps.navigation.go('help'), 'quiet help-open');
      help.setAttribute('aria-label', '도움말 열기');
      heading.append(help);
    }
    deps.ui.state.main.replaceChildren(heading);
    if (k === 'create') {
      const hero = deps.ui.state.el('section', 'banner');
      hero.append(deps.ui.state.el('small', '', '제작'), deps.ui.state.el('h2', '', '새로운 이야기를 만들어 보세요'), deps.ui.state.el('p', 'muted', '캐릭터와 세계관을 한곳에서 관리해요.'), deps.ui.button('✦ 캐릭터 제작 · 관리', () => deps.navigation.openNative('characters'), 'primary'));
      deps.ui.state.main.append(hero);
      for (const x of [['personas', '페르소나', '대화에서 사용할 나의 프로필'], ['lorebooks', '로어북', '캐릭터가 기억할 배경과 정보'], ['presets', '프리셋', 'AI에게 전달할 지침']]) deps.ui.state.main.append(menu(...x));
    } else {
      for (const x of [['settings', '설정', '화면, 언어와 앱 설정'], ['connections', 'AI 연결', '사용할 모델과 API 설정'], ['agents', '에이전트 · 도구', '설치한 에이전트와 기능 전체 보기']]) deps.ui.state.main.append(menu(...x));
      const addons = menu('settings', '확장 관리', '설치한 외부 확장을 관리합니다.');
      addons.onclick = () => deps.navigation.settings('addons');
      deps.ui.state.main.append(addons);
      const colors = deps.ui.state.el('section', 'color-settings');
      colors.append(deps.ui.state.el('strong', '', '테마 설정'));
      const choices = deps.ui.state.el('div', 'theme-choices');
      for (const [v, t] of [['light', '라이트'], ['dark', '다크']]) {
        const b = deps.ui.button(t, () => deps.extensions.setEngineTheme(v), 'chip');
        b.dataset.active = String(deps.ui.state.html.dataset.theme === v);
        choices.append(b);
      }
      colors.append(choices);
      const design = deps.ui.button('', () => deps.navigation.go('design'), 'menu-row');
      design.dataset.designOpen = '';
      const copy = deps.ui.state.el('div');
      copy.append(deps.ui.state.el('strong', '', '디자인'), deps.ui.state.el('p', 'muted', '지향색, 홈·라이브러리 보기와 채팅 글자 간격'));
      design.append(copy, deps.ui.state.el('span', '', '›'));
      deps.ui.state.main.append(colors, design, deps.ui.state.el('h2', '', '바로가기'));
      deps.extensions.extensionShortcuts();
    }
  }
  
  function designScreen() {
    deps.ui.state.main.replaceChildren(deps.ui.button('‹ 마이페이지', () => deps.navigation.go('my'), 'quiet'), deps.ui.state.el('h1', '', '디자인'), deps.design.themePreferences());
  }

  const initialize = [

  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, menu, hub, designScreen };
}

// Source: src/engine/extensions.js
/** extensions: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createExtensions(deps) {
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
      const result = fn();
      if (result) {
        done?.(result);
        return;
      }
      if (count < 7) deps.core.later(step, [50, 80, 120, 180, 280, 450, 700][count++]);else {
        deps.navigation.state.bridgeBusy = false;
        deps.navigation.state.agentActive = false;
        deps.ui.notice('메뉴 연결을 찾지 못했어요. 다른 탭으로 이동하거나 기능 설치 상태를 확인해 주세요.');
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
      const set = deps.adapter.engineActions().setTheme;
      if (set) set(value);else {
        deps.adapter.engineActions().setSettingsTab('appearance');
        const select = await deps.navigation.waitEngine(() => document.querySelector('#settings-control-theme-mode select'), signal);
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
      deps.navigation.routeFailure(e, () => setEngineTheme(value));
    }
  }
  
  function openAgent(name) {
    deps.navigation.state.navController?.abort();
    deps.navigation.beginRoute('agent');
    deps.navigation.state.agentActive = true;
    deps.navigation.engineHome();
    const aliases = {
      Noodle: ['noodle', '누들'],
      'Gacha Forge': ['gachaforge', '가챠포지'],
      Slurp: ['slurp', 'slurp2', '슬러프', '슬럽']
    }[name];
    retryNative(() => {
      const norm = x => x.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
      const buttons = [...document.querySelectorAll('[data-component="HomeBrowserHub.TabList"] [role="tab"]')];
      const b = buttons.find(b => aliases.includes(norm(b.id.replace('marinara-home-tab-', ''))) || aliases.some(a => norm(b.getAttribute('aria-label') || b.textContent).includes(a)));
      if (!b) return false;
      b.click();
      deps.navigation.state.bridgeBusy = false;
      deps.ui.state.html.classList.remove('mft-transition');
      deps.navigation.finishRoute('agent');
      return true;
    });
  }
  
  function runExtension(target) {
    deps.navigation.state.navController?.abort();
    const c = new AbortController();
    deps.navigation.state.navController = c;
    deps.navigation.state.routeIntent = 'extension';
    target.click();
    // Toggles and portal dialogs stay over My. Only a real engine panel takes over the canvas.
    deps.navigation.waitEngine(() => document.querySelector('[data-panel-key][aria-hidden="false"]'), c.signal, 1200).then(() => {
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

// Source: src/engine/mounts.js
/** mounts: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createMounts(deps) {
  const mftModuleState = {
    shellObserver: undefined,
    centerObserver: undefined,
    notificationMountObserver: undefined,
    resumeTimer: null,
    resumeAt: 0
  };

  function checkEngineHome() {
    if (deps.core.state.disposed || deps.navigation.state.bridgeBusy) return;
    if (deps.ui.state.root.dataset.native === 'true' && deps.navigation.state.routeIntent === 'chat') deps.convo.bindSplits();
    if (deps.navigation.state.routeIntent === 'start') deps.launch.reconcile();
    if (deps.navigation.state.routeIntent === 'chat') deps.launch.checkExit();
    // Native settings/extensions may render asynchronously. Never guess that a temporary blank means Home.
  }
  
  function bindShell(attempt = 0) {
    const shell = document.querySelector('[data-component="AppShell"]');
    if (!shell) {
      if (attempt < 7) deps.core.bindLater(() => bindShell(attempt + 1), [50, 100, 200, 400, 600, 900, 1400][attempt]);
      return;
    }
    if (!mftModuleState.notificationMountObserver) {
      const parent = document.querySelector('[data-component="TopBar"]')?.parentElement;
      if (parent) {
        mftModuleState.notificationMountObserver = new MutationObserver(deps.notifications.scheduleNotifications);
        mftModuleState.notificationMountObserver.observe(parent, {
          childList: true
        });
      }
    }
    mftModuleState.shellObserver = new MutationObserver(() => {
      checkEngineHome();
      deps.notifications.scheduleNotifications();
      if (shell.dataset.chatSurfaceActive === 'true' && !deps.navigation.state.bridgeBusy && deps.ui.state.root.dataset.native === 'true') {
        deps.avatars.scheduleCrops();
        deps.convo.bindSplits();
      }
    });
    mftModuleState.shellObserver.observe(shell, {
      childList: true,
      attributes: true,
      attributeFilter: ['data-chat-surface-active']
    });
    const center = shell.querySelector('[data-component="CenterContent"]');
    if (center) {
      mftModuleState.centerObserver = new MutationObserver(() => {
        checkEngineHome();
        deps.notifications.scheduleNotifications();
      });
      mftModuleState.centerObserver.observe(center, {
        childList: true,
        attributes: true,
        attributeFilter: ['data-shell-overlay-mode']
      });
      for (const c of center.children) mftModuleState.centerObserver.observe(c, {
        childList: true
      });
    }
  }
  // Bootstrap binding is independent from page-request cancellation.
  
  function visibility() {
    deps.ui.state.root.toggleAttribute('data-suspended', document.hidden);
    if (document.hidden) {
      clearTimeout(mftModuleState.resumeTimer);
      mftModuleState.resumeTimer = null;
      mftModuleState.resumeAt = 0;
      deps.notifications.state.unreadHydration?.abort();
      deps.updates.state.chatRefreshRequest?.abort();
      deps.core.stop();
    } else if (deps.ui.state.root.dataset.native !== 'true' && !deps.ui.state.main.querySelector('.card,.chat-row,.menu-row,.description') && ['home', 'chats'].includes(deps.navigation.state.view)) deps.navigation.go(deps.navigation.state.view);else if (deps.ui.state.root.dataset.native !== 'true') {
      deps.avatars.observeImages();
      if (deps.navigation.state.view === 'chats') deps.updates.queueChatRefresh();
    }
  }
  
  function resumeActivity(event) {
    if (document.hidden || deps.core.state.disposed) return;
    if (event?.type === 'online') mftModuleState.resumeAt = 0;
    deps.notifications.syncNotifications();
    // visibility/focus/pageshow often arrive together on mobile. One bounded, fresh read; no poll.
    if (!mftModuleState.resumeTimer && Date.now() - mftModuleState.resumeAt > 1000) {
      mftModuleState.resumeTimer = setTimeout(() => {
        mftModuleState.resumeTimer = null;
        if (document.hidden || deps.core.state.disposed) return;
        mftModuleState.resumeAt = Date.now();
        deps.notifications.refreshUnreadSources();
        deps.chats.hydrateSavedUnread(true);
      }, 120);
    }
    if (deps.ui.state.root.dataset.native === 'true' && deps.navigation.state.routeIntent === 'chat') {
      deps.convo.bindSplits();
      deps.avatars.scheduleCrops();
    }
  }
  // Safe Markdown: constructs DOM from text; HTML, scripts and remote images are not executed.

  const initialize = [
    { order: 14200, run() {
      mftModuleState.shellObserver = null;
    } },
    { order: 14201, run() {
      mftModuleState.centerObserver = null;
    } },
    { order: 14202, run() {
      mftModuleState.notificationMountObserver = null;
    } },
    { order: 14800, run() {
      document.addEventListener('visibilitychange', visibility);
    } },
    { order: 14900, run() {
      document.addEventListener('visibilitychange', resumeActivity);
      window.addEventListener('focus', resumeActivity);
      window.addEventListener('pageshow', resumeActivity);
      window.addEventListener('online', resumeActivity);
    } }
  ];
  const cleanup = [
    { order: 36, run() {
      mftModuleState.notificationMountObserver?.disconnect();
    } },
    { order: 53, run() {
      mftModuleState.shellObserver?.disconnect();
    } },
    { order: 54, run() {
      mftModuleState.centerObserver?.disconnect();
    } },
    { order: 62, run() {
      document.removeEventListener('visibilitychange', visibility);
    } },
    { order: 63, run() {
      document.removeEventListener('visibilitychange', resumeActivity);
      window.removeEventListener('focus', resumeActivity);
      window.removeEventListener('pageshow', resumeActivity);
      window.removeEventListener('online', resumeActivity);
      clearTimeout(mftModuleState.resumeTimer);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, checkEngineHome, bindShell, visibility, resumeActivity };
}

// Source: src/ui/markdown.js
/** markdown: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createMarkdown(deps) {
  const mftModuleState = {

  };

  // Safe Markdown: constructs DOM from text; HTML, scripts and remote images are not executed.
  function renderMarkdown(target, text) {
    target.replaceChildren();
    const lines = String(text).replace(/\r/g, '').split('\n');
    let list = null,
      code = null;
    function inline(n, t) {
      const re = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*|\[[^\]]+\]\([^\s)]+\))/g;
      let pos = 0;
      for (const m of t.matchAll(re)) {
        n.append(document.createTextNode(t.slice(pos, m.index)));
        const v = m[0];
        let child;
        if (v.startsWith('[')) {
          const [, label, url] = v.match(/^\[([^\]]+)\]\(([^)]+)\)$/) || [];
          try {
            const u = new URL(url, location.origin);
            if (!['http:', 'https:'].includes(u.protocol)) throw Error();
            child = deps.ui.state.el('a', '', label);
            child.href = u.href;
            child.target = '_blank';
            child.rel = 'noopener noreferrer';
          } catch {
            child = document.createTextNode(v);
          }
        } else {
          const delim = v.startsWith('**') || v.startsWith('~~') ? 2 : 1;
          child = deps.ui.state.el(v[0] === '`' ? 'code' : v.startsWith('**') ? 'strong' : v.startsWith('~~') ? 'del' : 'em', '', v.slice(delim, -delim));
        }
        n.append(child);
        pos = m.index + v.length;
      }
      n.append(document.createTextNode(t.slice(pos)));
    }
    for (const line of lines) {
      if (/^```/.test(line)) {
        if (code) code = null;else {
          code = deps.ui.state.el('pre');
          target.append(code);
        }
        list = null;
        continue;
      }
      if (code) {
        code.append(document.createTextNode(line + '\n'));
        continue;
      }
      const h = line.match(/^(#{1,6})\s+(.+)$/),
        li = line.match(/^\s*(?:[-*+]\s+|\d+\.\s+)(.*)$/);
      if (li) {
        if (!list) {
          list = deps.ui.state.el(/^\s*\d/.test(line) ? 'ol' : 'ul');
          target.append(list);
        }
        const n = deps.ui.state.el('li');
        inline(n, li[1]);
        list.append(n);
        continue;
      }
      list = null;
      if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        target.append(deps.ui.state.el('hr'));
        continue;
      }
      const n = deps.ui.state.el(h ? 'h' + Math.min(h[1].length + 1, 6) : line.startsWith('> ') ? 'blockquote' : 'p');
      inline(n, h ? h[2] : line.replace(/^> /, ''));
      target.append(n);
    }
  }

  const initialize = [

  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, renderMarkdown };
}

// Source: src/ui/gestures.js
/** gestures: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createGestures(deps) {
  const mftModuleState = {
    swipe: undefined,
    phone: undefined
  };

  function refreshCurrentView() {
    location.reload();
  }
  
  function returnFromNative() {
    const origin = deps.navigation.state.nativeOrigin || {
      view: deps.navigation.state.returnView === 'detail' ? 'home' : deps.navigation.state.returnView
    };
    deps.navigation.state.nativeOrigin = null;
    deps.data.state.cache.clear();
    deps.navigation.engineHome();
    deps.ui.own();
    deps.chats.state.chatMode = origin.chatMode || deps.chats.state.chatMode;
    deps.chats.state.chatsAll = origin.chatsAll ?? deps.chats.state.chatsAll;
    deps.chats.state.folderFilter = origin.folderFilter ?? deps.chats.state.folderFilter;
    deps.navigation.state.restoreScrollTarget = {
      view: origin.view,
      scroll: origin.scroll || 0
    };
    if (origin.view === 'detail' && origin.card) {
      deps.navigation.state.navController?.abort();
      deps.navigation.state.bridgeBusy = false;
      deps.navigation.state.agentActive = false;
      deps.navigation.state.routeIntent = 'own';
      deps.ui.state.html.classList.remove('mft-transition');
      deps.ui.state.html.removeAttribute('data-mft-agent');
      deps.catalog.detail(origin.card, true);
      deps.history.installBackWatcher();
    } else if (origin.view === 'personas') {
      deps.navigation.state.navController?.abort();
      deps.navigation.state.bridgeBusy = false;
      deps.navigation.state.agentActive = false;
      deps.navigation.state.routeIntent = 'own';
      deps.ui.state.html.classList.remove('mft-transition');
      deps.ui.state.html.removeAttribute('data-mft-agent');
      deps.catalog.personaGallery();
      deps.history.installBackWatcher();
    } else deps.navigation.go(origin.view || 'home', true);
  }
  
  function onSwipeStart(e) {
    mftModuleState.swipe = null;
    if (deps.ui.state.root.dataset.native === 'true' && deps.navigation.state.routeIntent === 'chat') return;
    const path = e.composedPath(),
      target = path[0];
    if (path.some(n => n instanceof Element && (n.matches('.rail,.gallery,.persona-folder,.card,.gallery-card,[role=tablist],[role=slider]') || n.scrollWidth > n.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(n).overflowX)))) return;
    if (!mftModuleState.phone.matches || e.touches.length !== 1 || !(target instanceof Element) || target.closest('input,textarea,select,button,a,[contenteditable],[role="slider"],.rail,[data-chat-floating-panel]')) return;
    mftModuleState.swipe = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      at: performance.now()
    };
  }
  
  function onSwipeCancel() {
    mftModuleState.swipe = null;
  }
  
  function onSwipeEnd(e) {
    const s = mftModuleState.swipe;
    mftModuleState.swipe = null;
    if (deps.ui.state.root.dataset.native === 'true' && deps.navigation.state.routeIntent === 'chat') return;
    if (!s || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - s.x,
      dy = e.changedTouches[0].clientY - s.y;
    if (performance.now() - s.at > 700) return;
    if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
    if (deps.ui.state.root.dataset.native !== 'true') {
      const keys = ['home', 'chats', 'create', 'my'],
        i = keys.indexOf(deps.navigation.state.view);
      if (i < 0) return;
      deps.navigation.go(keys[Math.max(0, Math.min(3, i + (dx < 0 ? 1 : -1)))]);
      return;
    }
    const social = document.querySelector('[data-component="NoodleView.MobileBottomNav"]');
    if (deps.navigation.state.agentActive && social) {
      const buttons = [...social.querySelectorAll('button')].slice(1),
        i = buttons.findIndex(b => b.getAttribute('aria-current') === 'page');
      deps.core.later(() => {
        buttons[Math.max(0, Math.min(buttons.length - 1, i + (dx < 0 ? 1 : -1)))]?.click();
        document.activeElement?.matches('input,textarea') && document.activeElement.blur();
      }, 0);
      return;
    }
    if (dx > 0) deps.navigation.go('chats');else if (deps.ui.state.visible(document.querySelector('[data-component="ChatSidebar"]'))) deps.adapter.nativeTarget('chats')?.click();
  }

  const initialize = [
    { order: 16300, run() {
      mftModuleState.swipe = null;
    } },
    { order: 16400, run() {
      mftModuleState.phone = matchMedia('(max-width:767px)');
    } },
    { order: 17000, run() {
      document.addEventListener('touchstart', onSwipeStart, {
        passive: true
      });
    } },
    { order: 17100, run() {
      document.addEventListener('touchend', onSwipeEnd, {
        passive: true
      });
    } },
    { order: 17200, run() {
      document.addEventListener('touchcancel', onSwipeCancel, {
        passive: true
      });
      // Galleries and chat folders reuse the engine data; no background list polling.
    } }
  ];
  const cleanup = [
    { order: 46, run() {
      document.removeEventListener('touchstart', onSwipeStart);
    } },
    { order: 47, run() {
      document.removeEventListener('touchend', onSwipeEnd);
    } },
    { order: 48, run() {
      document.removeEventListener('touchcancel', onSwipeCancel);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, refreshCurrentView, returnFromNative, onSwipeStart, onSwipeCancel, onSwipeEnd };
}

// Source: src/features/previews.js
/** previews: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createPreviews(deps) {
  const mftModuleState = {
    previewCache: undefined,
    previewRequests: undefined,
    previewObserver: undefined,
    previewGeneration: undefined
  };

  function fillPreviews(slice, ticket) {
    const generation = ++mftModuleState.previewGeneration;
    mftModuleState.previewObserver?.disconnect();
    let queue = [],
      working = 0;
    async function drain() {
      if (working >= 2 || !queue.length || ticket !== deps.core.state.epoch || generation !== mftModuleState.previewGeneration) return;
      const c = queue.shift();
      working++;
      const controller = new AbortController();
      mftModuleState.previewRequests.add(controller);
      try {
        const key = c.id + ':' + (c.lastMessageAt || '');
        let text = mftModuleState.previewCache.get(key);
        if (text === undefined) {
          const rows = await deps.data.jsonRequest('/chats/' + encodeURIComponent(c.id) + '/messages?limit=1', 'GET', undefined, controller.signal);
          text = String(rows?.[rows.length - 1]?.content || '').slice(0, 140);
          mftModuleState.previewCache.set(key, text);
          while (mftModuleState.previewCache.size > 200) mftModuleState.previewCache.delete(mftModuleState.previewCache.keys().next().value);
        }
        if (ticket === deps.core.state.epoch && generation === mftModuleState.previewGeneration) {
          c.preview = text;
          const n = deps.ui.state.main.querySelector(`[data-preview-id="${CSS.escape(c.id)}"]`);
          if (n) n.textContent = text || '아직 메시지가 없어요.';
        }
      } catch {} finally {
        working--;
        mftModuleState.previewRequests.delete(controller);
        drain();
      }
    }
    const byId = new Map(deps.chats.state.roomRows.filter(c => !c.preview).map(c => [String(c.id), c]));
    const targets = [];
    for (const node of deps.ui.state.main.querySelectorAll('[data-preview-id]')) {
      const c = byId.get(node.dataset.previewId);
      if (!c) continue;
      const text = mftModuleState.previewCache.get(c.id + ':' + (c.lastMessageAt || ''));
      if (text !== undefined) { c.preview = text; node.textContent = text || '아직 메시지가 없어요.'; }
      else targets.push(node);
    }
    if (!targets.length) return;
    mftModuleState.previewObserver = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) {
        mftModuleState.previewObserver.unobserve(e.target);
        const c = byId.get(e.target.dataset.previewId);
        if (c) queue.push(c);
      }
      drain();
      drain();
    }, {
      root: deps.ui.state.main,
      rootMargin: '30px'
    });
    for (const node of targets) mftModuleState.previewObserver.observe(node);
  }

  const initialize = [
    { order: 17700, run() {
      mftModuleState.previewCache = new Map();
    } },
    { order: 17701, run() {
      mftModuleState.previewRequests = new Set();
    } },
    { order: 17800, run() {
      mftModuleState.previewObserver = null;
    } },
    { order: 17801, run() {
      mftModuleState.previewGeneration = 0;
    } }
  ];
  const cleanup = [
    { order: 66, run() {
      mftModuleState.previewCache.clear();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, fillPreviews };
}

// Source: src/features/daily.js
/** daily: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createDaily(deps) {
  const mftModuleState = {

  };

  // Same compact catalog route as the official home widget; select one stable daily ID.
  function localDay() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }
  
  function dailyRank(day, id) {
    let hash = 2166136261;
    for (const ch of day + ':' + id) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
    return hash >>> 0;
  }
  
  async function characterOfDay(ticket) {
    const day = localDay();
    let previous;
    try {
      previous = JSON.parse(localStorage.getItem('mft-daily-character') || 'null');
    } catch {}
    if (previous?.day === day && previous.card) return previous.card;
    let chosen = null,
      alternate = null,
      rank = Infinity,
      otherRank = Infinity,
      offset = 0,
      generation;
    for (let attempt = 0; attempt < 3; attempt++) {
      chosen = alternate = null;
      rank = otherRank = Infinity;
      offset = 0;
      generation = undefined;
      while (true) {
        const page = await deps.data.get('/characters/catalog?' + new URLSearchParams({
          limit: '100',
          offset: String(offset)
        }), ticket);
        generation ??= page.catalogGeneration;
        if (page.catalogGeneration !== generation) break;
        for (const r of page.items || []) {
          if (!String(r.name || '').trim()) continue;
          const value = dailyRank(day, String(r.id));
          if (value < rank || value === rank && String(r.id) < chosen?.id) {
            rank = value;
            chosen = deps.data.compact(r);
          }
          if (r.id !== previous?.card?.id && (value < otherRank || value === otherRank && String(r.id) < alternate?.id)) {
            otherRank = value;
            alternate = deps.data.compact(r);
          }
        }
        if (!page.hasMore) {
          const pick = alternate || chosen;
          try {
            if (pick) localStorage.setItem('mft-daily-character', JSON.stringify({
              day,
              card: pick
            }));
          } catch {}
          return pick;
        }
        const advance = Number(page.limit) || Number(page.items?.length) || 0;
        if (!advance) throw Error('캐릭터 목록을 불러오지 못했어요.');
        offset += advance;
      }
    }
    throw Error('라이브러리가 변경됐어요. 다시 시도해 주세요.');
  }
  // Existing engine navigation callback provides an ID route when a named action is not selected in a hook.

  const initialize = [

  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, localDay, dailyRank, characterOfDay };
}

// Source: src/engine/query-updates.js
/** updates: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createUpdates(deps) {
  const mftModuleState = {
    queryCache: undefined,
    queryUnsubscribe: undefined,
    chatRefreshTimer: undefined,
    chatRefreshRequest: undefined,
    chatRevision: undefined,
    chatRefreshBurst: undefined
  };

  function invalidateChats(id) {
    for (const key of deps.data.state.cache.keys()) if (key.startsWith('/chats')) deps.data.state.cache.delete(key);
    if (id) { for (const key of deps.previews.state.previewCache.keys()) if (key.startsWith(id + ':')) deps.previews.state.previewCache.delete(key); }
    else deps.previews.state.previewCache.clear();
  }
  
  function queueChatRefresh(id) {
    invalidateChats(id);
    mftModuleState.chatRevision++;
    if (deps.core.state.disposed || document.hidden || deps.navigation.state.bridgeBusy || deps.ui.state.root.dataset.native === 'true' || deps.navigation.state.view !== 'chats') return;
    mftModuleState.chatRefreshBurst ||= Date.now();
    if (mftModuleState.chatRefreshTimer) {
      clearTimeout(mftModuleState.chatRefreshTimer);
      deps.core.state.bootstrapTimers.delete(mftModuleState.chatRefreshTimer);
    }
    mftModuleState.chatRefreshTimer = deps.core.bindLater(() => {
      mftModuleState.chatRefreshTimer = null;
      mftModuleState.chatRefreshBurst = 0;
      refreshChatRows();
    }, Date.now() - mftModuleState.chatRefreshBurst >= 1000 ? 0 : 180);
  }
  
  async function refreshChatRows() {
    if (deps.core.state.disposed || deps.navigation.state.view !== 'chats' || deps.ui.state.root.dataset.native === 'true' || deps.navigation.state.bridgeBusy) return;
    const ticket = deps.core.state.epoch,
      all = deps.chats.state.chatsAll,
      revision = mftModuleState.chatRevision;
    mftModuleState.chatRefreshRequest?.abort();
    const controller = new AbortController();
    mftModuleState.chatRefreshRequest = controller;
    try {
      const data = await deps.data.jsonRequest(all ? '/chats' : '/chats/home-feed', 'GET', undefined, controller.signal);
      if (deps.core.state.disposed || ticket !== deps.core.state.epoch || deps.ui.state.root.dataset.native === 'true' || deps.navigation.state.view !== 'chats') return;
      const rows = (all ? Array.isArray(data) ? data : [] : data.recentChats || []).map(r => ({
        chat: all ? r : r.chat,
        latest: all ? r.lastMessage || r.latestMessage : r.latestMessage
      }));
      const sortedRows = deps.chats.orderedChats(rows.map(r => deps.chats.normalizedChat(r.chat, r.latest)), all);
      deps.chats.ingestChats(sortedRows, all);
      const selected = sortedRows.map(c => ({
        chat: c,
        latest: {
          content: c.preview
        }
      })).filter(r => r.chat.mode === deps.chats.state.chatMode && (!all || !deps.chats.state.folderFilter || (deps.chats.state.folderFilter === 'unfiled' ? !r.chat.folderId : r.chat.folderId === deps.chats.state.folderFilter)));
      const listed = [...deps.ui.state.main.querySelectorAll('.chat-row')];
      const ids = new Set(listed.map(n => n.dataset.roomId));
      const selectedIds = new Set(selected.map(r => String(r.chat.id)));
      const rendered = new Map(listed.map(n => [n.dataset.roomId, n]));
      const storedRows = new Map(deps.chats.state.roomRows.map(c => [String(c.id), c]));
      if (selected.slice(0, Math.max(30, listed.length)).some(r => !ids.has(String(r.chat.id))) || listed.some(n => !selectedIds.has(n.dataset.roomId))) {
        deps.navigation.state.restoreScrollTarget = {
          view: 'chats',
          scroll: deps.ui.state.main.scrollTop
        };
        deps.chats.chats(all);
        return;
      }
      for (const c of deps.previews.state.previewRequests) c.abort();
      const list = deps.ui.state.main.querySelector('.chat-list');
      let cursor = list?.firstElementChild;
      for (const {
        chat: c,
        latest
      } of selected) {
        const row = rendered.get(String(c.id)),
          stored = storedRows.get(String(c.id));
        if (!row || !stored) continue;
        Object.assign(stored, {
          unreadCount: c.unreadCount,
          unreadVersion: c.unreadVersion
        });
        stored.name = c.name || stored.name;
        stored.lastMessageAt = c.lastMessageAt || c.updatedAt || '';
        const name = row.querySelector('strong');
        if (name.textContent !== stored.name) name.textContent = stored.name;
        if (latest?.content !== undefined) {
          stored.preview = String(latest.content).slice(0, 140);
          const preview = row.querySelector('[data-preview-id]');
          const text = stored.preview || '아직 메시지가 없어요.';
          if (preview.textContent !== text) preview.textContent = text;
        } else stored.preview = '';
        if (list && row.parentElement) {
          const item = row.parentElement;
          if (item === cursor) cursor = cursor.nextElementSibling;
          else list.insertBefore(item, cursor || null);
        }
      }
      deps.previews.fillPreviews(deps.chats.state.roomRows, ticket);
      deps.notifications.syncUnreadBadges(deps.notifications.unreadSnapshot(deps.notifications.notificationSnapshot()));
      deps.avatars.observeImages();
    } catch {} finally {
      if (mftModuleState.chatRefreshRequest === controller) mftModuleState.chatRefreshRequest = null;
      if (revision !== mftModuleState.chatRevision && !deps.core.state.disposed) queueChatRefresh();
    }
  }
  
  function bindQueryUpdates() {
    if (mftModuleState.queryCache) return;
    let client;
    for (const anchor of document.querySelectorAll('[data-component="TopBar"],[data-component="AppShell"]')) {
      if (deps.adapter.eachHook(anchor, value => {
        const candidate = value?.value || value?.client || value;
        if (typeof candidate?.getQueryCache === 'function') {
          client = candidate;
          return true;
        }
        return false;
      })) break;
    }
    if (!client) return;
    const found = client.getQueryCache();
    if (typeof found?.subscribe !== 'function') return;
    mftModuleState.queryCache = found;
    mftModuleState.queryUnsubscribe = found.subscribe(event => {
      const key = event.query?.queryKey;
      if (event.type === 'updated' && ['success', 'invalidate', 'setState'].includes(event.action?.type) && Array.isArray(key) && ['chats', 'home-feed'].includes(key[0])) {
        if (key[0] === 'chats' && key[1] === 'list' && Array.isArray(event.query?.state?.data)) deps.chats.ingestChats(event.query.state.data.map(c => deps.chats.normalizedChat(c)), true);
        const feed = event.query?.state?.data?.recentChats;
        if (Array.isArray(feed)) deps.chats.ingestChats(feed.filter(r => r?.chat).map(r => deps.chats.normalizedChat(r.chat, r.latestMessage)));
        deps.notifications.scheduleNotifications();
        queueChatRefresh(key[0] === 'chats' && key[1] === 'messages' && typeof key[2] === 'string' ? key[2] : undefined);
      }
    });
  }
  // Only translation nodes are adapted; native font preferences remain authoritative.

  const initialize = [
    { order: 21200, run() {
      mftModuleState.queryCache = null;
    } },
    { order: 21201, run() {
      mftModuleState.queryUnsubscribe = null;
    } },
    { order: 21202, run() {
      mftModuleState.chatRefreshTimer = null;
    } },
    { order: 21203, run() {
      mftModuleState.chatRefreshRequest = null;
    } },
    { order: 21204, run() {
      mftModuleState.chatRevision = 0;
    } },
    { order: 21205, run() {
      mftModuleState.chatRefreshBurst = 0;
    } }
  ];
  const cleanup = [
    { order: 32, run() {
      mftModuleState.queryUnsubscribe?.();
    } },
    { order: 33, run() {
      mftModuleState.chatRefreshRequest?.abort();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, invalidateChats, queueChatRefresh, refreshChatRows, bindQueryUpdates };
}

// Source: src/features/translations.js
/** translations: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createTranslations(deps) {
  const mftModuleState = {
    translationRoots: undefined,
    translationObserver: undefined,
    translationConnected: undefined,
    translationSizes: undefined
  };

  function restoreTranslationSizes() {
    for (const [n, old] of mftModuleState.translationSizes) if (n.isConnected) {
      if (old.value) n.style.setProperty('--mft-translation-size', old.value, old.priority);else n.style.removeProperty('--mft-translation-size');
    }
    mftModuleState.translationSizes.clear();
  }
  
  function sizeTranslation(n) {
    if (!n.isConnected) return;
    const scope = n.closest('[data-message-id],.mari-message,.mari-message-body') || n.parentElement?.parentElement;
    const source = n.closest('.mari-message-content') || scope?.querySelector('.mari-message-content') || n.closest('.mari-rp-bubble');
    if (!source || source === n) return;
    const original = getComputedStyle(source).fontSize;
    if (!original) return;
    const separate = !n.closest('.mari-message-content') || n.matches('.mt-2,.border-t');
    const size = separate ? `max(1px, calc(${original} - var(--mft-translation-reduction,0px)))` : original;
    if (!mftModuleState.translationSizes.has(n)) mftModuleState.translationSizes.set(n, {
      value: n.style.getPropertyValue('--mft-translation-size'),
      priority: n.style.getPropertyPriority('--mft-translation-size')
    });
    if (n.style.getPropertyValue('--mft-translation-size') !== size) n.style.setProperty('--mft-translation-size', size);
  }
  
  function bindTranslationSizes() {
    const candidates = deps.ui.state.root.dataset.native === 'true' && deps.navigation.state.routeIntent === 'chat' ? [...document.querySelectorAll('[data-chat-mode]')].filter(deps.ui.state.visible) : [];
    const next = candidates.filter(n => !candidates.some(p => p !== n && p.contains(n)));
    const same = next.length === mftModuleState.translationRoots.length && next.every((n, i) => n === mftModuleState.translationRoots[i]);
    if (same && mftModuleState.translationConnected) return;
    if (!same) {
      mftModuleState.translationObserver?.disconnect();
      restoreTranslationSizes();
      mftModuleState.translationRoots = next;
    }
    if (!next.length) return;
    if (!mftModuleState.translationObserver) mftModuleState.translationObserver = new MutationObserver(records => {
      if (deps.core.state.disposed || document.hidden) return;
      const changed = new Set();
      const add = n => {
        if (!(n instanceof Element)) return;
        if (n.matches('.translation-text')) changed.add(n);
        for (const t of n.querySelectorAll('.translation-text')) changed.add(t);
      };
      for (const r of records) {
        if (r.type === 'attributes') {
          if (!r.target.matches('.mari-message-content,.mari-rp-bubble')) continue;
          const row = r.target.closest('[data-message-id],.mari-message,.mari-message-body');
          add(row || r.target);
        } else {
          const parent = r.target.closest?.('.translation-text');
          if (parent) changed.add(parent);
          for (const n of r.addedNodes) add(n);
        }
      }
      for (const n of changed) sizeTranslation(n);
      for (const n of mftModuleState.translationSizes.keys()) if (!n.isConnected) mftModuleState.translationSizes.delete(n);
    });
    for (const scope of next) {
      scope.querySelectorAll('.translation-text').forEach(sizeTranslation);
      mftModuleState.translationObserver.observe(scope, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    mftModuleState.translationConnected = true;
  }
  
  // One owner per native bubble. A TTS replacement is the presentation source, never its
  // hidden native input. Splitting is confined to bubble layout; linear layout stays native.

  const initialize = [
    { order: 21700, run() {
      mftModuleState.translationRoots = [];
    } },
    { order: 21701, run() {
      mftModuleState.translationObserver = null;
    } },
    { order: 21702, run() {
      mftModuleState.translationConnected = false;
    } },
    { order: 21800, run() {
      mftModuleState.translationSizes = new Map();
    } }
  ];
  const cleanup = [
    { order: 1, run() {
      mftModuleState.translationObserver?.disconnect();
    } },
    { order: 2, run() {
      restoreTranslationSizes();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, restoreTranslationSizes, sizeTranslation, bindTranslationSizes };
}

// Source: src/features/convo.js
/** convo: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createConvo(deps) {
  const mftModuleState = {
    splitObserver: undefined,
    splitRoot: undefined,
    splitTask: undefined,
    splitConnected: undefined,
    splitFull: undefined,
    splitDirty: undefined,
    splitSources: undefined,
    presentationOwners: undefined
  };

  function resetSplit(n, state) {
    state.display.remove();
    n.removeAttribute('data-mft-split');
    if (!n.hasAttribute('data-mari-tts-source-view') && n.style.getPropertyValue('display') === 'none' && n.style.getPropertyPriority('display') === 'important') {
      if (state.displayValue) n.style.setProperty('display', state.displayValue, state.displayPriority);else n.style.removeProperty('display');
    }
    mftModuleState.splitSources.delete(n);
  }
  
  function displayedBubble(nativeNode) {
    if (nativeNode.hasAttribute('data-mari-tts-source-view')) {
      let next = nativeNode.nextElementSibling;
      for (let i = 0; next && i < 4; i++, next = next.nextElementSibling) {
        if (next.hasAttribute('data-mari-tts-copy')) {
          if (next.hasAttribute('data-mft-split') && !mftModuleState.splitSources.has(next)) next.removeAttribute('data-mft-split');
          if (!mftModuleState.splitSources.has(next) && next.style.getPropertyValue('display') === 'none' && !next.hidden) next.style.removeProperty('display');
          return next;
        }
      }
      return null;
    }
    return nativeNode;
  }
  
  function renderedLineFragments(source) {
    const copy = source.cloneNode(true),
      originals = [...source.querySelectorAll('*')],
      copies = [...copy.querySelectorAll('*')];
    for (let i = originals.length - 1; i >= 0; i--) {
      const n = originals[i],
        style = getComputedStyle(n);
      if (n.matches('[hidden],[aria-hidden="true"],.mari-tts-cue,.mari-tts-line-controls,[data-mari-ext-tts-hidden-translation]') || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') copies[i]?.remove();
    }
    copy.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
    copy.querySelectorAll('p,blockquote,h1,h2,h3,h4,h5,h6').forEach(p => p.append('\n'));
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT),
      nodes = [];
    let node,
      total = 0;
    while (node = walker.nextNode()) {
      nodes.push({
        node,
        start: total,
        end: total + node.data.length
      });
      total += node.data.length;
    }
    const full = copy.textContent;
    if (!full.includes('\n')) return [];
    const fragments = [];
    let offset = 0,
      firstIndex = 0,
      lastIndex = 0;
    for (const line of full.split('\n')) {
      const start = offset,
        end = offset + line.length;
      offset = end + 1;
      if (!line.trim()) continue;
      while (firstIndex < nodes.length && nodes[firstIndex].end <= start) firstIndex++;
      lastIndex = Math.max(lastIndex, firstIndex);
      while (lastIndex + 1 < nodes.length && nodes[lastIndex + 1].start < end) lastIndex++;
      const first = nodes[firstIndex],
        last = nodes[lastIndex];
      if (!first || !last) continue;
      const range = document.createRange();
      range.setStart(first.node, start - first.start);
      range.setEnd(last.node, end - last.start);
      fragments.push(range.cloneContents());
    }
    return fragments;
  }
  
  function makeSplit(source, fragments, fingerprint, nativeNode) {
    mftModuleState.presentationOwners.set(source, nativeNode);
    let state = mftModuleState.splitSources.get(source);
    if (!state) {
      const display = deps.ui.state.el('mft-message-lines', 'mft-split-display');
      const row = source.closest('[data-message-id],.mari-message');
      display.dataset.role = source.classList.contains('texting-bubble-user') || row?.classList.contains('mari-message-user') || row?.dataset.messageRole === 'user' ? 'user' : 'assistant';
      const scope = display.attachShadow({
          mode: 'open'
        }),
        style = deps.ui.state.el('style');
      style.textContent = ':host{display:flex;flex-direction:column;align-items:flex-start;gap:6px;max-width:100%;min-width:0;line-height:var(--mft-chat-line-height,1.8);letter-spacing:var(--mft-chat-letter-spacing,0px);overflow-wrap:anywhere}:host([data-role=user]){align-items:flex-end}.mft-line{box-sizing:border-box;display:block;max-width:100%;border-radius:16px;padding:9px 12px;background:var(--mft-card,#fff);color:var(--mft-ink,#191921);white-space:pre-wrap;font:inherit}:host([data-role=user]) .mft-line{background:var(--mft-accent,#6656ec);color:#fff}.mft-line p,.mft-line blockquote{margin:0}a{color:inherit}';
      scope.append(style);
      state = {
        display,
        scope,
        content: null,
        displayValue: source.style.getPropertyValue('display'),
        displayPriority: source.style.getPropertyPriority('display')
      };
      if (source.hasAttribute('data-mari-tts-copy') && state.displayValue === 'none') state.displayValue = '';
      mftModuleState.splitSources.set(source, state);
    }
    if (state.content !== fingerprint) {
      for (const child of [...state.scope.children]) if (child.tagName !== 'STYLE') child.remove();
      for (const fragment of fragments) {
        const line = deps.ui.state.el('div', 'mft-line');
        line.append(fragment);
        state.scope.append(line);
      }
      state.content = fingerprint;
    }
    for (const prop of ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing']) if (state.display.style[prop] !== source.style[prop]) state.display.style[prop] = source.style[prop];
    source.dataset.mftSplit = 'true';
    // Attribute-scoped CSS hides only our native source; foreign clones never inherit inline hiding.
    if (source.nextElementSibling !== state.display) source.after(state.display);
  }
  
  function syncSplits() {
    mftModuleState.splitTask = null;
    if (deps.core.state.disposed || document.hidden) return;
    mftModuleState.splitObserver?.disconnect();
    const scopes = mftModuleState.splitFull ? mftModuleState.splitRoot ? [mftModuleState.splitRoot] : [] : [...mftModuleState.splitDirty].filter(n => n.isConnected && mftModuleState.splitRoot?.contains(n));
    mftModuleState.splitFull = false;
    mftModuleState.splitDirty.clear();
    const scan = selector => scopes.flatMap(scope => [...(scope.matches(selector) ? [scope] : []), ...scope.querySelectorAll(selector)]);
    const owners = new Map();
    if (mftModuleState.splitRoot) for (const copy of scan('[data-mari-tts-copy]')) {
      if (copy.closest('.ptx-view') || copy.parentElement.closest('[data-mari-tts-copy]')) continue;
      let peer = copy.previousElementSibling;
      while (peer?.matches('mft-message-lines')) peer = peer.previousElementSibling;
      const known = mftModuleState.presentationOwners.get(copy);
      if (!peer?.hasAttribute('data-mari-tts-source-view') || known && !known.isConnected || copy.closest('[data-message-id],.mari-message')?.querySelector('textarea')) {
        const state = mftModuleState.splitSources.get(copy);
        if (state) resetSplit(copy, state);
        copy.remove();
      }
    }
    if (mftModuleState.splitRoot) for (const nativeNode of scan('.mari-message-bubble')) {
      if (nativeNode.closest('[data-mari-tts-copy],.ptx-view,.mari-convo-viewer-split-display,.mft-split-display')) continue;
      if (nativeNode.classList.contains('mari-convo-viewer-split-bubble')) continue;
      const source = displayedBubble(nativeNode);
      if (source) {
        owners.set(source, nativeNode);
        mftModuleState.presentationOwners.set(source, nativeNode);
      }
    }
    for (const [n, state] of mftModuleState.splitSources) {
      const row = n.closest('[data-message-id],.mari-message');
      if (!n.isConnected || !mftModuleState.splitRoot?.contains(n) || scopes.some(scope => scope.contains(n)) && (!owners.has(n) || row?.querySelector('textarea'))) resetSplit(n, state);
    }
    for (const [source, nativeNode] of owners) {
      const row = nativeNode.closest('[data-message-id],.mari-message');
      const prior = mftModuleState.splitSources.get(source);
      // PTX owns a live, interactive sibling immediately after its host. Never clone or reorder it.
      const skip = row?.hasAttribute('data-ptx-active') || row?.querySelector('.ptx-view,[data-ptx-hidden]') || deps.adapter.liveBubble(nativeNode) || !row || row.querySelector('textarea') || row.querySelector('.mari-message-typing') || source.querySelector('button:not(.mari-tts-line-controls button),code,img,input,pre,ul,ol,table') || [...nativeNode.children].some(c => c.classList.contains('mb-0.5')) || row.className.includes('bg-[var(--secondary)]/20');
      if (skip) {
        if (prior) resetSplit(source, prior);
        continue;
      }
      if (prior) for (const prop of ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing']) if (prior.display.style[prop] !== source.style[prop]) prior.display.style[prop] = source.style[prop];
      const fingerprint = source.innerHTML;
      if (prior?.content === fingerprint) {
        source.dataset.mftSplit = 'true';
        // Attribute-scoped CSS hides only our native source; foreign clones never inherit inline hiding.
        if (source.nextElementSibling !== prior.display) source.after(prior.display);
        continue;
      }
      const fragments = renderedLineFragments(source);
      if (fragments.length < 2) {
        if (prior) resetSplit(source, prior);
        continue;
      }
      makeSplit(source, fragments, fingerprint, nativeNode);
    }
    if (mftModuleState.splitRoot) {
      const owned = new Set([...mftModuleState.splitSources.values()].map(s => s.display));
      scan('mft-message-lines').forEach(n => {
        if (!owned.has(n)) n.remove();
      });
      mftModuleState.splitObserver.observe(mftModuleState.splitRoot, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'data-mari-tts-source-view', 'data-mari-tts-copy', 'data-ptx-hidden', 'data-ptx-active']
      });
      mftModuleState.splitConnected = true;
    }
  }
  
  function bindSplits() {
    deps.translations.bindTranslationSizes();
    const next = deps.ui.state.root.dataset.native === 'true' ? document.querySelector('[data-chat-mode="conversation"] [data-chat-scroll]') : null;
    if (next === mftModuleState.splitRoot && mftModuleState.splitConnected) return;
    if (next !== mftModuleState.splitRoot) {
      mftModuleState.splitObserver?.disconnect();
      for (const [n, state] of mftModuleState.splitSources) resetSplit(n, state);
      mftModuleState.splitRoot = next;
    }
    mftModuleState.splitFull = true;
    mftModuleState.splitDirty.clear();
    if (!mftModuleState.splitObserver) mftModuleState.splitObserver = new MutationObserver(records => {
      if (document.hidden) return;
      const mark = node => {
        const element = node.nodeType === 3 ? node.parentElement : node;
        if (!(element instanceof Element) || element.closest('[data-chat-composer],textarea,.mft-split-display') || deps.adapter.liveBubble(element)) return;
        const row = element.closest('[data-message-id]') || element.closest('.mari-message');
        if (row) mftModuleState.splitDirty.add(row);else if (element === mftModuleState.splitRoot && node.nodeType !== 3) return;else if (element.querySelector('[data-message-id],.mari-message-bubble,[data-mari-tts-copy]')) mftModuleState.splitFull = true;
      };
      for (const record of records) {
        mark(record.target);
        if (record.type === 'childList') for (const node of [...record.addedNodes, ...record.removedNodes]) mark(node);
      }
      if ((mftModuleState.splitFull || mftModuleState.splitDirty.size) && !mftModuleState.splitTask) mftModuleState.splitTask = deps.core.later(syncSplits, 50);
    });
    if (mftModuleState.splitRoot) syncSplits();
  }

  const initialize = [
    { order: 22200, run() {
      mftModuleState.splitObserver = null;
    } },
    { order: 22201, run() {
      mftModuleState.splitRoot = null;
    } },
    { order: 22202, run() {
      mftModuleState.splitTask = null;
    } },
    { order: 22203, run() {
      mftModuleState.splitConnected = false;
    } },
    { order: 22204, run() {
      mftModuleState.splitFull = true;
    } },
    { order: 22300, run() {
      mftModuleState.splitDirty = new Set();
    } },
    { order: 22400, run() {
      mftModuleState.splitSources = new Map();
    } },
    { order: 22401, run() {
      mftModuleState.presentationOwners = new WeakMap();
    } }
  ];
  const cleanup = [
    { order: 38, run() {
      mftModuleState.splitObserver?.disconnect();
    } },
    { order: 39, run() {
      for (const [n, state] of mftModuleState.splitSources) resetSplit(n, state);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, resetSplit, displayedBubble, renderedLineFragments, makeSplit, syncSplits, bindSplits };
}

// Source: src/features/writing.js
/** writing: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createWriting(deps) {
  const mftModuleState = {
    writingDesktop: undefined
  };

  function writingShell(target) {
    return target instanceof Element && target.closest('[data-chat-mode="roleplay"]') ? target.closest('.marinara-chat-input-shell,.mari-chat-input-box') : null;
  }
  
  function onWritingStart(e) {
    if (!e.target.matches?.('textarea[data-chat-composer]') || e.type === 'pointerover' && !mftModuleState.writingDesktop.matches) return;
    const shell = writingShell(e.target);
    if (shell && (e.type !== 'pointerover' || document.activeElement === e.target) && !shell.querySelector('[data-chat-input-popup]')) {
      if (!shell.hasAttribute('data-mft-writing')) shell.setAttribute('data-mft-writing', '');
      if (!mftModuleState.writingDesktop.matches && !shell.querySelector('.mft-writing-tools')) {
        const tools = deps.ui.button('도구', () => shell.removeAttribute('data-mft-writing'), 'mft-writing-tools');
        tools.setAttribute('aria-label', '입력 도구 표시');
        tools.onpointerdown = e => e.preventDefault();
        shell.append(tools);
      }
    }
  }
  
  function onWritingExit(e) {
    const shell = writingShell(e.target);
    if (!shell || !e.target.isConnected) return;
    if (e.type === 'focusout') {
      queueMicrotask(() => {
        if (!deps.core.state.disposed && shell.isConnected && !shell.querySelector('textarea[data-chat-composer]:focus')) shell.removeAttribute('data-mft-writing');
      });
    } else if (mftModuleState.writingDesktop.matches && !shell.contains(e.relatedTarget)) shell.removeAttribute('data-mft-writing');
  }
  
  function onWritingOutside(e) {
    if (mftModuleState.writingDesktop.matches) return;
    for (const shell of document.querySelectorAll('[data-mft-writing]')) if (!shell.contains(e.target)) shell.removeAttribute('data-mft-writing');
  }
  
  function onWritingEscape(e) {
    if (e.key === 'Escape') writingShell(e.target)?.removeAttribute('data-mft-writing');
  }

  const initialize = [
    { order: 23300, run() {
      mftModuleState.writingDesktop = matchMedia('(hover:hover) and (pointer:fine)');
    } },
    { order: 23900, run() {
      for (const type of ['focusin', 'input', 'pointerover']) document.addEventListener(type, onWritingStart, true);
    } },
    { order: 24000, run() {
      for (const type of ['focusout', 'pointerout']) document.addEventListener(type, onWritingExit, true);
    } },
    { order: 24100, run() {
      document.addEventListener('keydown', onWritingEscape, true);
    } },
    { order: 24200, run() {
      document.addEventListener('pointerdown', onWritingOutside, true);
      // Scoped native-editor helpers: no chat scan, no polling, no form-value rewrite.
    } }
  ];
  const cleanup = [
    { order: 18, run() {
      for (const type of ['focusin', 'input', 'pointerover']) document.removeEventListener(type, onWritingStart, true);
    } },
    { order: 19, run() {
      for (const type of ['focusout', 'pointerout']) document.removeEventListener(type, onWritingExit, true);
    } },
    { order: 20, run() {
      document.removeEventListener('keydown', onWritingEscape, true);
    } },
    { order: 21, run() {
      document.removeEventListener('pointerdown', onWritingOutside, true);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, writingShell, onWritingStart, onWritingExit, onWritingOutside, onWritingEscape };
}

// Source: src/features/native-ui.js
/** nativeUi: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createNativeUi(deps) {
  const mftModuleState = {
    nativeUiObserver: undefined,
    nativeUiRoots: undefined,
    nativeUiQueued: undefined,
    duplicateTagNodes: undefined,
    nativeUiAdditions: undefined
  };

  function enhanceNativeUi(scopes = mftModuleState.nativeUiRoots) {
    if (deps.core.state.disposed || deps.ui.state.root.dataset.native !== 'true' || deps.navigation.state.routeIntent === 'chat') return;
    mftModuleState.nativeUiObserver?.disconnect();
    for (const scope of scopes) {
      deps.settings.enhanceSettingsFolds(scope);
      for (const row of scope.querySelectorAll('[data-touch-drag-card="character"]')) {
        const tags = [...row.querySelectorAll('[data-character-row-tags]>span,.mari-chrome-muted-badge')].map(n => n.textContent.trim()).filter(x => x && !x.startsWith('+'));
        for (const info of row.querySelectorAll(':scope>div.min-w-0.flex-1')) for (const n of info.children) {
          if (!n.matches('.truncate:not(.italic)') || n.hasAttribute('data-character-row-name') || n.matches('.w-fit')) continue;
          const parts = n.textContent.trim().split(/\s*,\s*/);
          const duplicate = parts.length > 0 && parts.every(x => tags.includes(x));
          if (duplicate) {
            n.setAttribute('data-mft-tag-duplicate', '');
            mftModuleState.duplicateTagNodes.add(n);
          } else if (mftModuleState.duplicateTagNodes.has(n)) {
            n.removeAttribute('data-mft-tag-duplicate');
            mftModuleState.duplicateTagNodes.delete(n);
          }
        }
      }
      for (const row of scope.querySelectorAll('[data-lorebook-entry-row-id]')) {
        const drawer = row.querySelector(':scope>div.border-t');
        if (!drawer || !drawer.querySelector('textarea,input')) continue;
        if (!drawer.querySelector('.mft-lore-guide')) {
          const guide = deps.ui.state.el('details', 'mft-lore-guide');
          guide.append(deps.ui.state.el('summary', '', '처음 쓰는 로어북 · 사용 순서'), deps.ui.state.el('p', '', '① 주요 키워드에 대화에서 찾을 단어를 넣으세요. 예: 학교, 교실'), deps.ui.state.el('p', '', '② 내용에는 AI가 참고할 설정을 쓰세요. 예: 학교는 바닷가 마을에 있습니다.'), deps.ui.state.el('p', '', '③ 항목을 켜면 조건에 맞을 때 내용을 참고합니다. 보조 키워드와 고급 설정은 필요할 때만 사용하세요.'));
          drawer.prepend(guide);
          mftModuleState.nativeUiAdditions.add(guide);
        }
        const help = [['주요 키워드', '대화에 이 단어가 나오면 내용을 참고합니다. 쉼표로 나누거나 Enter로 추가하세요.'], ['Primary keys', 'Words to look for in chat. Add each word with Enter.'], ['보조 키워드', '주요 키워드와 함께 검사할 추가 조건입니다. 필요 없으면 비워 두세요.'], ['설명', '목록에서 알아보기 위한 짧은 메모입니다. 실제 설정은 내용에 적으세요.'], ['내용', '조건이 맞을 때 AI에게 전달할 설정입니다.'], ['결정', 'AI에게 추가 판단을 맡기는 옵션입니다. 처음에는 사용 안 함으로 두세요.']];
        for (const label of drawer.querySelectorAll('label,div[class~="mb-1.5"][class~="font-medium"]')) {
          const text = label.textContent.trim();
          const found = help.find(([key]) => text.startsWith(key));
          if (found && !label.nextElementSibling?.classList.contains('mft-field-help')) {
            const hint = deps.ui.state.el('p', 'mft-field-help', found[1]);
            label.after(hint);
            mftModuleState.nativeUiAdditions.add(hint);
          }
        }
        for (const b of drawer.querySelectorAll('button')) {
          const hints = {
            'AND Any': '보조 키워드 중 하나 이상 있어야 적용',
            'AND All': '보조 키워드가 모두 있어야 적용',
            'NOT Any': '보조 키워드가 하나라도 있으면 제외',
            'NOT All': '보조 키워드가 모두 있으면 제외'
          };
          if (hints[b.textContent.trim()] && !b.hasAttribute('data-mft-hint')) {
            b.dataset.mftOldTitle = b.getAttribute('title') || '';
            b.dataset.mftHint = '';
            b.title = hints[b.textContent.trim()];
          }
        }
      }
    }
    for (const scope of mftModuleState.nativeUiRoots) if (scope.isConnected) mftModuleState.nativeUiObserver.observe(scope, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  function bindNativeUi() {
    mftModuleState.nativeUiObserver?.disconnect();
    mftModuleState.nativeUiRoots = [];
    if (deps.core.state.disposed || deps.ui.state.root.dataset.native !== 'true' || deps.navigation.state.routeIntent === 'chat') return;
    const candidates = [...document.querySelectorAll('[data-component="CenterContent"],.mari-editor-shell,[data-panel-key="characters"],[data-panel-key="personas"],[data-panel-key="presets"],[data-panel-key="lorebooks"],[data-panel-key="settings"]')].filter(deps.ui.state.visible);
    mftModuleState.nativeUiRoots = candidates.filter(n => !candidates.some(p => p !== n && p.contains(n)));
    if (!mftModuleState.nativeUiObserver) mftModuleState.nativeUiObserver = new MutationObserver(records => {
      if (document.hidden || mftModuleState.nativeUiQueued || !records.some(r => !r.target.closest?.('.mft-tag-list') && !r.target.parentElement?.closest('.mft-tag-list') && (r.type === 'characterData' || [...r.addedNodes, ...r.removedNodes].some(n => !(n instanceof Element) || !n.matches('.mft-lore-guide,.mft-field-help,.mft-tag-list,.mft-settings-fold,.mft-settings-index'))))) return;
      const changed = new Set();
      for (const r of records) {
        const parent = r.target.nodeType === 1 ? r.target : r.target.parentElement;
        if (parent?.closest('.mft-lore-guide,.mft-field-help,.mft-tag-list,.mft-settings-fold,.mft-settings-index')) continue;
        const row = parent?.closest('[data-lorebook-entry-row-id],[data-touch-drag-card="character"]');
        if (row) changed.add(row.parentElement);
        for (const n of r.addedNodes) if (n instanceof Element && !n.matches('.mft-lore-guide,.mft-field-help,.mft-tag-list,.mft-settings-fold,.mft-settings-index')) changed.add(n.parentElement || n);
      }
      if (!changed.size) return;
      mftModuleState.nativeUiQueued = true;
      queueMicrotask(() => {
        mftModuleState.nativeUiQueued = false;
        enhanceNativeUi([...changed].filter(n => n?.isConnected));
      });
    });
    enhanceNativeUi();
  }

  const initialize = [
    { order: 24300, run() {
      mftModuleState.nativeUiObserver = null;
    } },
    { order: 24301, run() {
      mftModuleState.nativeUiRoots = [];
    } },
    { order: 24302, run() {
      mftModuleState.nativeUiQueued = false;
    } },
    { order: 24400, run() {
      mftModuleState.duplicateTagNodes = new Set();
    } },
    { order: 24401, run() {
      mftModuleState.nativeUiAdditions = new Set();
    } }
  ];
  const cleanup = [
    { order: 12, run() {
      mftModuleState.nativeUiObserver?.disconnect();
    } },
    { order: 14, run() {
      for (const n of mftModuleState.nativeUiAdditions) n.remove();
    } },
    { order: 15, run() {
      for (const n of mftModuleState.duplicateTagNodes) n.removeAttribute('data-mft-tag-duplicate');
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, enhanceNativeUi, bindNativeUi };
}

// Source: src/features/tags.js
/** tags: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createTags(deps) {
  const mftModuleState = {
    tagInputLists: undefined,
    tagOptionCache: undefined,
    tagOptionsPending: undefined,
    tagFetchControllers: undefined,
    activeTagMenu: undefined,
    tagMenuSequence: undefined
  };

  async function collectExistingTags(kind) {
    const old = mftModuleState.tagOptionCache.get(kind);
    if (old && Date.now() - old.time < 60000) return old.tags;
    const cached = deps.updates.state.queryCache?.find?.({
      queryKey: kind === 'persona' ? ['personas'] : ['characters', 'list'],
      exact: true
    })?.state?.data;
    const tags = new Set();
    const collect = row => {
      let data = row.data;
      try {
        if (typeof data === 'string') data = JSON.parse(data);
      } catch {
        data = null;
      }
      let values = row.tags || data?.data?.tags || data?.tags || row.parsed?.tags || [];
      try {
        if (typeof values === 'string') values = JSON.parse(values);
      } catch {
        values = [];
      }
      if (!Array.isArray(values)) values = [];
      for (const tag of values) if (typeof tag === 'string' && tag.trim()) tags.add(tag.trim());
    };
    if (Array.isArray(cached)) {
      cached.forEach(collect);
      const sorted = [...tags].sort((a, b) => a.localeCompare(b));
      mftModuleState.tagOptionCache.set(kind, {
        time: Date.now(),
        tags: sorted
      });
      return sorted;
    }
    const controller = new AbortController();
    mftModuleState.tagFetchControllers.set(kind, controller);
    const list = kind === 'persona' ? '/characters/personas/list' : '/characters/catalog';
    for (let offset = 0;; offset += 100) {
      const page = await deps.data.jsonRequest(list + '?' + new URLSearchParams({
        limit: '100',
        offset: String(offset)
      }), 'GET', undefined, controller.signal);
      if (deps.core.state.disposed) return [];
      const rows = Array.isArray(page) ? page : page.items || [];
      rows.forEach(collect);
      if (!page.hasMore || !rows.length) break;
    }
    const sorted = [...tags].sort((a, b) => a.localeCompare(b));
    mftModuleState.tagOptionCache.set(kind, {
      time: Date.now(),
      tags: sorted
    });
    return sorted;
  }
  
  function existingTags(kind) {
    if (mftModuleState.tagOptionsPending.has(kind)) return mftModuleState.tagOptionsPending.get(kind);
    const pending = collectExistingTags(kind).finally(() => {
      mftModuleState.tagOptionsPending.delete(kind);
      mftModuleState.tagFetchControllers.delete(kind);
    });
    mftModuleState.tagOptionsPending.set(kind, pending);
    return pending;
  }
  
  function closeTagMenu() {
    mftModuleState.tagMenuSequence++;
    if (!mftModuleState.activeTagMenu) return;
    mftModuleState.activeTagMenu.box.remove();
    mftModuleState.activeTagMenu.input.setAttribute('aria-expanded', 'false');
    mftModuleState.activeTagMenu = null;
  }
  
  function drawTagMenu(state) {
    if (state !== mftModuleState.activeTagMenu) return;
    const query = state.input.value.trim().toLowerCase();
    const shown = state.tags.filter(tag => tag.toLowerCase().includes(query));
    state.shown = shown;
    state.index = Math.min(state.index, shown.length - 1);
    state.box.replaceChildren();
    if (!shown.length) {
      state.box.append(deps.ui.state.el('p', 'mft-tag-empty', state.loading ? '태그를 불러오는 중…' : state.failed ? '태그를 불러오지 못했어요. 직접 입력해서 추가할 수 있습니다.' : '일치하는 기존 태그가 없습니다. 직접 입력해서 추가할 수 있습니다.'));
      return;
    }
    for (const [i, tag] of shown.entries()) {
      const option = deps.ui.button(tag, () => chooseTag(state, tag), 'mft-tag-option');
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(i === state.index));
      option.onpointerdown = e => e.preventDefault();
      state.box.append(option);
    }
  }
  
  function chooseTag(state, tag) {
    if (state !== mftModuleState.activeTagMenu) return;
    const input = state.input;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, tag);
    input.dispatchEvent(new Event('input', {
      bubbles: true
    }));
    closeTagMenu();
    input.focus({
      preventScroll: true
    });
  }
  
  async function onTagFocus(e) {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || !input.closest('.mari-editor-shell [data-editor-section="metadata"]') || !/(태그|add.*tag)/i.test(input.placeholder)) return;
    if (mftModuleState.activeTagMenu?.input === input) return;
    closeTagMenu();
    if (!mftModuleState.tagInputLists.has(input)) mftModuleState.tagInputLists.set(input, {
      list: input.getAttribute('list'),
      role: input.getAttribute('role'),
      autocomplete: input.getAttribute('autocomplete'),
      controls: input.getAttribute('aria-controls'),
      expanded: input.getAttribute('aria-expanded')
    });
    input.removeAttribute('list');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'true');
    const box = deps.ui.state.el('div', 'mft-tag-list');
    box.id = 'mft-tag-list';
    box.setAttribute('role', 'listbox');
    box.setAttribute('aria-label', '기존 태그');
    input.setAttribute('aria-controls', box.id);
    input.parentElement.after(box);
    const kind = input.closest('.mari-editor-shell')?.querySelector('.mari-avatar-placeholder--persona') ? 'persona' : 'character';
    const state = {
      input,
      box,
      tags: [],
      shown: [],
      index: -1,
      loading: true,
      failed: false
    };
    mftModuleState.activeTagMenu = state;
    const sequence = mftModuleState.tagMenuSequence;
    drawTagMenu(state);
    try {
      const tags = await existingTags(kind);
      if (deps.core.state.disposed || mftModuleState.activeTagMenu !== state || sequence !== mftModuleState.tagMenuSequence) return;
      state.tags = tags;
      state.loading = false;
      drawTagMenu(state);
    } catch {
      if (mftModuleState.activeTagMenu === state) {
        state.failed = true;
        state.loading = false;
        drawTagMenu(state);
      }
    }
  }
  
  function onTagInput(e) {
    if (mftModuleState.activeTagMenu?.input === e.target) {
      mftModuleState.activeTagMenu.index = -1;
      drawTagMenu(mftModuleState.activeTagMenu);
    }
  }
  
  function onTagKey(e) {
    const state = mftModuleState.activeTagMenu;
    if (!state || state.input !== e.target || e.isComposing) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeTagMenu();
      return;
    }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && state.shown.length) {
      e.preventDefault();
      e.stopPropagation();
      state.index = (state.index + (e.key === 'ArrowDown' ? 1 : -1) + state.shown.length) % state.shown.length;
      drawTagMenu(state);
      state.box.children[state.index]?.scrollIntoView({
        block: 'nearest'
      });
    } else if (e.key === 'Enter' && state.index >= 0) {
      e.preventDefault();
      e.stopPropagation();
      chooseTag(state, state.shown[state.index]);
    }
  }
  
  function onTagOutside(e) {
    const state = mftModuleState.activeTagMenu;
    if (state && e.target !== state.input && !state.box.contains(e.target)) closeTagMenu();
  }
  
  function onTagBlur(e) {
    const state = mftModuleState.activeTagMenu;
    if (state?.input === e.target) queueMicrotask(() => {
      if (mftModuleState.activeTagMenu === state && document.activeElement !== state.input && !state.box.contains(document.activeElement)) closeTagMenu();
    });
  }

  const initialize = [
    { order: 24402, run() {
      mftModuleState.tagInputLists = new Map();
    } },
    { order: 24403, run() {
      mftModuleState.tagOptionCache = new Map();
    } },
    { order: 24404, run() {
      mftModuleState.tagOptionsPending = new Map();
    } },
    { order: 24405, run() {
      mftModuleState.tagFetchControllers = new Map();
    } },
    { order: 26000, run() {
      mftModuleState.activeTagMenu = null;
    } },
    { order: 26001, run() {
      mftModuleState.tagMenuSequence = 0;
    } },
    { order: 26900, run() {
      document.addEventListener('focusin', onTagFocus, true);
    } },
    { order: 27000, run() {
      document.addEventListener('input', onTagInput, true);
    } },
    { order: 27100, run() {
      document.addEventListener('keydown', onTagKey, true);
    } },
    { order: 27200, run() {
      document.addEventListener('pointerdown', onTagOutside, true);
    } },
    { order: 27300, run() {
      document.addEventListener('focusout', onTagBlur, true);
    } }
  ];
  const cleanup = [
    { order: 5, run() {
      closeTagMenu();
    } },
    { order: 6, run() {
      document.removeEventListener('input', onTagInput, true);
    } },
    { order: 7, run() {
      document.removeEventListener('keydown', onTagKey, true);
    } },
    { order: 8, run() {
      document.removeEventListener('pointerdown', onTagOutside, true);
    } },
    { order: 9, run() {
      document.removeEventListener('focusout', onTagBlur, true);
    } },
    { order: 10, run() {
      for (const c of mftModuleState.tagFetchControllers.values()) c.abort();
    } },
    { order: 11, run() {
      mftModuleState.tagFetchControllers.clear();
    } },
    { order: 13, run() {
      document.removeEventListener('focusin', onTagFocus, true);
    } },
    { order: 16, run() {
      for (const [n, old] of mftModuleState.tagInputLists) if (n.isConnected) for (const [key, value] of Object.entries(old)) {
        const attr = key === 'controls' ? 'aria-controls' : key === 'expanded' ? 'aria-expanded' : key;
        if (value === null) n.removeAttribute(attr);else n.setAttribute(attr, value);
      }
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, collectExistingTags, existingTags, closeTagMenu, drawTagMenu, chooseTag, onTagFocus, onTagInput, onTagKey, onTagOutside, onTagBlur };
}

// Source: src/features/settings.js
/** settings: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createSettings(deps) {
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
      if (!panel.querySelector('.mft-settings-index')) {
        const sections = [...panel.querySelectorAll('section[id^="settings-section-"],#settings-section-roleplay-tracker>section')];
        if (!sections.length) continue;
        const bar = deps.ui.state.el('div', 'mft-settings-index');
        bar.append(deps.ui.button('모두 펼치기', () => revealSettings(panel)), deps.ui.button('모두 접기', () => {
          for (const [n] of mftModuleState.settingsFolds) if (panel.contains(n)) setSettingsFold(n, false);
        }));
        sections[0].before(bar);
        deps.nativeUi.state.nativeUiAdditions.add(bar);
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

// Source: src/core/bootstrap.js
/** bootstrap: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
function createBootstrap(deps) {
  const mftModuleState = {

  };

  

  const initialize = [
    { order: 27600, run() {
      deps.navigation.go('home', true);
    } },
    { order: 27700, run() {
      deps.mounts.bindShell();
    } },
    { order: 27800, run() {
      deps.notifications.syncNotifications();
    } },
    { order: 27900, run() {
      deps.history.installBackWatcher();
    } },
    { order: 28000, run() {
      deps.chats.hydrateSavedUnread(true);
    } }
  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup };
}

// Source: src/core/lifecycle.js
/** Ordered module initialization and failure-isolated, idempotent cleanup. */
function createLifecycle(deps) {
  const state = { started: false, disposed: false, initialization: [], teardown: [] };
  function configure(modules) {
    if (state.started) throw new Error('Lifecycle is already started');
    state.initialization = Object.values(modules).flatMap(m => m.initialize.splice(0)).sort((a, b) => a.order - b.order);
    state.teardown = Object.entries(modules).flatMap(([owner, module]) => module.cleanup.splice(0).map(step => ({ ...step, owner }))).sort((a, b) => a.order - b.order);
  }
  function dispose() {
    if (state.disposed) return;
    state.disposed = true;
    try {
      for (const step of state.teardown) {
        try { step.run(); } catch (error) { console.error('[Marinara Platform] cleanup: ' + step.owner, error); }
      }
    } finally { state.teardown.length = 0; }
  }
  function start() {
    if (state.started || state.disposed) return;
    state.started = true;
    try { for (const step of state.initialization) step.run(); } catch (error) { dispose(); throw error; } finally { state.initialization.length = 0; }
  }
  return { state, initialize: [], cleanup: [], configure, start, dispose };
}

// Source: src/features/help.js
/** Editable Markdown content; embedded at build time, with no extra runtime fetch. */
function createHelp(deps) {
  const state = {};
  function show() {
    const main = deps.ui.state.main;
    const article = deps.ui.state.el('article', 'description help-content');
    article.setAttribute('aria-label', '마리나라 플랫폼화 도움말');
    deps.markdown.renderMarkdown(article, "# 처음 오셨나요?\n\n서버를 켰다면, 이제 **AI를 연결할 차례**예요.\n아래 순서대로 읽어 주세요.\n\n---\n\n## 1. 마리나라가 AI 아닌가요?\n\n마리나라는 **채팅하는 프로그램**이에요.\n답변을 쓰는 AI는 따로 연결해야 해요.\n\n메시지를 보내면 이렇게 움직여요.\n\n1. 내가 마리나라에 말을 써요.\n2. 마리나라가 그 말을 AI에게 보내요.\n3. AI가 답변을 만들어요.\n4. 마리나라가 답변을 보여 줘요.\n\n**서버를 켰다면 채팅할 공간은 준비된 거예요.**\n이제 답변을 써 줄 AI를 연결하면 돼요.\n\n---\n\n## 2. 어떤 AI를 연결하나요?\n\nGemini, Claude, GPT 같은 AI를 연결할 수 있어요.\n\nAI를 직접 만들거나 설치할 필요는 없어요.\n**회사에서 제공하는 AI를 연결해서 사용해요.**\n\n---\n\n## 3. 어떻게 연결하나요?\n\nAI를 제공하는 사이트에서 **API 키**를 발급받아요.\n\nAPI 키는 **다른 프로그램에서 AI를 쓰기 위한 비밀 열쇠**예요.\n\n발급받은 키를 마리나라에 등록하면,\n마리나라가 그 키로 AI에게 답변을 요청할 수 있어요.\n\n- 내가 직접 만드는 글자가 아니에요.\n- 발급 사이트에서 받은 키를 복사해서 넣어요.\n- 비밀번호처럼 다른 사람에게 보여 주면 안 돼요.\n\n---\n\n## 4. API 키는 어디서 받나요?\n\n두 가지 방법이 있어요.\n\n### ① AI를 만든 회사에서 받기\n\n- **Gemini** → Google\n- **Claude** → Anthropic\n- **GPT** → OpenAI\n\n### ② 여러 회사의 AI를 모아 둔 곳에서 받기\n\n**OpenRouter, NanoGPT** 등이 있어요.\n여러 회사의 AI를 한곳에서 골라 사용할 수 있어요.\n\n어느 쪽이든 **마리나라에서 사용할 수 있는 연결인지 확인**해 주세요.\n\n발급 사이트마다 준비하는 방법은 달라요.\n자세한 발급 방법은 각 사이트의 안내를 따라가 주세요.\n\n---\n\n## 5. 이미 AI 유료 구독을 하고 있는데요?\n\n**구독 중이어도 마리나라에서 바로 쓸 수 있는 것은 아니에요.**\n\nAI 회사의 앱이나 홈페이지에서 채팅하는 것과,\n마리나라에 연결해서 사용하는 것은 이용 방식이 달라요.\n\n마리나라에 연결할 때는 **API 이용 조건과 결제를 따로 확인**해 주세요.\n\n---\n\n## 6. 돈도 따로 드나요?\n\n유료 API를 사용하면 **AI 사용료**가 들어요.\n\n사용료는 보통 **API 키를 발급받은 곳에 지불**해요.\n발급처에 따라 결제수단 등록이나 잔액 충전이 필요할 수 있어요.\n\n**키를 받았어도 결제 준비가 안 되어 있으면 사용하지 못할 수 있어요.**\n\n처음에는 조금 사용한 뒤,\n발급 사이트에서 사용 금액을 확인해 보세요.\n\n---\n\n## 7. 키를 받았어요. 어디에 넣나요?\n\n**마이페이지 → AI 연결**로 들어가세요.\n\n1. 키를 발급받은 곳에 맞는 연결을 만들어요.\n2. API 키를 붙여 넣어요.\n3. 사용할 **모델**을 골라요.\n\n모델은 **실제로 답변을 쓸 AI의 종류**예요.\n같은 회사에서도 여러 모델을 제공할 수 있어요.\n\n**발급받은 키로 사용할 수 있는 모델**을 골라 주세요.\n\n---\n\n## 8. AI와 캐릭터는 뭐가 달라요?\n\n- **AI:** 답변을 쓰는 역할이에요.\n- **캐릭터:** AI가 연기할 상대예요.\n\n예를 들어 캐릭터 설정에 이렇게 적혀 있다고 해 볼게요.\n\n> 이 캐릭터는 숲속 찻집의 주인이에요. 손님에게 다정하게 말해요.\n\n마리나라는 이 설정과 내 메시지를 AI에게 보내요.\n그러면 AI가 **그 캐릭터 역할로 답변을 쓰는 거예요.**\n\n홈에 캐릭터가 있다면 골라서 시작해 보세요.\n\n---\n\n## 9. 프리셋은 뭐예요?\n\n**AI에게 글 쓰는 방법을 알려 주는 안내서**예요.\n\n- **캐릭터 설정:** 누구를 연기할지 알려 줘요.\n- **프리셋:** 어떻게 답할지 알려 줘요.\n\n프리셋에는 이런 내용을 담을 수 있어요.\n\n- 대사는 짧게 써 주세요.\n- 행동은 자세히 설명해 주세요.\n- 내 대사와 행동을 대신 정하지 마세요.\n\n**처음에는 기본 프리셋으로 시작해도 돼요.**\n직접 작성할 필요는 없어요.\n\n---\n\n## 10. 처음에는 이것만 하면 돼요.\n\n1. **API 키 준비하기**\n2. **마이페이지 → AI 연결에 등록하기**\n3. **사용할 모델 고르기**\n4. **기본 프리셋 고르기**\n5. **홈에서 캐릭터를 선택해 채팅하기**\n\n페르소나, 로어북, 확장 같은 기능은\n첫 채팅에 성공한 다음 하나씩 알아봐도 괜찮아요.\n\n---\n\n## 잘 모르겠다면 질문해 주세요.\n\n어려운 것이 있다면 **커뮤니티에 적극적으로 질문해도 돼요.**\n여러분과 비슷한 어려움을 먼저 겪은 사람들이 도와줄 거예요.\n\n오류가 발생했을 시, 질문할 때 아래 내용을 함께 알려주면 빠른 해결에 도움을 줄 거예요.\n\n- **설치한 방법:** APK, Termux, PC 설치 등\n- **사용 중인 기기와 브라우저:** 예) 갤럭시·Chrome, PC·Chrome\n- **막힌 단계:** 어디까지 했고, 무엇이 안 되는지\n- **누른 버튼:** 문제가 생기기 직전에 무엇을 눌렀는지\n- **오류 문구:** 화면에 나온 내용을 그대로 적어 주세요.\n\n화면 사진을 함께 올리면 설명하기 편해요.\n**API 키와 개인정보는 꼭 가려 주세요.**\n\n---\n\n## 마리나라 공식 디스코드\n\n엔진 소식이 궁금하다면 들어가 보세요.\n엔진 제작자에게 다음 업데이트에 넣었으면 하는 기능을 요청할 수도 있어요.\n\n[공식 디스코드 들어가기](https://discord.gg/marinara)\n");
    main.replaceChildren(deps.ui.button('‹ 마이페이지', () => deps.navigation.go('my'), 'quiet'), article);
  }
  const initialize = [];
  const cleanup = [];
  return { state, initialize, cleanup, show };
}

// Source: src/engine/launch.js
/** Native launch lifecycle: one transaction per launch, authoritative room identity. */
function createLaunch(deps) {
  const state = { observer: null, signal: null, previousId: null, selectedMode: null, phase: 'idle', sawSetup: false, closing: false, settleTimer: null, deadline: null };
  const dialogs = '[role="dialog"],.mari-modal,[data-new-chat-connection-gate]';
  function stop() {
    state.observer?.disconnect(); state.observer = null;
    clearTimeout(state.settleTimer); clearTimeout(state.deadline);
    state.settleTimer = state.deadline = null;
    state.signal?.removeEventListener('abort', stop); state.signal = null;
    document.removeEventListener('click', onClick, true);
    if (state.phase !== 'ready') state.phase = 'idle';
  }
  function leave() { stop(); deps.gestures.returnFromNative(); }
  function onClick(event) {
    const button = event.target.closest?.('button');
    if (!button || button.disabled) return;
    const chooser = button.closest('[data-component="ChatModeSelectorModal"]');
    if (chooser) {
      const index = [...chooser.querySelectorAll('button')].indexOf(button);
      state.selectedMode = ['conversation', 'roleplay', 'game'][index] || null;
      state.phase = 'creating';
      return;
    }
    const dialog = button.closest(dialogs);
    if (!dialog) return;
    const close = button.querySelector('svg.lucide-x') || /^(취소|닫기|cancel|close|×|x)$/i.test((button.getAttribute('aria-label') || button.textContent).trim());
    if (close) {
      state.closing = true;
      state.phase = 'closing';
      // Let the original handler delete or keep its room first. No setter or click proxy.
      clearTimeout(state.settleTimer);
      state.settleTimer = setTimeout(() => { state.settleTimer = null; reconcile(); }, 700);
    }
  }
  function reconcile() {
    if (deps.core.state.disposed || deps.navigation.state.routeIntent !== 'start') { stop(); return; }
    const visible = [...document.querySelectorAll(dialogs)].filter(deps.ui.state.visible);
    const chooser = visible.some(n => n.querySelector('[data-component="ChatModeSelectorModal"]') || n.matches('[data-component="ChatModeSelectorModal"]'));
    if (visible.length && !chooser) { state.sawSetup = true; if (!state.closing) state.phase = 'setup'; }
    const active = deps.adapter.activeSession();
    const chat = deps.adapter.chatSurface(active.known ? active.id : undefined);
    const id = active.known ? active.id : chat?.id;
    const fresh = id && id !== state.previousId;
    if (state.closing && active.known && !active.id) {
      // Empty game setup was deleted. A stale loading surface must not keep this route alive.
      leave(); return;
    }
    if (visible.length) return;
    if (!fresh) return; // React/Lazy transitions and creation can be arbitrarily slow; absence is not cancellation.
    if (document.querySelector('[data-component="ChatArea.RestoringChat"],[data-component="GameSurface.MessagesLoading"]')) { state.phase = 'opening'; return; }
    if (state.closing && state.settleTimer) return;
    // Game's initial/start screens do not always expose data-chat-mode or a composer.
    if (!state.sawSetup) return;
    deps.navigation.state.roomId = id;
    deps.chats.state.chatMode = chat?.mode || state.selectedMode || deps.chats.state.chatMode;
    state.phase = 'ready'; stop();
    deps.navigation.finishRoute('chat');
  }
  function begin(signal, previousId) {
    stop(); state.signal = signal; state.previousId = previousId;
    state.phase = 'choosing'; state.selectedMode = null; state.sawSetup = false; state.closing = false;
    if (signal?.aborted) { stop(); return; }
    signal?.addEventListener('abort', stop, { once: true });
    document.addEventListener('click', onClick, true);
    state.observer = new MutationObserver(reconcile);
    state.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-chat-id','data-chat-mode','aria-hidden','hidden'] });
    state.deadline = setTimeout(() => {
      if (deps.navigation.state.routeIntent !== 'start' || state.phase === 'choosing' || state.phase === 'setup') return;
      deps.ui.notice('설정이나 방 열기가 끝나지 않았어요. 아래 버튼으로 돌아갈 수 있어요.');
      const back = deps.ui.button('캐릭터로 돌아가기', leave, 'button');
      deps.ui.state.status.append(back);
    }, 30000);
    reconcile();
  }
  function checkExit() {
    if (deps.navigation.state.routeIntent !== 'chat' || deps.navigation.state.bridgeBusy) return;
    const active = deps.adapter.activeSession();
    if (active.known && !active.id && ![...document.querySelectorAll(dialogs)].some(deps.ui.state.visible)) deps.gestures.returnFromNative();
  }
  const initialize = [

  ];
  const cleanup = [
    { order: 74, run() { stop(); } }
  ];
  return { state, initialize, cleanup, begin, reconcile, stop, onClick, checkExit };
}


function startApplication() {
  if (document.getElementById('mft-root')) return null;
  const modules = {};
  modules.ui = createUi(modules);
  modules.theme = createTheme(modules);
  modules.data = createData(modules);
  modules.core = createCore(modules);
  modules.navigation = createNavigation(modules);
  modules.history = createHistory(modules);
  modules.avatars = createAvatars(modules);
  modules.catalog = createCatalog(modules);
  modules.chats = createChats(modules);
  modules.design = createDesign(modules);
  modules.adapter = createAdapter(modules);
  modules.notifications = createNotifications(modules);
  modules.hub = createHub(modules);
  modules.extensions = createExtensions(modules);
  modules.mounts = createMounts(modules);
  modules.markdown = createMarkdown(modules);
  modules.gestures = createGestures(modules);
  modules.previews = createPreviews(modules);
  modules.daily = createDaily(modules);
  modules.updates = createUpdates(modules);
  modules.translations = createTranslations(modules);
  modules.convo = createConvo(modules);
  modules.writing = createWriting(modules);
  modules.nativeUi = createNativeUi(modules);
  modules.tags = createTags(modules);
  modules.settings = createSettings(modules);
  modules.bootstrap = createBootstrap(modules);
  modules.help = createHelp(modules);
  modules.launch = createLaunch(modules);
  modules.lifecycle = createLifecycle(modules);
  modules.lifecycle.configure(modules);
  marinara.onCleanup(modules.lifecycle.dispose);
  modules.lifecycle.start();
  return { dispose: modules.lifecycle.dispose };
}

startApplication();
})();
