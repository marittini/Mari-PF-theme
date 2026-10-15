/** design: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createDesign(deps) {
  const mftModuleState = {
    showHomeBanner: undefined,
    homeView: undefined,
    personaView: undefined,
    chatLetterSpacing: undefined,
    chatLineHeight: undefined,
    roleplayPadding: undefined,
    translationReduction: undefined,
    previousLetterSpacing: undefined,
    previousLineHeight: undefined,
    previousRpPadding: undefined,
    previousTranslationReduction: undefined,
    previewAccent: undefined,
    previewFrame: undefined
  };

  function applyChatTypography() {
    deps.ui.state.html.style.setProperty('--mft-translation-reduction', mftModuleState.translationReduction + 'px');
    deps.ui.state.body.style.setProperty('--translation-reduction', mftModuleState.translationReduction + 'px');
    if (mftModuleState.roleplayPadding !== null) {
      deps.ui.state.html.style.setProperty('--mft-rp-text-padding', mftModuleState.roleplayPadding + 'px');
      deps.ui.state.body.style.setProperty('--rp-text-padding', mftModuleState.roleplayPadding + 'px');
    }
    deps.ui.state.html.style.setProperty('--mft-chat-letter-spacing', mftModuleState.chatLetterSpacing + 'px');
    deps.ui.state.html.style.setProperty('--mft-chat-line-height', String(mftModuleState.chatLineHeight));
    deps.ui.state.body.style.setProperty('--chat-letter-spacing', mftModuleState.chatLetterSpacing + 'px');
    deps.ui.state.body.style.setProperty('--chat-line-height', String(mftModuleState.chatLineHeight));
  }
  
  function pickerColor() {
    const value = (deps.theme.state.accentPaint || '#6656ec').trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    if (/^#[0-9a-f]{3}$/i.test(value)) return '#' + [...value.slice(1)].map(c => c + c).join('');
    const rgb = value.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
    return rgb ? '#' + rgb.slice(1, 4).map(n => Math.round(Math.min(255, Math.max(0, +n))).toString(16).padStart(2, '0')).join('') : '#6656ec';
  }
  
  async function setMainColor(value) {
    const direct = deps.adapter.engineActions().setAppAccentColor;
    if (direct) {
      direct(value);
      return;
    }
    const signal = deps.navigation.beginRoute('theme');
    try {
      const actions = await deps.navigation.actionsReady(signal);
      if (signal.aborted) return;
      deps.navigation.clearLayers(actions);
      actions.openRightPanel('settings');
      await deps.navigation.waitEngine(() => deps.adapter.engineActions().setSettingsTab, signal, 5000);
      if (signal.aborted) return;
      deps.adapter.engineActions().setSettingsTab('appearance');
      const set = await deps.navigation.waitEngine(() => deps.adapter.engineActions().setAppAccentColor, signal, 5000);
      if (signal.aborted) return;
      set(value);
      deps.navigation.clearLayers(deps.adapter.engineActions());
      deps.navigation.state.bridgeBusy = false;
      deps.ui.state.html.classList.remove('mft-transition');
      deps.navigation.state.routeIntent = 'own';
      deps.ui.own();
      deps.ui.notice('');
    } catch (error) {
      deps.navigation.routeFailure(error, () => setMainColor(value), signal);
    }
  }
  
  function liveColorPreview(color) {
    if (color === mftModuleState.previewAccent) return;
    mftModuleState.previewAccent = color;
    if (mftModuleState.previewFrame) return;
    mftModuleState.previewFrame = requestAnimationFrame(() => {
      mftModuleState.previewFrame = 0;
      if (deps.core.state.disposed || !mftModuleState.previewAccent) return;
      deps.ui.state.html.style.setProperty('--mft-user-accent', mftModuleState.previewAccent);
      deps.ui.state.html.style.setProperty('--mft-user-banner', `color-mix(in srgb, ${mftModuleState.previewAccent} 12%, ${deps.ui.state.html.dataset.theme === 'dark' ? '#111113' : '#f5f5f8'})`);
      const trigger = deps.ui.state.main.querySelector('.color-trigger');
      if (trigger) trigger.style.background = mftModuleState.previewAccent;
    });
  }
  
  function clearColorPreview() {
    if (mftModuleState.previewFrame) cancelAnimationFrame(mftModuleState.previewFrame);
    mftModuleState.previewFrame = 0;
    if (!mftModuleState.previewAccent) return;
    mftModuleState.previewAccent = '';
    deps.theme.state.themePaintSignature = '';
    if (!deps.core.state.disposed) deps.theme.syncTheme();
  }
  
  function colorPicker() {
    const panel = deps.ui.state.el('section', 'color-picker');
    panel.hidden = true;
    panel.setAttribute('aria-label', '지향색 선택');
    let hue = 0,
      sat = 0,
      val = 0,
      draft = pickerColor();
    const pad = deps.ui.state.el('div', 'color-plane');
    pad.tabIndex = 0;
    pad.setAttribute('role', 'slider');
    pad.setAttribute('aria-label', '채도와 밝기');
    const point = deps.ui.state.el('span', 'color-point');
    pad.append(point);
    const slider = deps.ui.state.el('input', 'hue-slider');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '360';
    slider.step = '1';
    slider.setAttribute('aria-label', '색조');
    const fields = deps.ui.state.el('div', 'color-fields'),
      hex = deps.ui.state.el('input', 'main-color');
    hex.type = 'text';
    hex.maxLength = 7;
    hex.setAttribute('aria-label', 'HEX');
    const rgb = [0, 1, 2].map(i => {
      const n = deps.ui.state.el('input');
      n.type = 'number';
      n.min = '0';
      n.max = '255';
      n.step = '1';
      n.setAttribute('aria-label', ['R', 'G', 'B'][i]);
      return n;
    });
    for (const [i, input] of [hex, ...rgb].entries()) {
      const label = deps.ui.state.el('label', 'color-field');
      label.append(deps.ui.state.el('span', '', ['HEX', 'R', 'G', 'B'][i]), input);
      fields.append(label);
    }
    const preview = deps.ui.state.el('span', 'color-preview');
    preview.setAttribute('aria-label', '선택한 색상');
    fields.append(preview);
    const hsvHex = () => {
      const c = val * sat,
        x = c * (1 - Math.abs(hue / 60 % 2 - 1)),
        m = val - c,
        channels = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
      return '#' + channels.map(n => Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('');
    };
    const render = () => {
      draft = hsvHex();
      hex.value = draft;
      rgb.forEach((n, i) => n.value = parseInt(draft.slice(1 + i * 2, 3 + i * 2), 16));
      slider.value = String(hue);
      pad.style.setProperty('--picker-hue', `hsl(${hue} 100% 50%)`);
      point.style.left = sat * 100 + '%';
      point.style.top = (1 - val) * 100 + '%';
      pad.setAttribute('aria-valuetext', `채도 ${Math.round(sat * 100)}%, 밝기 ${Math.round(val * 100)}%`);
      preview.style.background = draft;
      if (!panel.hidden) liveColorPreview(draft);
    };
    const fromHex = color => {
      if (!/^#[0-9a-f]{6}$/i.test(color)) return false;
      const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255),
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        d = max - min;
      hue = d ? (max === r ? (g - b) / d % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 : hue;
      if (hue < 0) hue += 360;
      sat = max ? d / max : 0;
      val = max;
      render();
      return true;
    };
    const move = e => {
      const box = pad.getBoundingClientRect();
      sat = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width));
      val = 1 - Math.max(0, Math.min(1, (e.clientY - box.top) / box.height));
      render();
    };
    pad.onpointerdown = e => {
      if (e.button !== 0) return;
      pad.setPointerCapture(e.pointerId);
      move(e);
    };
    pad.onpointermove = e => {
      if (pad.hasPointerCapture(e.pointerId)) move(e);
    };
    pad.onkeydown = e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      sat = Math.max(0, Math.min(1, sat + (e.key === 'ArrowRight' ? .01 : e.key === 'ArrowLeft' ? -.01 : 0)));
      val = Math.max(0, Math.min(1, val + (e.key === 'ArrowUp' ? .01 : e.key === 'ArrowDown' ? -.01 : 0)));
      render();
    };
    slider.oninput = () => {
      hue = Number(slider.value);
      render();
    };
    hex.oninput = () => {
      if (/^#[0-9a-f]{6}$/i.test(hex.value)) fromHex(hex.value);
    };
    hex.onchange = () => {
      if (!fromHex(hex.value)) {
        hex.setCustomValidity('#RRGGBB 형식으로 입력해 주세요.');
        hex.reportValidity();
      } else hex.setCustomValidity('');
    };
    rgb.forEach(n => n.oninput = n.onchange = () => fromHex('#' + rgb.map(x => Math.round(Math.max(0, Math.min(255, Number(x.value) || 0))).toString(16).padStart(2, '0')).join('')));
    const presets = deps.ui.state.el('div', 'color-presets');
    for (const color of ['#e35a75', '#e58f38', '#c0a52d', '#78973b', '#27a698', '#449ac2', '#6656ec', '#a76bc5', '#cf71a8', '#33343b']) {
      const b = deps.ui.button('', () => fromHex(color), 'color-swatch');
      b.style.background = color;
      b.setAttribute('aria-label', color);
      presets.append(b);
    }
    const actions = deps.ui.state.el('div', 'picker-actions'),
      cancel = deps.ui.button('취소', () => {
        clearColorPreview();
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }, 'quiet'),
      apply = deps.ui.button('적용', async () => {
        if (!fromHex(hex.value)) return;
        apply.disabled = true;
        await setMainColor(draft);
        clearColorPreview();
        apply.disabled = false;
        trigger.style.background = pickerColor();
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }, 'primary');
    actions.append(cancel, apply);
    panel.append(pad, slider, fields, presets, actions);
    const trigger = deps.ui.button('', () => {
      panel.hidden = !panel.hidden;
      trigger.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) fromHex(pickerColor());else clearColorPreview();
    }, 'color-trigger');
    trigger.style.background = pickerColor();
    trigger.setAttribute('aria-label', '지향색 선택 열기');
    trigger.setAttribute('aria-expanded', 'false');
    fromHex(draft);
    return {
      panel,
      trigger
    };
  }
  
  function saveDesignPreferences() {
    try {
      localStorage.setItem('mft-preferences', JSON.stringify({
        showHomeBanner: mftModuleState.showHomeBanner,
        homeView: mftModuleState.homeView,
        personaView: mftModuleState.personaView,
        chatLetterSpacing: mftModuleState.chatLetterSpacing,
        chatLineHeight: mftModuleState.chatLineHeight,
        roleplayPadding: mftModuleState.roleplayPadding,
        translationReduction: mftModuleState.translationReduction
      }));
    } catch {}
  }
  
  function themePreferences() {
    const section = deps.ui.state.el('section', 'theme-preferences');
    const group = (key, title, description) => {
      const box = deps.ui.state.el('section', 'design-group');
      box.dataset.designGroup = key;
      box.append(deps.ui.state.el('h2', '', title), deps.ui.state.el('p', 'design-description', description));
      section.append(box);
      return box;
    };
    const colors = group('color', '색상', '아이콘과 사용자 말풍선에 적용할 지향색입니다.');
    const picker = colorPicker(),
      row = deps.ui.state.el('div', 'preference-row');
    row.append(deps.ui.state.el('strong', '', '지향색'), picker.trigger);
    colors.append(row, picker.panel);
    const library = group('library', '홈·라이브러리', '갤러리는 격자, 스크롤은 좌우로 넘기는 카드입니다.');
    const banner = deps.ui.state.el('label', 'preference-row');
    banner.append(deps.ui.state.el('strong', '', '홈 배너 표시'));
    const toggle = deps.ui.state.el('input', 'banner-toggle');
    toggle.type = 'checkbox';
    toggle.checked = mftModuleState.showHomeBanner;
    toggle.onchange = () => {
      mftModuleState.showHomeBanner = toggle.checked;
      saveDesignPreferences();
    };
    banner.append(toggle);
    library.append(banner);
    for (const [kind, label, current] of [['home', '홈 보기', mftModuleState.homeView], ['personas', '페르소나 라이브러리 보기', mftModuleState.personaView]]) {
      const setting = deps.ui.state.el('label', 'preference-row view-preference');
      setting.append(deps.ui.state.el('strong', '', label));
      const select = deps.ui.state.el('select', 'view-select');
      select.setAttribute('aria-label', label);
      select.dataset.viewPreference = kind;
      for (const [value, text] of [['gallery', '갤러리'], ['scroll', '스크롤']]) {
        const option = deps.ui.state.el('option', '', text);
        option.value = value;
        select.append(option);
      }
      select.value = current;
      select.onchange = () => {
        if (kind === 'home') mftModuleState.homeView = select.value;else mftModuleState.personaView = select.value;
        saveDesignPreferences();
      };
      setting.append(select);
      library.append(setting);
    }
    const chat = group('chat', '채팅 글자·여백', '원문 크기는 순정 설정을 따릅니다. 번역 크기 차이는 별도 표시 번역문에만 적용됩니다.');
    for (const [key, label, min, max, step, value] of [['chatLetterSpacing', '채팅 자간', -1, 4, .1, mftModuleState.chatLetterSpacing], ['chatLineHeight', '채팅 행간', 1.2, 2.8, .05, mftModuleState.chatLineHeight], ['translationReduction', '별도 번역문 크기 줄이기', 0, 12, 1, mftModuleState.translationReduction], ['roleplayPadding', '롤플레이 말풍선 좌우 여백', 0, 40, 1, mftModuleState.roleplayPadding ?? 6]]) {
      const row = deps.ui.state.el('label', 'spacing-setting'),
        caption = deps.ui.state.el('strong', '', label),
        input = deps.ui.state.el('input');
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = value;
      input.dataset.spacingSetting = key;
      input.setAttribute('aria-label', label);
      const output = deps.ui.state.el('output', '', key !== 'chatLineHeight' ? value + 'px' : String(value));
      input.oninput = () => {
        if (key === 'chatLetterSpacing') mftModuleState.chatLetterSpacing = Number(input.value);else if (key === 'chatLineHeight') mftModuleState.chatLineHeight = Number(input.value);else if (key === 'translationReduction') mftModuleState.translationReduction = Number(input.value);else mftModuleState.roleplayPadding = Number(input.value);
        output.textContent = key !== 'chatLineHeight' ? input.value + 'px' : input.value;
        applyChatTypography();
      };
      input.onchange = saveDesignPreferences;
      row.append(caption, input, output);
      chat.append(row);
    }
    const preview = deps.ui.state.el('div', 'typography-preview');
    preview.append(deps.ui.state.el('p', '', '원문: 글자와 여백을 편안하게 조절하세요.'), deps.ui.state.el('p', 'translation-size-preview', '번역문: 선택한 px만큼 작은 크기로 표시됩니다.'));
    chat.append(preview);
    return section;
  }

  const initialize = [
    { order: 2400, run() {
      mftModuleState.showHomeBanner = true;
    } },
    { order: 2401, run() {
      mftModuleState.homeView = 'scroll';
    } },
    { order: 2402, run() {
      mftModuleState.personaView = 'gallery';
    } },
    { order: 2403, run() {
      mftModuleState.chatLetterSpacing = 0;
    } },
    { order: 2404, run() {
      mftModuleState.chatLineHeight = 1.8;
    } },
    { order: 2405, run() {
      mftModuleState.roleplayPadding = null;
    } },
    { order: 2406, run() {
      mftModuleState.translationReduction = 0;
    } },
    { order: 2500, run() {
      try {
        const prefs = JSON.parse(localStorage.getItem('mft-preferences') || '{}');
        mftModuleState.showHomeBanner = prefs.showHomeBanner !== false;
        mftModuleState.homeView = prefs.homeView === 'gallery' ? 'gallery' : 'scroll';
        mftModuleState.personaView = prefs.personaView === 'scroll' ? 'scroll' : 'gallery';
        mftModuleState.chatLetterSpacing = Math.min(4, Math.max(-1, Number(prefs.chatLetterSpacing) || 0));
        mftModuleState.chatLineHeight = Math.min(2.8, Math.max(1.2, Number(prefs.chatLineHeight) || 1.8));
        mftModuleState.translationReduction = Math.min(12, Math.max(0, Number(prefs.translationReduction) || 0));
        if (typeof prefs.roleplayPadding === 'number' && Number.isFinite(prefs.roleplayPadding)) mftModuleState.roleplayPadding = Math.min(40, Math.max(0, prefs.roleplayPadding));
      } catch {}
    } },
    { order: 2600, run() {
      mftModuleState.previousLetterSpacing = deps.ui.state.html.style.getPropertyValue('--mft-chat-letter-spacing');
    } },
    { order: 2601, run() {
      mftModuleState.previousLineHeight = deps.ui.state.html.style.getPropertyValue('--mft-chat-line-height');
    } },
    { order: 2602, run() {
      mftModuleState.previousRpPadding = deps.ui.state.html.style.getPropertyValue('--mft-rp-text-padding');
    } },
    { order: 2603, run() {
      mftModuleState.previousTranslationReduction = deps.ui.state.html.style.getPropertyValue('--mft-translation-reduction');
    } },
    { order: 2800, run() {
      applyChatTypography();
    } },
    { order: 3100, run() {
      mftModuleState.previewAccent = '';
    } },
    { order: 3101, run() {
      mftModuleState.previewFrame = 0;
    } }
  ];
  const cleanup = [
    { order: 3, run() {
      for (const [key, value] of [['--mft-chat-letter-spacing', mftModuleState.previousLetterSpacing], ['--mft-chat-line-height', mftModuleState.previousLineHeight], ['--mft-rp-text-padding', mftModuleState.previousRpPadding], ['--mft-translation-reduction', mftModuleState.previousTranslationReduction]]) {
        if (value) deps.ui.state.html.style.setProperty(key, value);else deps.ui.state.html.style.removeProperty(key);
      }
    } },
    { order: 23, run() {
      if (mftModuleState.previewFrame) cancelAnimationFrame(mftModuleState.previewFrame);
    } },
    { order: 24, run() {
      mftModuleState.previewFrame = 0;
    } }
  ];
  return { state: mftModuleState, initialize, cleanup, applyChatTypography, pickerColor, setMainColor, liveColorPreview, clearColorPreview, colorPicker, saveDesignPreferences, themePreferences };
}
