/**
 * File source: https://bit.ly/3ukaHTz
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type {
  Config,
} from "@japa/runner";
import {
  TestContext,
} from "@japa/runner";
import TestUtils from "@ioc:Adonis/Core/TestUtils";
import {
  assert,
  runFailedTests,
  specReporter,
  apiClient,
} from "@japa/preset-adonis";
import sinon from "sinon";
import type {
  SinonSandbox,
} from "sinon";
import {
  Test,
} from "@japa/core";

declare module "@japa/runner" {

  // Interface must match the class name
  interface TestContext {
    sinon: SinonSandbox;
  }

}

/*
 |--------------------------------------------------------------------------
 | Japa Plugins
 |--------------------------------------------------------------------------
 |
 | Japa plugins allows you to add additional features to Japa. By default
 | we register the assertion plugin.
 |
 | Feel free to remove existing plugins or add more.
 |
 */
export const plugins: Config["plugins"] = [ assert(), runFailedTests(), apiClient() ];

/*
 |--------------------------------------------------------------------------
 | Japa Reporters
 |--------------------------------------------------------------------------
 |
 | Japa reporters displays/saves the progress of tests as they are executed.
 | By default, we register the spec reporter to show a detailed report
 | of tests on the terminal.
 |
 */
export const reporters: Config["reporters"] = [ specReporter() ];

/*
 |--------------------------------------------------------------------------
 | Runner hooks
 |--------------------------------------------------------------------------
 |
 | Runner hooks are executed after booting the AdonisJS app and
 | before the test files are imported.
 |
 | You can perform actions like starting the HTTP server or running migrations
 | within the runner hooks
 |
 */

export const runnerHooks: Required<Pick<Config, "setup" | "teardown">> = {
  setup: [
    () => TestUtils.ace().loadCommands(),
    () => TestContext.getter("sinon", () => sinon.createSandbox(), true),
  ],
  teardown: [],
};


/*
 |--------------------------------------------------------------------------
 | Configure individual suites
 |--------------------------------------------------------------------------
 |
 | The configureSuite method gets called for every test suite registered
 | within ".adonisrc.json" file.
 |
 | You can use this method to configure suites. For example: Only start
 | the HTTP server when it is a functional suite.
 */
export const configureSuite: Config["configureSuite"] = (suite) => {
  if ("functional" === suite.name) {
    suite.setup(() => TestUtils.httpServer().start());
  }

  const restoreSinonSandbox = (test: Test<TestContext, any>) => {
    test.context.sinon.restore();
  };

  suite.onGroup((group) => {
    group.each.teardown(restoreSinonSandbox);
  });

  suite.onTest((test) => {
    test.teardown(restoreSinonSandbox);
  });
};