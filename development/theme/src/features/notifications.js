/** notifications: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createNotifications(deps) {
  const mftModuleState = {
    unreadHydration: undefined,
    notificationObserver: undefined,
    notificationRail: undefined,
    notificationGetter: undefined,
    notificationSignature: undefined,
    alertTray: undefined,
    unreadGetter: undefined,
    retainedUnread: undefined,
    readUnreadVersions: undefined,
    readLiveCounts: undefined,
    unreadStorageSignature: undefined,
    dismissedToasts: undefined,
    toastClocks: undefined,
    notificationsQueued: undefined,
    resumeUnreadRoom: null,
    resumeUnreadSince: 0,
    readNotificationRefs: new Map()
  };

  function visibleRoom() {
    if (document.hidden || document.documentElement.classList.contains('mft-own') || deps.ui.state.root.dataset.native !== 'true' || deps.navigation.state.routeIntent !== 'chat' || deps.navigation.state.bridgeBusy) return null;
    const id = deps.navigation.state.roomId;
    if (!id) return null;
    const active = deps.adapter.activeSession?.();
    if (active?.known && active.id !== id) return null;
    if (deps.adapter.chatSurface) {
      const surface = deps.adapter.chatSurface(id)?.surface;
      if (!surface || surface.closest('[hidden],[aria-hidden="true"]') || deps.ui.state.visible && !deps.ui.state.visible(surface)) return null;
    }
    return id;
  }

  function notificationSnapshot() {
    const center = document.querySelector('[data-component="CenterContent"]') || document.querySelector('[data-component="TopBar"]')?.parentElement;
    const rail = center?.querySelector('[class~="pointer-events-none"][class~="absolute"][class~="right-3"]');
    if (rail !== mftModuleState.notificationRail) {
      mftModuleState.notificationObserver?.disconnect();
      mftModuleState.notificationRail = rail;
      if (rail) {
        mftModuleState.notificationObserver = new MutationObserver(scheduleNotifications);
        mftModuleState.notificationObserver.observe(rail, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['title', 'aria-label']
        });
      }
    }
    let notes = null;
    const accept = (value, getter) => {
      const map = value?.chatNotifications instanceof Map ? value.chatNotifications : value;
      if (map instanceof Map && (value?.chatNotifications instanceof Map || [...map.values()].some(x => x?.chatId && x?.characterName))) {
        notes = map;
        if (getter) mftModuleState.notificationGetter = () => {
          const next = getter();
          return next?.chatNotifications instanceof Map ? next.chatNotifications : next;
        };
        return true;
      }
      return false;
    };
    if (mftModuleState.notificationGetter) {
      try {
        const live = mftModuleState.notificationGetter();
        if (live instanceof Map) notes = live;
      } catch {
        mftModuleState.notificationGetter = null;
      }
    }
    if (!notes && rail) deps.adapter.eachHook(rail, accept);
    if (!notes) for (const anchor of document.querySelectorAll('[data-component="ChatSidebar"],[data-component="TopBar"],[data-component="AppShell"]')) {
      if (deps.adapter.eachHook(anchor, accept)) break;
    }
    if (!notes && rail) {
      notes = new Map();
      deps.adapter.eachHook(rail, value => {
        if (value?.notif?.chatId) notes.set(value.notif.chatId, value.notif);
        return false;
      }, true);
    }
    return notes || new Map();
  }
  
  function nativeNotificationAction(id, key) {
    if (!mftModuleState.notificationRail) return false;
    let action = null;
    deps.adapter.eachHook(mftModuleState.notificationRail, p => {
      if (p?.notif?.chatId === id && typeof p[key] === 'function') {
        action = p[key];
        return true;
      }
      return false;
    }, true);
    if (!action) return false;
    action();
    return true;
  }
  
  function notificationCopy(n) {
    const copy = deps.ui.state.el('div', 'notification-copy');
    copy.append(deps.ui.state.el('strong', '', n.characterName), deps.ui.state.el('p', '', n.kind === 'call' ? '전화가 왔어요.' : '메세지가 도착했습니다.'));
    return copy;
  }
  
  function saveUnreadLedger() {
    const value = JSON.stringify({
      counts: [...mftModuleState.retainedUnread].slice(-500),
      read: [...mftModuleState.readUnreadVersions].slice(-500)
    });
    if (value === mftModuleState.unreadStorageSignature) return;
    mftModuleState.unreadStorageSignature = value;
    try {
      localStorage.setItem('mft-unread-ledger', value);
    } catch {}
  }
  
  function chatUnreadMetadata(c) {
    let metadata = c.metadata;
    try {
      if (typeof metadata === 'string') metadata = JSON.parse(metadata);
    } catch {
      metadata = null;
    }
    return {
      unreadCount: Math.max(0, Number(metadata?.autonomousUnreadCount) || 0),
      unreadVersion: String(metadata?.autonomousUnreadAt || '')
    };
  }
  
  function captureUnreadMetadata(rows) {
    const active = visibleRoom();
    for (const c of rows) {
      if (!c?.id || c.id === active && c.id !== mftModuleState.resumeUnreadRoom || !persistedUnread(c)) continue;
      mftModuleState.retainedUnread.set(c.id, Math.max(mftModuleState.retainedUnread.get(c.id) || 0, c.unreadCount));
      // A new server version can restart its count at one after a previous acknowledgement.
      mftModuleState.readLiveCounts.delete(c.id);
    }
    saveUnreadLedger();
  }

  function suspendUnread() {
    if (deps.ui.state.root.dataset.native === 'true' && deps.navigation.state.routeIntent === 'chat' && deps.navigation.state.roomId) {
      if (mftModuleState.resumeUnreadRoom !== deps.navigation.state.roomId) mftModuleState.resumeUnreadSince = Date.now();
      mftModuleState.resumeUnreadRoom = deps.navigation.state.roomId;
    }
    captureUnreadMetadata([...deps.chats.state.chatRegistry.values()]);
  }

  function acknowledgeVisibleUnread(event) {
    if (document.hidden || deps.core.state.disposed || !mftModuleState.resumeUnreadRoom || deps.ui.state.root.dataset.native !== 'true' || deps.navigation.state.routeIntent !== 'chat') return;
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target?.closest('[data-chat-scroll],[data-chat-composer]') || target.closest('[role="dialog"],[data-chat-floating-panel]')) return;
    const id = deps.navigation.state.roomId;
    if (id !== mftModuleState.resumeUnreadRoom) return;
    deps.chats.rememberChatVisit(id);
    acknowledgeUnread(id);
  }

  function acknowledgeUnread(id) {
    if (!id) return;
    const note = notificationSnapshot().get(id);
    if (note) mftModuleState.readNotificationRefs.set(id, note);else mftModuleState.readNotificationRefs.delete(id);
    while (mftModuleState.readNotificationRefs.size > 500) mftModuleState.readNotificationRefs.delete(mftModuleState.readNotificationRefs.keys().next().value);
    if (id === mftModuleState.resumeUnreadRoom) { mftModuleState.resumeUnreadRoom = null; mftModuleState.resumeUnreadSince = 0; }
    mftModuleState.readLiveCounts.set(id, mftModuleState.retainedUnread.get(id) || 0);
    mftModuleState.retainedUnread.delete(id);
    const c = deps.chats.state.roomRows.find(c => c.id === id) || deps.chats.state.chatRegistry.get(id);
    if (c) mftModuleState.readUnreadVersions.set(id, c.unreadVersion + ':' + c.unreadCount);
    saveUnreadLedger();
    syncUnreadBadges(unreadSnapshot(new Map()));
  }
  
  function persistedUnread(c) {
    const lastVisit = deps.chats.state.chatVisits.get(c.id) || 0,
      arrival = Date.parse(c.unreadVersion) || 0;
    return c.unreadCount > 0 && (!arrival || arrival > lastVisit) && mftModuleState.readUnreadVersions.get(c.id) !== c.unreadVersion + ':' + c.unreadCount;
  }
  
  function unreadSnapshot(notes) {
    let live;
    const accept = (value, getter, raw = false) => {
      const counts = value?.unreadCounts instanceof Map ? value.unreadCounts : raw && value instanceof Map && value.size && [...value.values()].every(n => typeof n === 'number') ? value : null;
      if (!(counts instanceof Map)) return false;
      live = counts;
      if (getter) mftModuleState.unreadGetter = () => {
        const next = getter();
        return next?.unreadCounts instanceof Map ? next.unreadCounts : next;
      };
      return true;
    };
    if (mftModuleState.unreadGetter) try {
      const counts = mftModuleState.unreadGetter();
      if (counts instanceof Map) live = counts;else mftModuleState.unreadGetter = null;
    } catch {
      mftModuleState.unreadGetter = null;
    }
    if (!live) for (const anchor of document.querySelectorAll('[data-component="ChatSidebar"],[data-component="TopBar"],[data-component="AppShell"]')) {
      if (deps.adapter.eachHook(anchor, (value, getter) => accept(value, getter, anchor.dataset.component === 'ChatSidebar'))) break;
    }
    const visible = visibleRoom();
    const active = visible !== mftModuleState.resumeUnreadRoom ? visible : null;
    if (live) for (const id of mftModuleState.readLiveCounts.keys()) if (!live.has(id) && !notes.has(id)) mftModuleState.readLiveCounts.delete(id);
    if (live) for (const [id, value] of live) {
      const count = Math.max(0, Number(value) || 0);
      if (count === 0) {
        mftModuleState.readLiveCounts.delete(id);
        continue;
      }
      if (id === active || count <= (mftModuleState.readLiveCounts.get(id) || 0)) continue;
      mftModuleState.retainedUnread.set(id, Math.max(mftModuleState.retainedUnread.get(id) || 0, count));
    }
    for (const [id, n] of notes) if (id !== active) {
      const count = Number(n.count) || 1;
      if (mftModuleState.readNotificationRefs.get(id) === n) continue;
      mftModuleState.readNotificationRefs.delete(id);
      mftModuleState.readLiveCounts.delete(id);
      mftModuleState.retainedUnread.set(id, Math.max(mftModuleState.retainedUnread.get(id) || 0, count));
      mftModuleState.readUnreadVersions.delete(id);
    }
    for (const c of deps.chats.state.chatRegistry.values()) if (c.id !== active && persistedUnread(c)) mftModuleState.retainedUnread.set(c.id, Math.max(mftModuleState.retainedUnread.get(c.id) || 0, c.unreadCount));
    if (active) mftModuleState.retainedUnread.delete(active);
    saveUnreadLedger();
    return new Map(mftModuleState.retainedUnread);
  }
  
  function syncUnreadBadges(counts) {
    if (deps.navigation.state.view === 'chats' && deps.ui.state.root.dataset.native !== 'true') for (const tab of deps.ui.state.main.querySelectorAll('.mode-tab')) {
      let total = 0;
      for (const [id, count] of counts) if ((deps.chats.state.chatRegistry.get(id) || deps.chats.state.roomRows.find(c => c.id === id))?.mode === tab.dataset.mode) total += count;
      let badge = tab.querySelector('.mode-unread');
      if (total) {
        if (!badge) {
          badge = deps.ui.state.el('span', 'mode-unread');
          badge.setAttribute('aria-hidden', 'true');
          tab.append(badge);
        }
        const text = total > 99 ? '99+' : String(total);
        if (badge.textContent !== text) badge.textContent = text;
      } else badge?.remove();
    }
    const count = [...counts.values()].reduce((sum, n) => sum + n, 0);
    let badge = deps.ui.state.tabs.get('chats').querySelector('.unread');
    if (count) {
      if (!badge) {
        badge = deps.ui.state.el('span', 'unread');
        deps.ui.state.tabs.get('chats').append(badge);
      }
      const text = count > 99 ? '99+' : String(count);
      if (badge.textContent !== text) badge.textContent = text;
    } else badge?.remove();
    if (deps.navigation.state.view === 'chats' && deps.ui.state.root.dataset.native !== 'true') for (const row of deps.ui.state.main.querySelectorAll('.chat-row')) {
      const count = counts.get(row.dataset.roomId) || 0;
      row.classList.toggle('has-unread', count > 0);
      let badge = row.querySelector('.chat-unread');
      if (count) {
        if (!badge) {
          badge = deps.ui.state.el('span', 'chat-unread');
          row.append(badge);
        }
        if (badge.textContent !== String(count)) badge.textContent = String(count);
      } else badge?.remove();
    }
  }
  
  function toastLifetime(id, n, row) {
    const key = toastKey(n);
    let clock = mftModuleState.toastClocks.get(id);
    if (clock?.key !== key) {
      if (clock) clearTimeout(clock.timer);
      clock = {
        key,
        expires: Date.now() + 5200,
        timer: null
      };
      mftModuleState.toastClocks.set(id, clock);
    }
    if (n.kind === 'call') return;
    if (clock.expires <= Date.now()) {
      row.remove();
      return;
    }
    clearTimeout(clock.timer);
    clock.timer = setTimeout(() => {
      if (deps.core.state.disposed) return;
      clock.timer = null;
      for (const item of mftModuleState.alertTray.querySelectorAll('.alert-row')) if (item.dataset.toastId === id) item.remove();
    }, clock.expires - Date.now());
  }
  
  function toastKey(n) {
    return JSON.stringify([n.count, n.kind, n.callId, n.characterName]);
  }
  
  function dismissToast(id, n, row) {
    mftModuleState.dismissedToasts.set(id, toastKey(n));
    row.remove();
    nativeNotificationAction(id, 'onDismiss');
  }
  
  function bindToastSwipe(row, id, n) {
    let gesture = null,
      blockClickUntil = 0;
    const reset = () => {
      row.style.removeProperty('transform');
      row.style.removeProperty('opacity');
    };
    row.addEventListener('click', e => {
      if (performance.now() < blockClickUntil) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);
    row.addEventListener('pointerdown', e => {
      if (e.isPrimary === false || e.button !== 0) return;
      gesture = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        width: row.getBoundingClientRect().width,
        dragging: false
      };
    });
    row.addEventListener('pointermove', e => {
      if (!gesture || e.pointerId !== gesture.id) return;
      const dx = e.clientX - gesture.x,
        dy = e.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
          gesture = null;
          return;
        }
        if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        gesture.dragging = true;
        try {
          row.setPointerCapture?.(e.pointerId);
        } catch {/* A cancelled pointer needs no capture. */}
      }
      row.style.transform = `translateX(${dx}px)`;
      row.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / gesture.width));
    });
    row.addEventListener('pointerup', e => {
      if (!gesture || e.pointerId !== gesture.id) return;
      const g = gesture;
      gesture = null;
      if (g.dragging) {
        blockClickUntil = performance.now() + 600;
        const dx = e.clientX - g.x;
        if (Math.abs(dx) >= Math.min(80, g.width * .25)) {
          dismissToast(id, n, row);
          return;
        }
      }
      reset();
    });
    const cancel = () => {
      gesture = null;
      reset();
    };
    row.addEventListener('pointercancel', cancel);
    row.addEventListener('lostpointercapture', cancel);
  }
  
  function scheduleNotifications() {
    if (deps.core.state.disposed || document.hidden || mftModuleState.notificationsQueued) return;
    mftModuleState.notificationsQueued = true;
    queueMicrotask(() => {
      mftModuleState.notificationsQueued = false;
      syncNotifications();
    });
  }
  
  function refreshUnreadSources() {
    // React may remount its stores while the browser is suspended.
    mftModuleState.notificationGetter = null;
    mftModuleState.unreadGetter = null;
    syncNotifications();
  }

  function syncNotifications() {
    if (deps.core.state.disposed || document.hidden) return;
    deps.updates.bindQueryUpdates();
    const notes = notificationSnapshot();
    for (const id of mftModuleState.dismissedToasts.keys()) if (!notes.has(id)) mftModuleState.dismissedToasts.delete(id);
    for (const [id, clock] of mftModuleState.toastClocks) if (!notes.has(id)) {
      clearTimeout(clock.timer);
      mftModuleState.toastClocks.delete(id);
    }
    const unread = unreadSnapshot(notes);
    syncUnreadBadges(unread);
    const signature = JSON.stringify([...notes].map(([id, n]) => [id, n.characterName, n.avatarUrl, n.avatarCrop, n.count, n.kind, n.callId]));
    deps.ui.state.html.toggleAttribute('data-mft-alerts', notes.size > 0);
    if (signature === mftModuleState.notificationSignature) return;
    mftModuleState.notificationSignature = signature;
    deps.updates.queueChatRefresh();
    mftModuleState.alertTray.replaceChildren();
    for (const [id, n] of notes) {
      if (mftModuleState.dismissedToasts.get(id) === toastKey(n)) continue;
      const row = deps.ui.state.el('div', 'alert-row');
      bindToastSwipe(row, n.chatId || id, n);
      const b = deps.ui.button('', () => {
        deps.updates.invalidateChats();
        deps.navigation.bridge('chat', {
          id: n.chatId || id,
          mode: deps.chats.state.chatRegistry.get(n.chatId || id)?.mode || 'conversation',
          characterIds: deps.chats.state.chatRegistry.get(n.chatId || id)?.characterIds || [],
          fromNotification: true
        });
      }, 'alert');
      b.append(deps.avatars.avatar(n.avatarUrl || '', n.characterName, 'round', n.avatarCrop), notificationCopy(n));
      const im = b.querySelector('img[data-src]');
      if (im) {
        im.src = im.dataset.src;
        im.removeAttribute('data-src');
      }
      row.append(b, deps.ui.button('×', () => dismissToast(n.chatId || id, n, row), 'alert-dismiss'));
      if (n.kind === 'call' && n.callId) {
        row.append(deps.ui.button('받기', () => nativeNotificationAction(n.chatId || id, 'onAcceptCall'), 'button'), deps.ui.button('거절', () => nativeNotificationAction(n.chatId || id, 'onDeclineCall'), 'quiet'));
      }
      row.dataset.toastId = id;
      mftModuleState.alertTray.append(row);
      toastLifetime(id, n, row);
    }
  }
  // Listen to the engine's existing query cache. Refresh only a visible extension list,
  // and keep selection/scroll while requests are batched. Never navigate from data events.

  const initialize = [
    { order: 20901, run() {
      document.addEventListener('pointerdown', acknowledgeVisibleUnread, true);
      document.addEventListener('keydown', acknowledgeVisibleUnread, true);
      document.addEventListener('wheel', acknowledgeVisibleUnread, { capture: true, passive: true });
    } },
    { order: 10500, run() {
      mftModuleState.unreadHydration = null;
    } },
    { order: 18600, run() {
      mftModuleState.notificationObserver = null;
    } },
    { order: 18601, run() {
      mftModuleState.notificationRail = null;
    } },
    { order: 18602, run() {
      mftModuleState.notificationGetter = null;
    } },
    { order: 18603, run() {
      mftModuleState.notificationSignature = '';
    } },
    { order: 18700, run() {
      mftModuleState.alertTray = deps.ui.state.el('aside', 'alerts');
    } },
    { order: 18800, run() {
      mftModuleState.alertTray.setAttribute('aria-live', 'polite');
    } },
    { order: 18900, run() {
      deps.ui.state.body.append(mftModuleState.alertTray);
    } },
    { order: 19400, run() {
      mftModuleState.unreadGetter = null;
    } },
    { order: 19500, run() {
      mftModuleState.retainedUnread = new Map();
    } },
    { order: 19501, run() {
      mftModuleState.readUnreadVersions = new Map();
    } },
    { order: 19502, run() {
      mftModuleState.readLiveCounts = new Map();
    } },
    { order: 19600, run() {
      mftModuleState.unreadStorageSignature = '';
    } },
    { order: 19700, run() {
      try {
        const saved = JSON.parse(localStorage.getItem('mft-unread-ledger') || '{}');
        for (const [id, count] of saved.counts || []) if (typeof id === 'string' && Number(count) > 0) mftModuleState.retainedUnread.set(id, Math.min(9999, Number(count)));
        for (const [id, version] of saved.read || []) if (typeof id === 'string') mftModuleState.readUnreadVersions.set(id, String(version));
      } catch {}
    } },
    { order: 20400, run() {
      mftModuleState.dismissedToasts = new Map();
    } },
    { order: 20401, run() {
      mftModuleState.toastClocks = new Map();
    } },
    { order: 20900, run() {
      mftModuleState.notificationsQueued = false;
    } }
  ];
  const cleanup = [
    { order: 75, run() {
      document.removeEventListener('pointerdown', acknowledgeVisibleUnread, true);
      document.removeEventListener('keydown', acknowledgeVisibleUnread, true);
      document.removeEventListener('wheel', acknowledgeVisibleUnread, true);
    } },
    { order: 26, run() {
      for (const clock of mftModuleState.toastClocks.values()) clearTimeout(clock.timer);
    } },
    { order: 27, run() {
      mftModuleState.toastClocks.clear();
    } },
    { order: 28, run() {
      mftModuleState.unreadHydration?.abort();
    } },
    { order: 37, run() {
      mftModuleState.notificationObserver?.disconnect();
      mftModuleState.readNotificationRefs.clear();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, captureUnreadMetadata, suspendUnread, acknowledgeVisibleUnread, notificationSnapshot, nativeNotificationAction, notificationCopy, saveUnreadLedger, chatUnreadMetadata, acknowledgeUnread, persistedUnread, unreadSnapshot, syncUnreadBadges, toastLifetime, toastKey, dismissToast, bindToastSwipe, scheduleNotifications, syncNotifications, refreshUnreadSources };
}
