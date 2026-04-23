import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { MODULES } from "@/lib/content/modules";
import { COLLECTIONS } from "@/lib/content/collections";
import { LibraryBrowser } from "./library-browser";

export const metadata = { title: "Learning Hub · ArcticMind" };

const TYPE_LABEL: Record<string, string> = {
  reading: "Reading",
  video: "Video",
  exercise: "Exercise",
  live_workshop: "Live workshop",
  curated_external: "Curated external",
};

export default function LearningPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Learning Hub"
        title="Build the skills to act on the canvas."
        right={
          <Link href="/learning/path" className="btn-secondary inline-block bg-white">
            My Path →
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-3">
        <PathCell
          kicker="My Path"
          title="Personalized from your Canvas"
          body="Modules matched to the opportunities you starred, plus anything you've already started."
          href="/learning/path"
        />
        <PathCell
          kicker="Browse"
          title="The full library"
          body="All modules, filterable by role, industry, type, and skill level."
          href="#library"
        />
        <PathCell
          kicker="Collections"
          title="Curated sequences"
          body="Short reading paths — Getting started, the experimentation method, prompting fundamentals."
          href="#collections"
        />
      </div>

      <div id="collections">
        <h2 className="section-header mt-10 mb-3">Collections</h2>
        <table className="doc-table">
          <thead>
            <tr>
              <th style={{ width: "28%" }}>Collection</th>
              <th>Includes</th>
              <th style={{ width: "12%" }}></th>
            </tr>
          </thead>
          <tbody>
            {COLLECTIONS.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.title}</strong>
                  <div className="mt-1 text-ink-muted">{c.description}</div>
                </td>
                <td>
                  <ul className="m-0 list-disc pl-4">
                    {c.module_slugs.map((slug) => {
                      const m = MODULES.find((mm) => mm.slug === slug);
                      return m ? (
                        <li key={slug}>
                          {m.title}{" "}
                          <span className="text-ink-muted">
                            · {TYPE_LABEL[m.module_type]} · {m.estimated_minutes} min
                          </span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </td>
                <td>
                  <Link
                    href={`/learning/collections/${c.slug}`}
                    className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div id="library">
        <h2 className="section-header mt-10 mb-3">The library</h2>
        <LibraryBrowser modules={MODULES} />
      </div>
    </div>
  );
}

function PathCell({
  kicker,
  title,
  body,
  href,
}: {
  kicker: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block border-ink-border bg-bg-card px-6 py-5 transition hover:bg-ice md:border-r md:last:border-r-0"
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
        {kicker}
      </div>
      <div className="mt-1 text-[14px] font-bold text-ink">{title}</div>
      <p className="mt-2 text-[13px] leading-[1.55] text-ink">{body}</p>
      <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
        Open →
      </div>
    </Link>
  );
}
