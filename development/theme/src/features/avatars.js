/** avatars: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createAvatars(deps) {
  const mftModuleState = {
    nativeCharacterIds: undefined,
    imageObserver: undefined,
    cropTimer: undefined,
    cropRequest: undefined,
    cropOriginals: undefined,
    nativeCrops: undefined
  };

  function observeImages() {
    if (deps.navigation.state.restoreScrollTarget?.view === deps.navigation.state.view) {
      deps.ui.state.main.scrollTop = deps.navigation.state.restoreScrollTarget.scroll;
      deps.navigation.state.restoreScrollTarget = null;
    }
    mftModuleState.imageObserver?.disconnect();
    mftModuleState.imageObserver = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) {
        const im = e.target;
        im.src = im.dataset.src;
        im.removeAttribute('data-src');
        mftModuleState.imageObserver.unobserve(im);
      }
    }, {
      root: deps.ui.state.main,
      rootMargin: '80px'
    });
    deps.ui.state.main.querySelectorAll('img[data-src]').forEach(n => mftModuleState.imageObserver.observe(n));
  }
  
  function cropStyle(im, crop) {
    if (!crop || typeof crop !== 'object') return;
    const finite = v => typeof v === 'number' && Number.isFinite(v);
    if (['srcX', 'srcY', 'srcWidth', 'srcHeight'].every(k => finite(crop[k]))) {
      const {
        srcX: x,
        srcY: y,
        srcWidth: w,
        srcHeight: h
      } = crop;
      if (w < .01 || h < .01 || w > 1 || h > 1 || x < 0 || y < 0 || x + w > 1.001 || y + h > 1.001) return;
      Object.assign(im.style, {
        width: 100 / w + '%',
        height: 100 / h + '%',
        left: -x / w * 100 + '%',
        top: -y / h * 100 + '%',
        maxWidth: 'none',
        maxHeight: 'none',
        objectFit: 'fill'
      });
    } else if (finite(crop.zoom) && crop.zoom >= 1 && crop.zoom <= 20) {
      const x = finite(crop.offsetX) ? Math.max(-100, Math.min(100, crop.offsetX)) : 0,
        y = finite(crop.offsetY) ? Math.max(-100, Math.min(100, crop.offsetY)) : 0;
      if (crop.fullImage) im.style.objectFit = 'contain';
      if (crop.zoom > 1 || crop.fullImage) im.style.transform = `scale(${crop.zoom}) translate(${x}%, ${y}%)`;
    }
  }
  
  function avatar(path, name, cls = 'art', crop = null) {
    const wrap = deps.ui.state.el('div', cls);
    wrap.setAttribute('aria-label', name);
    if (path) {
      try {
        const u = new URL(path, location.origin);
        if (u.origin === location.origin && /^https?:$/.test(u.protocol)) {
          const im = deps.ui.state.el('img');
          im.alt = '';
          im.loading = 'lazy';
          im.decoding = 'async';
          im.dataset.src = u.href;
          cropStyle(im, crop);
          im.onerror = () => im.remove();
          wrap.append(im);
        }
      } catch {}
    }
    return wrap;
  }
  
  function scheduleCrops() {
    if (mftModuleState.cropTimer || deps.core.state.disposed || document.hidden || !document.querySelector('[data-chat-mode="roleplay"]')) return;
    mftModuleState.cropTimer = deps.core.later(() => {
      mftModuleState.cropTimer = null;
      refreshNativeCrops();
    }, 100);
  }
  
  function imageKey(path) {
    try {
      return new URL(path, location.origin).pathname;
    } catch {
      return '';
    }
  }
  // Match current persona identity and displayed photo before falling back to an older message snapshot.
  
  function applyNativeCrops() {
    for (const im of document.querySelectorAll('[data-chat-mode="roleplay"] :is(.mari-message-avatar,.rpg-avatar-panel,.rpg-avatar-panel-media,.mari-roleplay-avatar-panel-rail) img')) {
      const persona = deps.adapter.personaCropForImage(im),
        crop = persona.found ? persona.crop : mftModuleState.nativeCrops.get(imageKey(im.getAttribute('src')));
      if (!crop) continue;
      if (!mftModuleState.cropOriginals.has(im)) mftModuleState.cropOriginals.set(im, im.getAttribute('style'));
      im.style.inset = 'auto';
      cropStyle(im, crop);
      const frame = im.parentElement,
        box = frame?.getBoundingClientRect();
      if (box && Math.abs(box.width - box.height) > 1 && im.naturalWidth && im.naturalHeight && ['srcX', 'srcY', 'srcWidth', 'srcHeight'].every(k => Number.isFinite(crop[k])) && crop.srcWidth > 0 && crop.srcHeight > 0) {
        const scale = Math.max(box.width / (im.naturalWidth * crop.srcWidth), box.height / (im.naturalHeight * crop.srcHeight));
        const w = im.naturalWidth * scale,
          h = im.naturalHeight * scale;
        Object.assign(im.style, {
          width: w + 'px',
          height: h + 'px',
          left: (box.width - w * crop.srcWidth) / 2 - w * crop.srcX + 'px',
          top: (box.height - h * crop.srcHeight) / 2 - h * crop.srcY + 'px',
          objectFit: 'fill',
          transform: 'none'
        });
      }
      im.style.position = 'absolute';
      im.dataset.mftCrop = 'true';
    }
    for (const n of mftModuleState.cropOriginals.keys()) if (!n.isConnected) mftModuleState.cropOriginals.delete(n);
  }
  
  async function refreshNativeCrops() {
    if (deps.ui.state.root.dataset.native !== 'true') return;
    applyNativeCrops();
    const ids = [...new Set([...mftModuleState.nativeCharacterIds, ...[...document.querySelectorAll('[data-chat-mode="roleplay"] [data-card-css]')].map(n => n.dataset.cardCss).filter(Boolean)])].slice(0, 180);
    if (!ids.length) return;
    const key = ids.join(',');
    if (mftModuleState.nativeCrops.lastIds === key) {
      applyNativeCrops();
      return;
    }
    mftModuleState.cropRequest?.abort();
    const c = new AbortController();
    mftModuleState.cropRequest = c;
    try {
      const res = await fetch('/api/characters/summaries', {
        method: 'POST',
        credentials: 'same-origin',
        signal: c.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids
        })
      });
      if (!res.ok) return;
      const rows = await res.json();
      if (deps.core.state.disposed) return;
      for (const r of rows) if (r.avatarUrl && r.avatarCrop) mftModuleState.nativeCrops.set(imageKey(r.avatarUrl), r.avatarCrop);
      mftModuleState.nativeCrops.lastIds = key;
      applyNativeCrops();
    } catch (e) {/* Images retain the engine fallback on request failure. */} finally {
      if (mftModuleState.cropRequest === c) mftModuleState.cropRequest = null;
    }
  }
  
  function onImageLoad(e) {
    if (deps.ui.state.root.dataset.native === 'true' && e.target instanceof HTMLImageElement && e.target.closest('[data-chat-mode="roleplay"] :is(.mari-message-avatar,.rpg-avatar-panel,.rpg-avatar-panel-media,.mari-roleplay-avatar-panel-rail)')) scheduleCrops();
  }

  const initialize = [
    { order: 1204, run() {
      mftModuleState.nativeCharacterIds = [];
    } },
    { order: 1312, run() {
      mftModuleState.imageObserver = void 0;
    } },
    { order: 15200, run() {
      mftModuleState.cropTimer = null;
    } },
    { order: 15201, run() {
      mftModuleState.cropRequest = null;
    } },
    { order: 15300, run() {
      mftModuleState.cropOriginals = new Map();
    } },
    { order: 15301, run() {
      mftModuleState.nativeCrops = new Map();
    } }
  ];
  const cleanup = [
    { order: 43, run() {
      mftModuleState.cropRequest?.abort();
    } },
    { order: 44, run() {
      document.removeEventListener('load', onImageLoad, true);
    } },
    { order: 49, run() {
      for (const [n, old] of mftModuleState.cropOriginals) if (n.isConnected) {
        if (old === null) n.removeAttribute('style');else n.setAttribute('style', old);
        n.removeAttribute('data-mft-crop');
      }
    } },
    { order: 67, run() {
      mftModuleState.nativeCrops.clear();
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, observeImages, cropStyle, avatar, scheduleCrops, imageKey, applyNativeCrops, refreshNativeCrops, onImageLoad };
}
