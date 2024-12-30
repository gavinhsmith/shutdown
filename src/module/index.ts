import getCurrentTime from "./date.js";

console.info("Hello, World!");
console.info(`It is currently ${getCurrentTime().toDateString()}.`);

process.exit(0);
