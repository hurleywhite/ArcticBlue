import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULES, getModuleBySlug } from "@/lib/content/modules";
import { Markdown } from "@/components/shared/markdown";
import { ModuleProgressControls } from "./progress-controls";

export async function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getModuleBySlug(slug);
  return { title: m ? `${m.title} · ArcticMind` : "Module · ArcticMind" };
}

const TYPE_LABEL: Record<string, string> = {
  reading: "Reading",
  video: "Video",
  exercise: "Exercise",
  live_workshop: "Live workshop",
  curated_external: "Curated external",
};

export default async function ModuleDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getModuleBySlug(slug);
  if (!m) notFound();

  // related modules: share a topic tag
  const related = MODULES.filter(
    (other) =>
      other.id !== m.id &&
      (other.tags.topics ?? []).some((t) => (m.tags.topics ?? []).includes(t))
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="bg-navy px-6 py-5 text-white">
        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
          <Link href="/learning" className="hover:underline">
            Learning
          </Link>
          <span>·</span>
          <span>{TYPE_LABEL[m.module_type]}</span>
          <span>·</span>
          <span>{m.estimated_minutes} min</span>
        </div>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.15]">{m.title}</h1>
        {m.subtitle && (
          <p className="mt-1 text-[13px] opacity-90">{m.subtitle}</p>
        )}
        <div className="mt-3 text-[11px] opacity-80">
          {m.author_name}
          {m.author_role ? ` · ${m.author_role}` : ""}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_260px]">
        <div>
          <p className="text-[13px] leading-[1.6] text-ink">{m.description}</p>

          <hr className="rule my-6" />

          {m.module_type === "reading" && m.body_markdown && (
            <Markdown>{m.body_markdown}</Markdown>
          )}

          {m.module_type === "video" && (
            <div>
              <div className="flex aspect-video items-center justify-center border border-ink-border bg-bg-card">
                <div className="text-center">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
                    Video player
                  </div>
                  <div className="mt-1 text-[12px] text-ink-muted">
                    Mux player wires in once credentials are provisioned.
                  </div>
                  <div className="mt-2 text-[11px] text-ink-muted">
                    Playback ID: <code>{m.video_mux_playback_id}</code>
                  </div>
                </div>
              </div>
              <div className="callout mt-5">
                <p>
                  Progress will persist every 10 seconds while watching. Mark Complete
                  fires automatically at 95% watched, or manually from the rail.
                </p>
              </div>
            </div>
          )}

          {m.module_type === "exercise" && m.exercise_prompt && (
            <div>
              <h2 className="section-header mb-2">Exercise brief</h2>
              <div className="card-surface">
                <Markdown>{m.exercise_prompt}</Markdown>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-ink-border pt-4">
                <div className="text-[12px] text-ink-muted">
                  Ready to try this? Practice seeds a chat session with this brief.
                </div>
                <Link
                  href={`/tools/practice?seed=module&id=${m.id}`}
                  className="btn-primary"
                >
                  Practice this in Tools →
                </Link>
              </div>
            </div>
          )}

          {m.module_type === "live_workshop" && (
            <div>
              <h2 className="section-header mb-2">Workshop details</h2>
              <table className="doc-table">
                <tbody>
                  <tr>
                    <td style={{ width: "30%" }}>
                      <strong>Date and time</strong>
                    </td>
                    <td>
                      {m.workshop_date
                        ? new Date(m.workshop_date).toLocaleString("en-US", {
                            dateStyle: "full",
                            timeStyle: "short",
                          })
                        : "TBA"}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Duration</strong>
                    </td>
                    <td>{m.estimated_minutes} minutes</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Facilitator</strong>
                    </td>
                    <td>
                      {m.author_name}
                      {m.author_role ? ` · ${m.author_role}` : ""}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>What to bring</strong>
                    </td>
                    <td>A real, in-flight deliverable you'll use the session on.</td>
                  </tr>
                </tbody>
              </table>
              {m.workshop_registration_url && (
                <div className="mt-5">
                  <a
                    href={m.workshop_registration_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary inline-block"
                  >
                    Register →
                  </a>
                </div>
              )}
            </div>
          )}

          {m.module_type === "curated_external" && (
            <div>
              <h2 className="section-header mb-2">Why we recommend this</h2>
              {m.body_markdown && <Markdown>{m.body_markdown}</Markdown>}
              <div className="callout mt-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  External resource
                </div>
                <p className="mt-1">
                  <a
                    href={m.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {m.external_url}
                  </a>
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-ink-border pt-4">
                <div className="text-[12px] text-ink-muted">
                  Mark this as complete when you've read and absorbed it.
                </div>
              </div>
            </div>
          )}
        </div>

        <aside>
          <ModuleProgressControls moduleId={m.id} />

          <h3 className="section-header mt-8 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {m.tags.topics?.map((t) => (
              <span
                key={t}
                className="border border-ink-border bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
              >
                {t}
              </span>
            ))}
            {m.tags.roles?.map((r) => (
              <span
                key={r}
                className="border border-ice bg-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
              >
                {r === "all" ? "All roles" : r}
              </span>
            ))}
          </div>

          <h3 className="section-header mt-8 mb-2">Admin</h3>
          <Link
            href={`/admin/modules/${m.id}`}
            className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
          >
            Edit in CMS →
          </Link>

          {related.length > 0 && (
            <>
              <h3 className="section-header mt-8 mb-2">Related</h3>
              <ul className="m-0 list-none p-0">
                {related.map((rm) => (
                  <li key={rm.id} className="mb-3">
                    <Link
                      href={`/learning/${rm.slug}`}
                      className="block border border-ink-border bg-white px-3 py-2 transition hover:border-navy"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                        {TYPE_LABEL[rm.module_type]}
                      </div>
                      <div className="mt-0.5 text-[12px] font-bold">
                        {rm.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink-muted">
                        {rm.estimated_minutes} min
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
