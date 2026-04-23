# 📋 SchoolConnect SMS Platform - Development Checklist

## Phase 1: Foundation & MVP
- [x] **Design System** — Colors, fonts, tokens, button variants
- [x] **App Layout** — Sidebar navigation, responsive shell
- [x] **Dashboard** — Stats cards (live from DB), recent campaigns, quick actions
- [x] **Student Management** — CRUD with Supabase (classes, parents, tags, search/filter)
- [x] **Messaging Module (SMS)** — Compose, templates (DB-backed), target by class/tag, personalization
- [x] **Bulk Contacts** — Add/delete contacts (DB-backed), search/filter, CSV import (UI ready)
- [x] **Basic Reports** — Message logs with sent/delivered/failed stats, cost tracking

### Database Schema (Phase 1)
- [x] `classes` — name, level, section, academic_year
- [x] `students` — student_id, name, class_id FK, program, status
- [x] `parents` — name, phone(s), email, relationship → student FK
- [x] `student_tags` — tag per student (unique constraint)
- [x] `contacts` — name, phone, location, tag (bulk/marketing)
- [x] `sms_templates` — name, body
- [x] `campaigns` — name, type, target, message, delivery stats, cost
- [x] `messages` — recipient, body, status, cost, timestamps

## Phase 2: Expansion
- [x] **Voice Messaging** — Create broadcasts, target recipients, schedule, upload/record (UI ready)
- [x] **Campaign Automation** — Full CRUD, scheduling, status management, template integration
- [x] **Contact Segmentation** — Segment filter (parent, alumni, prospect, staff, general, other)
- [x] **SMS Wallet & Billing** — Balance display, transaction history, recharge placeholder

### Database Schema (Phase 2)
- [x] `sms_wallet` — balance, currency
- [x] `wallet_transactions` — type, amount, balance_before/after, description, reference
- [x] `voice_broadcasts` — title, audio_url, target, status, scheduled_at, stats
- [x] `contacts.segment` — segment column added (general, parent, alumni, prospect, staff, other)

## Phase 3: Backend & Integrations
- [x] **Authentication & Roles** — Email/password login, signup, forgot/reset password, protected routes, Super Admin / School Admin / Accounts / Marketing roles
- [x] **SMS API Integration (UI)** — Provider selection UI (Hubtel / AT / Twilio) in Settings, coming soon
- [x] **Payment Integration (UI)** — Paystack / Mobile Money config in Settings, coming soon
- [x] **Tighten RLS Policies** — All tables now require authenticated access (open policies removed)
- [ ] **SMS API Integration (Backend)** — Wire up actual Hubtel / Africa's Talking / Twilio sending
- [ ] **Payment Integration (Backend)** — Wire up Paystack / Mobile Money for wallet recharge

## Phase 4: Advanced Features
- [x] **WhatsApp Integration** — Send/track WhatsApp messages, edge function for sending via Meta/Twilio API
- [x] **Auto Reminders** — Scheduled reminders for fees, exams, events with frequency options
- [x] **Two-way SMS** — SMS Inbox with incoming messages, read status, reply functionality
- [x] **AI Message Suggestions** — AI-powered SMS content generation via edge function (Lovable AI)
- [x] **USSD Integration** — Informational page with planned menu structure (Coming Soon)
- [x] **Audit Logs & Security** — Track user actions, super admin only viewing, searchable log viewer
- [x] **CSV/Excel Import** — Bulk student & contact import with duplicate detection, preview, validation

### Database Schema (Phase 4)
- [x] `audit_logs` — user_id, action, entity_type, entity_id, details (JSONB), ip_address
- [x] `reminders` — title, type, message, target, frequency, schedule, status
- [x] `whatsapp_messages` — direction, recipient, body, media, status, campaign FK
- [x] `sms_inbox` — sender_phone, body, read status, reply tracking

### Edge Functions (Phase 4)
- [x] `suggest-message` — AI-powered SMS suggestions via Lovable AI Gateway
- [x] `send-whatsapp` — WhatsApp message sending (requires WHATSAPP_API_KEY secret)

## Phase 5: Future Enhancements
- [ ] **Email Notifications** — Send email alerts alongside SMS for important messages
- [x] **Dashboard Analytics Charts** — Visual charts for message trends, delivery rates over time
- [x] **Student/Parent Portal** — Read-only portal for parents to view messages sent to them
- [ ] **Multi-School Support** — Support multiple schools under one account
- [x] **Excel Import** — Support .xlsx files in addition to CSV
- [ ] **Webhook Receivers** — Inbound SMS/WhatsApp webhooks for real-time two-way messaging
- [ ] **Scheduled Campaign Execution** — Cron-based campaign and reminder execution
- [x] **Export Data** — Export students, contacts, reports to CSV/Excel
- [x] **Dark Mode** — Full dark mode theme support
- [ ] **Mobile App** — Progressive Web App (PWA) for mobile access
