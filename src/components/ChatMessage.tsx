/**
 * ChatMessage Component
 *
 * Displays a single message bubble in the chat sidebar.
 * Supports both user and AI messages with different styling.
 * Shows collapsible "thinking" section for AI actions.
 */

import { cn } from "@/lib/utils";
import { Sparkles, User, ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasActions?: boolean;
  actions?: any[];
}

interface ChatMessageProps {
  message: Message;
}

// Helper to format action descriptions
function formatAction(action: any, index: number): string {
  switch (action.type) {
    case "create_shape":
      return `Created ${action.shape} "${action.text || 'shape'}" at position (${action.x}, ${action.y})`;
    case "create_text":
      return `Created text "${action.text}" at position (${action.x}, ${action.y})`;
    case "connect":
      return `Connected element ${action.from} to element ${action.to}`;
    case "create_arrow":
      return `Created arrow from (${action.x}, ${action.y}) to (${action.endX}, ${action.endY})`;
    default:
      return `Action ${index + 1}: ${action.type}`;
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true); // Default expanded

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg transition-colors",
        isUser
          ? "bg-violet-500/10 ml-8"
          : "bg-slate-800/50 mr-8"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-violet-500/20 text-violet-400"
            : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2">
        {/* Role Label */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              isUser ? "text-violet-400" : "text-purple-400"
            )}
          >
            {isUser ? "You" : "Constellar AI"}
          </span>
          {message.hasActions && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              Generated Elements
            </span>
          )}
        </div>

        {/* Thinking/Actions Section (only for AI with actions) */}
        {!isUser && message.hasActions && message.actions && message.actions.length > 0 && (
          <div className="mb-1">
            <button
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-700/30 rounded transition-colors"
            >
              {isThinkingExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              <span>Used {message.actions.length} {message.actions.length === 1 ? 'tool' : 'tools'}</span>
            </button>

            {isThinkingExpanded && (
              <div className="mt-2 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg space-y-1.5">
                {message.actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <div className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    </div>
                    <span className="text-slate-300 leading-relaxed">{formatAction(action, index)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message Text */}
        <div
          className={cn(
            "text-sm leading-relaxed prose prose-invert prose-sm max-w-none",
            "prose-p:my-2 prose-code:text-violet-400 prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
            "prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700/50"
          )}
        >
          {isUser ? (
            <p className="text-slate-200">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                // Custom rendering for code blocks to prevent showing JSON actions
                code: ({ inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isJson = match && match[1] === "json";

                  // Hide JSON action blocks from display
                  if (isJson && !inline) {
                    return null;
                  }

                  if (inline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }

                  return (
                    <pre className={className}>
                      <code {...props}>{children}</code>
                    </pre>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-slate-500">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
