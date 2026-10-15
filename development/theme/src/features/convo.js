/** convo: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createConvo(deps) {
  const mftModuleState = {
    splitObserver: undefined,
    splitRoot: undefined,
    splitTask: undefined,
    splitConnected: undefined,
    splitFull: undefined,
    splitDirty: undefined,
    splitSources: undefined,
    presentationOwners: undefined
  };

  function resetSplit(n, state) {
    state.display.remove();
    n.removeAttribute('data-mft-split');
    if (!n.hasAttribute('data-mari-tts-source-view') && n.style.getPropertyValue('display') === 'none' && n.style.getPropertyPriority('display') === 'important') {
      if (state.displayValue) n.style.setProperty('display', state.displayValue, state.displayPriority);else n.style.removeProperty('display');
    }
    mftModuleState.splitSources.delete(n);
  }
  
  function displayedBubble(nativeNode) {
    if (nativeNode.hasAttribute('data-mari-tts-source-view')) {
      let next = nativeNode.nextElementSibling;
      for (let i = 0; next && i < 4; i++, next = next.nextElementSibling) {
        if (next.hasAttribute('data-mari-tts-copy')) {
          if (next.hasAttribute('data-mft-split') && !mftModuleState.splitSources.has(next)) next.removeAttribute('data-mft-split');
          if (!mftModuleState.splitSources.has(next) && next.style.getPropertyValue('display') === 'none' && !next.hidden) next.style.removeProperty('display');
          return next;
        }
      }
      return null;
    }
    return nativeNode;
  }
  
  function renderedLineFragments(source) {
    const copy = source.cloneNode(true),
      originals = [...source.querySelectorAll('*')],
      copies = [...copy.querySelectorAll('*')];
    for (let i = originals.length - 1; i >= 0; i--) {
      const n = originals[i],
        style = getComputedStyle(n);
      if (n.matches('[hidden],[aria-hidden="true"],.mari-tts-cue,.mari-tts-line-controls,[data-mari-ext-tts-hidden-translation]') || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') copies[i]?.remove();
    }
    copy.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
    copy.querySelectorAll('p,blockquote,h1,h2,h3,h4,h5,h6').forEach(p => p.append('\n'));
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT),
      nodes = [];
    let node,
      total = 0;
    while (node = walker.nextNode()) {
      nodes.push({
        node,
        start: total,
        end: total + node.data.length
      });
      total += node.data.length;
    }
    const full = copy.textContent;
    if (!full.includes('\n')) return [];
    const fragments = [];
    let offset = 0,
      firstIndex = 0,
      lastIndex = 0;
    for (const line of full.split('\n')) {
      const start = offset,
        end = offset + line.length;
      offset = end + 1;
      if (!line.trim()) continue;
      while (firstIndex < nodes.length && nodes[firstIndex].end <= start) firstIndex++;
      lastIndex = Math.max(lastIndex, firstIndex);
      while (lastIndex + 1 < nodes.length && nodes[lastIndex + 1].start < end) lastIndex++;
      const first = nodes[firstIndex],
        last = nodes[lastIndex];
      if (!first || !last) continue;
      const range = document.createRange();
      range.setStart(first.node, start - first.start);
      range.setEnd(last.node, end - last.start);
      fragments.push(range.cloneContents());
    }
    return fragments;
  }
  
  function makeSplit(source, fragments, fingerprint, nativeNode) {
    mftModuleState.presentationOwners.set(source, nativeNode);
    let state = mftModuleState.splitSources.get(source);
    if (!state) {
      const display = deps.ui.state.el('mft-message-lines', 'mft-split-display');
      const row = source.closest('[data-message-id],.mari-message');
      display.dataset.role = source.classList.contains('texting-bubble-user') || row?.classList.contains('mari-message-user') || row?.dataset.messageRole === 'user' ? 'user' : 'assistant';
      const scope = display.attachShadow({
          mode: 'open'
        }),
        style = deps.ui.state.el('style');
      style.textContent = ':host{display:flex;flex-direction:column;align-items:flex-start;gap:6px;max-width:100%;min-width:0;line-height:var(--mft-chat-line-height,1.8);letter-spacing:var(--mft-chat-letter-spacing,0px);overflow-wrap:anywhere}:host([data-role=user]){align-items:flex-end}.mft-line{box-sizing:border-box;display:block;max-width:100%;border-radius:16px;padding:9px 12px;background:var(--mft-card,#fff);color:var(--mft-ink,#191921);white-space:pre-wrap;font:inherit}:host([data-role=user]) .mft-line{background:var(--mft-accent,#6656ec);color:#fff}.mft-line p,.mft-line blockquote{margin:0}a{color:inherit}';
      scope.append(style);
      state = {
        display,
        scope,
        content: null,
        displayValue: source.style.getPropertyValue('display'),
        displayPriority: source.style.getPropertyPriority('display')
      };
      if (source.hasAttribute('data-mari-tts-copy') && state.displayValue === 'none') state.displayValue = '';
      mftModuleState.splitSources.set(source, state);
    }
    if (state.content !== fingerprint) {
      for (const child of [...state.scope.children]) if (child.tagName !== 'STYLE') child.remove();
      for (const fragment of fragments) {
        const line = deps.ui.state.el('div', 'mft-line');
        line.append(fragment);
        state.scope.append(line);
      }
      state.content = fingerprint;
    }
    for (const prop of ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing']) if (state.display.style[prop] !== source.style[prop]) state.display.style[prop] = source.style[prop];
    source.dataset.mftSplit = 'true';
    // Attribute-scoped CSS hides only our native source; foreign clones never inherit inline hiding.
    if (source.nextElementSibling !== state.display) source.after(state.display);
  }
  
  function syncSplits() {
    mftModuleState.splitTask = null;
    if (deps.core.state.disposed || document.hidden) return;
    mftModuleState.splitObserver?.disconnect();
    const scopes = mftModuleState.splitFull ? mftModuleState.splitRoot ? [mftModuleState.splitRoot] : [] : [...mftModuleState.splitDirty].filter(n => n.isConnected && mftModuleState.splitRoot?.contains(n));
    mftModuleState.splitFull = false;
    mftModuleState.splitDirty.clear();
    const scan = selector => scopes.flatMap(scope => [...(scope.matches(selector) ? [scope] : []), ...scope.querySelectorAll(selector)]);
    const owners = new Map();
    if (mftModuleState.splitRoot) for (const copy of scan('[data-mari-tts-copy]')) {
      if (copy.closest('.ptx-view') || copy.closest('[data-message-id],.mari-message')?.querySelector('.ptx-view,[data-ptx-hidden]') || copy.parentElement.closest('[data-mari-tts-copy]')) continue;
      let peer = copy.previousElementSibling;
      while (peer?.matches('mft-message-lines')) peer = peer.previousElementSibling;
      const known = mftModuleState.presentationOwners.get(copy);
      if (!peer?.hasAttribute('data-mari-tts-source-view') || known && !known.isConnected || copy.closest('[data-message-id],.mari-message')?.querySelector('textarea')) {
        const state = mftModuleState.splitSources.get(copy);
        if (state) resetSplit(copy, state);
        copy.remove();
      }
    }
    if (mftModuleState.splitRoot) for (const nativeNode of scan('.mari-message-bubble')) {
      if (nativeNode.closest('[data-mari-tts-copy],.ptx-view,.mari-convo-viewer-split-display,.mft-split-display')) continue;
      if (nativeNode.classList.contains('mari-convo-viewer-split-bubble')) continue;
      const row = nativeNode.closest('[data-message-id],.mari-message');
      // Release our own presentation before inspecting a translator-owned source or TTS copy.
      if (row?.hasAttribute('data-ptx-active') || row?.querySelector('.ptx-view,[data-ptx-hidden]')) continue;
      const source = displayedBubble(nativeNode);
      if (source) {
        owners.set(source, nativeNode);
        mftModuleState.presentationOwners.set(source, nativeNode);
      }
    }
    for (const [n, state] of mftModuleState.splitSources) {
      const row = n.closest('[data-message-id],.mari-message');
      if (!n.isConnected || !mftModuleState.splitRoot?.contains(n) || scopes.some(scope => scope.contains(n)) && (!owners.has(n) || row?.querySelector('textarea'))) resetSplit(n, state);
    }
    for (const [source, nativeNode] of owners) {
      const row = nativeNode.closest('[data-message-id],.mari-message');
      const prior = mftModuleState.splitSources.get(source);
      // PTX owns a live, interactive sibling immediately after its host. Never clone or reorder it.
      const skip = row?.hasAttribute('data-ptx-active') || row?.querySelector('.ptx-view,[data-ptx-hidden]') || deps.adapter.liveBubble(nativeNode) || !row || row.querySelector('textarea') || row.querySelector('.mari-message-typing') || source.querySelector('button:not(.mari-tts-line-controls button),code,img,input,pre,ul,ol,table') || [...nativeNode.children].some(c => c.classList.contains('mb-0.5')) || row.className.includes('bg-[var(--secondary)]/20');
      if (skip) {
        if (prior) resetSplit(source, prior);
        continue;
      }
      if (prior) for (const prop of ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing']) if (prior.display.style[prop] !== source.style[prop]) prior.display.style[prop] = source.style[prop];
      const fingerprint = source.innerHTML;
      if (prior?.content === fingerprint) {
        source.dataset.mftSplit = 'true';
        // Attribute-scoped CSS hides only our native source; foreign clones never inherit inline hiding.
        if (source.nextElementSibling !== prior.display) source.after(prior.display);
        continue;
      }
      const fragments = renderedLineFragments(source);
      if (fragments.length < 2) {
        if (prior) resetSplit(source, prior);
        continue;
      }
      makeSplit(source, fragments, fingerprint, nativeNode);
    }
    if (mftModuleState.splitRoot) {
      const owned = new Set([...mftModuleState.splitSources.values()].map(s => s.display));
      scan('mft-message-lines').forEach(n => {
        if (!n.closest('.ptx-view') && !owned.has(n)) n.remove();
      });
      mftModuleState.splitObserver.observe(mftModuleState.splitRoot, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'data-mari-tts-source-view', 'data-mari-tts-copy', 'data-ptx-hidden', 'data-ptx-active']
      });
      mftModuleState.splitConnected = true;
    }
  }
  
  function bindSplits() {
    deps.translations.bindTranslationSizes();
    const next = deps.ui.state.root.dataset.native === 'true' ? document.querySelector('[data-chat-mode="conversation"] [data-chat-scroll]') : null;
    if (next === mftModuleState.splitRoot && mftModuleState.splitConnected) return;
    if (next !== mftModuleState.splitRoot) {
      mftModuleState.splitObserver?.disconnect();
      for (const [n, state] of mftModuleState.splitSources) resetSplit(n, state);
      mftModuleState.splitRoot = next;
    }
    mftModuleState.splitFull = true;
    mftModuleState.splitDirty.clear();
    if (!mftModuleState.splitObserver) mftModuleState.splitObserver = new MutationObserver(records => {
      if (document.hidden) return;
      const mark = node => {
        const element = node.nodeType === 3 ? node.parentElement : node;
        if (!(element instanceof Element) || element.closest('[data-chat-composer],textarea,.mft-split-display,.ptx-view') || deps.adapter.liveBubble(element)) return;
        const row = element.closest('[data-message-id]') || element.closest('.mari-message');
        if (row) mftModuleState.splitDirty.add(row);else if (element === mftModuleState.splitRoot && node.nodeType !== 3) return;else if (element.querySelector('[data-message-id],.mari-message-bubble,[data-mari-tts-copy]')) mftModuleState.splitFull = true;
      };
      for (const record of records) {
        mark(record.target);
        if (record.type === 'childList') for (const node of [...record.addedNodes, ...record.removedNodes]) mark(node);
      }
      if ((mftModuleState.splitFull || mftModuleState.splitDirty.size) && !mftModuleState.splitTask) mftModuleState.splitTask = deps.core.later(syncSplits, 50);
    });
    if (mftModuleState.splitRoot) syncSplits();
  }

  const initialize = [
    { order: 22200, run() {
      mftModuleState.splitObserver = null;
    } },
    { order: 22201, run() {
      mftModuleState.splitRoot = null;
    } },
    { order: 22202, run() {
      mftModuleState.splitTask = null;
    } },
    { order: 22203, run() {
      mftModuleState.splitConnected = false;
    } },
    { order: 22204, run() {
      mftModuleState.splitFull = true;
    } },
    { order: 22300, run() {
      mftModuleState.splitDirty = new Set();
    } },
    { order: 22400, run() {
      mftModuleState.splitSources = new Map();
    } },
    { order: 22401, run() {
      mftModuleState.presentationOwners = new WeakMap();
    } }
  ];
  const cleanup = [
    { order: 38, run() {
      mftModuleState.splitObserver?.disconnect();
    } },
    { order: 39, run() {
      for (const [n, state] of mftModuleState.splitSources) resetSplit(n, state);
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, resetSplit, displayedBubble, renderedLineFragments, makeSplit, syncSplits, bindSplits };
}
