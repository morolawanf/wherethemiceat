import { TEMPERATURE_THRESHOLDS, TEMPERATURE_LEVELS } from "./constants";
import type { TemperatureLevel, TemperatureState } from "./types";

/**
 * Calculate temperature level based on distance to nearest report
 * Returns a value between 0-100
 */
export function calculateTemperatureValue(distanceMeters: number): number {
  const { NORMAL_THRESHOLD, COOL_THRESHOLD, COLD_THRESHOLD, FREEZE_THRESHOLD } =
    TEMPERATURE_THRESHOLDS;

  if (distanceMeters >= NORMAL_THRESHOLD) {
    return TEMPERATURE_LEVELS.NORMAL; // 0
  } else if (distanceMeters >= COOL_THRESHOLD) {
    // Linear interpolation between NORMAL and COOL (0-25)
    const ratio =
      (NORMAL_THRESHOLD - distanceMeters) / (NORMAL_THRESHOLD - COOL_THRESHOLD);
    return TEMPERATURE_LEVELS.NORMAL + ratio * (TEMPERATURE_LEVELS.COOL - TEMPERATURE_LEVELS.NORMAL);
  } else if (distanceMeters >= COLD_THRESHOLD) {
    // Linear interpolation between COOL and COLD (25-50)
    const ratio = (COOL_THRESHOLD - distanceMeters) / (COOL_THRESHOLD - COLD_THRESHOLD);
    return TEMPERATURE_LEVELS.COOL + ratio * (TEMPERATURE_LEVELS.COLD - TEMPERATURE_LEVELS.COOL);
  } else if (distanceMeters >= FREEZE_THRESHOLD) {
    // Linear interpolation between COLD and FREEZE (50-75)
    const ratio = (COLD_THRESHOLD - distanceMeters) / (COLD_THRESHOLD - FREEZE_THRESHOLD);
    return TEMPERATURE_LEVELS.COLD + ratio * (TEMPERATURE_LEVELS.FREEZE - TEMPERATURE_LEVELS.COLD);
  } else {
    // Linear interpolation between FREEZE and EXTREME (75-100)
    const ratio = Math.min(1, (FREEZE_THRESHOLD - distanceMeters) / FREEZE_THRESHOLD);
    return TEMPERATURE_LEVELS.FREEZE + ratio * (TEMPERATURE_LEVELS.EXTREME - TEMPERATURE_LEVELS.FREEZE);
  }
}

/**
 * Get temperature level label from value
 */
export function getTemperatureLevel(value: number): TemperatureLevel {
  if (value >= 75) return "extreme";
  if (value >= 50) return "freeze";
  if (value >= 25) return "cold";
  if (value >= 10) return "cool";
  return "normal";
}

/**
 * Get background gradient CSS based on temperature
 */
export function getTemperatureGradient(value: number): string {
  if (value >= 75) {
    // Extreme - Bright ice blue
    return "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)";
  } else if (value >= 50) {
    // Freeze - Icy blue
    return "linear-gradient(135deg, #a8edea 0%, #7dd3fc 100%)";
  } else if (value >= 25) {
    // Cold - Cool blue
    return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
  } else if (value >= 10) {
    // Cool - Blue purple
    return "linear-gradient(135deg, #667eea 0%, #4facfe 100%)";
  } else {
    // Normal - Dark purple/blue
    return "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)";
  }
}

/**
 * Get glass card opacity based on temperature
 */
export function getGlassOpacity(value: number): number {
  // Higher temperature (colder) = more opacity (more frosty)
  return 0.05 + (value / 100) * 0.15; // 0.05 to 0.20
}

/**
 * Get glass blur intensity based on temperature
 */
export function getGlassBlur(value: number): number {
  // Higher temperature (colder) = more blur (more frosty)
  return 8 + (value / 100) * 12; // 8px to 20px
}

/**
 * Get ice color intensity based on temperature
 */
export function getIceColorIntensity(value: number): string {
  // Returns a CSS color with varying intensity
  return `rgba(56, 189, 248, ${0.3 + (value / 100) * 0.7})`; // ice-400 with varying opacity
}

/**
 * Create complete temperature state
 */
export function createTemperatureState(nearestDistance: number | null): TemperatureState {
  if (nearestDistance === null) {
    return {
      level: "normal",
      value: TEMPERATURE_LEVELS.NORMAL,
      nearestDistance: null,
    };
  }

  const value = calculateTemperatureValue(nearestDistance);
  const level = getTemperatureLevel(value);

  return {
    level,
    value,
    nearestDistance,
  };
}

/**
 * Get temperature description for display
 */
export function getTemperatureDescription(level: TemperatureLevel): string {
  switch (level) {
    case "extreme":
      return "ICE agents are extremely close!";
    case "freeze":
      return "You're very close to a report";
    case "cold":
      return "Getting colder...";
    case "cool":
      return "There are reports nearby";
    case "normal":
    default:
      return "No reports nearby";
  }
}

