/** core: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createCore(deps) {
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
      deps.ui.state.css.textContent = __SHADOW_CSS__;
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
