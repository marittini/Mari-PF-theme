/** previews: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createPreviews(deps) {
  const mftModuleState = {
    previewCache: undefined,
    previewRequests: undefined,
    previewObserver: undefined,
    previewGeneration: undefined
  };

  function fillPreviews(slice, ticket) {
    const generation = ++mftModuleState.previewGeneration;
    mftModuleState.previewObserver?.disconnect();
    const byId = new Map(deps.chats.state.roomRows.filter(c => c.previewPending || !c.preview && !c.previewEmpty).map(c => [c.id, c]));
    const wanted = new Set([...byId.values()].map(c => c.id + ':' + (c.lastMessageAt || '')));
    for (const request of mftModuleState.previewRequests) if (request.previewKey && !wanted.has(request.previewKey)) request.abort();
    let queue = [],
      working = 0;
    async function drain() {
      if (working >= 2 || !queue.length || ticket !== deps.core.state.epoch || generation !== mftModuleState.previewGeneration) return;
      const c = queue.shift();
      working++;
      try {
        const key = c.id + ':' + (c.lastMessageAt || '');
        let text = mftModuleState.previewCache.get(key);
        if (text === undefined) {
          let request = [...mftModuleState.previewRequests].find(r => r.previewKey === key && !r.signal.aborted);
          if (!request) {
            request = new AbortController();
            request.previewKey = key;
            mftModuleState.previewRequests.add(request);
            request.previewPromise = (async () => {
              const rows = await deps.data.jsonRequest('/chats/' + encodeURIComponent(c.id) + '/messages?limit=12', 'GET', undefined, request.signal);
              if (!Array.isArray(rows)) throw Error('Unexpected message response');
              const message = [...rows].reverse().find(m => {
                let extra = m.extra; try { if (typeof extra === 'string') extra = JSON.parse(extra); } catch { extra = {}; }
                return m.role !== 'system' && extra?.hiddenFromUser !== true && extra?.commandOnly !== true && String(m.content || '').trim();
              });
              const value = message ? String(message.content).slice(0, 140) : rows.length ? '텍스트 미리보기가 없는 메시지예요.' : '';
              if (!request.signal.aborted) {
                mftModuleState.previewCache.set(key, value);
                while (mftModuleState.previewCache.size > 200) mftModuleState.previewCache.delete(mftModuleState.previewCache.keys().next().value);
              }
              return value;
            })().finally(() => mftModuleState.previewRequests.delete(request));
          }
          text = await request.previewPromise;
          if (request.signal.aborted) return;
        }
        if (ticket === deps.core.state.epoch && generation === mftModuleState.previewGeneration) {
          const result = { preview: text, previewKnown: true, previewEmpty: !text, previewPending: false };
          Object.assign(c, result);
          const registered = deps.chats.state.chatRegistry?.get(c.id);
          if (registered?.lastMessageAt === c.lastMessageAt) Object.assign(registered, result);
          const n = deps.ui.state.main.querySelector(`[data-preview-id="${CSS.escape(c.id)}"]`);
          if (n) n.textContent = text || '아직 메시지가 없어요.';
        }
      } catch (error) {
        if (error.name !== 'AbortError' && ticket === deps.core.state.epoch && generation === mftModuleState.previewGeneration) {
          const n = deps.ui.state.main.querySelector(`[data-preview-id="${CSS.escape(c.id)}"]`);
          if (n && !c.preview) n.textContent = '미리보기를 불러오지 못했어요.';
        }
      } finally {
        working--;
        drain();
      }
    }
    mftModuleState.previewObserver = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) {
        mftModuleState.previewObserver.unobserve(e.target);
        const c = byId.get(e.target.dataset.previewId);
        if (c) queue.push(c);
      }
      drain();
      drain();
    }, {
      root: deps.ui.state.main,
      rootMargin: '30px'
    });
    for (const [id] of byId) {
      const n = deps.ui.state.main.querySelector(`[data-preview-id="${CSS.escape(id)}"]`);
      if (n) mftModuleState.previewObserver.observe(n);
    }
  }

  const initialize = [
    { order: 17700, run() {
      mftModuleState.previewCache = new Map();
    } },
    { order: 17701, run() {
      mftModuleState.previewRequests = new Set();
    } },
    { order: 17800, run() {
      mftModuleState.previewObserver = null;
    } },
    { order: 17801, run() {
      mftModuleState.previewGeneration = 0;
    } }
  ];
  const cleanup = [
    { order: 66, run() {
      mftModuleState.previewCache.clear();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, fillPreviews };
}
