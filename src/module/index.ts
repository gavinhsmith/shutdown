/**
 * @module shutdown
 *
 * A simple shutdown handler for Node.
 *
 * @author gavinhsmith
 */

// Types / Interfaces

/** A function that will be run on shutdown. */
export type ShutdownProcesser = (code: number, name: string) => Promise<void>;

/** A shutdown process and its requires. */
export interface ShutdownProcess {
  name: string;
  processer: ShutdownProcesser;
  requires: string[];
}

/** Config for shutdown. */
export interface ShutdownConfig {
  /** The exit code that SIGTERM, SIGINT, etc should send when recieved. Defaults to `1`. */
  signalExitCode: number;
  /** Signals to watch for. Defaults to `SIGTERM`, `SIGINT`, `SIGUSR1`, and `SIGUSR2`. */
  watchedSignals: NodeJS.Signals[];
  /** Process events to watch for. Defaults to `uncaughtException`. Can **NOT** be `exit` or `beforeExit` */
  watchedEvents: string[];
  /** If shutdown messages should be suppresed. Defaults to `true`. */
  quiet: boolean;
}

// Constants

/** The default config for shutdown. */
const DEFAULT_CONFIG: ShutdownConfig = {
  signalExitCode: 1,
  watchedSignals: ["SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"],
  watchedEvents: ["uncaughtException"],
  quiet: true,
};

/** A collection of all known processes. */
const SHUTDOWN_PROCESSES: ShutdownProcess[] = [];

// Helper Functions

/**
 * Process shutdown.
 * @param code The exit code.
 */
function processShutdown(quiet: boolean) {
  return async (code: number) => {
    if (!quiet) console.info("Shutting down...");

    for (const process of SHUTDOWN_PROCESSES) {
      if (!quiet) console.info(`Running process ${process.name}`);
      await process.processer(code, process.name);
    }

    if (!quiet) console.info("Gracefull shutdown complete!");
    process.exit(code);
  };
}

/**
 * Verifies the config data.
 * @param config The config to verify.
 * @returns Returns the config.
 */
function verifyConfig(config: ShutdownConfig): ShutdownConfig {
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
export function init(config: Partial<ShutdownConfig> = {}): void {
  // Load config
  const { signalExitCode, watchedSignals, watchedEvents, quiet } = verifyConfig(
    {
      ...DEFAULT_CONFIG,
      ...config,
    }
  );

  [...watchedSignals, ...watchedEvents].forEach((eventType) => {
    if (eventType != null)
      process.on(eventType, processShutdown(quiet).bind(null, signalExitCode));
  });

  process.on("beforeExit", processShutdown(quiet));
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
