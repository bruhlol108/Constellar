"use client";

import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-lg font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                Constellar
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm">
              An AI-enabled whiteboard for engineers to generatively design solutions
              through natural conversation. Powered by Excalidraw and Claude AI.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#integration" className="hover:text-white transition-colors">
                  Integration
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-purple-500/20 hover:text-purple-400 transition-all"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-purple-500/20 hover:text-purple-400 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-purple-500/20 hover:text-purple-400 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 Constellar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}