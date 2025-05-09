import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export type MiddlewareFactory = (next: MiddlewareHandler) => MiddlewareHandler;

export type MiddlewareHandler = (
  request: NextRequest,
  event: NextFetchEvent,
) => NextResponse | Promise<NextResponse>;

export function stackMiddlewares(
  middlewareFactories: MiddlewareFactory[],
): MiddlewareHandler {
  const initialHandler: MiddlewareHandler = () => {
    return NextResponse.next();
  };

  return middlewareFactories.reduceRight<MiddlewareHandler>(
    (next, middleware) => middleware(next),
    initialHandler,
  );
}
