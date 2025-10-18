/**
 * Whiteboard Component
 *
 * Integrates Excalidraw as the main drawing canvas.
 * This component must be client-side only because Excalidraw uses browser APIs.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Type will be inferred from the Excalidraw component
type ExcalidrawImperativeAPI = any;

interface WhiteboardProps {
  onExcalidrawReady: (api: ExcalidrawImperativeAPI) => void;
}

export function Whiteboard({ onExcalidrawReady }: WhiteboardProps) {
  const [Excalidraw, setExcalidraw] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamically import Excalidraw (client-side only)
  useEffect(() => {
    import("@excalidraw/excalidraw").then((module) => {
      setExcalidraw(() => module.Excalidraw);
    });
  }, []);

  // Wait for container to be mounted and get dimensions
  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDimensions({
            width: rect.width,
            height: rect.height,
          });
          setIsMounted(true);
        }
      };

      // Wait a bit for layout to settle
      const timer = setTimeout(updateDimensions, 100);

      window.addEventListener('resize', updateDimensions);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);

  // Notify parent when API is ready
  const handleExcalidrawMount = (api: ExcalidrawImperativeAPI) => {
    excalidrawRef.current = api;
    onExcalidrawReady(api);
    console.log("Excalidraw API ready");
  };

  // Show loading state while Excalidraw loads or container not ready
  if (!Excalidraw || !isMounted || dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-full w-full bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-slate-400">
            {!Excalidraw ? "Loading whiteboard..." : "Initializing canvas..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        position: "relative",
        minHeight: "400px",
        minWidth: "400px"
      }}
    >
      <Excalidraw
        excalidrawAPI={(api: any) => handleExcalidrawMount(api)}
        theme="dark"
        initialData={{
          elements: [],
          appState: {
            viewBackgroundColor: "#0f0f23",
          },
        }}
      />
    </div>
  );
}
