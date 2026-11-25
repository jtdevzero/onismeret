/* BiasMap HU — approved C-direction visual experiment. Preview only. */
(function () {
  'use strict';
  if (!window.BiasAnimCSS) return;
  const previousLength=window.BiasAnimCSS.length;
  window.BiasAnimCSS += `
.bp{--ground:#080d1b;--surface:#121d30;--surface-2:#20304a;--ink:#f1f7ff;--muted:#b0bfd6;--faint:#94a9c7;--rule:#344760;--good:#6de5b2;--bad:#ff899b;color:var(--ink)}
.bp:not(.still) .bp-stage{isolation:isolate;border:1px solid #42617c;border-radius:22px;background:radial-gradient(ellipse at 52% 35%,#213750 0%,#0e1b30 45%,#080d1b 90%);box-shadow:0 15px 45px -22px #000b20,0 0 0 1px rgba(118,200,239,.13) inset}
.bp:not(.still) .bp-stage::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:linear-gradient(90deg,transparent 49.85%,rgba(83,155,193,.075) 50%,transparent 50.15%),linear-gradient(0deg,transparent 49.85%,rgba(83,155,193,.075) 50%,transparent 50.15%);background-size:34px 34px;mask-image:linear-gradient(to bottom,transparent 0%,#000 25%,#000 82%,transparent 100%)}
.bp:not(.still) .bp-cap,.bp:not(.still) .bp-svg,.bp:not(.still) .bp-ctl{position:relative;z-index:1}
.bp:not(.still) .bp-cap{gap:14px;align-items:start;padding:19px 22px 4px}
.bp:not(.still) .bp-no{color:#83dff4;font-weight:700;letter-spacing:.08em;padding-top:5px}
.bp:not(.still) .bp-text{font-size:clamp(15px,2vw,19px);line-height:1.45;letter-spacing:-.01em;text-shadow:0 1px 14px #061322}
.bp:not(.still) .bp-text b{color:#8de7f5}
.bp:not(.still) .bp-svg{filter:drop-shadow(0 9px 12px rgba(0,0,0,.16))}
.bp:not(.still) .bp-ctl{padding:10px 14px 15px;gap:10px;background:linear-gradient(0deg,rgba(10,21,38,.94),rgba(10,21,38,.42))}
.bp:not(.still) .bp-btn{width:44px;height:44px;border-color:#49637d;background:#1a3048;color:#f0f8ff;transition:background .18s,box-shadow .18s,border-color .18s}
.bp:not(.still) .bp-btn:hover{background:#264762;border-color:#8de7f5;box-shadow:0 0 0 3px rgba(141,231,245,.12)}
.bp:not(.still) .bp-btn[aria-pressed="true"]{background:#244a51;border-color:#8de7f5;color:#8de7f5}
.bp:not(.still) .bp-dot{height:44px;min-width:0}
.bp:not(.still) .bp-dot::before,.bp:not(.still) .bp-dot i{top:19px;height:6px}
.bp:not(.still) .bp-dot::before{background:#31465f}
.bp:not(.still) .bp-dot i{background:var(--q);box-shadow:0 0 12px color-mix(in srgb,var(--q) 48%,transparent)}
.bp:not(.still) .bp-card{background:radial-gradient(ellipse at 50% 40%,#213953,#091120 78%);z-index:2}
.bp:not(.still) .bp-pill{border-color:#48647f;background:#182c45;color:#eff8ff}
.bp:not(.still) .bp-pill.primary{background:#90e7f5;color:#081321;border-color:#90e7f5}
.bp:not(.still) .bp-menu{background:#14243a;border-color:#42617c;box-shadow:0 20px 50px #030912}
.bp:not(.still) .bp-name{color:#f1f7ff}
.bp:not(.still) .bp-line{color:#b7c7df}
@media(max-width:390px){.bp:not(.still) .bp-cap{padding:13px 13px 2px;gap:8px}.bp:not(.still) .bp-ctl{gap:5px;padding:7px 7px 10px}.bp:not(.still) .bp-btn{width:40px;height:40px}.bp:not(.still) .bp-dot{height:40px}.bp:not(.still) .bp-dot::before,.bp:not(.still) .bp-dot i{top:17px}}
@media(prefers-reduced-motion:reduce){.bp *{transition:none!important;animation:none!important}}
`;
  // Direct deep links may mount a player before this final preview script loads.
  // Apply the same scoped styling to those already-mounted shadow roots.
  const additions=window.BiasAnimCSS.slice(previousLength);
  document.querySelectorAll('*').forEach(host=>{
    const root=host.shadowRoot;
    if (root?.querySelector('.bp')) {
      const style=document.createElement('style');
      style.textContent=additions;
      root.append(style);
    }
  });
})();
