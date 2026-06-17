import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 10;

interface PaginationProps {
  page: number; // 1-based current page
  total: number; // total item count (across all pages)
  pageSize?: number;
  onChange: (page: number) => void;
}

/** Returns a windowed list of page numbers with `null` marking an ellipsis gap. */
function pageWindow(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | null)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push(null);
  for (let p = start; p <= end; p += 1) out.push(p);
  if (end < pageCount - 1) out.push(null);
  out.push(pageCount);
  return out;
}

/**
 * Reusable client-side pagination bar for the admin tables. Renders nothing when
 * everything fits on one page.
 */
export function Pagination({ page, total, pageSize = PAGE_SIZE, onChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  const current = Math.min(Math.max(1, page), pageCount);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);

  const btn =
    "grid h-9 min-w-9 px-2 place-items-center rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-white/5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(current - 1)}
          disabled={current <= 1}
          className={`${btn} bg-white/5 text-white/60 hover:bg-white/10`}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        {pageWindow(current, pageCount).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="px-1 text-white/30 text-xs">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`${btn} ${
                p === current ? "bg-theme-soft text-theme-dark" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onChange(current + 1)}
          disabled={current >= pageCount}
          className={`${btn} bg-white/5 text-white/60 hover:bg-white/10`}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
