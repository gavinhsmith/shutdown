// Types / Interfaces

/** A function that will be run on shutdown. */
export type ShutdownProcesser = () => void;

/** A shutdown process and its requires. */
export interface ShutdownProcess {
  processer: ShutdownProcesser;
  requires: string[];
}

/** Config for shutdown. */
export interface ShutdownConfig {
  /** The exit code that SIGTERM, SIGINT, etc should send when recieved. */
  signalExitCode?: number;
}

// Constants

/** The default config for shutdown. */
const DEFAULT_CONFIG: ShutdownConfig = {
  signalExitCode: 1,
};

/** A collection of all known processes. */
const SHUTDOWN_PROCESSES: Map<string, ShutdownProcess> = new Map();

// Helper Functions

// Exports

/**
 * Initiate shutdown.
 * @param config Config for shutdown.
 */
export function init(config: ShutdownConfig = {}): void {
  const { signalExitCode }: ShutdownConfig = { ...DEFAULT_CONFIG, ...config };
  const processSigEvent = () => process.exit(signalExitCode);

  process.on("SIGTERM", processSigEvent);
  process.on("SIGINT", processSigEvent);
  process.on("SIGABRT", processSigEvent);

  process.on("exit", () => {});
}

/**
 * Adds a new process to be run at shutdown.
 * @param name The name of this process
 * @param shutdownProcess The function that will be run.
 * @param requires A list of processes that need to be completed before this one can be run.
 */
export function runAtShutdown(
  name: string,
  shutdownProcess: ShutdownProcesser,
  requires: string[] = []
) {
  SHUTDOWN_PROCESSES.set(name, {
    processer: shutdownProcess,
    requires,
  });
}
