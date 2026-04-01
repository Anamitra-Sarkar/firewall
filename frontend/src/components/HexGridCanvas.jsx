import { useEffect, useRef } from 'react';

/**
 * HexGridCanvas — animated hex-grid background
 * Each hexagon slowly pulses in opacity. Occasionally a random hex
 * "fires" a bright cyan ripple that spreads outward to neighbouring hexes,
 * creating a living circuit-board / neural-net feel.
 */
export default function HexGridCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;
    let hexes = [];

    const HEX_SIZE = 28;       // circumradius
    const GAP      = 4;        // gap between hexes
    const STEP     = HEX_SIZE * 2 + GAP;
    const ROW_H    = Math.sqrt(3) * (HEX_SIZE + GAP / 2);

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildGrid();
    }

    function buildGrid() {
      hexes = [];
      const cols = Math.ceil(W / STEP) + 2;
      const rows = Math.ceil(H / ROW_H) + 2;
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const x = c * STEP + (r % 2 === 0 ? 0 : STEP / 2);
          const y = r * ROW_H;
          hexes.push({
            x, y,
            alpha:  0.04 + Math.random() * 0.06,
            target: 0.04 + Math.random() * 0.06,
            pulse:  0,           // 0-1 ripple brightness
            speed:  0.003 + Math.random() * 0.004,
          });
        }
      }
    }

    // Fire a ripple from a random hex
    function fireRipple() {
      if (!hexes.length) return;
      const origin = hexes[Math.floor(Math.random() * hexes.length)];
      const dist   = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      hexes.forEach(h => {
        const d = dist(h, origin);
        const delay = d / 200;   // seconds
        const start = performance.now() / 1000 + delay;
        // Store ripple data — overwrite if weaker
        if (!h._ripple || h._ripple.peak < 0.55) {
          h._ripple = { start, peak: 0.55 - d * 0.0008 };
        }
      });
    }

    // Schedule ripples randomly
    let nextRipple = performance.now() + 2000;

    function draw(now) {
      ctx.clearRect(0, 0, W, H);

      if (now > nextRipple) {
        fireRipple();
        nextRipple = now + 1800 + Math.random() * 2500;
      }

      const t = now / 1000;

      hexes.forEach(h => {
        // Slow ambient pulse
        if (Math.abs(h.alpha - h.target) < 0.002) {
          h.target = 0.03 + Math.random() * 0.07;
        }
        h.alpha += (h.target - h.alpha) * h.speed;

        // Ripple overlay
        let rippleAlpha = 0;
        if (h._ripple) {
          const elapsed = t - h._ripple.start;
          if (elapsed > 0) {
            const peak = h._ripple.peak;
            // rise fast, decay slow
            rippleAlpha = peak * Math.exp(-elapsed * 3);
            if (rippleAlpha < 0.002) h._ripple = null;
          }
        }

        const finalAlpha = Math.min(1, h.alpha + rippleAlpha);

        ctx.save();
        ctx.globalAlpha = finalAlpha;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = h.x + HEX_SIZE * Math.cos(angle);
          const py = h.y + HEX_SIZE * Math.sin(angle);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = rippleAlpha > 0.05 ? '#06b6d4' : '#0891b2';
        ctx.lineWidth   = rippleAlpha > 0.1  ? 1.5 : 0.8;
        ctx.stroke();

        // Fill glow on strong ripple
        if (rippleAlpha > 0.12) {
          ctx.fillStyle = `rgba(6,182,212,${rippleAlpha * 0.18})`;
          ctx.fill();
        }
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
