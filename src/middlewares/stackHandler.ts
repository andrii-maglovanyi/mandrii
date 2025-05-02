import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

export type MiddlewareHandler = (
  request: NextRequest,
  event: NextFetchEvent
) => NextResponse | Promise<NextResponse>;

export type MiddlewareFactory = (next: MiddlewareHandler) => MiddlewareHandler;

export function stackMiddlewares(
  middlewareFactories: MiddlewareFactory[]
): MiddlewareHandler {
  const initialHandler: MiddlewareHandler = () => {
    return NextResponse.next();
  };

  return middlewareFactories.reduceRight<MiddlewareHandler>(
    (next, middleware) => middleware(next),
    initialHandler
  );
}
