"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, Loader2, Check, LogOut } from "lucide-react";
import Link from "next/link";

// Load Excalidraw dynamically (client-side only)
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

export default function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const excalidrawRef = useRef<any>(null);
  const autoSaveTimerRef = useRef<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check auth and load project
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        loadProject();
      }
    });
  }, [projectId, router, supabase.auth]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (data.project) {
        setProject(data.project);

        // Load canvas data if it exists
        if (data.project.canvas_data && excalidrawRef.current) {
          setTimeout(() => {
            excalidrawRef.current?.updateScene?.(data.project.canvas_data);
          }, 100);
        }
      } else {
        alert("Project not found");
        router.push("/projects");
      }
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = useCallback(async (canvasData: any, createVersion = false) => {
    setSaving(true);
    setSaved(false);

    try {
      // Update project with new canvas data
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvas_data: canvasData,
        }),
      });

      // Create version snapshot if requested
      if (createVersion) {
        await fetch(`/api/projects/${projectId}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canvas_data: canvasData,
            description: "Manual save",
          }),
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const handleManualSave = async () => {
    if (!excalidrawRef.current) return;

    const elements = excalidrawRef.current.getSceneElements();
    const appState = excalidrawRef.current.getAppState();
    const files = excalidrawRef.current.getFiles();

    const canvasData = {
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        zoom: appState.zoom,
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
      },
      files,
    };

    await saveToDatabase(canvasData, true); // Create version on manual save
  };

  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Clear existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Auto-save after 3 seconds of inactivity
    autoSaveTimerRef.current = setTimeout(() => {
      const canvasData = {
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          zoom: appState.zoom,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
        },
        files,
      };

      saveToDatabase(canvasData, false); // Don't create version on auto-save
    }, 3000);
  }, [saveToDatabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading || !user || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <Link href="/projects" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-purple-500 group-hover:text-purple-400 transition-colors" />
          <span className="font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            {project.title}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          )}

          {saved && (
            <span className="text-sm text-green-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Saved!
            </span>
          )}

          <Button
            onClick={handleManualSave}
            disabled={saving}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Version
          </Button>

          <span className="text-sm text-gray-400">{user.email}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-red-500/50 hover:bg-red-500/10 text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {typeof window !== "undefined" && (
          <Excalidraw
            ref={excalidrawRef}
            onChange={handleChange}
            initialData={project.canvas_data || undefined}
          />
        )}
      </div>

      {/* Info banner */}
      <div className="px-4 py-2 bg-purple-500/10 border-t border-purple-500/20 text-xs text-gray-300 text-center">
        💡 Auto-saves every 3 seconds | Click "Save Version" to create a snapshot
      </div>
    </div>
  );
}
