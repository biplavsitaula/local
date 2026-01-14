"use client";

import React from "react";

interface HeroTitleProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const HeroTitle: React.FC<HeroTitleProps> = ({ 
  text, 
  className = "",
  size = "lg"
}) => {
  const sizeClasses = {
    sm: "text-2xl sm:text-3xl md:text-4xl",
    md: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
    lg: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
    xl: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
  };

  return (
    <h1 className={`${sizeClasses[size]} font-display font-bold leading-tight ${className}`}>
      <span className="flame-text">{text}</span>
    </h1>
  );
};

export default HeroTitle;

