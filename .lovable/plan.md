## Phase 3 Implementation Plan

### Step 1: Database Migration
- Create `profiles` table (user_id, display_name, avatar_url, school_name)
- Create `user_roles` table with `app_role` enum (super_admin, school_admin, accounts, marketing)
- Create `has_role()` security definer function
- Auto-create profile on signup via trigger
- **Tighten RLS** on all 11 tables — replace "allow all" with auth-based policies

### Step 2: Auth UI
- Login page (email/password)
- Signup page
- Forgot password + Reset password page
- Auth context/provider with session management
- Protected routes (redirect to login if unauthenticated)

### Step 3: Role-based Access
- Role check hooks (`useUserRole`)
- Sidebar items visibility based on role
- Admin-only pages guarded

### Step 4: SMS API Flow (stub)
- Settings page section for SMS provider config (Hubtel/AT/Twilio)
- Provider selection UI, API key input fields (saved to secrets later)
- Mark as "Coming Soon" with placeholder

### Step 5: Payment Flow (stub)  
- Wallet top-up modal with amount selection
- Payment method selector (Paystack / Mobile Money)
- Mark as "Coming Soon" with placeholder

### Step 6: Update TODO.md
- Mark completed items

**Note:** SMS sending and payment processing will be wired up in a future phase — this step creates the UI flows only.
