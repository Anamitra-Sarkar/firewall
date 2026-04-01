import { useEffect, useRef } from 'react';

/**
 * NeuralFlowCanvas — animated data-flow background
 * Draws a web of faint nodes connected by bezier paths.
 * Bright "data pulses" (small dots) travel along each path continuously,
 * simulating live network traffic — like packets moving through a firewall.
 * Colour palette: cyan/indigo on a pure white surface, very low opacity.
 */
export default function NeuralFlowCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;
    let nodes = [], edges = [], pulses = [];

    const NODE_COUNT = 28;
    const MAX_DIST   = 320;
    const PULSE_SPEED = 0.0018; // fraction of path per ms

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      build();
    }

    function build() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r:  2.5 + Math.random() * 2,
      }));
      pulses = [];
    }

    function updateEdges() {
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) edges.push({ a: i, b: j, d });
        }
      }
    }

    // Spawn pulses periodically on random edges
    let lastSpawn = 0;
    function spawnPulses(now) {
      if (now - lastSpawn < 120) return;
      lastSpawn = now;
      if (edges.length === 0) return;
      const e = edges[Math.floor(Math.random() * edges.length)];
      // cyan or indigo randomly
      const color = Math.random() > 0.45 ? '#06b6d4' : '#6366f1';
      pulses.push({ edge: e, t: 0, color, speed: PULSE_SPEED + Math.random() * 0.001 });
      // cap total pulses
      if (pulses.length > 90) pulses.splice(0, pulses.length - 90);
    }

    // Cubic bezier point
    function bezierPt(p0, p1, cp1, cp2, t) {
      const u = 1 - t;
      return {
        x: u*u*u*p0.x + 3*u*u*t*cp1.x + 3*u*t*t*cp2.x + t*t*t*p1.x,
        y: u*u*u*p0.y + 3*u*u*t*cp1.y + 3*u*t*t*cp2.y + t*t*t*p1.y,
      };
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);

      // Move nodes slowly
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      updateEdges();
      spawnPulses(now);

      // Draw edges — very faint slate lines
      edges.forEach(({ a, b, d }) => {
        const alpha = (1 - d / MAX_DIST) * 0.12;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        // slight curve via midpoint offset
        const mx = (nodes[a].x + nodes[b].x) / 2 + (Math.random() - 0.5) * 40;
        const my = (nodes[a].y + nodes[b].y) / 2 + (Math.random() - 0.5) * 40;
        ctx.quadraticCurveTo(mx, my, nodes[b].x, nodes[b].y);
        ctx.stroke();
        ctx.restore();
      });

      // Draw nodes
      nodes.forEach(n => {
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#0891b2';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Update & draw pulses
      pulses = pulses.filter(p => p.t <= 1.05);
      pulses.forEach(p => {
        p.t += p.speed * 16; // ~16ms per frame
        const t  = Math.min(p.t, 1);
        const na = nodes[p.edge.a];
        const nb = nodes[p.edge.b];
        // control points for curve
        const cp1 = { x: (na.x + nb.x) / 2 + 30, y: (na.y + nb.y) / 2 - 30 };
        const cp2 = { x: (na.x + nb.x) / 2 - 30, y: (na.y + nb.y) / 2 + 30 };
        const pos  = bezierPt(na, nb, cp1, cp2, t);
        const fade = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;

        // Glow
        ctx.save();
        ctx.globalAlpha = 0.28 * fade;
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Core dot
        ctx.save();
        ctx.globalAlpha = 0.72 * fade;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
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
