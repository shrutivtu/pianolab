import { useEffect, useRef } from 'react';

interface SpectrumProps {
  analyser: AnalyserNode | null;
  height?: number;
}

/**
 * Frequency spectrum (FFT) on a dark panel: gradient bars (violet at the base
 * rising to amber) with a soft glow and rounded tops, plus a faint mirrored
 * reflection for depth. Only the lower ~40% of bins is shown — that's where
 * musical energy lives, so harmonics stay legible.
 *
 * During silence the bars simply fall to zero, so the panel settles into a
 * calm flat baseline rather than flickering on noise.
 */
export function Spectrum({ analyser, height = 180 }: SpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const bins = analyser ? analyser.frequencyBinCount : 0;
    const data = new Uint8Array(bins);
    const shown = Math.max(1, Math.floor(bins * 0.4));

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

    function draw() {
      raf = requestAnimationFrame(draw);
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx!.clearRect(0, 0, w, h);

      // Baseline grid
      ctx!.strokeStyle = 'rgba(148,163,184,0.08)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      for (let i = 1; i < 4; i++) {
        const y = (i / 4) * h;
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
      }
      ctx!.stroke();

      if (!analyser) return;
      analyser.getByteFrequencyData(data);

      const grad = ctx!.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, '#7c3aed');
      grad.addColorStop(0.55, '#ec4899');
      grad.addColorStop(1, '#fbbf24');

      const gap = shown > 96 ? 0 : 1;
      const barW = w / shown;

      for (let i = 0; i < shown; i++) {
        const v = data[i] / 255;
        if (v <= 0.001) continue;
        const barH = v * (h - 6);
        const x = i * barW;
        const y = h - barH;
        const bw = Math.max(1, barW - gap);

        ctx!.fillStyle = grad;
        ctx!.shadowColor = 'rgba(236,72,153,0.55)';
        ctx!.shadowBlur = 10 * v;
        roundedTopRect(ctx!, x, y, bw, barH, Math.min(bw / 2, 2));
        ctx!.fill();

        // Faint reflection
        ctx!.shadowBlur = 0;
        ctx!.globalAlpha = 0.12 * v;
        ctx!.fillRect(x, h, bw, barH * 0.4);
        ctx!.globalAlpha = 1;
      }
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
      aria-label="Frequency spectrum showing the harmonic content of the sound"
      className="w-full block rounded-xl"
      style={{
        height,
        background:
          'radial-gradient(120% 100% at 50% 0%, #15172b 0%, #0b0c17 100%)',
      }}
    />
  );
}

/** Filled rect with only the top corners rounded. */
function roundedTopRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}
