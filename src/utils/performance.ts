/**
 * Performance utilities for ProseMirror integration
 */

import { useRef, useEffect, useCallback } from "react";

/**
 * Custom hook for debouncing function calls
 * @param callback - Function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function
 */
export function useDebounce<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Shallow compare two objects for equality
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns Whether objects are shallowly equal
 */
export function shallowEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;

  if (!obj1 || !obj2) return false;

  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const record1 = obj1 as Record<string, unknown>;
  const record2 = obj2 as Record<string, unknown>;

  const keys1 = Object.keys(record1);
  const keys2 = Object.keys(record2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (record1[key] !== record2[key]) return false;
  }

  return true;
}

/**
 * Create a hash/checksum of a ProseMirror document for comparison
 * @param doc - ProseMirror document
 * @returns Simple hash string
 */
export function createDocumentHash(doc: {
  type: { name: string };
  nodeSize: number;
  textContent: string;
  childCount: number;
}): string {
  // Simple hash based on document structure and content
  return JSON.stringify({
    type: doc.type.name,
    size: doc.nodeSize,
    content: doc.textContent,
    childCount: doc.childCount,
  });
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    this.measurements.set(name, performance.now());
  }

  endMeasure(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);

    if (process.env.NODE_ENV === "development") {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }
}
