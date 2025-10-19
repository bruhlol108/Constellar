/**
 * ChatSidebar Component
 *
 * The main chat interface for interacting with Gemini AI.
 * Features:
 * - Message list with auto-scroll
 * - Input box for user prompts
 * - Integration with Gemini API
 * - Parsing and execution of diagram actions
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "./ChatMessage";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CosmicLoader from "./CosmicLoader";

type ExcalidrawImperativeAPI = any;

interface ChatSidebarProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

export function ChatSidebar({ excalidrawAPI }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI whiteboard assistant powered by Google Gemini and Excalidraw. Describe any diagram, flowchart, or visual concept you'd like to create, and I'll help bring it to life on the canvas.\n\nTry:\n- \"Create a simple flowchart\"\n- \"Draw a system architecture diagram\"\n- \"Make a neural network diagram\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Chat cleared. What would you like to create on the whiteboard?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("[ChatSidebar] API response:", data);

      // Create AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Created elements on canvas",
        timestamp: new Date(),
        hasActions: !!data.toolCalls && data.toolCalls.length > 0,
        actions: data.toolCalls || [],
      };

      // Log tool calls to console
      if (data.toolCalls && data.toolCalls.length > 0) {
        console.group("🎨 [ChatSidebar] Tool Calls Received");
        data.toolCalls.forEach((call: any, index: number) => {
          const params = Object.entries(call)
            .filter(([key]) => key !== 'type')
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join(', ');
          console.log(`${index + 1}. ${call.type}(${params})`);
        });
        console.groupEnd();
      }

      setMessages((prev) => [...prev, aiMessage]);

      // If there are elements, add them to the canvas
      if (data.elements && data.elements.length > 0) {
        console.group("🖼️ [ChatSidebar] Adding Elements to Canvas");
        console.log(`📊 Received ${data.elements.length} element(s)`);
        console.log("🎯 Excalidraw API ready:", !!excalidrawAPI);

        if (!excalidrawAPI) {
          console.error("❌ ExcalidrawAPI not available yet!");
          console.groupEnd();
        } else {
          try {
            const currentElements = excalidrawAPI.getSceneElements();
            console.log(`📝 Current canvas has ${currentElements?.length || 0} element(s)`);

            const newElements = [...(currentElements || []), ...data.elements];
            console.log(`🔄 Updating canvas with ${newElements.length} total element(s)`);

            excalidrawAPI.updateScene({
              elements: newElements,
            });

            console.log("✅ Canvas updated successfully");
            console.groupEnd();
          } catch (error) {
            console.error("❌ Error adding elements to canvas:", error);
            console.groupEnd();
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-l border-slate-800/50">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              AI Assistant
            </h2>
            <p className="text-xs text-slate-400">
              Powered by Google Gemini
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 mr-8">
                <div className="flex-shrink-0">
                  <CosmicLoader size="sm" />
                </div>
                <div className="text-sm text-slate-400">
                  Constellar AI is thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to create..."
            className={cn(
              "min-h-[80px] max-h-[200px] resize-none",
              "bg-slate-800/50 border-slate-700/50",
              "focus:border-white/50 focus:ring-white/20",
              "placeholder:text-slate-500"
            )}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={cn(
              "h-auto px-4",
              "bg-white/15 hover:bg-white/25 border border-white/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <CosmicLoader size="sm" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
