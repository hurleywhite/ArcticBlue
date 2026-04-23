import Link from "next/link";
import { notFound } from "next/navigation";
import { LABS, formatMonth, getLabByMonth } from "@/lib/content/labs";
import { Markdown } from "@/components/shared/markdown";
import { LabArtifactsClient } from "./artifacts-client";

export async function generateStaticParams() {
  return LABS.map((l) => ({ month: l.month.slice(0, 7) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const lab = getLabByMonth(`${month}-01`);
  return { title: lab ? `${formatMonth(lab.month)} Lab · ${lab.title}` : "Lab · ArcticMind" };
}

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  in_progress: "In progress",
  completed: "Completed",
  canceled: "Canceled",
};

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const lab = getLabByMonth(`${month}-01`);
  if (!lab) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="bg-navy px-6 py-5 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
          <Link href="/lab" className="hover:underline">
            Practical Labs
          </Link>
          <span className="mx-2">·</span>
          <span>{formatMonth(lab.month)}</span>
          <span className="mx-2">·</span>
          <span>{STATUS_LABEL[lab.status]}</span>
          {lab.attendance && (
            <>
              <span className="mx-2">·</span>
              <span>{lab.attendance.attended} of {lab.attendance.invited} attended</span>
            </>
          )}
        </div>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.15]">{lab.title}</h1>
        <p className="mt-1 text-[13px] opacity-90">
          Facilitator: {lab.facilitator_name}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_260px]">
        <div>
          <h2 className="section-header mb-2">The challenge</h2>
          <p className="text-[13px] leading-[1.6]">{lab.challenge_brief}</p>

          <h2 className="section-header mt-8 mb-2">Agenda</h2>
          <Markdown>{lab.agenda_markdown}</Markdown>

          {lab.recap_markdown && (
            <>
              <h2 className="section-header mt-8 mb-2">What we learned</h2>
              <div className="callout">
                <Markdown>{lab.recap_markdown}</Markdown>
              </div>
            </>
          )}

          {lab.tools_featured.length > 0 && (
            <>
              <h2 className="section-header mt-8 mb-2">Tools used</h2>
              <table className="doc-table">
                <thead>
                  <tr>
                    <th style={{ width: "28%" }}>Tool</th>
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {lab.tools_featured.map((t) => (
                    <tr key={t.name}>
                      <td><strong>{t.name}</strong></td>
                      <td>{t.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {lab.artifacts.length > 0 && (
            <>
              <h2 className="section-header mt-8 mb-2">Shared team artifacts</h2>
              <p className="mb-3 text-[12px] text-ink-muted">
                What teammates took away and shared after the session.
              </p>
              <div className="border border-ink-border">
                {lab.artifacts.map((a, idx) => (
                  <div
                    key={a.id}
                    className={`px-5 py-4 ${
                      idx === lab.artifacts.length - 1 ? "" : "border-b border-ink-border"
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                      {a.user_name}{a.user_role ? ` · ${a.user_role}` : ""} · {new Date(a.created_at).toLocaleDateString()}
                    </div>
                    <div className="mt-0.5 text-[14px] font-bold text-navy">{a.title}</div>
                    <div className="prose-editorial mt-1 text-[13px]">
                      <Markdown>{a.content_markdown}</Markdown>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <LabArtifactsClient labId={lab.id} />
        </div>

        <aside>
          <h3 className="section-header mb-2">Session</h3>
          <table className="doc-table">
            <tbody>
              <tr><td><strong>Month</strong></td><td>{formatMonth(lab.month)}</td></tr>
              <tr><td><strong>When</strong></td><td>{new Date(lab.session_datetime).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</td></tr>
              <tr><td><strong>Duration</strong></td><td>{lab.session_duration_minutes} min</td></tr>
              <tr><td><strong>Facilitator</strong></td><td>{lab.facilitator_name}</td></tr>
              {lab.attendance && (
                <tr><td><strong>Attendance</strong></td><td>{lab.attendance.attended} of {lab.attendance.invited}</td></tr>
              )}
            </tbody>
          </table>

          <h3 className="section-header mt-6 mb-2">Pre-work for this session</h3>
          <Markdown>{lab.pre_work_markdown}</Markdown>
        </aside>
      </div>
    </div>
  );
}
