"use client";

import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface AdSpaceProps {
  size: "banner" | "sidebar" | "square" | "mobile-banner";
  className?: string;
}

/**
 * Reusable ad space component
 * Provides designated areas for advertisements
 */
export function AdSpace({ size, className }: AdSpaceProps) {
  const sizeClasses = {
    banner: "w-full h-24 md:h-32",
    sidebar: "w-full h-96 hidden md:block",
    square: "w-full aspect-square",
    "mobile-banner": "w-full h-16 md:hidden",
  };

  return (
    <GlassCard
      className={cn(
        "flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      variant="flat"
    >
      <div className="text-white/40 text-sm font-mono">
        Ad Space ({size})
      </div>
    </GlassCard>
  );
}

