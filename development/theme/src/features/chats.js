/** chats: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createChats(deps) {
  const mftModuleState = {
    chatMode: undefined,
    chatsAll: undefined,
    chatRegistry: undefined,
    chatVisits: undefined,
    folderFilter: undefined,
    folderRows: undefined,
    roomRows: undefined
  };

  function rememberChatVisit(id) {
    if (!id) return;
    mftModuleState.chatVisits.delete(id);
    mftModuleState.chatVisits.set(id, Date.now());
    while (mftModuleState.chatVisits.size > 100) mftModuleState.chatVisits.delete(mftModuleState.chatVisits.keys().next().value);
    try {
      localStorage.setItem('mft-chat-visits', JSON.stringify([...mftModuleState.chatVisits]));
    } catch {}
  }
  
  function normalizedChat(c, latest) {
    let ids = c.characterIds;
    try {
      if (typeof ids === 'string') ids = JSON.parse(ids);
    } catch {
      ids = [];
    }
    const previous = mftModuleState.chatRegistry?.get(String(c.id));
    const provided = latest !== undefined ? latest : c.lastMessage !== undefined ? c.lastMessage : c.latestMessage;
    const lastMessageAt = c.lastMessageAt || c.updatedAt || c.createdAt || '';
    const known = provided !== undefined;
    const preview = known ? (provided === null ? '' : String(provided?.content || '').slice(0, 140) || '텍스트 미리보기가 없는 메시지예요.') : previous?.preview || '';
    return {
      ...deps.notifications.chatUnreadMetadata(c),
      lastMessageAt,
      folderId: c.folderId || null,
      id: String(c.id),
      name: String(c.name || '이름 없는 대화'),
      mode: c.mode,
      characterIds: Array.isArray(ids) ? ids.slice(0, 6).filter(x => typeof x === 'string') : [],
      preview,
      previewEmpty: known ? !preview : previous?.previewEmpty === true && previous.lastMessageAt === lastMessageAt,
      previewKnown: known || previous?.previewKnown === true,
      previewPending: !known && (!previous?.previewKnown || previous.previewPending || previous.lastMessageAt !== lastMessageAt)
    };
  }
  
  function ingestChats(rows, complete = false) {
    if (complete) {
      const ids = new Set(rows.map(c => c.id));
      for (const id of mftModuleState.chatRegistry.keys()) if (!ids.has(id)) mftModuleState.chatRegistry.delete(id);
    }
    for (const c of rows) mftModuleState.chatRegistry.set(c.id, c);
    deps.notifications.captureUnreadMetadata(rows);
  }
  
  function orderedChats(rows, all) {
    const list = [...rows];
    if (!all) {
      const ids = new Set(list.map(c => c.id));
      for (const [id] of mftModuleState.chatVisits) {
        const c = mftModuleState.chatRegistry.get(id);
        if (c && !ids.has(id)) {
          list.push(c);
          ids.add(id);
        }
      }
      list.sort((a, b) => (mftModuleState.chatVisits.get(b.id) || 0) - (mftModuleState.chatVisits.get(a.id) || 0));
    } else list.sort((a, b) => (Date.parse(b.lastMessageAt) || 0) - (Date.parse(a.lastMessageAt) || 0) || a.id.localeCompare(b.id));
    return list;
  }
  
  function hydrateSavedUnread(force = false) {
    const previous = deps.notifications.state.unreadHydration;
    if (previous && !previous.signal.aborted && (!force || previous.fresh)) return previous.promise;
    // Resume must never reuse an aborted or pre-suspension/cache-backed read.
    previous?.abort();
    const controller = new AbortController();
    controller.fresh = force;
    deps.notifications.state.unreadHydration = controller;
    const deadline = setTimeout(() => controller.abort(), 12000);
    controller.promise = (async () => {
      try {
        const cached = !force && deps.updates.state.queryCache?.find?.({
          queryKey: ['chats', 'list'],
          exact: true
        })?.state?.data;
        const raw = Array.isArray(cached) && cached.length ? cached : await deps.data.jsonRequest('/chats', 'GET', undefined, controller.signal, force);
        if (controller.signal.aborted || deps.notifications.state.unreadHydration !== controller || deps.core.state.disposed || !Array.isArray(raw)) return false;
        const normalized = raw.map(c => normalizedChat(c));
        ingestChats(normalized, true);
        deps.data.state.cache.set('/chats', {
          time: Date.now(),
          data: normalized
        });
        // The engine may clear active-room metadata before the theme's resume fetch.
        // Only that protected CONVO room needs a bounded durable-message fallback.
        const protectedId = deps.notifications.state.resumeUnreadRoom;
        const room = normalized.find(c => c.id === protectedId && c.mode === 'conversation');
        const since = protectedId ? Math.max(deps.notifications.state.resumeUnreadSince || 0, mftModuleState.chatVisits.get(protectedId) || 0) : 0;
        if (force && room && !room.unreadCount && !deps.notifications.state.retainedUnread.has(room.id) && since && Date.parse(room.lastMessageAt) > since) {
          const messages = await deps.data.jsonRequest('/chats/' + encodeURIComponent(room.id) + '/messages?limit=50', 'GET', undefined, controller.signal, true);
          if (controller.signal.aborted || deps.notifications.state.unreadHydration !== controller || deps.notifications.state.resumeUnreadRoom !== protectedId) return false;
          const arrivals = (Array.isArray(messages) ? messages : []).filter(m => {
            let extra = m.extra; try { if (typeof extra === 'string') extra = JSON.parse(extra); } catch { extra = {}; }
            return m.role === 'assistant' && Date.parse(m.createdAt) > since && extra?.hiddenFromUser !== true;
          });
          if (arrivals.length) deps.notifications.captureUnreadMetadata([{ ...room, unreadCount: arrivals.length, unreadVersion: arrivals.map(m => m.createdAt).sort().at(-1) }]);
        }
        deps.notifications.syncUnreadBadges(deps.notifications.unreadSnapshot(deps.notifications.notificationSnapshot()));
        return true;
      } catch { return false; } finally {
        clearTimeout(deadline);
        if (deps.notifications.state.unreadHydration === controller) deps.notifications.state.unreadHydration = null;
      }
    })();
    return controller.promise;
  }
  
  async function chats(all = mftModuleState.chatsAll) {
    mftModuleState.chatsAll = all;
    deps.core.stop();
    deps.ui.own();
    const ticket = deps.core.state.epoch;
    deps.ui.state.main.replaceChildren(deps.ui.state.el('h1', '', '채팅'));
    const modes = deps.ui.state.el('div', 'mode-tabs');
    modes.setAttribute('role', 'tablist');
    modes.setAttribute('aria-label', '대화 모드');
    for (const [k, label] of [['conversation', '대화'], ['roleplay', '롤플레이'], ['game', '게임']]) {
      const b = deps.ui.button(label, () => {
        mftModuleState.chatMode = k;
        mftModuleState.folderFilter = '';
        chats(all);
      }, 'mode-tab');
      b.dataset.mode = k;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', label);
      b.setAttribute('aria-selected', String(k === mftModuleState.chatMode));
      modes.append(b);
    }
    deps.ui.state.main.append(modes);
    const controls = deps.ui.state.el('div', 'chat-switch');
    controls.append(deps.ui.button('최근 대화', () => chats(false), all ? 'quiet' : 'chip'), deps.ui.button('전체 대화', () => chats(true), all ? 'chip' : 'quiet'));
    deps.ui.state.main.append(controls);
    const loading = deps.ui.state.el('p', 'muted', '대화 목록을 불러오는 중…');
    deps.ui.state.main.append(loading);
    try {
      const rows = await deps.data.get(all ? '/chats' : '/chats/home-feed', ticket, x => (all ? Array.isArray(x) ? x : [] : x.recentChats || []).map(r => normalizedChat(all ? r : r.chat, all ? undefined : r.latestMessage)));
      if (ticket !== deps.core.state.epoch) return;
      loading.remove();
      ingestChats(rows, all);
      const selected = orderedChats(rows, all).filter(r => r.mode === mftModuleState.chatMode && (!all || !mftModuleState.folderFilter || (mftModuleState.folderFilter === 'unfiled' ? !r.folderId : r.folderId === mftModuleState.folderFilter)));
      if (!selected.length) deps.ui.state.main.append(deps.ui.state.el('p', 'muted', all ? '이 모드의 대화가 없어요. 홈에서 캐릭터를 골라 보세요.' : '최근 대화에 이 모드가 없어요. 전체 대화에서 찾아보세요.'));
      let offset = 0;
      const list = deps.ui.state.el('div', 'chat-list');
      deps.ui.state.main.append(list);
      mftModuleState.roomRows = rows;
      if (all) chatFolders(ticket, rows);
      const more = deps.ui.button('더 보기', () => renderPage(), 'quiet');
      deps.ui.state.main.append(more);
      async function renderPage() {
        more.disabled = true;
        const slice = selected.slice(offset, offset + 30),
          avatars = [],
          currentNotes = deps.notifications.unreadSnapshot(deps.notifications.notificationSnapshot());
        for (const c of slice) {
          const b = deps.ui.button('', () => deps.navigation.bridge('chat', c), 'chat-row');
          b.dataset.roomId = c.id;
          const note = currentNotes.get(c.id);
          if (note) b.classList.add('has-unread');
          const copy = deps.ui.state.el('div');
          copy.append(deps.ui.state.el('strong', '', c.name), deps.ui.state.el('p', 'summary', c.preview || (c.previewEmpty ? '아직 메시지가 없어요.' : '불러오는 중…')));
          copy.lastChild.dataset.previewId = c.id;
          const holder = deps.avatars.avatar('', c.name, 'round');
          b.append(holder, copy, deps.ui.state.el('span', 'muted', '›'));
          if (note) b.append(deps.ui.state.el('span', 'chat-unread', String(note)));
          const row = deps.ui.state.el('div', 'chat-item');
          row.append(b);
          list.append(row);
          avatars.push([holder, c]);
        }
        deps.previews.fillPreviews(slice, ticket);
        offset += 30;
        more.hidden = offset >= selected.length;
        const ids = [...new Set(slice.flatMap(c => c.characterIds))].slice(0, 180);
        if (!ids.length) {
          more.disabled = false;
          return;
        }
        try {
          const key = '/characters/summaries';
          const found = await deps.data.get(key + '?mft=' + encodeURIComponent(ids.join(',')), ticket, x => Array.isArray(x) ? x : [], {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ids
            })
          });
          if (ticket !== deps.core.state.epoch) return;
          const map = new Map(found.map(x => [x.id, x]));
          for (const [holder, c] of avatars) {
            const ch = c.characterIds.map(id => map.get(id)).find(x => x?.avatarUrl);
            if (ch) holder.replaceWith(deps.avatars.avatar(ch.avatarUrl, ch.name || c.name, 'round', ch.avatarCrop));
          }
          deps.avatars.observeImages();
        } catch (e) {
          if (e.name !== 'AbortError' && ticket === deps.core.state.epoch) deps.ui.notice('프로필 사진을 불러오지 못했어요. 대화는 열 수 있어요.');
        } finally {
          more.disabled = false;
        }
      }
      renderPage();
      deps.notifications.syncUnreadBadges(deps.notifications.unreadSnapshot(deps.notifications.notificationSnapshot()));
    } catch (e) {
      if (ticket === deps.core.state.epoch) deps.ui.error(e, () => chats(all));
    }
  }
  
  // Filters read the same saved engine folders. All mutations run through native controls.
  async function chatFolders(ticket, rows) {
    mftModuleState.roomRows = rows;
    const bar = deps.ui.state.el('div', 'folder-bar');
    bar.append(deps.ui.button('대화·폴더 관리', () => {
      deps.data.state.cache.clear();
      deps.navigation.openNative('chats');
    }, 'button'));
    deps.ui.state.main.insertBefore(bar, deps.ui.state.main.querySelector('.chat-list'));
    try {
      const data = await deps.data.jsonRequest('/chat-folders');
      if (ticket !== deps.core.state.epoch) return;
      mftModuleState.folderRows = Array.isArray(data) ? data : [];
      const select = deps.ui.state.el('select');
      select.setAttribute('aria-label', '대화 폴더');
      select.append(new Option('모든 폴더', ''), new Option('미분류', 'unfiled'));
      for (const f of mftModuleState.folderRows.filter(f => f.mode === mftModuleState.chatMode)) select.append(new Option(f.name, f.id));
      select.value = mftModuleState.folderFilter;
      select.onchange = () => {
        mftModuleState.folderFilter = select.value;
        chats(mftModuleState.chatsAll);
      };
      bar.prepend(select);
    } catch {/* Native management remains available when a filter request fails. */}
  }

  const initialize = [
    { order: 1307, run() {
      mftModuleState.chatMode = 'conversation';
    } },
    { order: 1308, run() {
      mftModuleState.chatsAll = false;
    } },
    { order: 10400, run() {
      mftModuleState.chatRegistry = new Map();
    } },
    { order: 10600, run() {
      mftModuleState.chatVisits = new Map();
    } },
    { order: 10700, run() {
      try {
        const saved = JSON.parse(localStorage.getItem('mft-chat-visits') || '[]');
        if (Array.isArray(saved)) mftModuleState.chatVisits = new Map(saved.filter(x => Array.isArray(x) && typeof x[0] === 'string' && Number.isFinite(x[1])).slice(0, 100));
      } catch {}
    } },
    { order: 17303, run() {
      mftModuleState.folderFilter = '';
    } },
    { order: 17304, run() {
      mftModuleState.folderRows = [];
    } },
    { order: 17305, run() {
      mftModuleState.roomRows = [];
    } }
  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, rememberChatVisit, normalizedChat, ingestChats, orderedChats, hydrateSavedUnread, chats, chatFolders };
}
