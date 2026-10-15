/** navigation: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createNavigation(deps) {
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

  function waitEngine(test, signal, ms = 8000, extraAttributes = []) {
    return new Promise((resolve, reject) => {
      // Engine dialogs can be portalled outside AppShell. Observe only while awaiting a route.
      let observer, timeout, settled = false;
      function finish(error, value) {
        if (settled) return;
        settled = true;
        observer?.disconnect();
        clearTimeout(timeout);
        signal?.removeEventListener('abort', cancel);
        error ? reject(error) : resolve(value);
      }
      function check() {
        if (settled) return;
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
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-chat-mode', 'data-chat-id', 'aria-hidden', 'data-chat-surface-active', 'aria-selected', 'hidden', ...extraAttributes]
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
  
  function finishRoute(intent, signal) {
    if (signal && (signal.aborted || mftModuleState.navController?.signal !== signal) || deps.core.state.disposed) return false;
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
  
  function routeFailure(error, retry, signal) {
    if (error.name === 'AbortError' || signal && (signal.aborted || mftModuleState.navController?.signal !== signal) || deps.core.state.disposed) return;
    deps.ui.state.html.classList.remove('mft-transition');
    mftModuleState.bridgeBusy = false;
    mftModuleState.agentActive = false;
    deps.ui.state.html.removeAttribute('data-mft-agent');
    // Restore the theme only after the native session/layers are actually closed.
    if (engineHome()) {
      mftModuleState.routeIntent = 'own';
      deps.ui.own();
    } else {
      deps.ui.native();
    }
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
    a.closeAllDetails?.();
    a.closeRightPanel?.();
    a.setSidebarOpen?.(false);
  }
  
  async function openNative(key) {
    const requestedChatMode = deps.chats.state.chatMode;
    const signal = beginRoute('panel');
    try {
      const a = await actionsReady(signal);
      if (signal.aborted) return false;
      if (!engineHome()) throw Error('기존 방을 닫지 못해 화면 이동을 중단했어요.');
      if (key === 'chats') {
        if (a.requestChatModeShortcut) a.requestChatModeShortcut(requestedChatMode);else a.setSidebarOpen(true);
      } else a.openRightPanel(key);
      await waitEngine(() => key === 'chats' ? [...document.querySelectorAll('[data-component="ChatSidebar"]')].find(deps.ui.state.visible) : document.querySelector(`[data-panel-key="${CSS.escape(key)}"][aria-hidden="false"]`), signal);
      if (key === 'chats') {
        const tab = await waitEngine(() => [...document.querySelectorAll(`[data-component="ChatSidebar"] [data-chat-mode-tab="${CSS.escape(requestedChatMode)}"]`)].find(deps.ui.state.visible), signal);
        if (signal.aborted) return false;
        if (tab.getAttribute('aria-pressed') !== 'true') tab.click();
        await waitEngine(() => tab.isConnected && tab.getAttribute('aria-pressed') === 'true', signal);
      }
      if (signal.aborted) return false;
      finishRoute('panel', signal);
      return true;
    } catch (e) {
      routeFailure(e, () => openNative(key), signal);
      return false;
    }
  }
  
  async function openBotBrowser() {
    const signal = beginRoute('bots');
    try {
      const a = await actionsReady(signal);
      if (signal.aborted) return false;
      if (!engineHome()) throw Error('기존 방을 닫지 못해 다운로드 화면을 열지 못했어요.');
      if (!a.openBotBrowser) {
        a.openRightPanel('characters');
        await waitEngine(() => deps.adapter.engineActions().openBotBrowser, signal, 5000);
        if (signal.aborted) return false;
        Object.assign(a, deps.adapter.engineActions());
        clearLayers(a);
      }
      if (signal.aborted) return false;
      a.openBotBrowser();
      await waitEngine(() => [...document.querySelectorAll('[data-component="BotBrowserView"]')].find(n => deps.ui.state.visible(n) && !n.closest('.pointer-events-none')), signal, 8000, ['class']);
      if (signal.aborted) return false;
      finishRoute('bots', signal);
      return true;
    } catch (error) {
      routeFailure(error, openBotBrowser, signal);
      return false;
    }
  }

  async function bridge(kind, item, start = false) {
    const signal = beginRoute(kind === 'chat' ? 'chat' : 'detail');
    deps.avatars.state.nativeCharacterIds = kind === 'chat' ? item.characterIds || [] : [item.id];
    try {
      if (kind !== 'chat' && !engineHome()) throw Error('기존 방을 닫지 못해 화면 이동을 중단했어요.');
      const fast = deps.adapter.engineNavigator();
      if (!start && kind !== 'chat' && fast) {
        fast({
          kind: 'resource',
          resource: kind === 'persona' ? 'persona' : 'character',
          id: item.id
        });
        await waitEngine(() => [...document.querySelectorAll('.mari-editor-shell,[data-component="MobileDetailSheet"]')].find(n => !n.closest('[aria-hidden="true"]')), signal);
        if (!signal.aborted) finishRoute('detail', signal);
        return;
      }
      const a = await actionsReady(signal);
      if (signal.aborted) return false;
      clearLayers(a);
      if (kind === 'chat') {
        deps.chats.state.chatMode = item.mode || deps.chats.state.chatMode;
        if (!deps.adapter.prepareChat(a)) throw Error('기존 방 진입에 필요한 순정 설정 초기화 액션을 찾지 못했어요. 앱 새로고침 후 다시 시도해 주세요.');
        if (!item.fromNotification || !deps.notifications.nativeNotificationAction(item.id, 'onNavigate')) a.setActiveChatId(item.id);
        await waitEngine(() => deps.adapter.roomReady(item.id, item.mode || 'conversation'), signal);
        if (signal.aborted) return;
        mftModuleState.roomId = item.id;
        finishRoute('chat', signal);
      } else {
        if (kind === 'persona' && !a.openPersonaDetail) {
          a.openRightPanel('personas');
          await waitEngine(() => deps.adapter.engineActions().openPersonaDetail, signal, 5000);
          if (signal.aborted) return;
          Object.assign(a, deps.adapter.engineActions());
          a.closeRightPanel();
        }
        if (start && !a.openModal || !start && !a.openCharacterDetail) {
          a.openRightPanel('characters');
          await waitEngine(() => {
            const next = deps.adapter.engineActions();
            return next.openModal && next.openCharacterDetail ? next : null;
          }, signal, 5000);
          if (signal.aborted) return;
          Object.assign(a, deps.adapter.engineActions());
          a.closeRightPanel();
        }
        if (signal.aborted) return;
        if (start) {
          const active = deps.adapter.activeSession();
          const previousRoomId = active.known ? active.id : deps.adapter.chatSurface()?.id || null;
          if (!deps.adapter.clearActiveChat(a)) throw Error('기존 방 닫기를 완료하지 못했어요.');
          mftModuleState.routeIntent = 'start';
          deps.ui.state.html.classList.remove('mft-transition');
          mftModuleState.bridgeBusy = false;
          deps.ui.native();
          deps.ui.state.html.dataset.mftNativeLayer = 'start';
          deps.ui.notice('');
          deps.history.armNativeBack();
          deps.history.installBackWatcher();
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
          finishRoute('detail', signal);
        }
      }
    } catch (e) {
      routeFailure(e, () => bridge(kind, item, start), signal);
    }
  }
  
  function engineHome() {
    // A pending game's native cancellation may delete asynchronously. Never
    // switch rooms before its callback can finish and null the active ID.
    if (mftModuleState.routeIntent === 'start' && !['idle', 'ready'].includes(deps.launch.state.phase)) {
      deps.launch.requestBack();
      return false;
    }
    if (!deps.adapter.dismissChatSetup()) return false;
    const a = deps.adapter.engineActions();
    deps.notifications.suspendUnread();
    if (!deps.adapter.clearActiveChat(a)) {
      deps.ui.notice('방 닫기를 완료하지 못했어요. 다시 홈을 눌러 주세요.');
      return false;
    }
    clearLayers(a);
    mftModuleState.roomId = null;
    return true;
  }
  
  async function settings(tab, done) {
    const signal = beginRoute('panel');
    try {
      const a = await actionsReady(signal);
      if (signal.aborted) return false;
      if (!engineHome()) throw Error('기존 방을 닫지 못해 설정을 열지 못했어요.');
      a.openRightPanel('settings');
      await waitEngine(() => deps.adapter.engineActions().setSettingsTab, signal, 5000);
      if (signal.aborted) return;
      deps.adapter.engineActions().setSettingsTab(tab);
      await waitEngine(() => {
        const button = document.getElementById('settings-tab-' + tab);
        return button && button.getAttribute('aria-selected') === 'true' ? button : null;
      }, signal);
      if (signal.aborted) return;
      finishRoute('panel', signal);
      if (done) deps.extensions.retryNative(done);
    } catch (e) {
      routeFailure(e, () => settings(tab, done), signal);
    }
  }
  
  function go(k, fromHistory = false, closeAttempt = 0) {
    if (k !== 'home') {
      deps.history.state.exitUntil = 0;
      clearTimeout(deps.history.state.exitTimer);
      deps.core.state.timers.delete(deps.history.state.exitTimer);
    }
    const wasNative = deps.ui.state.root.dataset.native === 'true';
    if (wasNative || deps.adapter.activeSession().id) {
      if (!engineHome()) {
        const ticket = deps.core.state.epoch;
        if (closeAttempt < 3) deps.core.bindLater(() => {
          if (!deps.core.state.disposed && ticket === deps.core.state.epoch) go(k, fromHistory, closeAttempt + 1);
        }, [80, 200, 500][closeAttempt]);
        return;
      }
      if (wasNative && mftModuleState.routeIntent !== 'chat') deps.extensions.state.installedMetaAt = 0;
      deps.updates.invalidateChats();
    }
    mftModuleState.nativeOrigin = null;
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
    if (mftModuleState.routeIntent === 'bots' && e.target.closest?.('[data-component="BotBrowserView"]>header button:has(svg.lucide-arrow-left)')) {
      queueMicrotask(deps.gestures.returnFromNative);
      return;
    }
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
        const surface = deps.adapter.chatSurface();
        const active = deps.adapter.activeSession();
        if (surface?.id && active.known && active.id === surface.id && deps.ui.state.visible(surface.surface || document.querySelector('[data-chat-mode]'))) {
          mftModuleState.routeIntent = 'chat';
          const nextId = surface.id;
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
  return { state: mftModuleState, initialize, cleanup, waitEngine, beginRoute, finishRoute, routeFailure, actionsReady, clearLayers, openNative, openBotBrowser, bridge, engineHome, settings, go, onModeClick };
}
