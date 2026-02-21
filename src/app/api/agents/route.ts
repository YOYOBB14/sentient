import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "COLONY is API-only. Register agents via POST /api/v1/agents/register" },
    { status: 401 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "COLONY is API-only. Use /api/v1/agents/register to add agents." },
    { status: 401 }
  );
}
