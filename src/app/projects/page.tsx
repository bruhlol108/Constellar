"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, Save, X, Pencil, LogOut } from "lucide-react";
import Link from "next/link";
import CosmicLoader from "@/components/CosmicLoader";

interface Constellation {
  id: string;
  title: string;
  description: string | null;
  canvas_data: any;
  created_at: string;
  updated_at: string;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  layer: number; // For parallax effect
}

export default function ConstellationsPage() {
  const [user, setUser] = useState<any>(null);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [stars, setStars] = useState<Star[]>([]);
  const router = useRouter();
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate random stars on mount
  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      const starCount = 35; // More stars with varied sizes

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100, // 0-100%
          y: Math.random() * 100, // 0-100%
          size: Math.random() * 3 + 0.5, // 0.5 to 3.5px - more variety
          opacity: Math.random() * 0.4 + 0.4, // 0.4 to 0.8
          duration: Math.random() * 2 + 3, // 3-5s
          delay: Math.random() * 3, // 0-3s
          layer: Math.floor(Math.random() * 3), // 0, 1, or 2 for parallax layers
        });
      }

      setStars(newStars);
    };

    generateStars();
  }, []);

  useEffect(() => {
    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        loadConstellations();
      }
    });
  }, [router, supabase.auth]);

  // Starfield animation (same as login)
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

  const loadConstellations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (data.projects) {
        setConstellations(data.projects);
      }
    } catch (error) {
      console.error("Error loading constellations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createConstellation = async () => {
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          canvas_data: {
            elements: [],
            appState: {},
            files: {},
          },
        }),
      });

      if (response.ok) {
        setNewTitle("");
        await loadConstellations();
      }
    } catch (error) {
      console.error("Error creating constellation:", error);
    } finally {
      setCreating(false);
    }
  };

  const updateConstellation = async (id: string) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditTitle("");
        await loadConstellations();
      }
    } catch (error) {
      console.error("Error updating constellation:", error);
    }
  };

  const deleteConstellation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this constellation?")) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadConstellations();
      }
    } catch (error) {
      console.error("Error deleting constellation:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <CosmicLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Starfield background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />

      {/* Dynamic randomized decorative stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <style jsx>{`
          @keyframes drift {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(-100vw, 50vh);
            }
          }
        `}</style>
        {stars.map((star) => {
          // Calculate enhanced glow intensity based on size
          const glowSize = Math.max(12, star.size * 6);
          const glowSpread = glowSize * 3;
          const glowOuter = glowSpread * 1.5;

          // Different drift speeds based on layer (closer = faster)
          const driftDuration = 40 - (star.layer * 10); // Layer 0: 40s, Layer 1: 30s, Layer 2: 20s

          return (
            <div
              key={star.id}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                top: `${star.y}%`,
                left: `${star.x}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                boxShadow: `
                  0 0 ${glowSize}px rgba(255,255,255,0.9),
                  0 0 ${glowSpread}px rgba(255,255,255,0.6),
                  0 0 ${glowOuter}px rgba(255,255,255,0.3)
                `,
                animation: `pulse ${star.duration}s ease-in-out ${star.delay}s infinite, drift ${driftDuration}s linear infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Minimal HUD elements */}
      <div className="absolute top-6 left-6 font-mono text-xs text-gray-500 space-y-1 z-50">
        <div>SYS.ONLINE</div>
        <div className="text-gray-600">LOC: WORKSPACE</div>
      </div>

      <div className="absolute top-6 right-6 font-mono text-xs text-gray-500 text-right space-y-1 z-50">
        <div>USER.ACTIVE</div>
        <div className="text-gray-600">{new Date().toLocaleTimeString()}</div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-light tracking-[0.2em] text-white/90 uppercase">
                Constellar
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="border border-white/20 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 hover:border-red-500/50 font-mono text-xs uppercase tracking-wider transition-all duration-200"
              >
                <LogOut className="w-3 h-3 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-light tracking-[0.3em] text-white mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            CONSTELLATIONS
          </h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/60 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.3)] mb-4" />
          <p className="text-gray-400 text-sm font-mono uppercase tracking-wider">
            Navigate your universe of AI-powered design systems
          </p>
        </div>

        {/* Create new constellation */}
        <Card className="mb-8 border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl shadow-white/5 hover:border-white/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-light tracking-wide uppercase text-sm">
              <Plus className="w-4 h-4 text-white/70" />
              Create New Constellation
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs font-mono uppercase tracking-wider">
              Chart a new system in your design universe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Constellation name..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createConstellation()}
                  className="bg-white/5 border-white/20 text-white focus:border-white/50 focus:ring-1 focus:ring-white/20 placeholder:text-gray-500 font-light transition-all"
                />
              </div>
              <Button
                onClick={createConstellation}
                disabled={creating || !newTitle.trim()}
                variant="ghost"
                className="bg-white/15 hover:bg-white/25 hover:shadow-lg hover:shadow-white/10 text-white border border-white/30 font-light uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
              >
                {creating ? (
                  <CosmicLoader size="sm" />
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-2" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Constellations list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <CosmicLoader size="lg" />
          </div>
        ) : constellations.length === 0 ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">
                Your universe awaits. Create your first constellation above!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {constellations.map((constellation) => (
              <Card
                key={constellation.id}
                className="border-white/20 bg-black/40 backdrop-blur-xl hover:border-white/40 hover:shadow-xl hover:shadow-white/5 transition-all shadow-2xl shadow-white/5 group"
              >
                <CardHeader>
                  {editingId === constellation.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateConstellation(constellation.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="bg-white/5 border-white/10 text-white focus:border-white/30 focus:ring-0 font-light"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateConstellation(constellation.id)}
                          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-all duration-200"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg font-light text-white tracking-wide group-hover:text-white/95 transition-colors">{constellation.title}</CardTitle>
                      <CardDescription className="text-gray-400 font-mono text-xs uppercase tracking-wider">
                        Charted {new Date(constellation.created_at).toLocaleDateString()}
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                {editingId !== constellation.id && (
                  <CardContent>
                    <div className="space-y-2">
                      <Link href={`/canvas/${constellation.id}`} className="block">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full bg-white/15 hover:bg-white/25 hover:shadow-md hover:shadow-white/10 text-white border border-white/30 font-mono text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.02]"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Launch
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(constellation.id);
                            setEditTitle(constellation.title);
                          }}
                          className="flex-1 border border-white/20 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-all duration-200"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Rename
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteConstellation(constellation.id)}
                          className="border border-white/20 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 hover:border-red-500/50 font-mono text-xs transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
