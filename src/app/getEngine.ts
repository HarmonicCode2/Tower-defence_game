import type { CreationEngine } from "../engine/engine";

let instance: CreationEngine | null = null;

/**
 * Get the main application engine
 * This is a simple way to access the engine instance from anywhere in the app
 */
export function engine(): CreationEngine {
  return instance!;
}

export function setEngine(app: CreationEngine) {
  instance = app;
}

export function getEngine(): CreationEngine {
  if (!instance) {
    throw new Error("Engine has not been initialized. Call setEngine() first.");
  }
  return instance;
}
