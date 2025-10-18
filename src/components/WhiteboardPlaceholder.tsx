/**
 * Whiteboard Placeholder Component
 *
 * Temporary placeholder until the actual whiteboard component is ready.
 * This allows testing the chat sidebar independently.
 */

"use client";

import React from "react";
import { Pencil } from "lucide-react";

type ExcalidrawImperativeAPI = any;

interface WhiteboardPlaceholderProps {
  onExcalidrawReady: (api: ExcalidrawImperativeAPI) => void;
}

export function WhiteboardPlaceholder({ onExcalidrawReady }: WhiteboardPlaceholderProps) {
  // Notify parent with mock API on mount
  React.useEffect(() => {
    // Create a mock API for testing
    const mockAPI = {
      updateScene: (data: any) => {
        console.log("Mock updateScene called with:", data);
      },
      getSceneElements: () => {
        console.log("Mock getSceneElements called");
        return [];
      },
    };

    onExcalidrawReady(mockAPI);
  }, [onExcalidrawReady]);

  return (
    <div className="h-full w-full bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
          <Pencil className="w-10 h-10 text-violet-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Whiteboard Canvas</h2>
        <p className="text-slate-400">
          This is a placeholder for the whiteboard component.
          Your teammate's canvas implementation will go here.
        </p>
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-300 mb-2">
            <strong>For now, you can test:</strong>
          </p>
          <ul className="text-sm text-slate-400 text-left space-y-1">
            <li>✓ Chat sidebar UI</li>
            <li>✓ Gemini API integration</li>
            <li>✓ JSON action parsing</li>
            <li>✓ Message history</li>
          </ul>
          <p className="text-xs text-slate-500 mt-3">
            Actions from the AI will be logged to the browser console
          </p>
        </div>
      </div>
    </div>
  );
}
