"use client";

import { useEffect, useRef } from "react";

/**
 * Pixel Blast animated background
 * Inspired by reactbits.dev/backgrounds/pixel-blast
 */
export function PixelBlast() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 300;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Pixel grid configuration
    const gridSize = 8;
    const cols = Math.ceil(canvas.width / gridSize);
    const rows = Math.ceil(canvas.height / gridSize);
    
    // Ice blue color palette
    const colors = [
      "rgba(56, 189, 248, 0.8)",   // ice-400
      "rgba(14, 165, 233, 0.6)",   // ice-500
      "rgba(2, 132, 199, 0.5)",    // ice-600
      "rgba(3, 105, 161, 0.4)",    // ice-700
      "rgba(34, 211, 238, 0.7)",   // frost-400
      "rgba(6, 182, 212, 0.5)",    // frost-500
    ];

    // Initialize grid
    const grid: number[][] = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        grid[i][j] = Math.random();
      }
    }

    // Animation
    const animate = () => {
      ctx.fillStyle = "rgba(30, 30, 46, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const value = grid[i][j];
          
          // Update value
          grid[i][j] += (Math.random() - 0.5) * 0.1;
          grid[i][j] = Math.max(0, Math.min(1, grid[i][j]));

          // Draw pixel if value is above threshold
          if (value > 0.7) {
            const colorIndex = Math.floor(value * colors.length) % colors.length;
            ctx.fillStyle = colors[colorIndex];
            const size = gridSize * (0.5 + value * 0.5);
            const offset = (gridSize - size) / 2;
            ctx.fillRect(
              j * gridSize + offset,
              i * gridSize + offset,
              size,
              size
            );
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}

