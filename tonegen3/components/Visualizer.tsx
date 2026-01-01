import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';

const Visualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      const analyser = audioService.getAnalyser();
      if (!analyser) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      // Detect Dark Mode (using class on html/body)
      const isDark = document.documentElement.classList.contains('dark');

      // Clear Canvas
      ctx.fillStyle = isDark ? '#202020' : '#f9f9f9'; // Matches platinum-50 or obsidian-200
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#a0a0a0' : '#606060'; // Light grey in dark mode
      ctx.beginPath();

      const sliceWidth = (rect.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * rect.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-32 rounded-xl bg-platinum-50 dark:bg-obsidian-200 shadow-inner border border-platinum-200 dark:border-obsidian-400 overflow-hidden relative transition-colors">
        <div className="absolute top-2 left-3 text-xs text-platinum-400 dark:text-platinum-500 font-bold tracking-wider uppercase pointer-events-none">
            Oscilloscope
        </div>
        <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Visualizer;
