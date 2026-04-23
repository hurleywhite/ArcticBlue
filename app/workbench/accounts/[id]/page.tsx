import Link from "next/link";
import { notFound } from "next/navigation";
import { ACCOUNTS, STAGE_LABEL, formatMeetingWhen, getAccountById } from "@/lib/content/accounts";
import { USE_CASES } from "@/lib/content/use-cases";
import { PageHeader } from "@/components/shared/page-header";
import { MeetingPrepClient } from "./meeting-prep-client";

export async function generateStaticParams() {
  return ACCOUNTS.map((a) => ({ id: a.id }));
}

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = getAccountById(id);
  if (!account) notFound();

  const relevantCases = (account.relevant_case_slugs ?? [])
    .map((slug) => USE_CASES.find((u) => u.slug === slug))
    .filter((u): u is (typeof USE_CASES)[number] => !!u);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker={`Workbench · ${STAGE_LABEL[account.stage]}`}
        title={account.company_name}
        right={
          <Link href="/workbench" className="btn-secondary inline-block bg-white">
            ← Pipeline
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <MeetingPrepClient
            accountId={account.id}
            accountName={account.company_name}
            nextMeeting={
              account.next_meeting
                ? {
                    title: account.next_meeting.title,
                    when: account.next_meeting.when,
                    whenLabel: formatMeetingWhen(account.next_meeting.when),
                    duration: account.next_meeting.duration_minutes,
                    location: account.next_meeting.location,
                    attendees: account.next_meeting.attendees,
                  }
                : null
            }
            notes={account.notes}
            pocName={account.poc_name}
            pocTitle={account.poc_title}
            pocEmail={account.poc_email}
          />

          {relevantCases.length > 0 && (
            <>
              <h2 className="section-header mt-10 mb-3">Cases to cite</h2>
              <div className="border border-ink-border">
                {relevantCases.map((c, idx) => (
                  <div
                    key={c.id}
                    className={`grid grid-cols-[140px_1fr_120px] items-start ${
                      idx === relevantCases.length - 1 ? "" : "border-b border-ink-border"
                    }`}
                  >
                    <div className="bg-navy px-4 py-4 text-white">
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
                        Headline
                      </div>
                      <div className="mt-1 text-[16px] font-bold leading-[1.15]">
                        {c.headline_metric}
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                        {c.anonymized_client_label} · {(c.tags.industries ?? []).join(" · ")}
                      </div>
                      <div className="mt-0.5 text-[14px] font-bold text-navy">{c.title}</div>
                      <p className="mt-1 text-[12px] leading-[1.5] text-ink">{c.summary.slice(0, 220)}…</p>
                    </div>
                    <div className="flex items-center justify-end px-4 py-4">
                      <Link
                        href={`/use-cases/${c.slug}`}
                        className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                      >
                        Open →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside>
          <h3 className="section-header mb-2">Account</h3>
          <table className="doc-table">
            <tbody>
              <tr>
                <td><strong>Industry</strong></td>
                <td>{account.industry}</td>
              </tr>
              <tr>
                <td><strong>Size</strong></td>
                <td>{account.size}</td>
              </tr>
              <tr>
                <td><strong>Domain</strong></td>
                <td>
                  <code className="text-[11px]">{account.domain}</code>
                </td>
              </tr>
              <tr>
                <td><strong>Stage</strong></td>
                <td>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    {STAGE_LABEL[account.stage]}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="section-header mt-6 mb-2">Primary contact</h3>
          <div className="card-surface">
            <div className="text-[14px] font-bold text-navy">{account.poc_name}</div>
            <div className="mt-0.5 text-[12px] text-ink-muted">{account.poc_title}</div>
            <div className="mt-2 text-[11px] text-ink">
              <code>{account.poc_email}</code>
            </div>
          </div>

          <h3 className="section-header mt-6 mb-2">Showcase for this meeting</h3>
          <ul className="m-0 list-none space-y-2 p-0">
            {[
              { href: "/mirror", title: "Mirror · their opportunity field" },
              { href: "/showcase/canvas", title: "Canvas · for their role" },
              { href: "/showcase/analyzer", title: "Analyzer · live company profile" },
              { href: "/showcase/practice", title: "Practice · live Claude demo" },
              { href: "/showcase/lab", title: "Lab · what they'd actually buy" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block border border-ink-border bg-white px-3 py-2 text-[11px] font-bold text-navy transition hover:border-navy hover:bg-ice"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
