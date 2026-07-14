# Google-Only Onboarding UI Design

## Goal

Replace the temporary email/password authentication form with production-shaped Google-only login and company registration screens while Google OAuth credentials are pending.

## Scope

This phase creates the frontend screens and interaction states only. It does not enable Google OAuth, create users, create organizations, or insert organization memberships.

## Routes and Screens

### Sign in (`/login`)

- Show the Zimba brand, a concise welcome message, and a single primary `Continue with Google` action.
- Include a link to `/register` for people creating a new company account.
- Remove email and password fields.
- If the Google provider is not configured, selecting the Google action displays an inline informational message instead of starting a fake login.
- An authenticated visitor is still redirected to `/admin/home`.

### Register (`/register`)

- Collect the user's full name and company name.
- Present `Continue with Google` as the only authentication method.
- Validate both fields before attempting to continue.
- Preserve the values in component state so they can later be connected to the OAuth handoff without redesigning the screen.
- Include a link back to `/login` for existing users.
- If Google is not configured, display the same inline setup message without creating records.

### Workspace Setup (`/onboarding`)

- Show a focused progress state labeled `Setting up your workspace`.
- Explain that Zimba is creating the company workspace and owner account.
- Include an accessible progress indicator and a restrained construction-themed visual treatment.
- This route is a presentation-only target until the OAuth callback and organization transaction are implemented.

## Visual Direction

- Reuse the existing Zimba typography, color tokens, logo, buttons, fields, and spacing system.
- Use a responsive split layout on larger screens: focused form content beside a branded construction image panel.
- Collapse to a clean single-column card on small screens.
- Keep the experience calm and credible rather than presenting disabled-looking or obviously mocked controls.
- Maintain visible focus states, semantic labels, inline status messaging, and adequate color contrast.

## Component Boundaries

- A shared authentication shell owns the responsive layout, brand treatment, and image panel.
- Separate login and registration forms own their respective fields and messages.
- A shared Google action owns the Google icon, pending state, and temporary not-configured message behavior.
- The onboarding progress screen is independent so the future OAuth callback can redirect to it without coupling it to either form.

## Future OAuth Connection

When credentials are available:

1. Registration stores the validated full name and company name in a short-lived secure server-side handoff.
2. The Google action starts Better Auth's Google OAuth flow.
3. The callback creates or resolves the Better Auth user.
4. A transaction creates the organization and owner membership when needed.
5. The app derives `X-Organization-Id` from the signed-in user's membership and redirects to `/admin/home`.

The future wiring must not use fake OAuth responses or store sensitive authentication tokens in browser storage.

## Verification

- Verify `/login`, `/register`, and `/onboarding` at mobile and desktop widths.
- Verify authenticated `/login` and `/register` visitors redirect to the dashboard.
- Verify required-field errors, keyboard navigation, status announcements, and route links.
- Run Biome, TypeScript, the production build, and React Doctor after implementation.
