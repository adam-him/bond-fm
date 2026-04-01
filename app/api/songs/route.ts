import { NextResponse } from "next/server";
import { getMetadata } from "@/lib/metadata";

export const runtime = "edge";

export async function GET() {
  const metadata = await getMetadata();
  return NextResponse.json(metadata);
}
