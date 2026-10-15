// v0.31.3 catalog behavior fixture, for controlled latency comparison only.
function createCatalog(deps) {
  const mftModuleState = {
    searchTimer: undefined,
    pageOffset: undefined,
    query: undefined,
    filter: undefined,
    detailCard: undefined,
    personaOffset: undefined,
    personaSearch: undefined
  };

  function card(c) {
    const b = deps.ui.button('', () => detail(c), 'card');
    b.dataset.characterId = c.id;
    b.append(deps.avatars.avatar(c.avatarPath, c.name, 'art', c.avatarCrop), deps.ui.state.el('strong', 'card-name', c.name));
    if (c.title) b.append(deps.ui.state.el('p', 'card-title', c.title));
    if (c.tags.length) b.append(deps.ui.state.el('p', 'tags', c.tags.slice(0, 3).map(t => '#' + t).join(' ')));
    if (c.creator) b.append(deps.ui.state.el('small', 'muted', '@' + c.creator));
    return b;
  }
  
  function section(title, items) {
    const s = deps.ui.state.el('section', 'shelf');
    if (title) s.append(deps.ui.state.el('h2', '', title));
    const row = deps.ui.state.el('div', 'rail');
    items.forEach(c => row.append(card(c)));
    s.append(row);
    return s;
  }
  
  function dailySection(c) {
    const sectionNode = section('오늘 당신을 만나러 온 캐릭터입니다.', [c]);
    sectionNode.classList.add('daily-pick');
    const cardNode = sectionNode.querySelector('.card'),
      frame = deps.ui.state.el('div', 'daily-portrait'),
      art = cardNode.querySelector('.art');
    art.before(frame);
    frame.append(art);
    const effects = deps.ui.state.el('span', 'daily-effects');
    effects.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 8; i++) {
      const mote = deps.ui.state.el('span', i % 3 === 0 ? 'daily-heart' : 'daily-star');
      mote.style.setProperty('--i', i);
      effects.append(mote);
    }
    frame.append(effects);
    return sectionNode;
  }
  
  function officialBannerLogo() {
    const n = deps.ui.state.el('img', 'spark banner-logo');
    n.src = '/logo.png';
    n.alt = '';
    n.decoding = 'async';
    return n;
  }
  
  function homeChrome() {
    deps.ui.state.main.dataset.catalogView = deps.design.state.homeView;
    deps.ui.state.main.replaceChildren();
    const search = deps.ui.state.el('input', 'search');
    search.type = 'search';
    search.placeholder = '캐릭터 이름이나 태그 검색';
    search.setAttribute('aria-label', '캐릭터 검색');
    search.value = mftModuleState.query;
    search.oninput = () => {
      clearTimeout(mftModuleState.searchTimer);
      deps.core.state.timers.delete(mftModuleState.searchTimer);
      mftModuleState.searchTimer = deps.core.later(() => {
        mftModuleState.query = search.value.trim();
        mftModuleState.pageOffset = 0;
        loadHome();
      }, 280);
    };
    const banner = deps.ui.state.el('section', 'banner');
    banner.append(deps.ui.state.el('small', '', '나만의 이야기, 여기서부터'), deps.ui.state.el('h1', '', '오늘은 누구와\n이야기할까요?'), officialBannerLogo());
    const chips = deps.ui.state.el('div', 'chips');
    for (const [k, label] of [['', '둘러보기'], ['favorites', '즐겨찾기'], ['daily', '오늘의 캐릭터']]) {
      const b = deps.ui.button(label, () => {
        mftModuleState.filter = k;
        mftModuleState.pageOffset = 0;
        loadHome();
      }, 'chip');
      b.dataset.active = String(mftModuleState.filter === k);
      chips.append(b);
    }
    deps.extensions.homeAgents(deps.ui.state.headerAgents);
    deps.ui.state.main.append(search);
    if (deps.design.state.showHomeBanner) deps.ui.state.main.append(banner);
    deps.ui.state.main.append(chips);
    return search;
  }
  
  async function loadHome() {
    deps.core.stop();
    deps.ui.own();
    const ticket = deps.core.state.epoch;
    const focused = deps.ui.state.shadow.activeElement?.classList.contains('search');
    const input = homeChrome();
    if (focused) {
      input.focus();
      input.setSelectionRange?.(input.value.length, input.value.length);
    }
    const loading = deps.ui.state.el('p', 'muted', '캐릭터를 불러오는 중…');
    deps.ui.state.main.append(loading);
    try {
      if (mftModuleState.filter === 'daily') {
        const c = await deps.daily.characterOfDay(ticket);
        if (ticket !== deps.core.state.epoch) return;
        loading.remove();
        deps.ui.state.main.append(c ? dailySection(c) : deps.ui.state.el('p', 'muted', '라이브러리에 캐릭터가 없어요.'));
        deps.avatars.observeImages();
        return;
      }
      const [p, homeGroups] = await Promise.all([deps.data.get('/characters/catalog?' + new URLSearchParams({
        limit: '12',
        offset: String(mftModuleState.pageOffset),
        sort: 'newest',
        search: mftModuleState.query,
        ...(mftModuleState.filter ? {
          favoriteFilter: mftModuleState.filter
        } : {})
      }), ticket, x => ({
        items: (x.items || []).map(deps.data.compact),
        hasMore: !!x.hasMore
      })), !mftModuleState.query && !mftModuleState.filter ? deps.data.get('/characters/groups/list', ticket, x => Array.isArray(x) ? x : []).catch(e => {
        if (e.name === 'AbortError') throw e;
        return [];
      }) : Promise.resolve([])]);
      if (ticket !== deps.core.state.epoch) return;
      loading.remove();
      if (!p.items.length) deps.ui.state.main.append(deps.ui.state.el('h2', '', '아직 캐릭터가 없어요'), deps.ui.state.el('p', 'muted', '검색어를 바꾸거나 제작에서 캐릭터를 추가해 주세요.'));else if (mftModuleState.query || mftModuleState.filter) deps.ui.state.main.append(section(mftModuleState.query ? '검색 결과' : '즐겨찾는 캐릭터', p.items));else {
        const groups = homeGroups;
        if (ticket !== deps.core.state.epoch) return;
        const grouped = new Set();
        for (const group of groups) {
          let ids = group.characterIds;
          try {
            if (typeof ids === 'string') ids = JSON.parse(ids);
          } catch {
            ids = [];
          }
          const members = p.items.filter(c => Array.isArray(ids) && ids.map(String).includes(c.id));
          if (!members.length) continue;
          members.forEach(c => grouped.add(c.id));
          const block = section(group.name || '이름 없는 폴더', members);
          block.classList.add('home-folder');
          deps.ui.state.main.append(block);
        }
        const unfiled = p.items.filter(c => !grouped.has(c.id));
        if (unfiled.length) {
          const block = section('캐릭터', unfiled);
          block.classList.add('unfiled');
          const first = deps.ui.state.main.querySelector('.home-folder');
          if (first) first.before(block);else deps.ui.state.main.append(block);
        }
      }
      const pager = deps.ui.state.el('div', 'pager');
      if (mftModuleState.pageOffset) pager.append(deps.ui.button('이전 캐릭터', () => {
        mftModuleState.pageOffset = Math.max(0, mftModuleState.pageOffset - 12);
        loadHome();
      }));
      if (p.hasMore) pager.append(deps.ui.button('다음 캐릭터', () => {
        mftModuleState.pageOffset += 12;
        loadHome();
      }));
      deps.ui.state.main.append(pager);
      deps.avatars.observeImages();
    } catch (e) {
      if (ticket === deps.core.state.epoch) deps.ui.error(e, loadHome);
    }
  }
  
  async function detail(c, fromHistory = false) {
    mftModuleState.detailCard = c;
    deps.navigation.state.view = 'detail';
    if (!fromHistory) deps.history.remember({
      kind: 'detail',
      card: c
    });
    deps.core.stop();
    deps.ui.own();
    const ticket = deps.core.state.epoch;
    deps.ui.state.main.replaceChildren(deps.ui.button(c.isPersona ? '‹ 페르소나' : '‹ 홈으로', () => c.isPersona ? personaGallery() : deps.navigation.go('home'), 'quiet'), deps.avatars.avatar(c.avatarPath, c.name, 'hero', c.avatarCrop));
    const heading = deps.ui.state.el('section', 'profile-heading');
    heading.append(deps.ui.state.el('h1', '', c.name));
    if (c.title) heading.append(deps.ui.state.el('p', 'card-title', c.title));
    if (c.tags.length) heading.append(deps.ui.state.el('p', 'tags', c.tags.map(t => '#' + t).join(' ')));
    if (c.creator) heading.append(deps.ui.state.el('p', 'muted', '@' + c.creator));
    deps.ui.state.main.append(heading);
    const actions = deps.ui.state.el('div', 'detail-actions');
    actions.append(...(c.isPersona ? [] : [deps.ui.button('대화 시작', () => deps.navigation.bridge('character', c, true), 'primary')]), deps.ui.button('편집', () => deps.navigation.bridge(c.isPersona ? 'persona' : 'character', c), 'quiet'));
    const description = deps.ui.state.el('div', 'description', '소개를 불러오는 중…');
    deps.ui.state.main.append(actions, deps.ui.state.el('h2', '', '소개'), description);
    deps.avatars.observeImages();
    try {
      const d = await deps.data.get('/characters/' + (c.isPersona ? 'personas/' : '') + encodeURIComponent(c.id), ticket, x => {
        let d = x.data ?? x;
        try {
          if (typeof d === 'string') d = JSON.parse(d);
        } catch {
          d = {};
        }
        d = d?.data || d || x;
        const notes = d.creator_notes ?? d.creatorNotes ?? x.creatorNotes ?? x.creator_notes;
        return typeof notes === 'string' && notes.trim() ? notes.slice(0, 50000) : '등록된 소개가 없어요.';
      });
      if (ticket === deps.core.state.epoch) deps.markdown.renderMarkdown(description, d);
    } catch (e) {
      if (e.name !== 'AbortError') description.textContent = '소개를 불러오지 못했어요. 잠시 후 다시 열어 주세요.';
    }
  }
  
  async function personaGallery() {
    deps.core.stop();
    deps.ui.own();
    deps.navigation.state.view = 'personas';
    deps.ui.state.main.dataset.catalogView = deps.design.state.personaView;
    const ticket = deps.core.state.epoch;
    deps.ui.state.main.replaceChildren(deps.ui.button('‹ 제작', () => deps.navigation.go('create'), 'quiet'), deps.ui.state.el('h1', '', '페르소나'));
    const search = deps.ui.state.el('input', 'search');
    search.placeholder = '페르소나 검색';
    search.value = mftModuleState.personaSearch;
    search.onchange = () => {
      mftModuleState.personaSearch = search.value.trim();
      mftModuleState.personaOffset = 0;
      personaGallery();
    };
    deps.ui.state.main.append(search, deps.ui.button('새 페르소나 · 관리', () => deps.navigation.openNative('personas'), 'quiet'));
    try {
      const [data, groups] = await Promise.all([deps.data.get('/characters/personas/list?' + new URLSearchParams({
        limit: '24',
        offset: String(mftModuleState.personaOffset),
        search: mftModuleState.personaSearch
      }), ticket), deps.data.get('/characters/persona-groups/list', ticket, x => Array.isArray(x) ? x : []).catch(e => {
        if (e.name === 'AbortError') throw e;
        return [];
      })]);
      if (ticket !== deps.core.state.epoch) return;
      const rows = Array.isArray(data) ? data : data.items || [],
        grouped = new Set();
      const show = (title, members) => {
        if (!members.length) return;
        const sectionNode = deps.ui.state.el('section', 'persona-folder');
        if (title) sectionNode.append(deps.ui.state.el('h2', '', title));
        const grid = deps.ui.state.el('div', 'gallery');
        for (const r of members) {
          const c = {
            ...deps.data.compact(r),
            isPersona: true
          };
          const b = deps.ui.button('', () => detail(c), 'gallery-card');
          b.dataset.personaId = c.id;
          b.append(deps.avatars.avatar(r.avatarPath || r.avatarUrl, c.name, 'art', r.avatarCrop || r.data?.extensions?.avatarCrop), deps.ui.state.el('strong', 'card-name', c.name));
          if (c.title) b.append(deps.ui.state.el('p', 'card-title', c.title));
          if (c.tags.length) b.append(deps.ui.state.el('p', 'tags', c.tags.map(t => '#' + t).join(' ')));
          grid.append(b);
        }
        sectionNode.append(grid);
        deps.ui.state.main.append(sectionNode);
        return sectionNode;
      };
      for (const group of groups) {
        let ids = group.personaIds;
        try {
          if (typeof ids === 'string') ids = JSON.parse(ids);
        } catch {
          ids = [];
        }
        const members = rows.filter(r => Array.isArray(ids) && ids.includes(r.id));
        members.forEach(r => grouped.add(r.id));
        show(group.name || '이름 없는 폴더', members);
      }
      const unfiled = show('페르소나', rows.filter(r => !grouped.has(r.id)));
      const first = deps.ui.state.main.querySelector('.persona-folder');
      if (unfiled && first !== unfiled) first.before(unfiled);
      const pager = deps.ui.state.el('div', 'pager');
      if (mftModuleState.personaOffset) pager.append(deps.ui.button('이전', () => {
        mftModuleState.personaOffset = Math.max(0, mftModuleState.personaOffset - 24);
        personaGallery();
      }));
      if (data.hasMore) pager.append(deps.ui.button('다음', () => {
        mftModuleState.personaOffset += 24;
        personaGallery();
      }));
      deps.ui.state.main.append(pager);
      deps.avatars.observeImages();
    } catch (e) {
      if (ticket === deps.core.state.epoch) deps.ui.error(e, personaGallery);
    }
  }
  // Filters read the same saved engine folders. All mutations run through native controls.

  const initialize = [
    { order: 1303, run() {
      mftModuleState.searchTimer = null;
    } },
    { order: 1309, run() {
      mftModuleState.pageOffset = 0;
    } },
    { order: 1310, run() {
      mftModuleState.query = '';
    } },
    { order: 1311, run() {
      mftModuleState.filter = '';
    } },
    { order: 17300, run() {
      mftModuleState.detailCard = null;
    } },
    { order: 17301, run() {
      mftModuleState.personaOffset = 0;
    } },
    { order: 17302, run() {
      mftModuleState.personaSearch = '';
    } }
  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, card, section, dailySection, officialBannerLogo, homeChrome, loadHome, detail, personaGallery };
}

// Source: src/features/chats.js
/** chats: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */