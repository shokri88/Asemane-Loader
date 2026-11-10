/* AsmaneLoader — vanilla JS, no global CSS resets, no scroll locking. */
(function (window, document) {
  'use strict';
  const cinematic = ['converge','crosswind','cascade','spiral','letters','blueprint'];
  const variants = ['breath', 'line', 'reveal', 'orbit', 'frame', 'rise', 'draw', 'assemble', 'weave', 'pulse', 'type', 'signature', ...cinematic];
  const script = document.currentScript;
  const defaultLogo = new URL('assets/logo.png', script ? script.src : document.baseURI).href;
  function create(options = {}) {
    const isScene = cinematic.includes(options.variant);
    const reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    const entrance = isScene && !reduced ? 2100 : 0;
    const started = Date.now();
    const host = options.target || document.body;
    if (!host) throw new Error('Create the loader after <body> exists.');
    const el = document.createElement('div');
    el.className = 'asm-loader' + (options.inline ? ' asm-inline' : '');
    el.dataset.variant = variants.includes(options.variant) ? options.variant : 'line';
    if (isScene) el.classList.add('asm-scene');
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
    if (isScene || ['draw','assemble','weave','pulse','type','signature'].includes(el.dataset.variant)) {
      mark.classList.add('asm-segmented');
      logo.remove();
      // Each layer uses the exact original pixels, with independent clipping.
      const regions = [
        [0,0,100,21.1], [0,14,100,37.1],
        [0,40,94.1,83.5], [97.1,40,100,74.2],
        [0,91.8,26.5,100], [28.8,91.8,75.8,100], [77.5,91.8,100,100]
      ];
      if (isScene && options.variant === 'letters') {
        // Keep original wordmark pixels; reveal narrow strips as a typographic wave.
        regions.splice(4);
        for (let x = 0; x < 100; x += 5) regions.push([x,91.8,x+5,100]);
      }
      regions.forEach(([left,top,right,bottom], index) => {
        const layer = document.createElement('span');
        layer.className = 'asm-piece asm-piece-' + index;
        layer.style.setProperty('--piece-index', index);
        if (isScene) {
          const angle = index * 2.399963;
          let x = Math.cos(angle), y = Math.sin(angle), rotation = 0;
          switch (options.variant) {
            case 'converge': x = index % 2 ? 1 : -1; y = index % 3 - 1; break;
            case 'crosswind': x = index % 2 ? -1 : 1; y = index < 4 ? -.45 : .55; break;
            case 'cascade': x = (index % 3 - 1)*.65; y = index < 4 ? -1 : 1; break;
            case 'spiral': rotation = index % 2 ? 65 : -65; break;
            case 'letters': x = index < 4 ? (index % 2 ? 1 : -1) : (index-13.5)/10; y = index < 4 ? -.8 : 1; break;
            case 'blueprint': x = index % 2 ? 0 : (index % 4 ? 1 : -1); y = index % 2 ? (index % 3 ? -1 : 1) : 0; break;
          }
          layer.style.setProperty('--fly-x', x.toFixed(3));
          layer.style.setProperty('--fly-y', y.toFixed(3));
          layer.style.setProperty('--fly-rotation', rotation + 'deg');
          layer.style.setProperty('--arrival-delay', Math.min(index * 65, 650) + 'ms');
          layer.style.setProperty('--depart-delay', Math.min(index * 30, 250) + 'ms');
        }
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
    let timer, removal, departure, disposed = false;
    function onLoad() { hide(); }
    function cleanup() { clearTimeout(timer); window.removeEventListener('load', onLoad); }
    function hide() {
      if (disposed) return;
      disposed = true; cleanup();
      if (!isScene || reduced) {
        el.classList.add('asm-leaving');
        removal = setTimeout(() => el.remove(), reduced ? 0 : 480);
        return;
      }
      // Finish assembling even when load fires immediately from cache.
      departure = setTimeout(() => {
        el.classList.add('asm-scattering');
        removal = setTimeout(() => el.remove(), 1450);
      }, Math.max(0, entrance - (Date.now() - started)));
    }
    function destroy() { disposed = true; cleanup(); clearTimeout(departure); clearTimeout(removal); el.remove(); }
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
