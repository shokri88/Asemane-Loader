/* AsmaneLoader — vanilla JS, no global CSS resets, no scroll locking. */
(function (window, document) {
  'use strict';
  const variants = ['breath', 'line', 'reveal', 'orbit', 'frame', 'rise', 'draw', 'assemble', 'weave', 'pulse', 'type', 'signature'];
  const script = document.currentScript;
  const defaultLogo = new URL('assets/logo.png', script ? script.src : document.baseURI).href;
  function create(options = {}) {
    const host = options.target || document.body;
    if (!host) throw new Error('Create the loader after <body> exists.');
    const el = document.createElement('div');
    el.className = 'asm-loader' + (options.inline ? ' asm-inline' : '');
    el.dataset.variant = variants.includes(options.variant) ? options.variant : 'line';
    el.dataset.theme = options.theme === 'dark' ? 'dark' : 'light';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    if (options.size) el.style.setProperty('--asm-size', Number(options.size) + 'px');
    if (options.accent) el.style.setProperty('--asm-accent', options.accent);
    if (options.background) el.style.setProperty('--asm-bg', options.background);
    if (options.speed) el.style.setProperty('--asm-speed', Number(options.speed) + 's');
    const stage = document.createElement('div'); stage.className = 'asm-stage'; stage.setAttribute('aria-hidden','true');
    const mark = document.createElement('div'); mark.className = 'asm-mark';
    const logo = new Image(); logo.className = 'asm-logo'; logo.alt = ''; logo.src = options.logo || defaultLogo;
    mark.append(logo);
    if (['draw','assemble','weave','pulse','type','signature'].includes(el.dataset.variant)) {
      mark.classList.add('asm-segmented');
      logo.remove();
      // Each layer uses the exact original pixels, with independent clipping.
      const regions = [
        [0,0,100,21.1], [0,14,100,37.1],
        [0,40,94.1,83.5], [97.1,40,100,74.2],
        [0,91.8,26.5,100], [28.8,91.8,75.8,100], [77.5,91.8,100,100]
      ];
      regions.forEach(([left,top,right,bottom], index) => {
        const layer = document.createElement('span');
        layer.className = 'asm-piece asm-piece-' + index;
        layer.style.setProperty('--piece-index', index);
        const crop = document.createElement('span'); crop.className = 'asm-crop';
        crop.style.clipPath = `inset(${top}% ${100-right}% ${100-bottom}% ${left}%)`;
        if (index === 0) crop.style.clipPath = 'polygon(0 0,100% 0,100% 21.1%,97% 21.1%,97% 12%,0 12%)';
        if (index === 1) crop.style.clipPath = 'polygon(0 14%,97% 14%,97% 21.2%,100% 21.2%,100% 37.1%,0 37.1%)';
        const image = logo.cloneNode(); image.className = 'asm-logo asm-fragment';
        crop.append(image); layer.append(crop); mark.append(layer);
      });
    }
    if (el.dataset.variant === 'reveal') { const copy = logo.cloneNode(); copy.classList.add('asm-logo-copy'); mark.append(copy); }
    const detail = document.createElement('span'); detail.className = 'asm-detail';
    const label = document.createElement('span'); label.className = 'asm-sr'; label.textContent = options.label || 'در حال بارگذاری';
    stage.append(mark, detail); el.append(stage, label); host.append(el);
    let timer, removal, disposed = false;
    function onLoad() { hide(); }
    function cleanup() { clearTimeout(timer); window.removeEventListener('load', onLoad); }
    function hide() { if(disposed) return; disposed = true; cleanup(); el.classList.add('asm-leaving'); removal = setTimeout(() => el.remove(), 480); }
    function destroy() { disposed = true; cleanup(); clearTimeout(removal); el.remove(); }
    // Safety timeout prevents the overlay from blocking a site indefinitely.
    if (!options.inline) timer = setTimeout(hide, Number(options.maxWait) > 0 ? Number(options.maxWait) : 10000);
    if (options.autoHide !== false && !options.inline) {
      if (document.readyState === 'complete') queueMicrotask(hide);
      else window.addEventListener('load', onLoad, {once:true});
    }
    return {element:el, hide, destroy};
  }
  window.AsmaneLoader = Object.freeze({create, variants:Object.freeze(variants)});
})(window, document);
