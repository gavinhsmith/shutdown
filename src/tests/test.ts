import runAtShutdown, { init } from "@this";
init({
  watchedEvents: ["exit"],
});

runAtShutdown("test", () => {
  console.info("This would be run at shutdown before we are done...");
});

console.info("Test exit");
