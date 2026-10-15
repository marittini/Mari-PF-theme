/** translations: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createTranslations(deps) {
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
