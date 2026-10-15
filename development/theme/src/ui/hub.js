/** hub: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createHub(deps) {
  const mftModuleState = {

  };

  function menu(key, title, description) {
    const b = deps.ui.button('', () => key === 'personas' ? deps.catalog.personaGallery() : deps.navigation.openNative(key), 'menu-row');
    const copy = deps.ui.state.el('div');
    copy.append(deps.ui.state.el('strong', '', title), deps.ui.state.el('p', 'muted', description));
    b.append(copy, deps.ui.state.el('span', '', '›'));
    return b;
  }
  
  function hub(k) {
    const heading = deps.ui.state.el('div', 'page-heading');
    heading.append(deps.ui.state.el('h1', '', k === 'create' ? '제작' : '마이페이지'));
    if (k === 'my') {
      const help = deps.ui.button('도움말', () => deps.navigation.go('help'), 'quiet help-open');
      help.setAttribute('aria-label', '도움말 열기');
      heading.append(help);
    }
    deps.ui.state.main.replaceChildren(heading);
    if (k === 'create') {
      const hero = deps.ui.state.el('section', 'banner');
      hero.append(deps.ui.state.el('small', '', '제작'), deps.ui.state.el('h2', '', '새로운 이야기를 만들어 보세요'), deps.ui.state.el('p', 'muted', '캐릭터와 세계관을 한곳에서 관리해요.'), deps.ui.button('✦ 캐릭터 제작 · 관리', () => deps.navigation.openNative('characters'), 'primary'));
      deps.ui.state.main.append(hero);
      for (const x of [['personas', '페르소나', '대화에서 사용할 나의 프로필'], ['lorebooks', '로어북', '캐릭터가 기억할 배경과 정보'], ['presets', '프리셋', 'AI에게 전달할 지침']]) deps.ui.state.main.append(menu(...x));
    } else {
      for (const x of [['settings', '설정', '화면, 언어와 앱 설정'], ['connections', 'AI 연결', '사용할 모델과 API 설정'], ['agents', '에이전트 · 도구', '설치한 에이전트와 기능 전체 보기']]) deps.ui.state.main.append(menu(...x));
      const addons = menu('settings', '확장 관리', '설치한 외부 확장을 관리합니다.');
      addons.onclick = () => deps.navigation.settings('addons');
      deps.ui.state.main.append(addons);
      const colors = deps.ui.state.el('section', 'color-settings');
      colors.append(deps.ui.state.el('strong', '', '테마 설정'));
      const choices = deps.ui.state.el('div', 'theme-choices');
      for (const [v, t] of [['light', '라이트'], ['dark', '다크']]) {
        const b = deps.ui.button(t, () => deps.extensions.setEngineTheme(v), 'chip');
        b.dataset.active = String(deps.ui.state.html.dataset.theme === v);
        choices.append(b);
      }
      colors.append(choices);
      const design = deps.ui.button('', () => deps.navigation.go('design'), 'menu-row');
      design.dataset.designOpen = '';
      const copy = deps.ui.state.el('div');
      copy.append(deps.ui.state.el('strong', '', '디자인'), deps.ui.state.el('p', 'muted', '지향색, 홈·라이브러리 보기와 채팅 글자 간격'));
      design.append(copy, deps.ui.state.el('span', '', '›'));
      deps.ui.state.main.append(colors, design, deps.ui.state.el('h2', '', '바로가기'));
      deps.extensions.extensionShortcuts();
    }
  }
  
  function designScreen() {
    deps.ui.state.main.replaceChildren(deps.ui.button('‹ 마이페이지', () => deps.navigation.go('my'), 'quiet'), deps.ui.state.el('h1', '', '디자인'), deps.design.themePreferences());
  }

  const initialize = [

  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, menu, hub, designScreen };
}
