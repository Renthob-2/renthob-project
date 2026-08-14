/**
 * Normalizes a Nigerian phone number to E.164 format (+234...).
 * Accepts formats like 08012345678, 8012345678, 2348012345678, +2348012345678.
 * Returns null when the input cannot be normalized.
 */
export function normalizePhone(input: string): string | null {
  const digits = (input || "").replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");

  if (!digits) return null;

  let local: string;

  if (digits.startsWith("+")) {
    const rest = digits.slice(1);
    if (rest.startsWith("234")) {
      local = rest.slice(3);
    } else {
      // Non-Nigerian international number: keep as-is if it looks valid
      return rest.length >= 8 && rest.length <= 15 ? `+${rest}` : null;
    }
  } else if (digits.startsWith("234")) {
    local = digits.slice(3);
  } else if (digits.startsWith("0")) {
    local = digits.slice(1);
  } else {
    local = digits;
  }

  if (!/^\d{10}$/.test(local)) return null;

  return `+234${local}`;
}

/** True when the string looks like a phone number rather than an email. */
export function looksLikePhone(input: string): boolean {
  return !input.includes("@") && /\d/.test(input);
}

/** Pretty display: +234 801 234 5678 */
export function formatPhone(e164: string): string {
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : e164;
}
