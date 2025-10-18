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
import { ChatMessage, type Message } from "./ChatMessage";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Loader2, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendMessage, type GeminiMessage } from "@/lib/geminiClient";
import { executeActions } from "@/lib/mcpAdapter";

type ExcalidrawImperativeAPI = any;
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface ChatSidebarProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

export function ChatSidebar({ excalidrawAPI }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI whiteboard assistant. Describe any diagram, flowchart, or visual concept you'd like to create, and I'll help bring it to life on the canvas. Try saying something like:\n\n- \"Draw a flowchart for a login system\"\n- \"Create a neural network diagram with 3 layers\"\n- \"Show me a system architecture with database and API\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

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

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
    setShowSettings(false);
  };

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

    // Check if API key is set
    if (!apiKey) {
      alert(
        "Please set your Google Gemini API key in the settings (gear icon) before chatting."
      );
      setShowSettings(true);
      return;
    }

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
      // Convert messages to Gemini format (exclude welcome message)
      const history: GeminiMessage[] = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          content: msg.content,
        }));

      // Send message to Gemini
      const response = await sendMessage(apiKey, userMessage.content, history);

      // Create AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        hasActions: response.hasActions,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If there are actions, execute them on the whiteboard
      if (response.actions && response.actions.length > 0) {
        console.log("Executing actions:", response.actions);
        executeActions(response.actions, excalidrawAPI);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please check your API key and try again.`,
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

            {/* Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>API Settings</DialogTitle>
                  <DialogDescription>
                    Configure your Google Gemini API key. Get one from{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:underline"
                    >
                      Google AI Studio
                    </a>
                    .
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Gemini API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="AIzaSy..."
                      defaultValue={apiKey}
                      onBlur={(e) => handleSaveApiKey(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Your API key is stored locally in your browser and never
                    sent to our servers.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 mr-8">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="text-sm text-slate-400">
                Constellar AI is thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

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
              "focus:border-violet-500/50 focus:ring-violet-500/20",
              "placeholder:text-slate-500"
            )}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={cn(
              "h-auto px-4",
              "bg-gradient-to-r from-violet-500 to-purple-600",
              "hover:from-violet-600 hover:to-purple-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
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
