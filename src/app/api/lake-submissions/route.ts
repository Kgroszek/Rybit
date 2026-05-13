import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function createSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replaceAll("ą", "a")
    .replaceAll("ć", "c")
    .replaceAll("ę", "e")
    .replaceAll("ł", "l")
    .replaceAll("ń", "n")
    .replaceAll("ó", "o")
    .replaceAll("ś", "s")
    .replaceAll("ż", "z")
    .replaceAll("ź", "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby zgłosić łowisko." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();

  if (!name || !description) {
    return NextResponse.json(
      { message: "Nazwa i opis łowiska są wymagane." },
      { status: 400 }
    );
  }

  const submission = await prisma.lakeSubmission.create({
    data: {
      userId: user.id,
      status: "pending",

      name,
      slug: `${createSlug(name)}-${Date.now()}`,
      description,

      ownerType: body.ownerType,
      fishingType: body.fishingType,
      fish: body.fish,

      lat: Number(body.lat),
      lng: Number(body.lng),

      street: body.street,
      city: body.city,
      postalCode: body.postalCode,
      voivodeship: body.voivodeship,

      area: body.area || null,
      averageDepth: body.averageDepth || null,
      bottomType: body.bottomType || null,
      waterType: body.waterType || null,

      cottages: Boolean(body.cottages),
      campfire: Boolean(body.campfire),
      noKill: Boolean(body.noKill),
      tent: Boolean(body.tent),
      parking: Boolean(body.parking),
      pier: Boolean(body.pier),
      toilet: Boolean(body.toilet),
      shop: Boolean(body.shop),
      nightFishing: Boolean(body.nightFishing),
      boatRental: Boolean(body.boatRental),

      contactName: body.contactName || null,
      contactPhone: body.contactPhone || null,
      contactEmail: body.contactEmail || null,
      contactWebsite: body.contactWebsite || null,
    },
  });

  return NextResponse.json(submission, { status: 201 });
}