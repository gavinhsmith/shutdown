/**
 * Gets the current time.
 * @param adjust Adjusts the current time by `ms` milliseconds.
 * @returns A instance of `Date` that holds the time.
 */
export default function getCurrentTime(adjust: number = 0): Date {
  return adjust != 0 ? new Date() : new Date(new Date().getTime() + adjust);
}
