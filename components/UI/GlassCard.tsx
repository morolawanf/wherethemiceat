"use client";

import { motion } from "framer-motion";
import { useTemperature } from "@/store/useAppStore";
import { getGlassOpacity, getGlassBlur } from "@/lib/temperature";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "elevated" | "flat";
}

/**
 * Glassmorphic card component with temperature-based styling
 * Gets frostier (more opacity, more blur) as temperature increases
 */
export function GlassCard({
  children,
  className,
  onClick,
  variant = "default",
}: GlassCardProps) {
  const temperature = useTemperature();
  const opacity = getGlassOpacity(temperature.value);
  const blur = getGlassBlur(temperature.value);

  const baseClasses = "rounded-lg border border-white/20 transition-all duration-500";
  
  const variantClasses = {
    default: "shadow-lg",
    elevated: "shadow-xl",
    flat: "shadow-md",
  };

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        onClick && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  );
}

