import { captureException } from "@sentry/nextjs";
import ipaddr from "ipaddr.js";
import { NextRequest, NextResponse } from "next/server";

type LocationData = Record<string, unknown>;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const ipCache = new Map<string, { data: LocationData; expiresAt: number }>();

export async function GET(request: NextRequest) {
  try {
    // Extract client IP address from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : request.headers.get("x-real-ip");

    // Validate the extracted IP
    if (!ip || ipaddr.parse(ip).range() === "private") {
      return NextResponse.json(
        { error: "Invalid or private IP address" },
        { status: 400 },
      );
    }

    const cached = ipCache.get(ip);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    // Set up a timeout for the fetch request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    // Call IP-API.com (free tier does not require API key)
    const locationResponse = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,continent,country,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting`,
      { signal: controller.signal },
    );

    clearTimeout(timeout); // Clear timeout if request succeeds

    // Handle API response failure
    if (!locationResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch location data" },
        { status: locationResponse.status },
      );
    }

    const locationData = await locationResponse.json();

    // Check if IP-API returned an error
    if (locationData.status === "fail") {
      return NextResponse.json(
        { error: locationData.message ?? "Failed to retrieve location data" },
        { status: 400 },
      );
    }

    ipCache.set(ip, {
      data: locationData,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(locationData);
  } catch (error) {
    captureException(error);

    let errorMessage = "Internal Server Error";

    if (error instanceof Error) {
      console.error("Error fetching location data:", error.message);
      errorMessage = error.message;
    } else {
      console.error("Unknown error type:", error);
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
