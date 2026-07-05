import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCMA, type CMASubject, type CMAComp } from "@/lib/cma";

interface CMARequestBody {
  subject?: CMASubject;
  comps?: CMAComp[];
  leadId?: string | null;
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

  const body = (await request.json().catch(() => null)) as CMARequestBody | null;
  const subject = body?.subject;
  const comps = Array.isArray(body?.comps) ? body.comps : [];

  if (!subject?.address?.trim() || !subject?.suburb?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Subject property needs at least an address and suburb." },
      { status: 400 }
    );
  }

  const result = await generateCMA(subject, comps);

  const { data, error } = await supabase
    .from("cmas")
    .insert({
      agent_id: user.id,
      lead_id: body?.leadId || null,
      subject,
      comps,
      result,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cma: data });
}
