import { NextResponse } from "next/server";

/**
 * Health check endpoint for Docker healthcheck and monitoring
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}

