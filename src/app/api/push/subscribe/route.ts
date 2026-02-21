import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "COLONY is API-only. Push subscriptions are not available." },
    { status: 401 }
  );
}
