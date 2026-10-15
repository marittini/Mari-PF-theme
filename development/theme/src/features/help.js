/** Editable Markdown content; embedded at build time, with no extra runtime fetch. */
export function createHelp(deps) {
  const state = {};
  function show() {
    const main = deps.ui.state.main;
    const article = deps.ui.state.el('article', 'description help-content');
    article.setAttribute('aria-label', '마리나라 플랫폼화 도움말');
    deps.markdown.renderMarkdown(article, __HELP_MARKDOWN__);
    main.replaceChildren(deps.ui.button('‹ 마이페이지', () => deps.navigation.go('my'), 'quiet'), article);
  }
  const initialize = [];
  const cleanup = [];
  return { state, initialize, cleanup, show };
}
