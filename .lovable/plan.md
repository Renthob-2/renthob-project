## Affiliate Program — Full Implementation Plan

### 1. Database Schema (Migration)
Create the following tables:

- **`affiliate_profiles`** — Stores affiliate-specific data
  - `user_id`, `referral_code` (unique), `commission_rate` (admin-configurable, default 5%), `is_active`, `total_earnings`, `available_balance`, `created_at`

- **`referral_signups`** — Tracks who signed up using which code
  - `referred_user_id`, `affiliate_user_id`, `referral_code_used`, `status` (signed_up → verified → converted), `created_at`

- **`affiliate_commissions`** — Earned commissions per transaction
  - `affiliate_user_id`, `referral_signup_id`, `property_id`, `transaction_amount`, `commission_rate`, `commission_amount`, `status` (pending → approved → paid), `created_at`

- **`affiliate_withdrawals`** — Withdrawal requests
  - `affiliate_user_id`, `amount`, `status` (pending → approved → paid → rejected), `admin_note`, `reviewed_by`, `created_at`, `reviewed_at`

- Add `affiliate` to the `app_role` enum

- RLS: Affiliates see own data; admins see/manage all

### 2. Signup Flow Update
- Add optional "referral code" field on the signup page
- Store referral code in `user_metadata` during signup
- On first sign-in, create a `referral_signups` record linking the new user to the affiliate

### 3. Anti-Abuse Measures
- Prevent self-referral (affiliate can't use own code)
- Require email verification before referral counts
- Delay affiliate activation until profile is complete

### 4. Affiliate Dashboard (`/dashboard/affiliate`)
- Overview: referral link/code, total clicks, signups, conversions, earnings
- Referral list with statuses
- Withdrawal request form + history
- Copy referral link button

### 5. Admin Affiliate Management (`/admin/affiliates`)
- View all affiliates, their stats, and commission rates
- Adjust commission % per affiliate
- Approve/reject withdrawal requests
- View referral chains and conversion data

### 6. Commission Logic
- Commission earned only on successful transaction (rental application approved)
- Single commission per deal even if affiliate referred both parties
- Admin can manually approve/adjust commissions

### 7. Routes
- `/dashboard/affiliate` — Affiliate dashboard (protected, affiliate role)
- `/admin/affiliates` — Admin affiliate management page
