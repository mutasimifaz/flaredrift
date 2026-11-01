import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';

const palettes = {
  ember: ['#ff512f', '#ff9b54', '#f5d58a', '#7c9cff'],
  tide: ['#58c7ff', '#5d82ff', '#b3a0ff', '#ff8a68'],
};

export default function FluxMachine() {
  const canvasRef = useRef(null);
  const [energy, setEnergy] = useState(55);
  const [palette, setPalette] = useState('ember');
  const [playing, setPlaying] = useState(true);
  const [seed, setSeed] = useState(0);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let particles = [];
    let raf = 0;
    let lastTime = 0;
    const colors = palettes[palette];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(190, Math.max(75, Math.round(width * height / 4800)));
      particles = Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + Math.random() * 0.6;
        const radius = Math.random() * Math.min(width, height) * 0.46;
        return {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          orbit: radius,
          angle,
          speed: (Math.random() * 0.25 + 0.08) * (Math.random() > 0.5 ? 1 : -1),
          size: Math.random() * 1.8 + 0.55,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = (time) => {
      raf = requestAnimationFrame(draw);
      if (!playing) return;
      const delta = Math.min((time - (lastTime || time)) / 1000, 0.04);
      lastTime = time;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#08090d';
      ctx.fillRect(0, 0, width, height);

      const power = energy / 55;
      const pointer = pointerRef.current;
      const cx = pointer.active ? pointer.x * width : width * 0.5;
      const cy = pointer.active ? pointer.y * height : height * 0.5;
      const maxDistance = Math.min(width, height) * 0.48;

      particles.forEach((particle, index) => {
        particle.angle += particle.speed * delta * (0.55 + power * 1.7);
        const wave = Math.sin(time * 0.0007 + particle.phase) * 18 * power;
        const radius = particle.orbit + wave;
        const homeX = width / 2 + Math.cos(particle.angle) * radius;
        const homeY = height / 2 + Math.sin(particle.angle * 1.08) * radius * 0.58;
        const dx = homeX - cx;
        const dy = homeY - cy;
        const distance = Math.hypot(dx, dy) || 1;
        const influence = pointer.active ? Math.max(0, 1 - distance / maxDistance) : 0;
        const x = homeX + (dx / distance) * influence * 28 * power;
        const y = homeY + (dy / distance) * influence * 28 * power;

        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.42 + (Math.sin(time * 0.001 + particle.phase) + 1) * 0.25;
        ctx.shadowBlur = 12 * power;
        ctx.shadowColor = particle.color;
        ctx.arc(x, y, particle.size * (0.8 + power * 0.35), 0, Math.PI * 2);
        ctx.fill();

        if (index % 3 === 0) {
          const next = particles[(index + 7) % particles.length];
          const nx = width / 2 + Math.cos(next.angle) * next.orbit;
          const ny = height / 2 + Math.sin(next.angle * 1.08) * next.orbit * 0.58;
          const lineDistance = Math.hypot(nx - x, ny - y);
          if (lineDistance < 62 + energy * 0.55) {
            ctx.beginPath();
            ctx.globalAlpha = (1 - lineDistance / (100 + energy)) * 0.2;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.7;
            ctx.moveTo(x, y);
            ctx.lineTo(nx, ny);
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [energy, palette, playing, seed]);

  const updatePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      active: true,
    };
  };

  return (
    <div className="flux-machine">
      <div className="flux-stage" onPointerMove={updatePointer} onPointerLeave={() => { pointerRef.current.active = false; }}>
        <canvas ref={canvasRef} aria-label="An animated field of particles that responds to pointer movement" />
        <div className="flux-stage-label"><span className="flux-live-dot" /> LIVE GENERATIVE STUDY</div>
        <div className="flux-stage-coordinates">FIELD 001 / {palette.toUpperCase()}</div>
        <div className="flux-center-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" role="presentation">
            <path d="M16 2.5v27M2.5 16h27M6.45 6.45l19.1 19.1m0-19.1-19.1 19.1" />
            <circle cx="16" cy="16" r="3.2" />
          </svg>
        </div>
        <p className="flux-hint">MOVE YOUR POINTER THROUGH THE FIELD</p>
      </div>

      <div className="flux-controls">
        <div className="flux-control-copy">
          <span className="eyebrow">TUNE THE FIELD</span>
          <p>Change its energy. Shift its colour. See what happens.</p>
        </div>
        <div className="flux-control-group flux-energy">
          <label htmlFor="flux-energy">ENERGY <span>{energy}%</span></label>
          <input id="flux-energy" type="range" min="10" max="100" value={energy} onChange={(event) => setEnergy(Number(event.target.value))} />
        </div>
        <div className="flux-control-group">
          <span className="flux-control-label">COLOUR STUDY</span>
          <div className="flux-palette-switch">
            <button className={palette === 'ember' ? 'is-active' : ''} onClick={() => setPalette('ember')} aria-pressed={palette === 'ember'}><i className="palette-ember" /> Ember</button>
            <button className={palette === 'tide' ? 'is-active' : ''} onClick={() => setPalette('tide')} aria-pressed={palette === 'tide'}><i className="palette-tide" /> Tide</button>
          </div>
        </div>
        <div className="flux-actions">
          <button onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause animation' : 'Play animation'}>
            {playing ? <Pause size={15} /> : <Play size={15} />} {playing ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => setSeed((value) => value + 1)}><RefreshCw size={15} /> Regenerate</button>
        </div>
      </div>
    </div>
  );
}
