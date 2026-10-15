/** nativeUi: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createNativeUi(deps) {
  const mftModuleState = {
    nativeUiObserver: undefined,
    nativeUiRoots: undefined,
    nativeUiQueued: undefined,
    duplicateTagNodes: undefined,
    nativeUiAdditions: undefined
  };

  function enhanceNativeUi(scopes = mftModuleState.nativeUiRoots) {
    if (deps.core.state.disposed || deps.ui.state.root.dataset.native !== 'true' || deps.navigation.state.routeIntent === 'chat') return;
    mftModuleState.nativeUiObserver?.disconnect();
    for (const scope of scopes) {
      deps.settings.enhanceSettingsFolds(scope);
      for (const row of scope.querySelectorAll('[data-touch-drag-card="character"]')) {
        const tags = [...row.querySelectorAll('[data-character-row-tags]>span,.mari-chrome-muted-badge')].map(n => n.textContent.trim()).filter(x => x && !x.startsWith('+'));
        for (const info of row.querySelectorAll(':scope>div.min-w-0.flex-1')) for (const n of info.children) {
          if (!n.matches('.truncate:not(.italic)') || n.hasAttribute('data-character-row-name') || n.matches('.w-fit')) continue;
          const parts = n.textContent.trim().split(/\s*,\s*/);
          const duplicate = parts.length > 0 && parts.every(x => tags.includes(x));
          if (duplicate) {
            n.setAttribute('data-mft-tag-duplicate', '');
            mftModuleState.duplicateTagNodes.add(n);
          } else if (mftModuleState.duplicateTagNodes.has(n)) {
            n.removeAttribute('data-mft-tag-duplicate');
            mftModuleState.duplicateTagNodes.delete(n);
          }
        }
      }
      for (const row of scope.querySelectorAll('[data-lorebook-entry-row-id]')) {
        const drawer = row.querySelector(':scope>div.border-t');
        if (!drawer || !drawer.querySelector('textarea,input')) continue;
        if (!drawer.querySelector('.mft-lore-guide')) {
          const guide = deps.ui.state.el('details', 'mft-lore-guide');
          guide.append(deps.ui.state.el('summary', '', '처음 쓰는 로어북 · 사용 순서'), deps.ui.state.el('p', '', '① 주요 키워드에 대화에서 찾을 단어를 넣으세요. 예: 학교, 교실'), deps.ui.state.el('p', '', '② 내용에는 AI가 참고할 설정을 쓰세요. 예: 학교는 바닷가 마을에 있습니다.'), deps.ui.state.el('p', '', '③ 항목을 켜면 조건에 맞을 때 내용을 참고합니다. 보조 키워드와 고급 설정은 필요할 때만 사용하세요.'));
          drawer.prepend(guide);
          mftModuleState.nativeUiAdditions.add(guide);
        }
        const help = [['주요 키워드', '대화에 이 단어가 나오면 내용을 참고합니다. 쉼표로 나누거나 Enter로 추가하세요.'], ['Primary keys', 'Words to look for in chat. Add each word with Enter.'], ['보조 키워드', '주요 키워드와 함께 검사할 추가 조건입니다. 필요 없으면 비워 두세요.'], ['설명', '목록에서 알아보기 위한 짧은 메모입니다. 실제 설정은 내용에 적으세요.'], ['내용', '조건이 맞을 때 AI에게 전달할 설정입니다.'], ['결정', 'AI에게 추가 판단을 맡기는 옵션입니다. 처음에는 사용 안 함으로 두세요.']];
        for (const label of drawer.querySelectorAll('label,div[class~="mb-1.5"][class~="font-medium"]')) {
          const text = label.textContent.trim();
          const found = help.find(([key]) => text.startsWith(key));
          if (found && !label.nextElementSibling?.classList.contains('mft-field-help')) {
            const hint = deps.ui.state.el('p', 'mft-field-help', found[1]);
            label.after(hint);
            mftModuleState.nativeUiAdditions.add(hint);
          }
        }
        for (const b of drawer.querySelectorAll('button')) {
          const hints = {
            'AND Any': '보조 키워드 중 하나 이상 있어야 적용',
            'AND All': '보조 키워드가 모두 있어야 적용',
            'NOT Any': '보조 키워드가 하나라도 있으면 제외',
            'NOT All': '보조 키워드가 모두 있으면 제외'
          };
          if (hints[b.textContent.trim()] && !b.hasAttribute('data-mft-hint')) {
            b.dataset.mftOldTitle = b.getAttribute('title') || '';
            b.dataset.mftHint = '';
            b.title = hints[b.textContent.trim()];
          }
        }
      }
    }
    for (const scope of mftModuleState.nativeUiRoots) if (scope.isConnected) mftModuleState.nativeUiObserver.observe(scope, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  function bindNativeUi() {
    mftModuleState.nativeUiObserver?.disconnect();
    mftModuleState.nativeUiRoots = [];
    if (deps.core.state.disposed || deps.ui.state.root.dataset.native !== 'true' || deps.navigation.state.routeIntent === 'chat') return;
    const candidates = [...document.querySelectorAll('[data-component="CenterContent"],.mari-editor-shell,[data-panel-key="characters"],[data-panel-key="personas"],[data-panel-key="presets"],[data-panel-key="lorebooks"],[data-panel-key="settings"]')].filter(deps.ui.state.visible);
    mftModuleState.nativeUiRoots = candidates.filter(n => !candidates.some(p => p !== n && p.contains(n)));
    if (!mftModuleState.nativeUiObserver) mftModuleState.nativeUiObserver = new MutationObserver(records => {
      if (document.hidden || mftModuleState.nativeUiQueued || !records.some(r => !r.target.closest?.('.mft-tag-list') && !r.target.parentElement?.closest('.mft-tag-list') && (r.type === 'characterData' || [...r.addedNodes, ...r.removedNodes].some(n => !(n instanceof Element) || !n.matches('.mft-lore-guide,.mft-field-help,.mft-tag-list,.mft-settings-fold,.mft-settings-index'))))) return;
      const changed = new Set();
      for (const r of records) {
        const parent = r.target.nodeType === 1 ? r.target : r.target.parentElement;
        if (parent?.closest('.mft-lore-guide,.mft-field-help,.mft-tag-list,.mft-settings-fold,.mft-settings-index')) continue;
        const row = parent?.closest('[data-lorebook-entry-row-id],[data-touch-drag-card="character"]');
        if (row) changed.add(row.parentElement);
        for (const n of r.addedNodes) if (n instanceof Element && !n.matches('.mft-lore-guide,.mft-field-help,.mft-tag-list,.mft-settings-fold,.mft-settings-index')) changed.add(n.parentElement || n);
      }
      if (!changed.size) return;
      mftModuleState.nativeUiQueued = true;
      queueMicrotask(() => {
        mftModuleState.nativeUiQueued = false;
        enhanceNativeUi([...changed].filter(n => n?.isConnected));
      });
    });
    enhanceNativeUi();
  }

  const initialize = [
    { order: 24300, run() {
      mftModuleState.nativeUiObserver = null;
    } },
    { order: 24301, run() {
      mftModuleState.nativeUiRoots = [];
    } },
    { order: 24302, run() {
      mftModuleState.nativeUiQueued = false;
    } },
    { order: 24400, run() {
      mftModuleState.duplicateTagNodes = new Set();
    } },
    { order: 24401, run() {
      mftModuleState.nativeUiAdditions = new Set();
    } }
  ];
  const cleanup = [
    { order: 12, run() {
      mftModuleState.nativeUiObserver?.disconnect();
    } },
    { order: 14, run() {
      for (const n of mftModuleState.nativeUiAdditions) n.remove();
    } },
    { order: 15, run() {
      for (const n of mftModuleState.duplicateTagNodes) n.removeAttribute('data-mft-tag-duplicate');
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, enhanceNativeUi, bindNativeUi };
}
