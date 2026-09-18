// The prism trails behind every page: a deterministic composition that
// drifts toward a vanishing point, drawn on a fixed canvas.
(function () {
  const c = document.getElementById('trails');
  const ctx = c.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, trails = [], t0 = performance.now();
  let mx = 0, my = 0, tx = 0, ty = 0;

  // deterministic pseudo-random so the composition is stable between loads
  let seed = 20260917;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

  function make() {
    trails = [];
    const vp = { x: W * 0.64, y: H * 0.36 };          // vanishing point, upper right of centre
    const n = W < 700 ? 54 : 96;
    for (let i = 0; i < n; i++) {
      const side = rnd();
      // start off-screen along the left edge or bottom edge
      const sx = side < 0.6 ? -W * 0.15 : rnd() * W * 0.7;
      const sy = side < 0.6 ? H * (0.45 + rnd() * 0.75) : H * 1.15;
      const spread = (rnd() - 0.5) * 0.06;
      const ex = vp.x + (rnd() - 0.5) * W * 0.04;
      const ey = vp.y + (rnd() - 0.5) * H * 0.03;
      const cx = sx + (ex - sx) * (0.45 + rnd() * 0.2) + spread * W;
      const cy = sy + (ey - sy) * (0.25 + rnd() * 0.2) + (rnd() - 0.5) * H * 0.12;
      const thick = rnd();
      trails.push({
        sx, sy, cx, cy, ex, ey,
        w: thick > 0.9 ? 2.2 + rnd() * 2.2 : thick > 0.6 ? 0.9 + rnd() * 0.9 : 0.35 + rnd() * 0.5,
        a: thick > 0.9 ? 0.55 : thick > 0.6 ? 0.28 : 0.12,
        phase: rnd() * Math.PI * 2, speed: 0.15 + rnd() * 0.35,
        hue: rnd()
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed = 20260917; make(); draw(0);
  }

  function stroke(tr, dx, dy, color, alpha, width) {
    ctx.beginPath();
    ctx.moveTo(tr.sx + dx, tr.sy + dy);
    ctx.quadraticCurveTo(tr.cx + dx, tr.cy + dy, tr.ex + dx, tr.ey + dy);
    ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.stroke();
  }

  function draw(t) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H);
    const ox = tx, oy = ty;
    const vp = { x: W * 0.64 + ox, y: H * 0.36 + oy };

    // atmosphere: a soft haze under the trails
    const haze = ctx.createRadialGradient(vp.x, vp.y, 0, vp.x, vp.y, Math.max(W, H) * 0.55);
    haze.addColorStop(0, 'rgba(255,255,255,0.10)');
    haze.addColorStop(0.35, 'rgba(155,231,255,0.035)');
    haze.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = haze; ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const tr of trails) {
      const shimmer = reduce ? 1 : 0.7 + 0.3 * Math.sin(t * 0.001 * tr.speed + tr.phase);
      const a = tr.a * shimmer;
      // chromatic fringe: cyan and violet ghosts offset a hair from the white core
      if (tr.w > 0.8) {
        stroke(tr, ox - 1.6, oy + 1.0, '#9BE7FF', a * 0.35, tr.w * 0.9);
        stroke(tr, ox + 1.6, oy - 1.0, '#C9B3FF', a * 0.30, tr.w * 0.9);
      }
      if (tr.w > 2) { ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(255,255,255,0.8)'; } else { ctx.shadowBlur = 0; }
      stroke(tr, ox, oy, '#FFFFFF', a, tr.w);
    }
    ctx.shadowBlur = 0;

    // prismatic flare ring near the vanishing point
    const r = Math.min(W, H) * 0.22;
    const ring = [['#9BE7FF', -3], ['#FFFFFF', 0], ['#C9B3FF', 3], ['#FFD79B', 6]];
    for (const [col, off] of ring) {
      ctx.beginPath();
      ctx.arc(vp.x + r * 0.55, vp.y - r * 0.15, Math.max(1, r + off), Math.PI * 1.05, Math.PI * 1.75);
      ctx.strokeStyle = col; ctx.globalAlpha = 0.05; ctx.lineWidth = 1.2; ctx.stroke();
    }
    // the hot point itself
    const core = ctx.createRadialGradient(vp.x, vp.y, 0, vp.x, vp.y, 90);
    core.addColorStop(0, 'rgba(255,255,255,0.55)');
    core.addColorStop(0.2, 'rgba(255,255,255,0.18)');
    core.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = core; ctx.fillRect(vp.x - 90, vp.y - 90, 180, 180);

    // vignette so the copy always sits on dark
    ctx.globalCompositeOperation = 'source-over';
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.25, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    vig.addColorStop(0, 'rgba(5,5,5,0.5)');
    vig.addColorStop(1, 'rgba(5,5,5,0.85)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    tx += (mx - tx) * 0.04; ty += (my - ty) * 0.04;
    draw(t - t0);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / W - 0.5) * -18; my = (e.clientY / H - 0.5) * -12;
  }, { passive: true });
  resize();
  if (!reduce) requestAnimationFrame(loop);
  window.addEventListener('error', () => {}, true);
})();
