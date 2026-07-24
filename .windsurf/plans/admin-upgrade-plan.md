# Zimba Admin App Upgrade — Implementation Plan

## Findings Summary

### Admin App (`apps/admin`)
- **Auth:** Magic link + Google OAuth only. No email/password. Platform roles: `super_admin`, `support`.
- **Pages:** Overview (has `StatCard`s), Organizations, Users, Activity, Settings, Projects, Suppliers, Receipts, Payments, Billing (mocked), Support (mocked), System. Detail pages for `organizations/[id]` and `users/[id]`.
- **Tables:** Basic HTML tables with `StatusBadge`. No search, filtering, pagination, row actions, or empty state differentiation.
- **Loading:** Single `loading.tsx` with 2 generic `Skeleton` bars — doesn't match any page layout.

### Web App (`apps/web`)
- **Auth:** Magic link + Google OAuth. No email/password. Login → onboarding (if no membership) → workspace.
- **Onboarding:** Minimal — only `fullName` + `companyName`. No approval step. No pending approval screen. No demo access.
- **Loading:** Only `[workspaceSlug]/loading.tsx` (2 skeleton bars) and `invite/[token]/loading.tsx`. `DashboardPageSkeleton` exists but is **not used**.
- **Error/Not-Found:** Error boundary and not-found pages exist for workspace routes.

### Database
- Organization status: `active`, `trial`, `suspended` — no `pending_approval`.
- No onboarding application table. No ownership transfer request table.
- Account table has `password` field — email/password possible but password plugin not configured.
- Audit logs: `platformAuditLog`, `auditLog`, `activityEvent` exist.

### Email
- Resend integration works. Existing: magic link, super admin invite, member invite. No welcome/approval/transfer emails.

---

## Phased Implementation Plan

### Phase 1: DB Schema Changes
1. Create `onboarding-schema.ts` — `onboarding_application` table (userId, fullName, email, companyName, companyWebsite, industry, country, phone, teamSize, useCase, status, reviewedBy, reviewedAt, rejectionReason, organizationId, timestamps)
2. Create `ownership-transfer-schema.ts` — `ownership_transfer_request` table (organizationId, fromUserId, toUserId, status, reason, reviewedBy, reviewedAt, rejectionReason, timestamps)
3. Update `schemas/index.ts` to export new schemas
4. Update `relations.ts` with relations for new tables
5. Update `contracts/zod/organization-zod.ts` — add `pending_approval` to organization status enum
6. Add new contracts types and zod schemas for onboarding and ownership transfer
7. Create migration SQL file
8. Add repository functions in `onboarding-repo.ts` and `ownership-transfer-repo.ts`
9. Export new repos from `repositories/index.ts`

### Phase 2: Auth UX
1. Enable `password` plugin in `@workspace/auth` `createWorkspaceAuth`
2. Add `passwordClient` to both admin and web auth clients
3. Add email/password sign-in to admin `login-form.tsx`
4. Add email/password sign-in to web `login-form.tsx`
5. Add sign-up flow (email/password) to web app login form
6. Improve session persistence — ensure callback URLs work correctly
7. Clear separation of login → onboarding → pending approval → workspace states

### Phase 3: Customer Onboarding & Approval
1. Extend web `onboarding-form.tsx` with detailed fields (company website, industry, country, phone, team size, use case)
2. Update `completeOnboarding` action to create an `onboarding_application` record with `pending` status
3. Create `pending-approval` page in web app — shown when org status is `pending_approval`
4. Update web app layout/page redirects to check approval status and route to pending-approval
5. Add admin approval workflow:
   - New admin route `(dashboard)/applications/page.tsx` — list onboarding applications
   - New admin route `(dashboard)/applications/[id]/page.tsx` — review detail
   - Server actions: `approveApplicationAction`, `rejectApplicationAction`
   - On approval: create organization with `active` status, set org member as owner
   - On rejection: update application status, send rejection email
6. Add sidebar entry for "Applications" in admin sidebar
7. Send welcome email after onboarding submission
8. Send approval notification email when approved/rejected

### Phase 4: Admin UI Improvements
1. Create reusable `DataTable` component with search, filtering, status badges, row actions, empty states, loading skeletons
2. Upgrade overview page with more analytics cards
3. Upgrade organizations table — search, filter by status, row click to detail, activate/suspend actions
4. Upgrade users table — search, filter by role, row click to detail
5. Upgrade activity/audit table — search, filter by action type
6. Upgrade projects, suppliers, receipts, payments tables — search, filter, status badges
7. Add applications table to admin overview stats
8. Improve admin loading states (Phase 6 overlap)

### Phase 5: Ownership Transfer
1. Create API use case for requesting ownership transfer
2. Create API use case for approving/rejecting transfer (super_admin only)
3. Add "Transfer Ownership" button in web app settings (owner only)
4. Create transfer request form (select new owner from team members)
5. Add admin route `(dashboard)/transfers/page.tsx` — list transfer requests
6. Add server actions: `requestOwnershipTransferAction`, `approveTransferAction`, `rejectTransferAction`
7. Audit log all transfer steps (request, approve, reject, execute)
8. Prevent cross-org transfers (validate same organization)
9. Prevent automatic transfer (require admin approval)
10. Add sidebar entry for "Transfers" in admin sidebar

### Phase 6: Loading States & Skeletons
1. Fix admin `loading.tsx` — create proper admin dashboard skeleton matching layout
2. Add per-route loading files for admin: organizations, users, activity, etc.
3. Fix web `[workspaceSlug]/loading.tsx` — use existing `DashboardPageSkeleton`
4. Add per-route loading files for web: home, expenses, projects, settings, etc.
5. Create login/onboarding loading skeletons
6. Ensure empty, error, loading, pending states are visually distinct
7. Consider Suspense boundaries for streaming where safe (no unsafe caching of private data)

### Phase 7: Demo Access
1. Create demo data fixtures (sample projects, suppliers, receipts, payments — no real data)
2. Add demo login button on web login page
3. Create demo user/organization in seed script
4. Mark demo data clearly in UI
5. Demo access separate from real platform access

### Phase 8: Emails
1. Create `welcome-email.tsx` — sent after onboarding submission
2. Create `approval-notification.tsx` — sent when application approved/rejected
3. Create `ownership-transfer-request.tsx` — sent to admins when transfer requested
4. Create `ownership-transfer-result.tsx` — sent to requester when approved/rejected
5. Add email sending functions to `transactional/email.ts`
6. Export new emails from `transactional/index.ts`

### Phase 9: Tests & Verification
1. Add tests for onboarding application use case
2. Add tests for ownership transfer use case
3. Add tests for approval workflow
4. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`
5. Visual inspection of both apps
6. Verify all states: login → onboarding → pending → approved → workspace
