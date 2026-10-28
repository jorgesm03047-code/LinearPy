import React, { useEffect, useRef } from 'react';
import type { M2 } from '../../core/transformations';

interface TransformCanvas2DProps {
  matrix: M2;
  range?: number;
}

/**
 * Lienzo 2D interactivo que muestra la deformación del espacio bajo una matriz 2×2.
 * Dibuja el cuadrado unitario original y el transformado junto con los vectores base.
 */
export const TransformCanvas2D: React.FC<TransformCanvas2DProps> = ({ matrix, range = 4 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const pixelRatio = window.devicePixelRatio || 1;
      const width = bounds.width;
      const height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const scale = width / (range * 2);

      // Limpiar fondo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Transformar coordenadas: el origen (0, 0) al centro de la pantalla
      const toScreen = (x: number, y: number): [number, number] => [
        width / 2 + x * scale,
        height / 2 - y * scale,
      ];

      // Cuadrícula de fondo
      ctx.strokeStyle = '#e3e8ed';
      ctx.lineWidth = 1;
      for (let i = -range; i <= range; i++) {
        const [x1, y1] = toScreen(i, -range);
        const [x2, y2] = toScreen(i, range);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const [hx1, hy1] = toScreen(-range, i);
        const [hx2, hy2] = toScreen(range, i);
        ctx.beginPath();
        ctx.moveTo(hx1, hy1);
        ctx.lineTo(hx2, hy2);
        ctx.stroke();
      }

      // Ejes coordenados principales
      ctx.strokeStyle = '#003b5d';
      ctx.lineWidth = 2;
      const [cx0, cy0] = toScreen(0, -range);
      const [cx1, cy1] = toScreen(0, range);
      ctx.beginPath();
      ctx.moveTo(cx0, cy0);
      ctx.lineTo(cx1, cy1);
      ctx.stroke();

      const [rx0, ry0] = toScreen(-range, 0);
      const [rx1, ry1] = toScreen(range, 0);
      ctx.beginPath();
      ctx.moveTo(rx0, ry0);
      ctx.lineTo(rx1, ry1);
      ctx.stroke();

      const tickStep = Math.max(1, Math.ceil(range / 6));
      ctx.fillStyle = '#52616d';
      ctx.font = '15px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = -range + tickStep; i <= range - tickStep; i += tickStep) {
        if (i === 0) continue;
        const [x, axisY] = toScreen(i, 0);
        ctx.fillText(String(i), x, axisY + 6);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = -range + tickStep; i <= range - tickStep; i += tickStep) {
        if (i === 0) continue;
        const [axisX, y] = toScreen(0, i);
        ctx.fillText(String(i), axisX - 6, y);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#003b5d';
      ctx.font = '600 16px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText('x', width - 18, height / 2 + 7);
      ctx.fillText('y', width / 2 + 7, 8);
      ctx.fillStyle = '#52616d';
      ctx.fillText('0', width / 2 + 5, height / 2 + 5);

      // Cuadrado unitario original (0,0) -> (1,0) -> (1,1) -> (0,1)
      const squareOriginal = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ];

      ctx.fillStyle = 'rgba(107, 118, 130, 0.15)';
      ctx.strokeStyle = '#8fa9bb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      squareOriginal.forEach(([x, y], idx) => {
        const [sx, sy] = toScreen(x, y);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cuadrado unitario transformado: T * v
      const applyT = (x: number, y: number): [number, number] => [
        matrix[0][0] * x + matrix[0][1] * y,
        matrix[1][0] * x + matrix[1][1] * y,
      ];

      const squareTransformed = squareOriginal.map(([x, y]) => applyT(x, y));

      ctx.fillStyle = 'rgba(241, 140, 6, 0.25)';
      ctx.strokeStyle = '#f18c06';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      squareTransformed.forEach(([x, y], idx) => {
        const [sx, sy] = toScreen(x, y);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Malla interna de puntos transformados
      ctx.fillStyle = '#003b5d';
      for (let gx = 0; gx <= 1; gx += 0.25) {
        for (let gy = 0; gy <= 1; gy += 0.25) {
          const [tx, ty] = applyT(gx, gy);
          const [sx, sy] = toScreen(tx, ty);
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Dibujar vectores base transformados T(i) y T(j)
      const drawArrow = (from: [number, number], to: [number, number], color: string) => {
        const [fx, fy] = toScreen(from[0], from[1]);
        const [tx, ty] = toScreen(to[0], to[1]);
        const headlen = 10;
        const angle = Math.atan2(ty - fy, tx - fx);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(
          tx - headlen * Math.cos(angle - Math.PI / 6),
          ty - headlen * Math.sin(angle - Math.PI / 6),
        );
        ctx.lineTo(
          tx - headlen * Math.cos(angle + Math.PI / 6),
          ty - headlen * Math.sin(angle + Math.PI / 6),
        );
        ctx.closePath();
        ctx.fill();
      };

      const iHat = applyT(1, 0);
      const jHat = applyT(0, 1);
      drawArrow([0, 0], iHat, '#003b5d'); // T(i) en azul oscuro
      drawArrow([0, 0], jHat, '#f18c06'); // T(j) en naranja
    };

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [matrix, range]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Plano cartesiano con escala numérica y cuadrado unitario transformado por la matriz ${matrix
          .flat()
          .map((v) => Number(v.toFixed(3)))
          .join(', ')}`}
        width={500}
        height={500}
        style={{
          width: '100%',
          maxWidth: '500px',
          height: 'auto',
          aspectRatio: '1/1',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
        }}
      />
      <div
        style={{
          display: 'flex',
          gap: 'var(--s-4)',
          flexWrap: 'wrap',
          marginTop: 'var(--s-2)',
          fontSize: 'var(--text-xs)',
        }}
      >
        <span style={{ color: '#003b5d', fontWeight: 700 }}>■ Vector T(i)</span>
        <span style={{ color: '#f18c06', fontWeight: 700 }}>■ Vector T(j)</span>
        <span style={{ color: '#6b7682' }}>■ Cuadrado original</span>
      </div>
    </div>
  );
};
