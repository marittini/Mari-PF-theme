/** markdown: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createMarkdown(deps) {
  const mftModuleState = {

  };

  // Safe Markdown: constructs DOM from text; HTML, scripts and remote images are not executed.
  function renderMarkdown(target, text) {
    target.replaceChildren();
    const lines = String(text).replace(/\r/g, '').split('\n');
    let list = null,
      code = null;
    function inline(n, t) {
      const re = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*|\[[^\]]+\]\([^\s)]+\))/g;
      let pos = 0;
      for (const m of t.matchAll(re)) {
        n.append(document.createTextNode(t.slice(pos, m.index)));
        const v = m[0];
        let child;
        if (v.startsWith('[')) {
          const [, label, url] = v.match(/^\[([^\]]+)\]\(([^)]+)\)$/) || [];
          try {
            const u = new URL(url, location.origin);
            if (!['http:', 'https:'].includes(u.protocol)) throw Error();
            child = deps.ui.state.el('a', '', label);
            child.href = u.href;
            child.target = '_blank';
            child.rel = 'noopener noreferrer';
          } catch {
            child = document.createTextNode(v);
          }
        } else {
          const delim = v.startsWith('**') || v.startsWith('~~') ? 2 : 1;
          child = deps.ui.state.el(v[0] === '`' ? 'code' : v.startsWith('**') ? 'strong' : v.startsWith('~~') ? 'del' : 'em', '', v.slice(delim, -delim));
        }
        n.append(child);
        pos = m.index + v.length;
      }
      n.append(document.createTextNode(t.slice(pos)));
    }
    for (const line of lines) {
      if (/^```/.test(line)) {
        if (code) code = null;else {
          code = deps.ui.state.el('pre');
          target.append(code);
        }
        list = null;
        continue;
      }
      if (code) {
        code.append(document.createTextNode(line + '\n'));
        continue;
      }
      const h = line.match(/^(#{1,6})\s+(.+)$/),
        li = line.match(/^\s*(?:[-*+]\s+|\d+\.\s+)(.*)$/);
      if (li) {
        if (!list) {
          list = deps.ui.state.el(/^\s*\d/.test(line) ? 'ol' : 'ul');
          target.append(list);
        }
        const n = deps.ui.state.el('li');
        inline(n, li[1]);
        list.append(n);
        continue;
      }
      list = null;
      if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        target.append(deps.ui.state.el('hr'));
        continue;
      }
      const n = deps.ui.state.el(h ? 'h' + Math.min(h[1].length + 1, 6) : line.startsWith('> ') ? 'blockquote' : 'p');
      inline(n, h ? h[2] : line.replace(/^> /, ''));
      target.append(n);
    }
  }

  const initialize = [

  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, renderMarkdown };
}
