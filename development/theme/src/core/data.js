/** data: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createData(deps) {
  const mftModuleState = {
    cache: undefined,
    viewRequests: undefined,
    request: undefined,
    refreshWriteQueued: undefined,
    resourceFetch: undefined
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
    const old = mftModuleState.cache.get(path);
    if (old && Date.now() - old.time < 60000) {
      mftModuleState.cache.delete(path);
      mftModuleState.cache.set(path, old);
      return old.data;
    }
    const c = new AbortController();
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
      mftModuleState.cache.set(path, {
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
    }
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
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, resourceFetchWrapper, compact, get, jsonRequest };
}
