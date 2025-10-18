"use client";

import { MessageSquare, Pencil, Zap, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Conversational Design",
    description:
      "Simply describe what you want to create. Our AI understands your intent and generates the shapes and diagrams.",
  },
  {
    icon: Pencil,
    title: "Excalidraw Integration",
    description:
      "Built on top of Excalidraw's powerful API, giving you the best hand-drawn style whiteboard experience.",
  },
  {
    icon: Bot,
    title: "Claude MCP",
    description:
      "Connected to Claude AI through Model Context Protocol for intelligent, context-aware design assistance.",
  },
  {
    icon: Zap,
    title: "Generative Shapes",
    description:
      "Generate complex diagrams, flowcharts, and architecture designs through natural language commands.",
  },
];

export default function Features() {
  return (
    <section className="py-24 relative" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Engineer with{" "}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              intelligence
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform how you design and collaborate with AI-powered whiteboarding
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-secondary/50 border-white/10 backdrop-blur-sm p-6 hover:bg-secondary/70 transition-all hover:border-purple-500/30 group"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}