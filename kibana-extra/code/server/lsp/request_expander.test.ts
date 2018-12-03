/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import fs from 'fs';
import rimraf from 'rimraf';
import sinon from 'sinon';
import { ServerOptions } from '../server_options';
import { LanguageServerProxy } from './proxy';
import { RequestExpander } from './request_expander';

// @ts-ignore
const options: ServerOptions = {
  workspacePath: '/tmp/test/workspace',
};

beforeAll(async () => {
  if (!fs.existsSync(options.workspacePath)) {
    fs.mkdirSync(options.workspacePath);
  }
});

afterAll(() => {
  return new Promise(resolve => {
    rimraf(options.workspacePath, resolve);
  });
});
test('requests should be sequential', async () => {
  // @ts-ignore
  const proxyStub = sinon.createStubInstance(LanguageServerProxy, {
    handleRequest: sinon.stub().callsFake(() => {
      const start = Date.now();
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ result: { start, end: Date.now() } });
        }, 100);
      });
    }),
  });
  const expander = new RequestExpander(proxyStub, false, 1, options);
  const request1 = {
    method: 'request1',
    params: [],
  };
  const request2 = {
    method: 'request2',
    params: [],
  };
  const response1Promise = expander.handleRequest(request1);
  const response2Promise = expander.handleRequest(request2);
  const response1 = await response1Promise;
  const response2 = await response2Promise;
  // response2 should not be started before repsonse1 ends.
  expect(response1.result.end).toBeLessThanOrEqual(response2.result.start);
});
test('be able to open multiple workspace', async () => {
  // @ts-ignore
  const proxyStub = sinon.createStubInstance(LanguageServerProxy, {
    initialize: sinon.stub().callsFake(() => {
      proxyStub.initialized = true;
      return Promise.resolve();
    }),
    handleRequest: sinon.stub().resolvesArg(0),
  });
  const expander = new RequestExpander(proxyStub, true, 2, options);
  const request1 = {
    method: 'request1',
    params: [],
    workspacePath: '/tmp/test/workspace/1',
  };
  const request2 = {
    method: 'request2',
    params: [],
    workspacePath: '/tmp/test/workspace/2',
  };
  fs.mkdirSync(request1.workspacePath);
  fs.mkdirSync(request2.workspacePath);
  await expander.handleRequest(request1);
  await expander.handleRequest(request2);
  expect(proxyStub.initialize.called);
  expect(
    proxyStub.initialize.calledOnceWith({}, [
      {
        name: request1.workspacePath,
        uri: `file://${request1.workspacePath}`,
      },
    ])
  ).toBeTruthy();
  expect(
    proxyStub.handleRequest.calledWith({
      method: 'workspace/didChangeWorkspaceFolders',
      params: {
        event: {
          added: [
            {
              name: request2.workspacePath,
              uri: `file://${request2.workspacePath}`,
            },
          ],
          removed: [],
        },
      },
      isNotification: true,
    })
  ).toBeTruthy();
});

test(' be able to swap workspace', async () => {
  // @ts-ignore
  const proxyStub = sinon.createStubInstance(LanguageServerProxy, {
    initialize: sinon.stub().callsFake(() => {
      proxyStub.initialized = true;
      return Promise.resolve();
    }),
    handleRequest: sinon.stub().resolvesArg(0),
  });
  const expander = new RequestExpander(proxyStub, true, 1, options);
  const request1 = {
    method: 'request1',
    params: [],
    workspacePath: '/tmp/test/workspace/1',
  };
  const request2 = {
    method: 'request2',
    params: [],
    workspacePath: '/tmp/test/workspace/2',
  };
  fs.mkdirSync(request1.workspacePath);
  fs.mkdirSync(request2.workspacePath);
  await expander.handleRequest(request1);
  await expander.handleRequest(request2);
  expect(proxyStub.initialize.called);
  expect(
    proxyStub.handleRequest.calledWith({
      method: 'workspace/didChangeWorkspaceFolders',
      params: {
        event: {
          added: [
            {
              name: request2.workspacePath,
              uri: `file://${request2.workspacePath}`,
            },
          ],
          removed: [
            {
              name: request1.workspacePath,
              uri: `file://${request1.workspacePath}`,
            },
          ],
        },
      },
      isNotification: true,
    })
  ).toBeTruthy();
});
