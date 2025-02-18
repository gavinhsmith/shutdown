# shutdown

A simple shutdown handler for Node.

[![NPM Version](https://img.shields.io/npm/v/%40gavinhsmith%2Fshutdown?style=flat-square&label=NPM%20Version&labelColor=cc3838&color=f0f0f0)](https://www.npmjs.com/package/@gavinhsmith/shutdown)
[![NPM Downloads](https://img.shields.io/npm/d18m/%40gavinhsmith%2Fshutdown?style=flat-square&label=NPM%20Downloads&labelColor=cc3838&color=f0f0f0)](https://www.npmjs.com/package/@gavinhsmith/shutdown)
[![License](https://img.shields.io/github/license/gavinhsmith/shutdown?style=flat-square&label=Licence&color=f0f0f0)](https://github.com/gavinhsmith/shutdown?tab=MIT-1-ov-file)

## Install

Install `shutdown` via your favorite package manager.

### [NPM](https://www.npmjs.com/package/@gavinhsmith/shutdown)

```shell
npm install @gavinhsmith/shutdown
```

### [Yarn](https://yarnpkg.com/package?name=%40gavinhsmith%2Fshutdown)

```shell
yarn add @gavinhsmith/shutdown
```

## Usage

Include in your project, init shutdown, and add as many handlers as you'd like. TypeScript definitions are included in the module.

```ts
// Import the module.
import runAtShutdown, { init } from "@gavinhsmith/shutdown";

// Initiate the module in your startup file.
init({...});

// Add your handlers anywhere in your project.
runAtShutdown("handler_1", (code, name) => {...});

// Add another that requires "handler_1" to be completed first.
runAtShutdown("handler_1", (code, name) => {...}, ["handler_1"]);
```

## Config

Module can be configed in the `init()` function.

```ts
// Changes the signals to listen to, and the exit code to throw on a signal.
init({
  signalExitCode: 2,
  watchedSignals: ["SIGTERM"],
  ...
});

// Your code, including your shutdowns...
runAtShutdown("handler_1", (code, name) => {...});
runAtShutdown("handler_2", (code, name) => {...}, ["handler_1"]);
runAtShutdown("handler_3", (code, name) => {...}, ["handler_1"]);

// End your program somehow.
process.kill(process.pid, "SIGTERM");
```

```text
Process exited with code 2.
```

## Config options

These config options can be used in the `init()` function to modify shutdown.

|  Config Option   |                                                  Description                                                   |    Type    |                  Default                  |
| :--------------: | :------------------------------------------------------------------------------------------------------------: | :--------: | :---------------------------------------: |
| _signalExitCode_ |                    The exit code that signal events like `SIGTERM` will throw when invoked.                    |   `int`    |                    `1`                    |
| _watchedSignals_ |                                   The signals that shutdown will listen to.                                    | `string[]` | `SIGINT`, `SIGTERM`, `SIGUSR1`, `SIGUSR2` |
| _watchedEvents_  | The process events that shutdown will listen to. Can't be `exit` or `beforeExit`, these are already processed. | `string[]` |            `uncaughtException`            |
|     _quiet_      |                                   If shutdown messages should be suppresed.                                    | `boolean`  |                  `true`                   |

## Contributing

Clone the repository, and run `npm i` or `yarn` to install the dependancies and build the module. Run module tests via the `test` script in package.json.

Workflow tests require [act](https://github.com/nektos/act). You **do not need** this for module development, as workflow tests are not run during CI.

I'll review pull requests in time.
