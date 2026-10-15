/** history: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createHistory(deps) {
  const mftModuleState = {
    nativeBackArmed: undefined,
    historyOwned: undefined,
    historyToken: undefined,
    closeWatcher: undefined,
    exitUntil: undefined,
    exitTimer: undefined,
    engineBack: null,
    cleanupPops: 0
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
  
  function trackEngineBack(...args) {
    // Native overlay cleanup calls history.back(); hardware/browser Back does not.
    // Its popstate can arrive after a new lazy chooser has begun mounting.
    const cleanup = !deps.core.state.disposed && !!history.state?.marinaraOverlay;
    if (cleanup) mftModuleState.cleanupPops++;
    try { return mftModuleState.engineBack.apply(this, args); }
    catch (error) { if (cleanup) mftModuleState.cleanupPops--; throw error; }
  }

  function onBack(event) {
    if (mftModuleState.cleanupPops) {
      mftModuleState.cleanupPops--;
      if (deps.navigation.state.routeIntent === 'start') {
        if (deps.navigation.state.expectedEnginePops) deps.navigation.state.expectedEnginePops--;
        return;
      }
    }
    if (Date.now() < mftModuleState.exitUntil && deps.ui.state.root.dataset.native !== 'true' && deps.navigation.state.view === 'home') return;
    if (deps.navigation.state.routeIntent === 'extension' && document.querySelector('[role="dialog"],.mari-modal')) return;
    if (deps.navigation.state.expectedEnginePops && Date.now() < deps.navigation.state.expectedEnginePopUntil) {
      deps.navigation.state.expectedEnginePops--;
      return;
    }
    deps.navigation.state.expectedEnginePops = 0;
    if (deps.navigation.state.routeIntent === 'start') {
      if (deps.launch.requestBack('history')) event.stopImmediatePropagation();
      return;
    }
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
        if (deps.navigation.state.routeIntent === 'start') {
          deps.launch.requestBack();
          queueMicrotask(installBackWatcher);
          return;
        }
        const modal = [...document.querySelectorAll('.mari-modal,[role="dialog"],[data-component="GameSetupWizard"]')].filter(deps.ui.state.visible).at(-1);
        const close = modal?.querySelector('button:has(svg.lucide-x)');
        if (close && !close.disabled) {
          if (history.state?.marinaraOverlay) {
            deps.navigation.state.expectedEnginePops++;
            deps.navigation.state.expectedEnginePopUntil = Date.now() + 75;
          }
          close.click();
          queueMicrotask(installBackWatcher);
          return;
        }
        // A disabled/missing native dismiss action must not bypass the setup lifecycle.
        if (modal || deps.navigation.state.routeIntent === 'start') {
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
    { order: 13899, run() {
      mftModuleState.engineBack = history.back;
      history.back = trackEngineBack;
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
    { order: 73, run() {
      if (history.back === trackEngineBack) history.back = mftModuleState.engineBack;
      mftModuleState.cleanupPops = 0;
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
