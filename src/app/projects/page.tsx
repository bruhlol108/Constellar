"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Plus, Trash2, Edit, Save, X, Loader2, Pencil, LogOut } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string | null;
  canvas_data: any;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        loadProjects();
      }
    });
  }, [router, supabase.auth]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
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
        await loadProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setCreating(false);
    }
  };

  const updateProject = async (id: string) => {
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
        await loadProjects();
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Cosmic background */}
      <div className="cosmic-orb cosmic-orb-1" />
      <div className="cosmic-orb cosmic-orb-2" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Sparkles className="w-6 h-6 text-purple-500 group-hover:text-purple-400 transition-colors" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                Constellar
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">{user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-red-500/50 hover:bg-red-500/10 text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent mb-2">
            My Projects
          </h1>
          <p className="text-gray-400">
            Manage your AI-generated workflow diagrams
          </p>
        </div>

        {/* Create new project */}
        <Card className="mb-8 border-white/10 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              Create New Project
            </CardTitle>
            <CardDescription>
              Start a new workflow diagram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Project title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createProject()}
                  className="bg-background/50 border-white/10"
                />
              </div>
              <Button
                onClick={createProject}
                disabled={creating || !newTitle.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-white/10 bg-card/80 backdrop-blur-xl">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">
                No projects yet. Create your first project above!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="border-white/10 bg-card/80 backdrop-blur-xl hover:border-purple-500/50 transition-colors"
              >
                <CardHeader>
                  {editingId === project.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateProject(project.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="bg-background/50 border-white/10"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateProject(project.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          className="border-white/10"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                {editingId !== project.id && (
                  <CardContent>
                    <div className="space-y-2">
                      <Link href={`/canvas/${project.id}`}>
                        <Button
                          size="sm"
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Open Canvas
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(project.id);
                            setEditTitle(project.title);
                          }}
                          className="flex-1 border-white/10 hover:bg-purple-500/10"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Rename
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProject(project.id)}
                          className="border-red-500/50 hover:bg-red-500/10 text-red-400"
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
