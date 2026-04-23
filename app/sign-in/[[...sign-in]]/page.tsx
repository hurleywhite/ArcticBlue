/*
  Sign-in page. Clerk's <SignIn /> component drops in once env vars are
  provisioned and ClerkProvider is added to the root layout. For now this
  is a placeholder so the /sign-in link in the top nav doesn't 404.
*/

export const metadata = { title: "Sign in · ArcticMind" };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-[480px] px-6 py-16">
      <div className="bg-navy px-6 py-4 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
          Sign in
        </div>
        <div className="mt-0.5 text-[16px] font-bold">ArcticMind is invite-only.</div>
      </div>
      <div className="border border-ink-border border-t-0 px-6 py-6">
        <p className="text-[13px] leading-[1.55]">
          Clerk auth wires in once publishable and secret keys are provisioned.
          You'll land on this page from the top nav — the real Clerk form replaces this
          placeholder.
        </p>
        <div className="callout mt-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            For admins provisioning the app
          </div>
          <ol className="mt-2 list-decimal pl-5 text-[13px] leading-[1.55]">
            <li>
              Create a Clerk application with Organizations enabled (invite-only).
            </li>
            <li>
              Copy <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and
              {" "}
              <code>CLERK_SECRET_KEY</code> into <code>.env.local</code>.
            </li>
            <li>
              Wrap <code>app/layout.tsx</code> with <code>&lt;ClerkProvider&gt;</code> and
              swap this page's body for <code>&lt;SignIn /&gt;</code>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
