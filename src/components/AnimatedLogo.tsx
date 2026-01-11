"use client";

import React from "react";
import Image from "next/image";

interface AnimatedLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  width = 180,
  height = 48,
  className = "",
}) => {
  return (
    <div className={`relative flex items-center justify-center py-1 pointer-events-none ${className}`}>
      <div className="relative w-48 h-24 flex items-center justify-center">
        {/* Glow layers */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-yellow/30 via-flame-orange/20 to-flame-red/15 blur-2xl animate-glow-pulse-outer"
          style={{ animationDuration: "2.5s" }}
        />
        
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-orange/30 via-flame-red/20 to-flame-yellow/20 blur-xl animate-glow-pulse"
          style={{ animationDelay: "0.2s", animationDuration: "2.8s" }}
        />
        
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-orange/50 via-flame-red/40 to-flame-yellow/30 blur-lg animate-glow-pulse"
          style={{ animationDelay: "0.4s", animationDuration: "3s" }}
        />
        
        {/* Logo Image */}
        <div className="relative z-10 flex items-center justify-center animate-flame-pulse transition-all duration-300">
          <Image 
            src="/assets/flame-dark-logo.png" 
            alt="Flame Beverage logo" 
            width={width}
            height={height}
            className="object-contain h-auto w-auto drop-shadow-2xl transition-transform duration-300"
            priority
          />
        </div>

        {/* Floating ember particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ember-float"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2.5 + (i % 4) * 0.5}s`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-flame-orange to-flame-red blur-sm"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-40px)`,
                opacity: 0.5 + (i % 3) * 0.15,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedLogo;


































