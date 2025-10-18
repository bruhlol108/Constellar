/**
 * WorkspaceLayout Component
 *
 * Main layout component that combines the Excalidraw whiteboard
 * and the AI chatbot sidebar in a split-panel view.
 *
 * Uses react-resizable-panels for a draggable split view.
 */

"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { ChatSidebar } from "./ChatSidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

type ExcalidrawImperativeAPI = any;

// Dynamically import Excalidraw to avoid SSR issues
const ExcalidrawCanvas = dynamic(
  () => import("./ExcalidrawCanvas"),
  { ssr: false }
);

export function WorkspaceLayout() {
  const excalidrawRef = useRef<any>(null);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Top Header */}
      <div className="flex-shrink-0 h-14 bg-slate-900 border-b border-slate-800/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Constellar</h1>
              <p className="text-xs text-slate-400">AI Whiteboard Workspace</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
            Ready
          </div>
        </div>
      </div>

      {/* Main Content: Resizable Split View */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        <ResizablePanelGroup direction="horizontal" style={{ height: '100%' }}>
          {/* Left Panel: Excalidraw Canvas */}
          <ResizablePanel defaultSize={70} minSize={30} style={{ height: '100%' }}>
            <div style={{ height: '100%', width: '100%' }}>
              <ExcalidrawCanvas ref={excalidrawRef} />
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle className="w-1 bg-slate-800 hover:bg-violet-500 transition-colors" />

          {/* Right Panel: Chat Sidebar */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50} style={{ height: '100%' }}>
            <ChatSidebar excalidrawAPI={excalidrawRef.current} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
