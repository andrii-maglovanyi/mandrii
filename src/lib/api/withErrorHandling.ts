import { captureException } from "@sentry/nextjs";

export async function withErrorHandling(
  handler: () => Promise<Response | undefined>,
): Promise<Response> {
  try {
    const result = await handler();
    return (
      result ?? Response.json({ error: "Empty response" }, { status: 500 })
    );
  } catch (error) {
    captureException(error);
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
