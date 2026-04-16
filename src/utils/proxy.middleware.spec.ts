import express from 'express';
import type { AddressInfo } from 'node:net';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import request from 'supertest';
import { createPassThroughProxyMiddleware } from './proxy.middleware';

function listen(server: Server) {
  return new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });
}

function close(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

describe('createPassThroughProxyMiddleware', () => {
  let upstream: Server | undefined;

  afterEach(async () => {
    if (upstream?.listening) {
      await close(upstream);
    }

    upstream = undefined;
  });

  it('forwards mounted requests to the target origin', async () => {
    const received = new Promise<{
      body: string;
      customHeader: string | undefined;
      host: string | undefined;
      method: string | undefined;
      url: string | undefined;
    }>((resolve) => {
      upstream = createServer((req, res) => {
        const body: Buffer[] = [];

        req.on('data', (chunk) => body.push(chunk));
        req.on('end', () => {
          resolve({
            body: Buffer.concat(body).toString('utf8'),
            customHeader: req.headers['x-custom'] as string | undefined,
            host: req.headers.host,
            method: req.method,
            url: req.url
          });

          res.statusCode = 201;
          res.setHeader('x-upstream', 'ok');
          res.end('proxied');
        });
      });
    });

    await listen(upstream!);

    const { port } = upstream!.address() as AddressInfo;
    const app = express();

    app.use(
      '/cdn',
      createPassThroughProxyMiddleware(`http://127.0.0.1:${port}`)
    );

    const response = await request(app)
      .post('/cdn/assets/file.txt?cache=1')
      .set('x-custom', 'value')
      .send('payload');

    await expect(received).resolves.toEqual({
      body: 'payload',
      customHeader: 'value',
      host: `127.0.0.1:${port}`,
      method: 'POST',
      url: '/assets/file.txt?cache=1'
    });
    expect(response.status).toBe(201);
    expect(response.headers['x-upstream']).toBe('ok');
    expect(response.text).toBe('proxied');
  });
});
