"use client";

import { useEffect, useRef } from "react";

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Star properties
    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      opacity: number;
      speed: number;
    }

    const stars: Star[] = [];
    const numStars = 200;

    // Create stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 2,
        opacity: Math.random(),
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    // Animation
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = "rgba(10, 11, 30, 0.1)"; // Fade trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Move star
        star.z -= star.speed;

        // Reset if too close
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        // Calculate position (parallax effect)
        const k = 128.0 / star.z;
        const px = (star.x - canvas.width / 2) * k + canvas.width / 2;
        const py = (star.y - canvas.height / 2) * k + canvas.height / 2;

        // Only draw if on screen
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = star.size * (1 - star.z / 1000);
          const opacity = 1 - star.z / 1000;

          // Draw star
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * star.opacity})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();

          // Add glow for brighter stars
          if (opacity > 0.7) {
            ctx.fillStyle = `rgba(139, 92, 246, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(px, py, size * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ background: "#0a0b1e" }}
    />
  );
}
