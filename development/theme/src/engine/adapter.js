/** adapter: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createAdapter(deps) {
  const mftModuleState = {
    actionNames: undefined,
    lastChatSetter: null,
    cachedChatActions: {}
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
    // Notification navigation owns the complete native reset routine. Its component
    // often returns null, so its hooks cannot be found from a DOM notification rail.
    // Search the mounted current Fiber tree only on explicit engine action lookup.
    const resetNames = ['setPendingNewChatMode', 'setShouldOpenSettings', 'setShouldOpenWizard', 'setShouldOpenWizardInShortcutMode', 'setSetupActive'];
    if (resetNames.some(name => !out[name] && !mftModuleState.cachedChatActions[name])) {
      const shell = document.querySelector('[data-component="AppShell"]');
      const key = Object.keys(shell || {}).find(k => k.startsWith('__reactFiber$'));
      let root = key ? shell[key] : null;
      while (root?.return) root = root.return;
      root = root?.stateNode?.current || root;
      const stack = root ? [root] : [], visited = new Set();
      let budget = 0, cursor = 0;
      while (cursor < stack.length && budget++ < 4000) {
        const fiber = stack[cursor++];
        if (!fiber || visited.has(fiber)) continue;
        visited.add(fiber);
        let hook = fiber.memoizedState;
        for (let i = 0; hook && i < 160; hook = hook.next, i++) {
          accept(hook.memoizedState);
          for (const snapshot of [hook.queue, hook.memoizedState]) if (snapshot && typeof snapshot === 'object') {
            accept(snapshot.value);
            if (typeof snapshot.getSnapshot === 'function') try { accept(snapshot.getSnapshot()); } catch {}
          }
        }
        if (resetNames.every(name => out[name] || mftModuleState.cachedChatActions[name])) break;
        if (fiber.sibling) stack.push(fiber.sibling);
        if (fiber.child) stack.push(fiber.child);
      }
    }
    // Zustand action functions remain stable across component unmounts. Never cache
    // component-local wizard setters or write hook values/store snapshots directly.
    for (const name of resetNames) {
      if (out[name]) mftModuleState.cachedChatActions[name] = out[name];
      else if (mftModuleState.cachedChatActions[name]) out[name] = mftModuleState.cachedChatActions[name];
    }
    if (out.setActiveChatId) mftModuleState.lastChatSetter = out.setActiveChatId;
    return out;
  }
  
  function clearActiveChat(actions) {
    const setter = actions?.setActiveChatId || mftModuleState.lastChatSetter;
    if (typeof setter !== 'function') { const active = activeSession(); return active.known && !active.id; }
    try {
      setter(null);
      const active = activeSession();
      return !active.known || !active.id;
    } catch { return false; }
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

  function dismissChatSetup() {
    // Suspense can retain wizardOpen while its lazy wizard has no DOM yet.
    // Use the existing overlay callbacks; onWizardFinish also opens settings,
    // so close that native drawer again before switching to an existing room.
    let overlay = null;
    for (const anchor of document.querySelectorAll('[data-chat-mode],[data-component="CenterContent"]')) {
      if (eachHook(anchor, props => {
        if (props?.wizardOpen === true && typeof props.onWizardFinish === 'function' && typeof props.onCloseSettings === 'function') {
          overlay = props; return true;
        }
        return false;
      }, true, true)) break;
    }
    if (overlay) {
      overlay.onWizardFinish();
      overlay.onCloseSettings({ force: true });
      return true;
    }
    const wizard = document.querySelector('[data-component="ChatSetupWizard"]:not([hidden])');
    if (!wizard || wizard.closest('[hidden],[aria-hidden="true"]')) return true;
    const close = wizard.querySelector('button:has(svg.lucide-x)');
    if (!close || close.disabled) return false;
    // This calls onFinish, which clears LocalChatArea.wizardOpen. Resetting the
    // global flags alone cannot clear that retained component-local state.
    close.click();
    return true;
  }

  function prepareChat(a) {
    const required = ['setPendingNewChatMode', 'setShouldOpenSettings', 'setShouldOpenWizard', 'setShouldOpenWizardInShortcutMode', 'setSetupActive'];
    if (!required.every(name => typeof a[name] === 'function')) return false;
    if (!dismissChatSetup()) return false;
    a.setPendingNewChatMode(null);
    a.setShouldOpenSettings(false);
    a.setShouldOpenWizard(false);
    a.setShouldOpenWizardInShortcutMode(false);
    a.setSetupActive(false);
    return true;
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
  
  function eachHook(node, accept, children = false, currentOnly = false) {
    const key = Object.keys(node || {}).find(k => k.startsWith('__reactFiber$'));
    let f = key ? node[key] : null;
    if (currentOnly) {
      let top = f;
      while (top?.return) top = top.return;
      if (top?.stateNode?.current && top.stateNode.current !== top) f = f?.alternate;
    }
    const seen = new Set(),
      stack = [];
    for (let d = 0; f && d < 18; d++, f = f.return) stack.push(f);
    let steps = 0;
    while (stack.length && steps++ < 600) {
      const item = stack.shift();
      if (!item || seen.has(item)) continue;
      seen.add(item);
      for (const branch of currentOnly ? [item] : [item, item.alternate]) {
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
      // The nearest message owns this flag. A view can stream another message.
      const message = p?.message || p?.ctx?.message;
      if (message?.id) return message.role !== 'user' && (p.isStreaming === true || p.ctx?.isStreaming === true);
      if (p?.isStreaming === true || p?.ctx?.isStreaming === true) return true;
    }
    return false;
  }

  function chatDeletionCache() {
    let cache = null;
    for (const anchor of document.querySelectorAll('[data-component="TopBar"],[data-component="AppShell"]')) {
      if (eachHook(anchor, value => {
        const client = value?.value || value?.client || value;
        if (typeof client?.getMutationCache !== 'function') return false;
        cache = client.getMutationCache();
        return typeof cache?.subscribe === 'function';
      })) break;
    }
    return cache;
  }

  const initialize = [
    { order: 7100, run() {
      mftModuleState.actionNames = new Set(['setActiveChatId', 'setSidebarOpen', 'closeRightPanel', 'openRightPanel', 'closeAllDetails', 'openModal', 'openCharacterDetail', 'setSettingsTab', 'openPersonaDetail', 'openAgentCatalog', 'openBotBrowser', 'setTheme', 'requestChatModeShortcut', 'setPendingNewChatMode', 'setShouldOpenSettings', 'setShouldOpenWizard', 'setShouldOpenWizardInShortcutMode', 'setSetupActive', 'setAppAccentColor']);
    } }
  ];
  const cleanup = [
    { order: 76, run() { mftModuleState.lastChatSetter = null; mftModuleState.cachedChatActions = {}; } },

  ];
  return { state: mftModuleState, initialize, cleanup, nativeTarget, engineActions, clearActiveChat, surfaceHasChatId, chatSurface, activeSession, roomReady, prepareChat, dismissChatSetup, personaCropForImage, engineNavigator, eachHook, liveBubble, chatDeletionCache };
}
