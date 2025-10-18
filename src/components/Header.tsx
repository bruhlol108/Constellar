"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-purple-500 group-hover:text-purple-400 transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Constellar
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#integration"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Integration
            </Link>
            <Link
              href="#docs"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Button
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-400"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}