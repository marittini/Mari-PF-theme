/** gestures: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createGestures(deps) {
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
    if (!deps.navigation.engineHome()) return;
    deps.navigation.state.nativeOrigin = null;
    deps.updates.invalidateChats();
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
