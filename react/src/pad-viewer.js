(function () {
  // faces unwarped from the hero photo (assets/hero-pad.png) so the 3D pad matches it exactly
  const TEX = 'assets/pad-3d/';

  class PadViewer extends HTMLElement {
    connectedCallback() {
      if (this._booted) return;
      this._booted = true;

      const bg = this.getAttribute('background') || '#ffffff';

      const host = document.createElement('div');
      host.style.cssText =
        'position:absolute;inset:0;overflow:hidden;background:' + bg +
        ';perspective:1100px;touch-action:none;cursor:grab;border-radius:inherit;';
      this.appendChild(host);
      this._host = host;

      const stage = document.createElement('div');
      stage.style.cssText =
        'position:absolute;top:50%;left:50%;width:0;height:0;transform-style:preserve-3d;';
      host.appendChild(stage);
      this._stage = stage;

      const pad = document.createElement('div');
      pad.style.cssText = 'position:absolute;transform-style:preserve-3d;';
      stage.appendChild(pad);

      // pad stands upright like before: honeycomb face toward the viewer, fluted walls around.
      // W/H = honeycomb face, DEPTH = pad thickness (tweak for a thicker/thinner pad)
      const W = 360, H = 277, DEPTH = 64;

      // solid box: six photo faces (hidden faces reuse the visible ones, mirrored)
      const face = (img, w, h, transform, tone, extra) => {
        const el = document.createElement('div');
        el.style.cssText =
          `position:absolute;left:${-w / 2}px;top:${-h / 2}px;width:${w}px;height:${h}px;` +
          `transform:${transform} ${extra || ''};backface-visibility:hidden;-webkit-backface-visibility:hidden;` +
          `background:#d6a068 url("${TEX}${img}.jpg") center/100% 100% no-repeat;` +
          `filter:brightness(${tone});`;
        pad.appendChild(el);
      };
      face('top', W, H, `translateZ(${DEPTH / 2}px)`, 1);
      face('top', W, H, `rotateY(180deg) translateZ(${DEPTH / 2}px)`, 0.85, 'scaleX(-1)');
      face('side-short-v', DEPTH, H, `rotateY(-90deg) translateZ(${W / 2}px)`, 0.85);
      face('side-short-v', DEPTH, H, `rotateY(90deg) translateZ(${W / 2}px)`, 0.85, 'scaleX(-1)');
      face('side-long', W, DEPTH, `rotateX(90deg) translateZ(${H / 2}px)`, 1.0, 'scaleY(-1)');
      face('side-long', W, DEPTH, `rotateX(-90deg) translateZ(${H / 2}px)`, 0.7);

      const shadow = document.createElement('div');
      shadow.style.cssText =
        `position:absolute;left:${-W / 2}px;top:${H / 2 + 54}px;width:${W * 1.05}px;height:${H * 0.62}px;` +
        `transform:rotateX(90deg);background:radial-gradient(ellipse at center, rgba(16,22,26,0.22), transparent 68%);` +
        `filter:blur(10px);`;
      stage.appendChild(shadow);

      // interaction — default pose matches the product sheet: front face toward viewer,
      // right edge and top edge visible
      const RX0 = -10, RY0 = 32; // starting angle
      let rx = RX0, ry = RY0, vel = 0, dragging = false, lastX = 0, lastY = 0, swayT = 0;
      const auto = this.hasAttribute('autorotate');
      const apply = () => {
        stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      apply();

      const down = (e) => {
        dragging = true;
        host.style.cursor = 'grabbing';
        const p = e.touches ? e.touches[0] : e;
        lastX = p.clientX; lastY = p.clientY;
      };
      const move = (e) => {
        if (!dragging) return;
        const p = e.touches ? e.touches[0] : e;
        const dx = p.clientX - lastX, dy = p.clientY - lastY;
        lastX = p.clientX; lastY = p.clientY;
        ry += dx * 0.45;
        rx = Math.max(-80, Math.min(80, rx - dy * 0.35));
        swayT = 0;
        apply();
        if (e.cancelable) e.preventDefault();
      };
      const up = () => { dragging = false; host.style.cursor = 'grab'; };

      host.addEventListener('mousedown', down);
      host.addEventListener('touchstart', down, { passive: true });
      window.addEventListener('mousemove', move);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('mouseup', up);
      window.addEventListener('touchend', up);

      const tick = () => {
        this._raf = requestAnimationFrame(tick);
        if (!dragging && auto) {
          swayT += 0.004;
          ry = RY0 + Math.sin(swayT) * 12;
          rx = RX0 + Math.sin(swayT * 0.7) * 3;
          apply();
        }
      };
      tick();

      const fit = () => {
        const s = Math.min((host.clientWidth || 400) / 480, (host.clientHeight || 300) / 380, 1.4);
        pad.style.transform = `scale(${Math.max(0.5, s)})`;
      };
      fit();
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(fit);
        this._ro.observe(host);
      }

      this._cleanup = () => {
        cancelAnimationFrame(this._raf);
        window.removeEventListener('mousemove', move);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchend', up);
        if (this._ro) this._ro.disconnect();
      };
    }

    disconnectedCallback() { if (this._cleanup) this._cleanup(); }
  }

  if (!customElements.get('pad-viewer')) customElements.define('pad-viewer', PadViewer);
})();
