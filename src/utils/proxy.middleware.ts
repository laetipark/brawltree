import { Logger } from '@nestjs/common';
import type { RequestHandler } from 'express';
import { request as httpRequest } from 'node:http';
import type { IncomingHttpHeaders } from 'node:http';
import { request as httpsRequest } from 'node:https';
import type { RequestOptions } from 'node:https';

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

function createProxyHeaders(headers: IncomingHttpHeaders, host: string) {
  const proxyHeaders: IncomingHttpHeaders = {};

  Object.entries(headers).forEach(([name, value]) => {
    if (value === undefined || hopByHopHeaders.has(name.toLowerCase())) {
      return;
    }

    proxyHeaders[name] = value;
  });

  proxyHeaders.host = host;

  return proxyHeaders;
}

function writeProxyHeaders(
  headers: IncomingHttpHeaders,
  setHeader: (name: string, value: number | string | readonly string[]) => void
) {
  Object.entries(headers).forEach(([name, value]) => {
    if (value === undefined || hopByHopHeaders.has(name.toLowerCase())) {
      return;
    }

    setHeader(name, value);
  });
}

export function createPassThroughProxyMiddleware(target: string): RequestHandler {
  const targetUrl = new URL(target);
  const request = targetUrl.protocol === 'https:' ? httpsRequest : httpRequest;
  const targetBasePath = targetUrl.pathname.replace(/\/$/, '');

  return (req, res, next) => {
    const requestUrl = new URL(req.url || '/', targetUrl);

    if (targetBasePath) {
      requestUrl.pathname = `${targetBasePath}${requestUrl.pathname}`;
    }

    const options: RequestOptions = {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port ? Number(targetUrl.port) : undefined,
      method: req.method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers: createProxyHeaders(req.headers, targetUrl.host),
      rejectUnauthorized: true
    };

    const proxyReq = request(options, (proxyRes) => {
      res.status(proxyRes.statusCode ?? 502);
      writeProxyHeaders(proxyRes.headers, (name, value) =>
        res.setHeader(name, value)
      );
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      Logger.warn(
        `Proxy request failed for ${targetUrl.origin}${req.url || '/'}: ${error.message}`
      );

      if (res.headersSent) {
        res.destroy(error);
        return;
      }

      next(error);
    });

    req.on('aborted', () => proxyReq.destroy());
    req.pipe(proxyReq);
  };
}
