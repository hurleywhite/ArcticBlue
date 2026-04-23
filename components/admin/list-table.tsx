import Link from "next/link";

/*
  Shared admin list table. Every content type renders the same way —
  title, meta columns, status, and an action. Keeps the admin experience
  consistent across content types without duplicating markup.
*/

export type ListColumn<T> = {
  label: string;
  width?: string;
  render: (row: T) => React.ReactNode;
};

export function AdminListTable<T extends { id: string }>({
  columns,
  rows,
  editHrefFor,
}: {
  columns: ListColumn<T>[];
  rows: T[];
  editHrefFor: (row: T) => string;
}) {
  return (
    <table className="doc-table">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.label} style={c.width ? { width: c.width } : undefined}>
              {c.label}
            </th>
          ))}
          <th style={{ width: "12%" }}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            {columns.map((c) => (
              <td key={c.label}>{c.render(r)}</td>
            ))}
            <td>
              <Link
                href={editHrefFor(r)}
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
              >
                Edit →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AdminToolbar({
  newHref,
  newLabel,
}: {
  newHref: string;
  newLabel: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-b border-ink-border bg-bg-card px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
        Filters · Search · Bulk actions (Phase 1E polish)
      </div>
      <Link href={newHref} className="btn-primary">
        {newLabel}
      </Link>
    </div>
  );
}
