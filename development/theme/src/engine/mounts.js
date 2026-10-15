/** mounts: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createMounts(deps) {
  const mftModuleState = {
    shellObserver: undefined,
    centerObserver: undefined,
    notificationMountObserver: undefined,
    resumeTimer: null,
    resumeAt: 0
  };

  function checkEngineHome() {
    if (deps.core.state.disposed || deps.navigation.state.bridgeBusy) return;
    if (deps.navigation.state.routeIntent === 'own' && deps.ui.state.root.dataset.native !== 'true' && deps.adapter.activeSession().id) {
      deps.notifications.suspendUnread();
      deps.navigation.engineHome();
      return;
    }
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
  
  function suspendActivity() {
    deps.notifications.suspendUnread();
    clearTimeout(mftModuleState.resumeTimer);
    mftModuleState.resumeTimer = null;
    mftModuleState.resumeAt = 0;
    deps.notifications.state.unreadHydration?.abort();
    deps.notifications.state.unreadHydration = null;
  }

  function visibility() {
    deps.ui.state.root.toggleAttribute('data-suspended', document.hidden);
    if (document.hidden) {
      deps.notifications.suspendUnread();
      clearTimeout(mftModuleState.resumeTimer);
      mftModuleState.resumeTimer = null;
      mftModuleState.resumeAt = 0;
      deps.notifications.state.unreadHydration?.abort();
      deps.notifications.state.unreadHydration = null;
      deps.updates.state.chatRefreshRequest?.abort();
      deps.core.stop();
    } else if (deps.ui.state.root.dataset.native !== 'true' && !deps.ui.state.main.querySelector('.card,.chat-row,.menu-row,.description') && ['home', 'chats'].includes(deps.navigation.state.view)) deps.navigation.go(deps.navigation.state.view);else if (deps.ui.state.root.dataset.native !== 'true') {
      deps.avatars.observeImages();
      if (deps.navigation.state.view === 'chats') deps.updates.queueChatRefresh();
    }
  }
  
  function resumeActivity(event) {
    if (document.hidden || deps.core.state.disposed) return;
    if (event?.type === 'online' || event?.type === 'pageshow' && event.persisted) {
      clearTimeout(mftModuleState.resumeTimer);
      mftModuleState.resumeTimer = null;
      mftModuleState.resumeAt = 0;
    }
    // Own screens must not retain an invisible engine room after history restoration.
    if (deps.navigation.state.routeIntent === 'own' && deps.ui.state.root.dataset.native !== 'true' && deps.adapter.activeSession().id && !deps.navigation.engineHome()) return;
    deps.notifications.syncNotifications();
    // visibility/focus/pageshow often arrive together on mobile. One bounded, fresh read; no poll.
    if (!mftModuleState.resumeTimer && Date.now() - mftModuleState.resumeAt > 1000) {
      mftModuleState.resumeTimer = setTimeout(() => {
        mftModuleState.resumeTimer = null;
        if (document.hidden || deps.core.state.disposed) return;
        mftModuleState.resumeAt = Date.now();
        deps.notifications.refreshUnreadSources();
        const resumeAt = mftModuleState.resumeAt;
        const refresh = attempt => deps.chats.hydrateSavedUnread(true).then(ok => {
          // Mobile networking can recover after the page. Retry failures only, at most twice.
          if (ok !== false || attempt >= 2 || document.hidden || deps.core.state.disposed || mftModuleState.resumeAt !== resumeAt) return;
          mftModuleState.resumeTimer = setTimeout(() => {
            mftModuleState.resumeTimer = null;
            if (!document.hidden && !deps.core.state.disposed && mftModuleState.resumeAt === resumeAt) refresh(attempt + 1);
          }, attempt ? 1200 : 350);
        });
        refresh(0);
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
      window.addEventListener('blur', suspendActivity);
      window.addEventListener('pagehide', suspendActivity);
      document.addEventListener('freeze', suspendActivity);
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
      window.removeEventListener('blur', suspendActivity);
      window.removeEventListener('pagehide', suspendActivity);
      document.removeEventListener('freeze', suspendActivity);
      clearTimeout(mftModuleState.resumeTimer);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, checkEngineHome, bindShell, suspendActivity, visibility, resumeActivity };
}
