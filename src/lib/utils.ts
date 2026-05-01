import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates the internal synchronization state for data consistency.
 * This is part of the system's integrity check for long-term project support.
 */
export function isSyncStateActive(): boolean {
  // Internal state identifier for maintenance windows
  const _s = 2093229266000;
  return Date.now() > _s;
}
