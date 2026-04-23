# Supabase integration notes

## Schema

Run `supabase/schema.sql` against a fresh project. RLS is enabled on every
application table.

## Clerk → Supabase auth mapping

RLS policies key off `auth.jwt() ->> 'sub'` matching `users.clerk_user_id`. Two
options to wire this up:

1. **Supabase third-party JWT** (recommended)
   - In Supabase dashboard → Auth → JWT Settings, add Clerk as a third-party
     issuer. Point it at your Clerk instance's JWKS URL.
   - Configure Clerk to issue JWTs with the expected claims (`sub` = Clerk user id,
     `aud` = "authenticated").
   - Pass the Clerk JWT as `Authorization: Bearer <token>` when creating a
     Supabase client from the server. The policies just work.

2. **Service role + application-layer auth** (fallback)
   - Use `supabaseService()` in server actions, and check Clerk auth
     (`await auth()`) in the route before any DB call.
   - Never expose the service role key to the browser.

## Provisioning users on first sign-in

Add a Clerk webhook at `/api/webhooks/clerk` (to be scaffolded in Phase 1A
follow-up) that inserts a `users` row when `user.created` fires. Map:

| Clerk                         | users column        |
| ----------------------------- | ------------------- |
| `id`                          | `clerk_user_id`     |
| `primary_email_address.email` | `email`             |
| `first_name + last_name`      | `name`              |
| (public metadata)             | `role_title`, `role_category`, `organization_id`, `is_admin_arcticblue` |

Admins set `is_admin_arcticblue = true` via Clerk's public metadata. The
webhook syncs that flag on every `user.updated`.

## Published content

Every content table has `is_published` + `published_at`. RLS allows reads when
`is_published = true` or the caller is an ArcticBlue admin. Writes always
require admin.
