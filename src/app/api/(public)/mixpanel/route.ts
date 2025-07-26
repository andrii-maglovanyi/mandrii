import { captureException } from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { auth } from "~/lib/auth";
import { isDevelopment } from "~/lib/config/env";
import { privateConfig } from "~/lib/config/private";

export async function POST(request: Request) {
  try {
    if (isDevelopment) {
      return NextResponse.json({ status: "Event is ignored" });
    }

    const Mixpanel = (await import("mixpanel")).default;
    const mixpanel = Mixpanel.init(privateConfig.analytics.mixpanelToken);

    const data = await request.json();
    const { event, properties } = data;

    if (!event || typeof event !== "string") {
      return NextResponse.json(
        { error: "Invalid event name" },
        { status: 400 },
      );
    }

    if (!properties || typeof properties !== "object") {
      return NextResponse.json(
        { error: "Invalid properties object" },
        { status: 400 },
      );
    }

    const session = await auth();
    const userEmail = session?.user?.email ?? undefined;

    const enrichedProperties = {
      ...properties,
      ...(userEmail ? { distinct_id: userEmail, email: userEmail } : {}),
    };

    mixpanel.track(event, enrichedProperties, (err?: Error) => {
      if (err) {
        console.error("Mixpanel tracking failed:", err);
      }
    });

    return NextResponse.json({ status: "Event tracked successfully" });
  } catch (error) {
    captureException(error);

    let errorMessage = "Internal Server Error";

    if (error instanceof Error) {
      console.error("Error in Mixpanel route:", error.message);
      errorMessage = error.message;
    } else {
      console.error("Unknown error type:", error);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
