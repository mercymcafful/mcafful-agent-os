import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ListingRequestBody {
  title?: unknown;
  suburb?: unknown;
  address?: unknown;
  price?: unknown;
  beds?: unknown;
  baths?: unknown;
  garages?: unknown;
  status?: unknown;
}

const ALLOWED_STATUSES = ["active", "under_offer", "sold", "draft"];

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as ListingRequestBody | null;

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json(
      { ok: false, error: "Title is required." },
      { status: 400 }
    );
  }

  const status =
    typeof body?.status === "string" && ALLOWED_STATUSES.includes(body.status)
      ? body.status
      : "active";

  const { error } = await supabase.from("listings").insert({
    agent_id: user.id,
    title,
    suburb: toNullableString(body?.suburb),
    address: toNullableString(body?.address),
    price: toNullableNumber(body?.price),
    beds: toNullableNumber(body?.beds),
    baths: toNullableNumber(body?.baths),
    garages: toNullableNumber(body?.garages),
    status,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
