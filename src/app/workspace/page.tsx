/**
 * Workspace Page
 *
 * Main application page featuring the AI whiteboard workspace.
 * This is where users interact with the Excalidraw canvas and AI chatbot.
 */

import { WorkspaceLayout } from "@/components/WorkspaceLayout";

export const metadata = {
  title: "Workspace | Constellar",
  description: "AI-powered whiteboard workspace",
};

export default function WorkspacePage() {
  return <WorkspaceLayout />;
}
