import { supabaseAdmin } from "@/lib/supabase/admin";
import { qualifyAndReply, FALLBACK_REPLY, type ListingContext } from "@/lib/qualify";
import { sendText } from "@/lib/whatsapp";

// Meta calls this to verify the webhook belongs to you before it will
// deliver any messages.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

interface WhatsAppWebhookBody {
  entry?: {
    changes?: {
      value?: {
        messages?: { from?: string; text?: { body?: string } }[];
        contacts?: { profile?: { name?: string } }[];
      };
    }[];
  }[];
}

// The AI reply is grounded only in the agent's current active listings —
// fetched fresh per inbound message so it never quotes a sold/withdrawn
// listing. Falls back to an empty list (conversational-only reply) if the
// fetch fails, rather than blocking the whole webhook.
async function getActiveListingsContext(): Promise<ListingContext[]> {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("suburb, address, price, beds, baths")
    .eq("status", "active")
    .eq("agent_id", process.env.AGENT_ID);

  if (error) {
    console.error("WhatsApp webhook: failed to fetch listings:", error.message);
    return [];
  }

  return data ?? [];
}

// Meta delivers inbound messages (and status updates, which we ignore) here.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as WhatsAppWebhookBody | null;

    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message?.from) {
      // No inbound message (e.g. a delivery/read status update) — nothing to do.
      return new Response("OK", { status: 200 });
    }

    const phone = message.from;
    const text = message.text?.body ?? null;
    const profileName = value?.contacts?.[0]?.profile?.name ?? null;

    console.log("WhatsApp inbound:", { phone, text, profileName });

    const { data: existingLead } = await supabaseAdmin
      .from("leads")
      .select("id")
      .eq("contact", phone)
      .neq("status", "lost")
      .limit(1)
      .maybeSingle();

    if (!existingLead) {
      const qualified = text
        ? await qualifyAndReply(text, await getActiveListingsContext())
        : {
            lead_type: "unknown" as const,
            suburb: null,
            temperature: "warm" as const,
            summary: "No message text (non-text message type)",
            reply: FALLBACK_REPLY,
          };

      const { error } = await supabaseAdmin.from("leads").insert({
        agent_id: process.env.AGENT_ID,
        name: profileName,
        contact: phone,
        source: "whatsapp",
        temperature: qualified.temperature,
        status: "new",
        lead_type: qualified.lead_type,
        suburb: qualified.suburb,
        summary: qualified.summary,
      });

      if (error) {
        console.error("WhatsApp webhook: failed to insert lead:", error.message);
      } else {
        await sendText(phone, qualified.reply);
      }
    }
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
  }

  // Always 200, quickly — Meta retry-storms a webhook that errors or is slow.
  return new Response("OK", { status: 200 });
}
