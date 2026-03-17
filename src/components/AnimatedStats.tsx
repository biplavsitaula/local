"use client";

import React, { useState, useEffect, useRef } from "react";

interface StatItem {
  value: string;
  label: string;
}

interface AnimatedStatsProps {
  stats: StatItem[];
  variant?: "hero-dark" | "hero-gradient" | "card";
  className?: string;
}

/**
 * Parses a stat value like "500+", "10k+", "5000+", "24/7", "1hr"
 * Returns { numericValue, prefix, suffix, isAnimatable }
 */
function parseStatValue(value: string): {
  numericValue: number;
  prefix: string;
  suffix: string;
  isAnimatable: boolean;
} {
  // Match patterns like "10+", "500+", "5000+", "10k+", etc.
  const match = value.match(/^(\d+)(k?)(\+?)$/i);
  if (match) {
    let num = parseInt(match[1], 10);
    const isK = match[2].toLowerCase() === "k";
    const suffix = (isK ? "k" : "") + (match[3] || "");
    return { numericValue: num, prefix: "", suffix, isAnimatable: true };
  }
  return { numericValue: 0, prefix: "", suffix: value, isAnimatable: false };
}

function useCountUp(
  target: number,
  isAnimatable: boolean,
  isVisible: boolean,
  duration: number = 2000
): number {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || !isAnimatable || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a smooth deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(easedProgress * target);

      setCount(currentCount);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, isAnimatable, isVisible, duration]);

  return isAnimatable ? count : 0;
}

const AnimatedStatItem: React.FC<{
  stat: StatItem;
  isVisible: boolean;
  variant: "hero-dark" | "hero-gradient" | "card";
}> = ({ stat, isVisible, variant }) => {
  const parsed = parseStatValue(stat.value);
  const animatedValue = useCountUp(parsed.numericValue, parsed.isAnimatable, isVisible);

  const displayValue = parsed.isAnimatable
    ? `${parsed.prefix}${animatedValue}${parsed.suffix}`
    : stat.value;

  if (variant === "hero-dark") {
    return (
      <div className="text-left">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500">
          {displayValue}
        </p>
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500">
          {stat.label}
        </p>
      </div>
    );
  }

  if (variant === "hero-gradient") {
    return (
      <div className="text-center">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-gradient">
          {displayValue}
        </p>
        <p className="text-xs sm:text-sm text-color-muted">{stat.label}</p>
      </div>
    );
  }

  // card variant (for AboutPageContent)
  return (
    <div className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 text-center border border-border hover:border-golden transition-colors">
      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ternary-text mb-1 sm:mb-2">
        {displayValue}
      </div>
      <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
        {stat.label}
      </div>
    </div>
  );
};

const AnimatedStats: React.FC<AnimatedStatsProps> = ({
  stats,
  variant = "card",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Default layout classes based on variant
  let defaultClass = "";
  if (variant === "hero-dark") {
    defaultClass = "flex flex-wrap gap-5 sm:gap-12 pt-6 sm:pt-10 md:pt-12 border-t border-white/10 w-fit";
  } else if (variant === "hero-gradient") {
    defaultClass = "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 pt-8 sm:pt-12 max-w-2xl mx-auto";
  } else {
    defaultClass = "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 md:mb-16";
  }

  return (
    <div ref={containerRef} className={className || defaultClass}>
      {stats.map((stat, index) => (
        <AnimatedStatItem
          key={index}
          stat={stat}
          isVisible={isVisible}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default AnimatedStats;
