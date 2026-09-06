import React, { useRef, useEffect } from 'react';

interface NeonSphereCanvasProps {
  audioLevel: number;
  isCallActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  pulseSpeed?: number;
}

export const NeonSphereCanvas: React.FC<NeonSphereCanvasProps> = ({
  audioLevel,
  isCallActive,
  isListening,
  isSpeaking,
  pulseSpeed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotationX = 0;
    let rotationY = 0;

    // Create 3D points for the sphere
    const numPoints = 180;
    const points: Array<{ x: number; y: number; z: number }> = [];
    const radius = 90;

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;

      points.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
      });
    }

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Audio-driven scale expansion (pulso effect)
      const basePulse = Math.sin(Date.now() * 0.002 * pulseSpeed) * 0.06;
      const audioPulse = (audioLevel / 100) * 0.35;
      const scaleMultiplier = 1 + basePulse + audioPulse;

      rotationX += 0.008;
      rotationY += 0.005;

      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      // Projected points
      const projected: Array<{ x: number; y: number; scale: number; alpha: number }> = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 3D rotations
        const y1 = p.y * cosX - p.z * sinX;
        const z1 = p.y * sinX + p.z * cosX;

        const x2 = p.x * cosY + z1 * sinY;
        const z2 = -p.x * sinY + z1 * cosY;

        // Perspective
        const fov = 300;
        const scale = (fov / (fov + z2)) * scaleMultiplier;
        const xProj = centerX + x2 * scale;
        const yProj = centerY + y1 * scale;
        const alpha = Math.max(0.15, (z2 + radius) / (2 * radius));

        projected.push({ x: xProj, y: yProj, scale, alpha });
      }

      // Draw connections
      ctx.lineWidth = 0.8;
      const maxDistance = 45 * scaleMultiplier;

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.4 * projected[i].alpha;
            ctx.strokeStyle = isSpeaking
              ? `rgba(6, 214, 255, ${lineAlpha * 1.5})`
              : isListening
              ? `rgba(0, 255, 170, ${lineAlpha * 1.2})`
              : `rgba(0, 195, 255, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw points with glowing nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const pointRadius = Math.max(1, 2 * p.scale);

        ctx.fillStyle = isSpeaking
          ? `rgba(0, 240, 255, ${p.alpha})`
          : `rgba(0, 210, 255, ${p.alpha})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw outer glowing neon ring
      const ringRadius = radius * 1.35 * scaleMultiplier;
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        ringRadius * 0.8,
        centerX,
        centerY,
        ringRadius * 1.2
      );
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
      gradient.addColorStop(0.5, `rgba(0, 212, 255, ${0.15 + audioPulse * 0.4})`);
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [audioLevel, isCallActive, isListening, isSpeaking, pulseSpeed]);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
