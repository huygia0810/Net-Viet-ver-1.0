import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { createNetVietApp } from '../server';

export interface TestHarnessInstance {
  url: string;
  close: () => Promise<void>;
}

export interface TestHarnessOptions {
  enableTestMockAi?: boolean;
  aiClient?: null;
}

/**
 * Starts an isolated test server bound strictly to loopback (127.0.0.1).
 * Mock permission is controlled strictly by options.enableTestMockAi passed
 * to createNetVietApp (app factory), NOT by external environment flags.
 * Used ONLY by integration test runners to verify mock AI pipelines in isolation.
 */
export async function startIsolatedTestHarness(options: TestHarnessOptions = { enableTestMockAi: true }): Promise<TestHarnessInstance> {
  const previousNodeEnv = process.env.NODE_ENV;
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }

  const app = createNetVietApp({
    enableTestMockAi: options.enableTestMockAi ?? true,
    aiClient: options.aiClient,
  });
  const server = http.createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });

  const address = server.address() as AddressInfo;
  const boundPort = address.port;

  return {
    url: `http://127.0.0.1:${boundPort}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        if (previousNodeEnv !== undefined) {
          process.env.NODE_ENV = previousNodeEnv;
        } else {
          delete process.env.NODE_ENV;
        }
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
