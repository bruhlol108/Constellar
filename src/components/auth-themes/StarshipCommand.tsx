"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function StarshipCommand() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Realistic starfield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
    }

    const stars: Star[] = [];
    const numStars = 800;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000,
        size: Math.random() * 1.5,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      stars.forEach((star) => {
        star.z -= 0.5;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        const k = 128 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / 1000) * star.size * 2;
          const opacity = 1 - star.z / 1000;

          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/projects");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        alert("Check email to verify!");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
      {/* Realistic Starfield */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />

      {/* Back to Home */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-xs text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-wider"
      >
        ← Home
      </button>

      {/* Minimal HUD elements */}
      <div className="absolute top-6 left-6 font-mono text-xs text-gray-500 space-y-1">
        <div>SYS.ONLINE</div>
        <div className="text-gray-600">LOC: SECTOR 7</div>
      </div>

      <div className="absolute top-6 right-6 font-mono text-xs text-gray-500 text-right space-y-1">
        <div>AUTH.REQ</div>
        <div className="text-gray-600">{new Date().toLocaleTimeString()}</div>
      </div>

      {/* Crosshair center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-1/2 w-px h-4 bg-white" />
          <div className="absolute bottom-0 left-1/2 w-px h-4 bg-white" />
          <div className="absolute left-0 top-1/2 h-px w-4 bg-white" />
          <div className="absolute right-0 top-1/2 h-px w-4 bg-white" />
        </div>
      </div>

      {/* Main Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Sleek minimal header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-light tracking-[0.3em] text-white/90 mb-2">
            CONSTELLAR
          </h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>

        {/* Glass panel form */}
        <div className="relative overflow-hidden rounded-lg">
          {/* Subtle border glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-lg" />

          <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-lg border border-white/10 shadow-2xl">
            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label className="text-gray-400 text-xs uppercase tracking-wider font-light">
                    Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 bg-white/5 border-white/10 text-white focus:border-white/30 focus:ring-0 placeholder:text-gray-600 font-light"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider font-light">
                  Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 bg-white/5 border-white/10 text-white focus:border-white/30 focus:ring-0 placeholder:text-gray-600 font-light"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider font-light">
                  Password
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 bg-white/5 border-white/10 text-white focus:border-white/30 focus:ring-0 placeholder:text-gray-600 font-light"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-red-500/30 bg-red-500/5 p-3 text-red-400 text-sm rounded font-light"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-light uppercase tracking-widest text-sm transition-all duration-300"
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  isLogin ? "Access" : "Register"
                )}
              </Button>
            </form>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full mt-6 text-gray-500 hover:text-gray-300 text-xs transition-colors uppercase tracking-wide font-light"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
