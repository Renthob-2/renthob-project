

## Fix: WhatsApp Property Share — Encoding and Redirect Issues

### Problems Identified

1. **Naira symbol (₦) showing as garbled text ("â‚¦")** — The `escapeHtml` function is converting the `₦` character unnecessarily. WhatsApp's in-app browser may not handle the raw UTF-8 properly when it appears in HTML attributes. We should use the HTML entity `&#8358;` instead of the raw `₦` character.

2. **Redirect URL is hardcoded** — The canonical URL is hardcoded to `https://eazhob.lovable.app` on line 45. This works but should use the published URL dynamically for future-proofing.

### Plan

**File: `supabase/functions/og-property/index.ts`**

1. Replace the raw `₦` character in `ogTitle` (line 38) with the HTML entity `&#8358;` so it renders correctly across all browsers and WhatsApp's preview.

2. Also add a `&#x20A6;` numeric reference as a fallback approach — actually, simplest fix: use `"NGN "` or the HTML entity `&#8358;` in the title string, and keep the raw `₦` only in the plain-text body (not inside HTML attributes).

3. Update `escapeHtml` to also handle non-ASCII currency symbols by encoding them as HTML numeric entities, or simply replace `₦` with `&#8358;` before inserting into HTML.

**Concrete change:**
- Line 38: Change `₦${price}` to use the HTML-safe Naira representation
- Best approach: build `ogTitle` with a plain "NGN" or "₦" and then let `escapeHtml` handle it by adding Unicode-aware encoding, OR simply hardcode `&#8358;` for the Naira sign in the HTML template (not in `escapeHtml` input).

Since `escapeHtml` is called on `ogTitle`, the simplest fix:
```typescript
const ogTitle = `${property.title} - \u20A6${price}/${property.price_period}`;
```
This uses the actual Unicode codepoint. The real issue is that `escapeHtml` doesn't break this — the HTML already declares `charset=utf-8`. The garbled display suggests the Deno runtime or response might not be sending proper UTF-8 bytes.

**Root cause fix:** Encode the response body explicitly as UTF-8 using `TextEncoder`:
```typescript
const encoder = new TextEncoder();
return new Response(encoder.encode(html), {
  headers: {
    ...corsHeaders,
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  },
});
```

Or alternatively, avoid the issue entirely by using HTML entities in the template:
```typescript
const naira = "&#8358;";
// Use naira in the HTML directly, not through escapeHtml
```

### Final Approach (2 changes in one file)

**`supabase/functions/og-property/index.ts`:**

1. Use HTML entity `&#8358;` for the Naira sign in the HTML output to avoid any UTF-8 encoding issues
2. Build two versions of the title: one with raw `₦` for the redirect body text, one with `&#8358;` for meta tags
3. Ensure the redirect URL points to the published app URL (`https://eazhob.lovable.app/property/{id}`) — this is already correct

This single edge function update will fix the garbled Naira symbol on WhatsApp previews and ensure clicking the link correctly opens the property page.

