/** writing: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createWriting(deps) {
  const mftModuleState = {
    writingDesktop: undefined
  };

  function writingShell(target) {
    return target instanceof Element && target.closest('[data-chat-mode="roleplay"]') ? target.closest('.marinara-chat-input-shell,.mari-chat-input-box') : null;
  }
  
  function onWritingStart(e) {
    if (!e.target.matches?.('textarea[data-chat-composer]') || e.type === 'pointerover' && !mftModuleState.writingDesktop.matches) return;
    const shell = writingShell(e.target);
    if (shell && (e.type !== 'pointerover' || document.activeElement === e.target) && !shell.querySelector('[data-chat-input-popup]')) {
      if (!shell.hasAttribute('data-mft-writing')) shell.setAttribute('data-mft-writing', '');
      if (!mftModuleState.writingDesktop.matches && !shell.querySelector('.mft-writing-tools')) {
        const tools = deps.ui.button('도구', () => shell.removeAttribute('data-mft-writing'), 'mft-writing-tools');
        tools.setAttribute('aria-label', '입력 도구 표시');
        tools.onpointerdown = e => e.preventDefault();
        shell.append(tools);
      }
    }
  }
  
  function onWritingExit(e) {
    const shell = writingShell(e.target);
    if (!shell || !e.target.isConnected) return;
    if (e.type === 'focusout') {
      queueMicrotask(() => {
        if (!deps.core.state.disposed && shell.isConnected && !shell.querySelector('textarea[data-chat-composer]:focus')) shell.removeAttribute('data-mft-writing');
      });
    } else if (mftModuleState.writingDesktop.matches && !shell.contains(e.relatedTarget)) shell.removeAttribute('data-mft-writing');
  }
  
  function onWritingOutside(e) {
    if (mftModuleState.writingDesktop.matches) return;
    for (const shell of document.querySelectorAll('[data-mft-writing]')) if (!shell.contains(e.target)) shell.removeAttribute('data-mft-writing');
  }
  
  function onWritingEscape(e) {
    if (e.key === 'Escape') writingShell(e.target)?.removeAttribute('data-mft-writing');
  }

  const initialize = [
    { order: 23300, run() {
      mftModuleState.writingDesktop = matchMedia('(hover:hover) and (pointer:fine)');
    } },
    { order: 23900, run() {
      for (const type of ['focusin', 'input', 'pointerover']) document.addEventListener(type, onWritingStart, true);
    } },
    { order: 24000, run() {
      for (const type of ['focusout', 'pointerout']) document.addEventListener(type, onWritingExit, true);
    } },
    { order: 24100, run() {
      document.addEventListener('keydown', onWritingEscape, true);
    } },
    { order: 24200, run() {
      document.addEventListener('pointerdown', onWritingOutside, true);
      // Scoped native-editor helpers: no chat scan, no polling, no form-value rewrite.
    } }
  ];
  const cleanup = [
    { order: 18, run() {
      for (const type of ['focusin', 'input', 'pointerover']) document.removeEventListener(type, onWritingStart, true);
    } },
    { order: 19, run() {
      for (const type of ['focusout', 'pointerout']) document.removeEventListener(type, onWritingExit, true);
    } },
    { order: 20, run() {
      document.removeEventListener('keydown', onWritingEscape, true);
    } },
    { order: 21, run() {
      document.removeEventListener('pointerdown', onWritingOutside, true);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, writingShell, onWritingStart, onWritingExit, onWritingOutside, onWritingEscape };
}
