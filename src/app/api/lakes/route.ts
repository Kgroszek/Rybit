import { NextResponse } from "next/server";
import { getLakes } from "@/lib/lakes";

export async function GET() {
  const lakes = await getLakes();

  return NextResponse.json(lakes);
}