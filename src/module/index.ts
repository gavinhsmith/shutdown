/**
 * @module shutdown
 *
 * A simple shutdown handler for Node.
 *
 * @author gavinhsmith
 */

// Types / Interfaces

/** A function that will be run on shutdown. */
export type ShutdownProcesser = (code: number, name: string) => void;

/** A shutdown process and its requires. */
export interface ShutdownProcess {
  name: string;
  processer: ShutdownProcesser;
  requires: string[];
}

/** Config for shutdown. */
export interface ShutdownConfig {
  /** The exit code that SIGTERM, SIGINT, etc should send when recieved. Defaults to `1`. */
  signalExitCode?: number;
  /** Signals to watch for. Defaults to `SIGTERM`, `SIGINT`, `SIGUSR1`, and `SIGUSR2`. */
  watchedSignals?: NodeJS.Signals[];
  /** Process events to watch for. Defaults to `uncaughtException`. Can **NOT** be `exit` or `beforeExit` */
  watchedEvents?: string[];
}

/** Processed config for shutdown. */
export interface CleanShutdownConfig extends ShutdownConfig {
  signalExitCode: number;
  watchedSignals: NodeJS.Signals[];
  watchedEvents: string[];
}

// Constants

/** The default config for shutdown. */
const DEFAULT_CONFIG: CleanShutdownConfig = {
  signalExitCode: 1,
  watchedSignals: ["SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"],
  watchedEvents: ["uncaughtException"],
};

/** A collection of all known processes. */
const SHUTDOWN_PROCESSES: ShutdownProcess[] = [];

// Helper Functions

/**
 * Process shutdown.
 * @param code The exit code.
 */
function processShutdown(code: number) {
  console.info("Shutting down...");

  for (const process of SHUTDOWN_PROCESSES) {
    console.info(`Running process ${process.name}`);
    process.processer(code, process.name);
  }

  console.info("Gracefull shutdown complete!");
  process.exit(code);
}

/**
 * Verifies the config data.
 * @param config The config to verify.
 * @returns Returns the config.
 */
function verifyConfig(config: CleanShutdownConfig): CleanShutdownConfig {
  const invalidEvents = ["exit", "beforeExit"];

  function containsInvalidEvents(array: string[]): boolean {
    for (const event of invalidEvents) {
      if (array.includes(event)) return true;
    }
    return array.includes("exit") || array.includes("beforeExit");
  }
  function indexOfViolation(array: string[]) {
    return array.findIndex((value) => invalidEvents.includes(value));
  }

  if (
    containsInvalidEvents([...config.watchedEvents, ...config.watchedSignals])
  ) {
    console.warn(
      'watchedEvents can\'t be "exit" or "beforeExit". Not listening to that event...'
    );
    while (indexOfViolation(config.watchedSignals) != -1) {
      delete config.watchedSignals[indexOfViolation(config.watchedSignals)];
    }
    while (indexOfViolation(config.watchedEvents) != -1) {
      delete config.watchedEvents[indexOfViolation(config.watchedEvents)];
    }
  }

  return config;
}

// Exports

/**
 * Initiate shutdown.
 * @param config Config for shutdown.
 */
export function init(config: ShutdownConfig = {}): void {
  // Load config
  const { signalExitCode, watchedSignals, watchedEvents } = verifyConfig({
    ...DEFAULT_CONFIG,
    ...config,
  });

  [...watchedSignals, ...watchedEvents].forEach((eventType) => {
    if (eventType != null)
      process.on(eventType, processShutdown.bind(null, signalExitCode));
  });

  process.on("beforeExit", processShutdown);
}

/**
 * Adds a new process to be run at shutdown.
 * @param name The name of this process
 * @param shutdownProcess The function that will be run, must return a promise that resolves on completion.
 * @param requires A list of processes that need to be completed before this one can be run.
 */
export function runAtShutdown(
  name: string,
  shutdownProcess: ShutdownProcesser,
  requires: string[] = []
) {
  SHUTDOWN_PROCESSES.push({
    name,
    processer: shutdownProcess,
    requires,
  });

  SHUTDOWN_PROCESSES.sort((a, b) => {
    if (a.requires.includes(b.name)) {
      return -1; // A must happen before B
    } else {
      return b.requires.length - a.requires.length;
    }
  });
}

// Export Default

export default runAtShutdown;
