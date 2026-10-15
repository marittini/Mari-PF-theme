// DOM functions extracted verbatim from the user-supplied translation extension.
// Source SHA-256: f6ef038c035e028d13145fe4144022b33a03fac5a47bb87880aa16707e929485
const BLOCK_TAGS = new Set(("ADDRESS ARTICLE ASIDE BLOCKQUOTE CENTER DD DETAILS DIV DL DT FIELDSET FIGCAPTION FIGURE FOOTER FORM "
    + "H1 H2 H3 H4 H5 H6 HEADER HR LI MAIN NAV OL P PRE SECTION SUMMARY TABLE TBODY TD TFOOT TH THEAD TR UL").split(" "));

const BLOCK_SELECTOR = [...BLOCK_TAGS].map((t) => t.toLowerCase()).join(",");

const SKIP_TAGS = new Set("PRE STYLE SCRIPT SVG TEMPLATE TEXTAREA INPUT SELECT BUTTON AUDIO VIDEO CANVAS IFRAME NOSCRIPT".split(" "));

const WRAPPER_TAGS = new Set("STRONG B EM I U S DEL INS SPAN FONT MARK A SMALL BIG SUB SUP Q ABBR CITE".split(" "));

function hashText(str) {
    let h = 0x811c9dc5;
    const s = String(str ?? "");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
  }

