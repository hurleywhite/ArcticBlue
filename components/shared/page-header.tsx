/*
  Reusable page header band — navy row with kicker + title, optional
  right-hand action. Used across Canvas, Learning, Use Cases, Tools, etc.
*/

export function PageHeader({
  kicker,
  title,
  right,
}: {
  kicker: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="bg-navy px-6 py-4 text-white">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
            {kicker}
          </div>
          <h1 className="mt-0.5 text-[20px] font-bold leading-[1.15]">{title}</h1>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </div>
  );
}
