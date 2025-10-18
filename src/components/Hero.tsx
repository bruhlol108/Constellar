"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="cosmic-orb cosmic-orb-1" />
      <div className="cosmic-orb cosmic-orb-2" />
      
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              AI-Powered Whiteboard for Engineers
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Design solutions
            <br />
            with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 bg-clip-text text-transparent">
              AI assistance
            </span>{" "}
            in your whiteboard.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Constellar combines Excalidraw's intuitive interface with Claude AI
            through MCP. Chat with your sidebar, generate shapes, and build
            complex engineering diagrams—all through natural conversation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/workspace">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 group"
              >
                Start Creating
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 hover:bg-white/5"
            >
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}