function normalizeForKey(s) {
    return String(s ?? "")
      .replace(/[“”„‟«»＂]/g, '"')
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[*_~`#>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

function blockKey(block) {
    return hashText(normalizeForKey(block));
  }

function skipSelector() {
    const sel = String(settings().keepTags || "").trim();
    if (!sel) return "";
    try {
      document.createDocumentFragment().querySelector(sel);
      return sel;
    } catch {
      return "";
    }
  }

function collectUnits(root, skipSel = skipSelector()) {
    const units = [];
    const addUnit = (nodes) => {
      while (nodes.length && nodes[0].nodeType === 1 && nodes[0].tagName === "BR") nodes.shift();
      while (nodes.length && nodes[nodes.length - 1].nodeType === 1 && nodes[nodes.length - 1].tagName === "BR") nodes.pop();
      if (!nodes.length) return;
      const first = nodes[0];
      if (first.nodeType === 3) {
        const lead = /^\s*/.exec(first.textContent)[0].length;
        if (lead === first.textContent.length) { nodes.shift(); return addUnit(nodes); }
        if (lead) nodes[0] = first.splitText(lead);
      }
      const last = nodes[nodes.length - 1];
      if (last.nodeType === 3) {
        const trail = /\s*$/.exec(last.textContent)[0].length;
        if (trail === last.textContent.length) { nodes.pop(); return addUnit(nodes); }
        if (trail) last.splitText(last.textContent.length - trail);
      }
      const text = nodes.map((n) => n.textContent).join("");
      if (/\p{L}/u.test(text)) units.push({ nodes, text: text.trim() });
    };
    const splitRun = (run) => {
      let cur = [];
      const push = () => { const n = cur; cur = []; addUnit(n); };
      for (const node of run) {
        if (node.nodeType === 3) {
          const parts = node.textContent.split(/(\n[ \t]*\n\s*)/);
          if (parts.length === 1) { cur.push(node); continue; }
          const made = parts.map((p, i) => [document.createTextNode(p), i % 2 === 1]).filter(([t]) => t.textContent);
          node.replaceWith(...made.map((m) => m[0]));
          for (const [t, sep] of made) {
            if (sep) push();
            else cur.push(t);
          }
        } else if (node.tagName === "BR" && cur.length && cur[cur.length - 1].nodeType === 1 && cur[cur.length - 1].tagName === "BR") {
          cur.pop();
          push();
        } else {
          cur.push(node);
        }
      }
      push();
    };
    const walk = (container) => {
      let run = [];
      const flush = () => { if (run.length) splitRun(run); run = []; };
      for (const node of [...container.childNodes]) {
        if (node.nodeType === 3) { run.push(node); continue; }
        if (node.nodeType !== 1) continue;
        if (SKIP_TAGS.has(node.tagName) || node.getAttribute("translate") === "no" || node.classList.contains("ptx-pill")
          || node.classList.contains("ptx-bar") || (skipSel && node.matches(skipSel))) {
          flush();
          continue;
        }
        if (BLOCK_TAGS.has(node.tagName) || node.querySelector(BLOCK_SELECTOR) || /\n[ \t]*\n/.test(node.textContent)) {
          flush();
          walk(node);
          continue;
        }
        run.push(node);
      }
      flush();
    };
    walk(root);
    return units;
  }

function serializeUnit(nodes) {
    const wrappers = [];
    const atoms = [];
    let hadBr = false;
    const out = (n) => {
      if (n.nodeType === 3) return n.textContent;
      if (n.nodeType !== 1) return "";
      if (n.tagName === "BR") { hadBr = true; return "\n"; }
      if (WRAPPER_TAGS.has(n.tagName)) {
        const i = wrappers.push(n);
        return `<x${i}>${[...n.childNodes].map(out).join("")}</x${i}>`;
      }
      return `⟪${atoms.push(n)}⟫`;
    };
    const src = nodes.map(out).join("").trim();
    return { src, wrappers, atoms, hadBr };
  }

function stripMarks(s) {
    return String(s ?? "").replace(/<\/?x\d+>/g, "").replace(/⟪\d+⟫/g, "");
  }

function rebuildUnit(str, { wrappers, atoms, hadBr }) {
    const frag = document.createDocumentFragment();
    const stack = [frag];
    const top = () => stack[stack.length - 1];
    const usedAtoms = new Set();
    const tagged = /<x\d+>/.test(str);
    const quoteWrap = !tagged && wrappers.find((w) => /^["“«「『]/.test(w.textContent.trim()));
    const addText = (t) => {
      if (!t) return;
      const lines = hadBr ? t.split("\n") : [t];
      lines.forEach((line, i) => {
        if (i) top().appendChild(document.createElement("br"));
        if (!line) return;
        if (!quoteWrap) { top().appendChild(document.createTextNode(line)); return; }
        let last = 0;
        for (const m of line.matchAll(DIALOGUE_RE)) {
          if (m.index > last) top().appendChild(document.createTextNode(line.slice(last, m.index)));
          const w = quoteWrap.cloneNode(false);
          w.textContent = m[0];
          top().appendChild(w);
          last = m.index + m[0].length;
        }
        if (last < line.length) top().appendChild(document.createTextNode(line.slice(last)));
      });
    };
    const re = /<x(\d+)>|<\/x(\d+)>|⟪(\d+)⟫/g;
    let last = 0;
    let m;
    while ((m = re.exec(str))) {
      addText(str.slice(last, m.index));
      last = re.lastIndex;
      if (m[1]) {
        const w = wrappers[Number(m[1]) - 1];
        const el = w ? w.cloneNode(false) : document.createElement("span");
        top().appendChild(el);
        stack.push(el);
      } else if (m[2]) {
        if (stack.length > 1) stack.pop();
      } else {
        const a = atoms[Number(m[3]) - 1];
        if (a) { top().appendChild(a.cloneNode(true)); usedAtoms.add(a); }
      }
    }
    addText(str.slice(last));
    for (const a of atoms) if (!usedAtoms.has(a)) frag.append(" ", a.cloneNode(true));
    return frag;
  }

function hostsOf(el) {
    return [...el.getElementsByClassName("mari-message-content")].filter((h) => !h.classList.contains("ptx-view")
      && !h.classList.contains("mari-message-typing")
      && !h.closest(".ptx-view")
      && h.closest("[data-message-id]") === el
      && !h.parentElement?.closest(".mari-message-content"));
  }

function viewAfter(host) {
    const next = host.nextElementSibling;
    return next && next.classList.contains("ptx-view") && next._ptxFor === host ? next : null;
  }

function unmount(host) {
    if (host.hasAttribute("data-ptx-hidden")) host.removeAttribute("data-ptx-hidden");
    viewAfter(host)?.remove();
  }

function dropOrphans(root) {
    for (const v of root.querySelectorAll(".ptx-view")) {
      const host = v._ptxFor;
      if (!host || !host.isConnected || host.nextElementSibling !== v) {
        v.remove();
        if (host?.isConnected) host.removeAttribute("data-ptx-hidden");
      }
    }
  }

function buildView(host, id, rec) {
    const view = host.cloneNode(true);
    view.removeAttribute("data-ptx-hidden");
    view.removeAttribute("id");
    const both = settings().viewMode === "both";
    for (const u of collectUnits(view)) {
      const key = blockKey(u.text);
      const tr = rec.map[key];
      if (tr === undefined) {
        if (unitKind(serializeUnit(u.nodes).src) === "text") {
          const miss = document.createElement("span");
          miss.className = "ptx-u is-missing";
          miss.title = "아직 번역되지 않은 문단입니다.";
          u.nodes[0].before(miss);
          miss.append(...u.nodes);
        }
        continue;
      }
      const parts = serializeUnit(u.nodes);
      const forced = openState.get(`${id}:${key}`);
      const open = forced === undefined ? both : forced;
      const wrap = document.createElement("span");
      wrap.className = `ptx-u${open ? " is-open" : ""}`;
      wrap.dataset.k = key;
      wrap.tabIndex = 0;
      wrap.setAttribute("role", "button");
      wrap.setAttribute("aria-expanded", String(open));
      const t = document.createElement("span");
      t.className = "ptx-t";
      t.append(rebuildUnit(tr, parts));
      const o = document.createElement("span");
      o.className = "ptx-o";
      u.nodes[0].before(wrap);
      o.append(...u.nodes);
      wrap.append(t, o);
    }
    return view;
  }

function markFlat(view) {
    for (const unit of view.querySelectorAll(".ptx-u[data-k]")) {
      const display = unit.parentElement ? getComputedStyle(unit.parentElement).display : "";
      if (!/flex|grid/.test(display)) continue;
      unit.classList.add("is-flat");
      unit.classList.remove("is-open");
      for (const attr of ["role", "tabindex", "aria-expanded"]) unit.removeAttribute(attr);
    }
  }

function setActive(el, on) {
    if (el.hasAttribute("data-ptx-active") !== on) el.toggleAttribute("data-ptx-active", on);
  }

function processMessage(el) {
    const id = el.getAttribute("data-message-id");
    const rec = getRecord(id);
    const busy = translating.has(id);
    decorateButton(el, rec, busy);
    const hasView = el.querySelector(".ptx-view");
    if (!rec && !busy && !hasView) { setActive(el, false); return; }
    if (hasView) dropOrphans(el);
    const hosts = hostsOf(el);
    if (!hosts.length) return;
    const editing = !!el.querySelector("textarea");
    const want = rec && rec.view !== "orig" && !editing && !streamingIds.has(id);
    if (!want) {
      hosts.forEach(unmount);
      setActive(el, false);
      if (busy && !editing) mountPill(hosts[hosts.length - 1]);
      return;
    }
    const s = settings();
    const base = [rec.at, s.viewMode, s.keepTags, busy ? 1 : 0].join("|");
    hosts.forEach((host, i) => {
      const existing = viewAfter(host);
      const sig = `${base}|${host.innerHTML.length}|${host.childElementCount}|${host.className}`;
      if (existing && existing.dataset.sig === sig && host.hasAttribute("data-ptx-hidden")) return;
      const view = buildView(host, id, rec);
      view.classList.add("ptx-view");
      view.dataset.sig = sig;
      view.dataset.mid = id;
      if (i === hosts.length - 1) {
        const conversation = isConversation(currentChatId);
        if (busy) view.insertAdjacentHTML("beforeend", pillHtml());
        else if (!conversation) view.insertAdjacentHTML("beforeend", barHtml());
      }
      view._ptxFor = host;
      if (existing) existing.replaceWith(view);
      else host.after(view);
      host.setAttribute("data-ptx-hidden", "");
      markFlat(view);
    });
    setActive(el, true);
  }

function onViewClick(e) {
    const p = e.target.closest?.(".ptx-view .ptx-u[data-k]:not(.is-flat)");
    if (!p) return;
    if (e.target.closest("a, img, details > summary, button, input, textarea")) return;
    if (String(window.getSelection?.() || "").trim()) return;
    togglePara(p);
  }

function onViewKey(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const p = e.target.closest?.(".ptx-view .ptx-u[data-k]");
    if (!p || e.target !== p) return;
    e.preventDefault();
    togglePara(p);
  }

function togglePara(p) {
    const view = p.closest(".ptx-view");
    const open = !p.classList.contains("is-open");
    p.classList.toggle("is-open", open);
    p.setAttribute("aria-expanded", String(open));
    openState.set(`${view.dataset.mid}:${p.dataset.k}`, open);
  }