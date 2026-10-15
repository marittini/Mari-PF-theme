/** updates: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createUpdates(deps) {
  const mftModuleState = {
    queryCache: undefined,
    queryUnsubscribe: undefined,
    chatRefreshTimer: undefined,
    chatRefreshRequest: undefined,
    chatRevision: undefined,
    chatRefreshBurst: undefined
  };

  function invalidateChats() {
    for (const key of deps.data.state.cache.keys()) if (key.startsWith('/chats')) deps.data.state.cache.delete(key);
    deps.previews.state.previewCache.clear();
  }
  
  function queueChatRefresh() {
    invalidateChats();
    mftModuleState.chatRevision++;
    if (deps.core.state.disposed || document.hidden || deps.navigation.state.bridgeBusy || deps.ui.state.root.dataset.native === 'true' || deps.navigation.state.view !== 'chats') return;
    mftModuleState.chatRefreshBurst ||= Date.now();
    if (mftModuleState.chatRefreshTimer) {
      clearTimeout(mftModuleState.chatRefreshTimer);
      deps.core.state.bootstrapTimers.delete(mftModuleState.chatRefreshTimer);
    }
    mftModuleState.chatRefreshTimer = deps.core.bindLater(() => {
      mftModuleState.chatRefreshTimer = null;
      mftModuleState.chatRefreshBurst = 0;
      refreshChatRows();
    }, Date.now() - mftModuleState.chatRefreshBurst >= 1000 ? 0 : 180);
  }
  
  async function refreshChatRows() {
    if (deps.core.state.disposed || deps.navigation.state.view !== 'chats' || deps.ui.state.root.dataset.native === 'true' || deps.navigation.state.bridgeBusy) return;
    const ticket = deps.core.state.epoch,
      all = deps.chats.state.chatsAll,
      revision = mftModuleState.chatRevision;
    mftModuleState.chatRefreshRequest?.abort();
    const controller = new AbortController();
    mftModuleState.chatRefreshRequest = controller;
    try {
      const data = await deps.data.jsonRequest(all ? '/chats' : '/chats/home-feed', 'GET', undefined, controller.signal);
      if (deps.core.state.disposed || ticket !== deps.core.state.epoch || deps.ui.state.root.dataset.native === 'true' || deps.navigation.state.view !== 'chats') return;
      const rows = (all ? Array.isArray(data) ? data : [] : data.recentChats || []).map(r => ({
        chat: all ? r : r.chat,
        latest: all ? r.lastMessage || r.latestMessage : r.latestMessage
      }));
      const sortedRows = deps.chats.orderedChats(rows.map(r => deps.chats.normalizedChat(r.chat, r.latest)), all);
      deps.chats.ingestChats(sortedRows, all);
      const selected = sortedRows.map(c => ({ chat: c })).filter(r => r.chat.mode === deps.chats.state.chatMode && (!all || !deps.chats.state.folderFilter || (deps.chats.state.folderFilter === 'unfiled' ? !r.chat.folderId : r.chat.folderId === deps.chats.state.folderFilter)));
      const listed = [...deps.ui.state.main.querySelectorAll('.chat-row')];
      const ids = new Set(listed.map(n => n.dataset.roomId));
      if (selected.slice(0, Math.max(30, listed.length)).some(r => !ids.has(String(r.chat.id))) || listed.some(n => !selected.some(r => String(r.chat.id) === n.dataset.roomId))) {
        deps.navigation.state.restoreScrollTarget = {
          view: 'chats',
          scroll: deps.ui.state.main.scrollTop
        };
        deps.chats.chats(all);
        return;
      }
      const list = deps.ui.state.main.querySelector('.chat-list');
      for (const {
        chat: c
      } of selected) {
        const row = deps.ui.state.main.querySelector(`[data-room-id="${CSS.escape(String(c.id))}"]`),
          stored = deps.chats.state.roomRows.find(r => r.id === String(c.id));
        if (!row || !stored) continue;
        Object.assign(stored, {
          unreadCount: c.unreadCount,
          unreadVersion: c.unreadVersion,
          previewEmpty: c.previewEmpty,
          previewKnown: c.previewKnown,
          previewPending: c.previewPending
        });
        stored.name = c.name || stored.name;
        stored.lastMessageAt = c.lastMessageAt || c.updatedAt || '';
        row.querySelector('strong').textContent = stored.name;
        if (c.preview || c.previewKnown && !c.previewPending) {
          stored.preview = c.preview;
          row.querySelector('[data-preview-id]').textContent = stored.preview || '아직 메시지가 없어요.';
        }
        if (list && row.parentElement) list.append(row.parentElement);
      }
      deps.previews.fillPreviews(deps.chats.state.roomRows, ticket);
      deps.notifications.syncUnreadBadges(deps.notifications.unreadSnapshot(deps.notifications.notificationSnapshot()));
      deps.avatars.observeImages();
    } catch {} finally {
      if (mftModuleState.chatRefreshRequest === controller) mftModuleState.chatRefreshRequest = null;
      if (revision !== mftModuleState.chatRevision && !deps.core.state.disposed) queueChatRefresh();
    }
  }
  
  function bindQueryUpdates() {
    if (mftModuleState.queryCache) return;
    let client;
    for (const anchor of document.querySelectorAll('[data-component="TopBar"],[data-component="AppShell"]')) {
      if (deps.adapter.eachHook(anchor, value => {
        const candidate = value?.value || value?.client || value;
        if (typeof candidate?.getQueryCache === 'function') {
          client = candidate;
          return true;
        }
        return false;
      })) break;
    }
    if (!client) return;
    const found = client.getQueryCache();
    if (typeof found?.subscribe !== 'function') return;
    mftModuleState.queryCache = found;
    mftModuleState.queryUnsubscribe = found.subscribe(event => {
      const key = event.query?.queryKey;
      if (event.type === 'updated' && ['success', 'invalidate', 'setState'].includes(event.action?.type) && Array.isArray(key) && ['chats', 'home-feed'].includes(key[0])) {
        if (key[0] === 'chats' && key[1] === 'messages' && typeof key[2] === 'string') {
          // Edits can keep lastMessageAt unchanged. Never reuse an older request
          // for that room after a native message mutation, while metadata-only
          // list refreshes may still share their pending preview.
          for (const request of deps.previews.state.previewRequests) if (request.previewKey?.startsWith(key[2] + ':')) request.abort();
          for (const room of [deps.chats.state.chatRegistry.get(key[2]), ...deps.chats.state.roomRows.filter(c => c.id === key[2])]) if (room) room.previewPending = true;
        }
        if (key[0] === 'chats' && key[1] === 'list' && Array.isArray(event.query?.state?.data)) deps.chats.ingestChats(event.query.state.data.map(c => deps.chats.normalizedChat(c)), true);
        const detail = key[0] === 'chats' && key[1] === 'detail' && event.query?.state?.data;
        if (detail?.id) deps.chats.ingestChats([deps.chats.normalizedChat(detail)]);
        const feed = event.query?.state?.data?.recentChats;
        if (Array.isArray(feed)) deps.chats.ingestChats(feed.filter(r => r?.chat).map(r => deps.chats.normalizedChat(r.chat, r.latestMessage)));
        deps.notifications.scheduleNotifications();
        queueChatRefresh();
      }
    });
  }
  // Only translation nodes are adapted; native font preferences remain authoritative.

  const initialize = [
    { order: 21200, run() {
      mftModuleState.queryCache = null;
    } },
    { order: 21201, run() {
      mftModuleState.queryUnsubscribe = null;
    } },
    { order: 21202, run() {
      mftModuleState.chatRefreshTimer = null;
    } },
    { order: 21203, run() {
      mftModuleState.chatRefreshRequest = null;
    } },
    { order: 21204, run() {
      mftModuleState.chatRevision = 0;
    } },
    { order: 21205, run() {
      mftModuleState.chatRefreshBurst = 0;
    } }
  ];
  const cleanup = [
    { order: 32, run() {
      mftModuleState.queryUnsubscribe?.();
    } },
    { order: 33, run() {
      mftModuleState.chatRefreshRequest?.abort();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, invalidateChats, queueChatRefresh, refreshChatRows, bindQueryUpdates };
}
