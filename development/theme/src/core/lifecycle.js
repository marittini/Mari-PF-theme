/** Ordered module initialization and failure-isolated, idempotent cleanup. */
export function createLifecycle(deps) {
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
