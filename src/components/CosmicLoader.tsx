"use client";

import { motion } from "framer-motion";

interface CosmicLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CosmicLoader({ size = "md", className = "" }: CosmicLoaderProps) {
  const sizeMap = {
    sm: { container: "w-6 h-6", orbit: "w-6 h-6", star: "w-1 h-1" },
    md: { container: "w-8 h-8", orbit: "w-8 h-8", star: "w-1.5 h-1.5" },
    lg: { container: "w-12 h-12", orbit: "w-12 h-12", star: "w-2 h-2" },
  };

  const sizes = sizeMap[size];

  return (
    <div className={`relative ${sizes.container} ${className}`}>
      {/* Center star */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting stars - 3 orbits */}
      {[0, 1, 2].map((orbitIndex) => (
        <motion.div
          key={orbitIndex}
          className={`absolute inset-0 ${sizes.orbit}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3 - orbitIndex * 0.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <motion.div
            className={`absolute top-0 left-1/2 ${sizes.star} bg-white/90 rounded-full -translate-x-1/2 shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: orbitIndex * 0.3,
            }}
          />
        </motion.div>
      ))}

      {/* Faint orbital rings */}
      {[0, 1, 2].map((ringIndex) => (
        <motion.div
          key={`ring-${ringIndex}`}
          className="absolute inset-0 rounded-full border border-white/10"
          style={{
            transform: `scale(${0.4 + ringIndex * 0.3})`,
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ringIndex * 0.4,
          }}
        />
      ))}
    </div>
  );
}
