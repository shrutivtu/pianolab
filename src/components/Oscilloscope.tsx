import { useEffect, useRef } from 'react';

interface OscilloscopeProps {
  analyser: AnalyserNode | null;
  height?: number;
}

/**
 * Time-domain waveform on a dark "scope" panel: a faint grid, a glowing
 * gradient trace, and a soft fill underneath. Reads getByteTimeDomainData
 * from the shared analyser once per animation frame.
 *
 * When silent we draw a flat line instead of shimmering on noise, so the
 * canvas holds still — which also respects prefers-reduced-motion.
 */
export function Oscilloscope({ analyser, height = 180 }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const data = analyser ? new Uint8Array(analyser.fftSize) : new Uint8Array(0);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function drawGrid(w: number, h: number) {
      ctx!.strokeStyle = 'rgba(148,163,184,0.08)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      for (let i = 1; i < 8; i++) {
        const x = (i / 8) * w;
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
      }
      for (let i = 1; i < 4; i++) {
        const y = (i / 4) * h;
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
      }
      ctx!.stroke();
      // Brighter center line
      ctx!.strokeStyle = 'rgba(148,163,184,0.18)';
      ctx!.beginPath();
      ctx!.moveTo(0, h / 2);
      ctx!.lineTo(w, h / 2);
      ctx!.stroke();
    }

    function draw() {
      raf = requestAnimationFrame(draw);
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      let active = false;
      if (analyser) {
        analyser.getByteTimeDomainData(data);
        for (let i = 0; i < data.length; i += 32) {
          if (Math.abs(data[i] - 128) > 2) {
            active = true;
            break;
          }
        }
      }

      ctx!.clearRect(0, 0, w, h);
      drawGrid(w, h);

      // Build the trace path.
      const path = new Path2D();
      if (analyser && active) {
        const n = data.length;
        for (let i = 0; i < n; i++) {
          const x = (i / (n - 1)) * w;
          const y = (data[i] / 255) * h;
          if (i === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
      } else {
        path.moveTo(0, h / 2);
        path.lineTo(w, h / 2);
      }

      // Soft fill under the curve (only when active).
      if (active) {
        const fill = new Path2D(path);
        fill.lineTo(w, h);
        fill.lineTo(0, h);
        fill.closePath();
        const grad = ctx!.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(139,92,246,0.22)');
        grad.addColorStop(1, 'rgba(139,92,246,0)');
        ctx!.fillStyle = grad;
        ctx!.fill(fill);
      }

      // Glowing gradient stroke.
      const stroke = ctx!.createLinearGradient(0, 0, w, 0);
      stroke.addColorStop(0, '#22d3ee');
      stroke.addColorStop(0.5, '#8b5cf6');
      stroke.addColorStop(1, '#ec4899');
      ctx!.strokeStyle = stroke;
      ctx!.lineWidth = active ? 2.5 : 1.5;
      ctx!.lineJoin = 'round';
      ctx!.lineCap = 'round';
      ctx!.shadowColor = 'rgba(139,92,246,0.8)';
      ctx!.shadowBlur = active ? 14 : 0;
      ctx!.stroke(path);
      ctx!.shadowBlur = 0;
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Oscilloscope showing the sound's waveform over time"
      className="w-full block rounded-xl"
      style={{
        height,
        background:
          'radial-gradient(120% 100% at 50% 0%, #15172b 0%, #0b0c17 100%)',
      }}
    />
  );
}
