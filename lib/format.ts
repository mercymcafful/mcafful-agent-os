export function formatZAR(amount: number): string {
  return `R ${Math.round(amount).toLocaleString("en-US").replace(/,/g, " ")}`;
}

export function formatSourceLabel(source: string): string {
  return source
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function looksLikePhoneNumber(contact: string): boolean {
  if (contact.includes("@")) return false;
  const digits = contact.replace(/\D/g, "");
  return digits.length >= 9;
}

// Normalises to WhatsApp/tel-friendly digits, e.g. a local "0821234567"
// becomes "27821234567" (South African country code).
export function toWhatsAppDigits(contact: string): string {
  const digits = contact.replace(/\D/g, "");
  return digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
}
