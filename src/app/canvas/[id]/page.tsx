"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Save, Check, LogOut } from "lucide-react";
import Link from "next/link";
import { ChatSidebar } from "@/components/ChatSidebar";
import CosmicLoader from "@/components/CosmicLoader";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const excalidrawRef = useRef<any>(null);
  const autoSaveTimerRef = useRef<any>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
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

  // Re-load canvas data when API becomes available
  useEffect(() => {
    if (excalidrawAPI && project?.canvas_data) {
      setTimeout(() => {
        excalidrawAPI.updateScene(project.canvas_data);
      }, 100);
    }
  }, [excalidrawAPI, project]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (data.project) {
        setProject(data.project);
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
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

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

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
    setEditedTitle(project.title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (!editedTitle.trim() || editedTitle === project.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editedTitle.trim() }),
      });

      setProject({ ...project, title: editedTitle.trim() });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating title:", error);
      alert("Failed to update title");
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  if (loading || !user || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CosmicLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar - Google Docs style */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        {/* Left: Logo/Brand */}
        <div className="flex-1 flex items-center">
          <Link href="/projects" className="flex items-center gap-2 group">
            <Sparkles className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            <span className="font-bold text-lg text-white/90">
              CONSTELLAR
            </span>
          </Link>
        </div>

        {/* Center: Editable Title */}
        <div className="flex-1 flex items-center justify-center px-4">
          {isEditingTitle ? (
            <Input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="max-w-md text-center bg-white/5 border-white/10 text-white focus:border-white/30 focus:ring-0"
            />
          ) : (
            <button
              onDoubleClick={handleTitleDoubleClick}
              className="max-w-md px-4 py-1.5 rounded hover:bg-white/5 transition-colors cursor-text"
              title="Double-click to edit"
            >
              <span className="font-semibold text-white/90">
                {project.title}
              </span>
            </button>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {saving && (
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <CosmicLoader size="sm" />
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
            className="bg-white/15 hover:bg-white/25 border border-white/30"
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

      {/* Canvas with AI Sidebar */}
      <div className="flex-1 relative overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel: Excalidraw Canvas */}
          <ResizablePanel defaultSize={70} minSize={30} className="h-full">
            <div className="h-full w-full relative">
              {typeof window !== "undefined" && (
                <Excalidraw
                  excalidrawAPI={(api: any) => {
                    excalidrawRef.current = api;
                    if (api && !excalidrawAPI) {
                      setExcalidrawAPI(api);
                      console.log("[Canvas] Excalidraw API initialized");
                    }
                  }}
                  onChange={handleChange}
                  initialData={project.canvas_data || undefined}
                />
              )}
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle className="w-1 bg-slate-800 hover:bg-white/30 transition-colors" />

          {/* Right Panel: Chat Sidebar */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50} className="h-full overflow-hidden">
            <div className="h-full overflow-hidden">
              <ChatSidebar excalidrawAPI={excalidrawAPI} projectId={projectId} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
