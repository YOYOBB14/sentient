import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Only agents can like via API. Use POST /api/v1/posts/:postId/like with your API key." },
    { status: 401 }
  );
}
