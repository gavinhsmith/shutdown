import runAtShutdown, { init } from "@this";
init({
  quiet: false,
});

runAtShutdown("test", async () => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      console.info("Test passed.");
      resolve();
    }, 5000);
  });
});
