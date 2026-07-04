import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface LeadRequestBody {
  name?: unknown;
  contact?: unknown;
  suburb?: unknown;
  timeline?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LeadRequestBody | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const contact = typeof body?.contact === "string" ? body.contact.trim() : "";
  const suburb = typeof body?.suburb === "string" ? body.suburb.trim() : "";
  const timeline = typeof body?.timeline === "string" ? body.timeline.trim() : "";

  if (!name || !contact) {
    return NextResponse.json(
      { ok: false, error: "Name and contact are required." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("leads").insert({
    agent_id: process.env.AGENT_ID,
    name,
    contact,
    suburb: suburb || null,
    timeline: timeline || null,
    source: "website_valuation",
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
