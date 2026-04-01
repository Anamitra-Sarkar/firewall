import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    let mouse = { x: null, y: null };

    const PARTICLE_COUNT = 110;
    const CONNECTION_DIST = 140;
    const MOUSE_DIST = 180;
    const SPEED = 0.45;
    const COLORS = [
      'rgba(34,211,238,',   // cyan-400
      'rgba(6,182,212,',    // cyan-500
      'rgba(8,145,178,',    // cyan-600
      'rgba(103,232,249,',  // cyan-300
      'rgba(165,243,252,',  // cyan-200 (rare)
    ];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x  = Math.random() * canvas.width;
        this.y  = init ? Math.random() * canvas.height : -10;
        this.vx = (Math.random() - 0.5) * SPEED;
        this.vy = (Math.random() - 0.5) * SPEED;
        this.r  = Math.random() * 2 + 1;
        this.baseAlpha = Math.random() * 0.5 + 0.3;
        this.alpha = this.baseAlpha;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        // pulse
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }
      update(t) {
        this.x += this.vx;
        this.y += this.vy;
        // pulse glow
        this.alpha = this.baseAlpha + Math.sin(t * this.pulseSpeed + this.pulseOffset) * 0.15;
        // wrap
        if (this.x < -20) this.x = canvas.width + 20;
        if (this.x > canvas.width + 20) this.x = -20;
        if (this.y < -20) this.y = canvas.height + 20;
        if (this.y > canvas.height + 20) this.y = -20;
      }
      draw() {
        // glow
        ctx.beginPath();
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
        grd.addColorStop(0, this.color + this.alpha + ')');
        grd.addColorStop(1, this.color + '0)');
        ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        // core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color + (this.alpha + 0.3) + ')';
        ctx.fill();
      }
    }

    function connect() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34,211,238,${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        // mouse connections
        if (mouse.x !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const opacity = (1 - dist / MOUSE_DIST) * 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(103,232,249,${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    let t = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t++;
      particles.forEach(p => { p.update(t); p.draw(); });
      connect();
      animId = requestAnimationFrame(animate);
    }

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    animate();

    const onResize = () => { resize(); };
    const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = null; mouse.y = null; };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
}
