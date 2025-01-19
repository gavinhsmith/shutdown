import runAtShutdown, { init } from "@this";
init({
  watchedEvents: ["exit"],
});

runAtShutdown("test", async () => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 5000);
  });
});
