/** tags: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createTags(deps) {
  const mftModuleState = {
    tagInputLists: undefined,
    tagOptionCache: undefined,
    tagOptionsPending: undefined,
    tagFetchControllers: undefined,
    activeTagMenu: undefined,
    tagMenuSequence: undefined
  };

  async function collectExistingTags(kind) {
    const old = mftModuleState.tagOptionCache.get(kind);
    if (old && Date.now() - old.time < 60000) return old.tags;
    const cached = deps.updates.state.queryCache?.find?.({
      queryKey: kind === 'persona' ? ['personas'] : ['characters', 'list'],
      exact: true
    })?.state?.data;
    const tags = new Set();
    const collect = row => {
      let data = row.data;
      try {
        if (typeof data === 'string') data = JSON.parse(data);
      } catch {
        data = null;
      }
      let values = row.tags || data?.data?.tags || data?.tags || row.parsed?.tags || [];
      try {
        if (typeof values === 'string') values = JSON.parse(values);
      } catch {
        values = [];
      }
      if (!Array.isArray(values)) values = [];
      for (const tag of values) if (typeof tag === 'string' && tag.trim()) tags.add(tag.trim());
    };
    if (Array.isArray(cached)) {
      cached.forEach(collect);
      const sorted = [...tags].sort((a, b) => a.localeCompare(b));
      mftModuleState.tagOptionCache.set(kind, {
        time: Date.now(),
        tags: sorted
      });
      return sorted;
    }
    const controller = new AbortController();
    mftModuleState.tagFetchControllers.set(kind, controller);
    const list = kind === 'persona' ? '/characters/personas/list' : '/characters/catalog';
    for (let offset = 0;; offset += 100) {
      const page = await deps.data.jsonRequest(list + '?' + new URLSearchParams({
        limit: '100',
        offset: String(offset)
      }), 'GET', undefined, controller.signal);
      if (deps.core.state.disposed) return [];
      const rows = Array.isArray(page) ? page : page.items || [];
      rows.forEach(collect);
      if (!page.hasMore || !rows.length) break;
    }
    const sorted = [...tags].sort((a, b) => a.localeCompare(b));
    mftModuleState.tagOptionCache.set(kind, {
      time: Date.now(),
      tags: sorted
    });
    return sorted;
  }
  
  function existingTags(kind) {
    if (mftModuleState.tagOptionsPending.has(kind)) return mftModuleState.tagOptionsPending.get(kind);
    const pending = collectExistingTags(kind).finally(() => {
      mftModuleState.tagOptionsPending.delete(kind);
      mftModuleState.tagFetchControllers.delete(kind);
    });
    mftModuleState.tagOptionsPending.set(kind, pending);
    return pending;
  }
  
  function closeTagMenu() {
    mftModuleState.tagMenuSequence++;
    if (!mftModuleState.activeTagMenu) return;
    mftModuleState.activeTagMenu.box.remove();
    mftModuleState.activeTagMenu.input.setAttribute('aria-expanded', 'false');
    mftModuleState.activeTagMenu = null;
  }
  
  function drawTagMenu(state) {
    if (state !== mftModuleState.activeTagMenu) return;
    const query = state.input.value.trim().toLowerCase();
    const shown = state.tags.filter(tag => tag.toLowerCase().includes(query));
    state.shown = shown;
    state.index = Math.min(state.index, shown.length - 1);
    state.box.replaceChildren();
    if (!shown.length) {
      state.box.append(deps.ui.state.el('p', 'mft-tag-empty', state.loading ? '태그를 불러오는 중…' : state.failed ? '태그를 불러오지 못했어요. 직접 입력해서 추가할 수 있습니다.' : '일치하는 기존 태그가 없습니다. 직접 입력해서 추가할 수 있습니다.'));
      return;
    }
    for (const [i, tag] of shown.entries()) {
      const option = deps.ui.button(tag, () => chooseTag(state, tag), 'mft-tag-option');
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(i === state.index));
      option.onpointerdown = e => e.preventDefault();
      state.box.append(option);
    }
  }
  
  function chooseTag(state, tag) {
    if (state !== mftModuleState.activeTagMenu) return;
    const input = state.input;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, tag);
    input.dispatchEvent(new Event('input', {
      bubbles: true
    }));
    closeTagMenu();
    input.focus({
      preventScroll: true
    });
  }
  
  async function onTagFocus(e) {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || !input.closest('.mari-editor-shell [data-editor-section="metadata"]') || !/(태그|add.*tag)/i.test(input.placeholder)) return;
    if (mftModuleState.activeTagMenu?.input === input) return;
    closeTagMenu();
    if (!mftModuleState.tagInputLists.has(input)) mftModuleState.tagInputLists.set(input, {
      list: input.getAttribute('list'),
      role: input.getAttribute('role'),
      autocomplete: input.getAttribute('autocomplete'),
      controls: input.getAttribute('aria-controls'),
      expanded: input.getAttribute('aria-expanded')
    });
    input.removeAttribute('list');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'true');
    const box = deps.ui.state.el('div', 'mft-tag-list');
    box.id = 'mft-tag-list';
    box.setAttribute('role', 'listbox');
    box.setAttribute('aria-label', '기존 태그');
    input.setAttribute('aria-controls', box.id);
    input.parentElement.after(box);
    const kind = input.closest('.mari-editor-shell')?.querySelector('.mari-avatar-placeholder--persona') ? 'persona' : 'character';
    const state = {
      input,
      box,
      tags: [],
      shown: [],
      index: -1,
      loading: true,
      failed: false
    };
    mftModuleState.activeTagMenu = state;
    const sequence = mftModuleState.tagMenuSequence;
    drawTagMenu(state);
    try {
      const tags = await existingTags(kind);
      if (deps.core.state.disposed || mftModuleState.activeTagMenu !== state || sequence !== mftModuleState.tagMenuSequence) return;
      state.tags = tags;
      state.loading = false;
      drawTagMenu(state);
    } catch {
      if (mftModuleState.activeTagMenu === state) {
        state.failed = true;
        state.loading = false;
        drawTagMenu(state);
      }
    }
  }
  
  function onTagInput(e) {
    if (mftModuleState.activeTagMenu?.input === e.target) {
      mftModuleState.activeTagMenu.index = -1;
      drawTagMenu(mftModuleState.activeTagMenu);
    }
  }
  
  function onTagKey(e) {
    const state = mftModuleState.activeTagMenu;
    if (!state || state.input !== e.target || e.isComposing) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeTagMenu();
      return;
    }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && state.shown.length) {
      e.preventDefault();
      e.stopPropagation();
      state.index = (state.index + (e.key === 'ArrowDown' ? 1 : -1) + state.shown.length) % state.shown.length;
      drawTagMenu(state);
      state.box.children[state.index]?.scrollIntoView({
        block: 'nearest'
      });
    } else if (e.key === 'Enter' && state.index >= 0) {
      e.preventDefault();
      e.stopPropagation();
      chooseTag(state, state.shown[state.index]);
    }
  }
  
  function onTagOutside(e) {
    const state = mftModuleState.activeTagMenu;
    if (state && e.target !== state.input && !state.box.contains(e.target)) closeTagMenu();
  }
  
  function onTagBlur(e) {
    const state = mftModuleState.activeTagMenu;
    if (state?.input === e.target) queueMicrotask(() => {
      if (mftModuleState.activeTagMenu === state && document.activeElement !== state.input && !state.box.contains(document.activeElement)) closeTagMenu();
    });
  }

  const initialize = [
    { order: 24402, run() {
      mftModuleState.tagInputLists = new Map();
    } },
    { order: 24403, run() {
      mftModuleState.tagOptionCache = new Map();
    } },
    { order: 24404, run() {
      mftModuleState.tagOptionsPending = new Map();
    } },
    { order: 24405, run() {
      mftModuleState.tagFetchControllers = new Map();
    } },
    { order: 26000, run() {
      mftModuleState.activeTagMenu = null;
    } },
    { order: 26001, run() {
      mftModuleState.tagMenuSequence = 0;
    } },
    { order: 26900, run() {
      document.addEventListener('focusin', onTagFocus, true);
    } },
    { order: 27000, run() {
      document.addEventListener('input', onTagInput, true);
    } },
    { order: 27100, run() {
      document.addEventListener('keydown', onTagKey, true);
    } },
    { order: 27200, run() {
      document.addEventListener('pointerdown', onTagOutside, true);
    } },
    { order: 27300, run() {
      document.addEventListener('focusout', onTagBlur, true);
    } }
  ];
  const cleanup = [
    { order: 5, run() {
      closeTagMenu();
    } },
    { order: 6, run() {
      document.removeEventListener('input', onTagInput, true);
    } },
    { order: 7, run() {
      document.removeEventListener('keydown', onTagKey, true);
    } },
    { order: 8, run() {
      document.removeEventListener('pointerdown', onTagOutside, true);
    } },
    { order: 9, run() {
      document.removeEventListener('focusout', onTagBlur, true);
    } },
    { order: 10, run() {
      for (const c of mftModuleState.tagFetchControllers.values()) c.abort();
    } },
    { order: 11, run() {
      mftModuleState.tagFetchControllers.clear();
    } },
    { order: 13, run() {
      document.removeEventListener('focusin', onTagFocus, true);
    } },
    { order: 16, run() {
      for (const [n, old] of mftModuleState.tagInputLists) if (n.isConnected) for (const [key, value] of Object.entries(old)) {
        const attr = key === 'controls' ? 'aria-controls' : key === 'expanded' ? 'aria-expanded' : key;
        if (value === null) n.removeAttribute(attr);else n.setAttribute(attr, value);
      }
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, collectExistingTags, existingTags, closeTagMenu, drawTagMenu, chooseTag, onTagFocus, onTagInput, onTagKey, onTagOutside, onTagBlur };
}
