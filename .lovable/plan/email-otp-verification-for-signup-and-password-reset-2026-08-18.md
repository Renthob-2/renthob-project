# Email OTP verification for signup and password reset

## Current state (verified)

- There is no OTP anywhere in the app. The only OTP-related file is the unused shadcn `input-otp` UI component.
- Signup calls Supabase `signUp` with an `emailRedirectTo` link to `/login?verified=1` — a click-the-link flow, not a code.
- No email sending domain is configured for the project, so all auth emails go out from the default shared Lovable sender. That is the most likely reason verification mail is slow, lands in spam, or appears not to arrive.
- Login now accepts email or phone number plus password (built last turn); that path does not depend on email at all.

## What to build

### 1. Reliable email delivery (prerequisite)

Set up Renthob's own sending domain (e.g. `renthob.com`, matching `support@renthob.com`) via the email setup dialog, add the DNS records, and wait for verification. Until this is done, no change to the code will make delivery reliable.

Also raise the hourly auth-email rate limit so bursts of signups don't get blocked with "email rate limit exceeded".

### 2. Branded auth email templates with a 6-digit code

Scaffold the managed auth email templates and style them with the Renthob palette and logo. Each verification and password-reset email will show both:

- a large 6-digit code, and
- a fallback "click to verify" button.

### 3. OTP screens in the app

- **Signup**: after creating the account, show a code-entry screen (6 boxes) instead of the current "check your email" dead end. Entering the code verifies the account and signs the user straight in. Includes a resend button with a 60-second cooldown, and a "wrong email? go back" option.
- **Forgot password**: same code-entry step, then the new-password form — no link hopping between tabs.
- The existing email-link flow keeps working, so anyone who clicks the link in the email is still verified normally.

## Technical notes

- New `src/components/auth/OtpVerification.tsx` using the existing `input-otp` component; used by both `SignupPage` and `ForgotPasswordPage`.
- Verification uses `supabase.auth.verifyOtp({ email, token, type: 'signup' | 'recovery' })`; resend uses `supabase.auth.resend` / `resetPasswordForEmail`.
- Templates come from `email_domain--scaffold_auth_email_templates` (signup, recovery, magic-link, invite, email-change, reauthentication) and expose the `token` variable; then deploy `auth-email-hook`.
- Rate limit raised via `configure_auth` (`rate_limit_email_sent`) once sending is active.
- `ResetPasswordPage` keeps its current behaviour of signing the user out after a successful password change.

## Sequencing

Steps 2 and 3 can be built immediately; the codes only actually arrive in inboxes reliably once the domain in step 1 is verified. If you'd rather not set up a domain right now, say so and I'll build the OTP screens against the default sender.
