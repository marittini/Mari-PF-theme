/** Native launch lifecycle: one transaction per launch, authoritative room identity. */
export function createLaunch(deps) {
  const state = { observer: null, signal: null, previousId: null, selectedMode: null, phase: 'idle', sawSetup: false, closing: false, settleTimer: null, closingDialog: null, backRequested: false, createdId: null, deletionUnsubscribe: null };
  const dialogs = '[role="dialog"],.mari-modal,[data-component="GameSetupWizard"],[data-component="ChatSetupWizard"],[data-new-chat-connection-gate]';
  function stop() {
    state.observer?.disconnect(); state.observer = null;
    state.deletionUnsubscribe?.(); state.deletionUnsubscribe = null;
    clearTimeout(state.settleTimer);
    state.settleTimer = null; state.closingDialog = null; state.backRequested = false;
    state.signal?.removeEventListener('abort', stop); state.signal = null;
    document.removeEventListener('click', onClick, true);
    if (state.phase !== 'ready') state.phase = 'idle';
  }
  function leave() { stop(); deps.gestures.returnFromNative(); }
  function onDeletion(event) {
    const mutation = event.mutation;
    if (event.type !== 'updated' || event.action?.type !== 'success' || mutation?.state?.status !== 'success') return;
    const { variables, context } = mutation.state;
    const id = typeof variables === 'string' ? variables : variables?.id;
    // ME 2.5.0 useDeleteChat's onMutate context distinguishes deletion from
    // other successful mutations for the same room. Pending/error are never proof.
    if (!Array.isArray(context?.previousGroups) || !Array.isArray(context?.affectedGroupIds)) return;
    if (deps.navigation.state.routeIntent !== 'start' || !state.closing || !state.createdId || id !== state.createdId) return;
    if (state.selectedMode !== 'game' && !state.closingDialog?.matches('[data-component="GameSetupWizard"]')) return;
    const active = deps.adapter.activeSession();
    // Cache removal can unmount GameSurface before its observer onSuccess runs.
    // Recover only this confirmed deleted room, after native mutation settlement.
    if (!active.known || active.id && active.id !== id) return;
    if (active.id === id && !deps.adapter.clearActiveChat({})) return;
    reconcile();
  }
  function onClick(event) {
    const button = event.target.closest?.('button');
    if (!button || button.disabled) return;
    const chooser = button.closest('[data-component="ChatModeSelectorModal"]');
    if (chooser) {
      const index = [...chooser.querySelectorAll('button')].indexOf(button);
      state.selectedMode = ['conversation', 'roleplay', 'game'][index] || null;
      state.phase = 'creating';
      if (history.state?.marinaraOverlay) {
        deps.navigation.state.expectedEnginePops++;
        deps.navigation.state.expectedEnginePopUntil = Date.now() + 1500;
      }
      return;
    }
    const dialog = button.closest(dialogs);
    if (!dialog) return;
    const close = button.querySelector('svg.lucide-x') || /^(취소|닫기|cancel|close|×|x)$/i.test((button.getAttribute('aria-label') || button.textContent).trim());
    if (close) {
      if (dialog.matches('.mari-modal') && history.state?.marinaraOverlay) {
        deps.navigation.state.expectedEnginePops++;
        deps.navigation.state.expectedEnginePopUntil = Date.now() + 1500;
      }
      state.closing = true;
      state.closingDialog = dialog;
      state.phase = 'closing';
      // Let the original handler delete or keep its room first. No setter or click proxy.
      clearTimeout(state.settleTimer);
      state.settleTimer = setTimeout(() => { state.settleTimer = null; reconcile(); }, 700);
    }
  }
  function requestBack(source) {
    if (deps.navigation.state.routeIntent !== 'start') return false;
    const active = deps.adapter.activeSession();
    // Native popstate listeners can run before this extension's listener on Window.
    // If native Back already closed this launch, do not click a stale wizard and
    // start an asynchronous delete whose success could later close another room.
    if (state.createdId && active.known && !active.id && !state.closing) {
      leave();
      return false;
    }
    const modal = [...document.querySelectorAll(dialogs)].filter(deps.ui.state.visible).at(-1);
    if (!modal) {
      if (source === 'history' && history.state?.route?.kind === 'native') return false;
      if (!state.closing) state.backRequested = true;
      return true;
    }
    const close = modal.querySelector('button:has(svg.lucide-x)') || [...modal.querySelectorAll('button')].find(b => /^(취소|닫기|cancel|close|×|x)$/i.test((b.getAttribute('aria-label') || b.textContent).trim()));
    if (!close || close.disabled || state.closing && state.closingDialog === modal) return true;
    // Modal owns an engine sentinel, whereas GameSetupWizard is a custom portal.
    // Invoke its actual X in both cases; do not replace cancellation with setActiveChatId(null).
    if (source === 'history' && modal.matches('.mari-modal')) {
      // The engine already popped this Modal's sentinel and will invoke onClose.
      // Record cancellation before that handler runs, without clicking it twice.
      onClick({ target: close });
      return false;
    }
    if (!modal.matches('.mari-modal') && (history.state?.marinaraOverlay || source === 'history')) {
      deps.navigation.state.expectedEnginePops++;
      deps.navigation.state.expectedEnginePopUntil = Date.now() + 1500;
    }
    close.click();
    return true;
  }
  function reconcile() {
    if (deps.core.state.disposed || deps.navigation.state.routeIntent !== 'start') { stop(); return; }
    const mounted = [...document.querySelectorAll(dialogs)];
    const visible = mounted.filter(deps.ui.state.visible);
    // A motion panel starts at opacity:0. Mount/unmount, not animation visibility, owns setup.
    const mountedSetup = mounted.some(n => n.matches('[data-component="GameSetupWizard"],[data-component="ChatSetupWizard"],[data-new-chat-connection-gate]') && !n.closest('[hidden],[aria-hidden="true"]'));
    if (state.backRequested && visible.length) {
      state.backRequested = false;
      requestBack();
      return; // Re-read mounted surfaces after the native close handler mutates them.
    }
    const chooser = visible.some(n => n.querySelector('[data-component="ChatModeSelectorModal"]') || n.matches('[data-component="ChatModeSelectorModal"]'));
    if (mountedSetup || visible.length && !chooser) {
      state.sawSetup = true;
      // Closing an inner picker/help dialog is not cancellation of its still-open wizard.
      if (state.closing && state.closingDialog && !state.closingDialog.isConnected) {
        state.closing = false; state.closingDialog = null;
        clearTimeout(state.settleTimer); state.settleTimer = null;
      }
      if (!state.closing) state.phase = 'setup';
    }
    const active = deps.adapter.activeSession();
    const chat = deps.adapter.chatSurface(active.known ? active.id : undefined);
    const id = active.known ? active.id : chat?.id;
    const fresh = id && id !== state.previousId;
    if (fresh) state.createdId = id;
    if (state.createdId && active.known && !active.id && !state.closing) { leave(); return; }
    if (state.closing && active.known && !active.id) {
      // Empty game setup was deleted. A stale loading surface must not keep this route alive.
      leave(); return;
    }
    if (visible.length || mountedSetup) return;
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
    stop(); state.signal = signal; state.previousId = previousId; state.createdId = null;
    state.phase = 'choosing'; state.selectedMode = null; state.sawSetup = false; state.closing = false;
    if (signal?.aborted) { stop(); return; }
    signal?.addEventListener('abort', stop, { once: true });
    state.deletionUnsubscribe = deps.adapter.chatDeletionCache?.()?.subscribe(onDeletion) || null;
    document.addEventListener('click', onClick, true);
    state.observer = new MutationObserver(reconcile);
    state.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-chat-id','data-chat-mode','data-chat-surface-active','aria-hidden','hidden'] });
    // Setup and model generation have no theme-imposed deadline. Native errors/cancellation own recovery.
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
  return { state, initialize, cleanup, begin, reconcile, stop, onClick, requestBack, checkExit };
}
