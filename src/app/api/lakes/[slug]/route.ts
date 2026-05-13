import { NextResponse } from "next/server";
import { getLakeBySlug } from "@/lib/lakes";

type LakeRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: LakeRouteProps) {
  const { slug } = await params;

  const lake = await getLakeBySlug(slug);

  if (!lake) {
    return NextResponse.json(
      { message: "Nie znaleziono łowiska." },
      { status: 404 }
    );
  }

  return NextResponse.json(lake);
}