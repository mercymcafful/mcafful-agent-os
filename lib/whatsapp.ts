// Sends a free-form WhatsApp text reply via the Graph API. Only valid within
// the 24-hour window opened by the customer's own inbound message. Never
// throws — a failed reply must not break lead capture.
export async function sendText(to: string, body: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("WhatsApp sendText failed:", response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("WhatsApp sendText error:", error);
    return false;
  }
}
