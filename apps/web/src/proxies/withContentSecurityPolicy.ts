import { NextFetchEvent, NextRequest } from "next/server";

import { MiddlewareFactory } from "./stackHandler";

export const withContentSecurityPolicy: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:;
      style-src 'self' 'nonce-${nonce}' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `
      .replaceAll(/\s{2,}/, " ")
      .trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);

    const response = await next(
      new NextRequest(request.url, {
        headers: requestHeaders,
      }),
      event,
    );

    response.headers.set("Content-Security-Policy", cspHeader);

    return response;
  };
};
