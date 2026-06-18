import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState, type ComponentType } from "react";

export interface SearchableOption {
  value: string;
  label: string;
  /** Extra text matched by the search box but not shown in the option (e.g. serial no). */
  keywords?: string;
}

interface Props {
  /** Hidden input name so the value is picked up by the surrounding form's FormData. */
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  /** Allow entering a value that isn't in the option list (free text). */
  allowCustom?: boolean;
}

export function SearchableSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Type to search…",
  emptyText = "No matches found",
  icon: Icon,
  allowCustom = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const selected = options.find((o) => o.value === value) ?? null;
  // Free-text value typed by the user that isn't one of the predefined options.
  const customLabel = !selected && allowCustom && value ? value : "";
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => `${o.label} ${o.keywords ?? ""}`.toLowerCase().includes(q))
    : options;
  const showCustomEntry =
    allowCustom &&
    query.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === q || o.value.toLowerCase() === q);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl pl-4 pr-3 py-3 text-sm font-bold focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all cursor-pointer text-left"
      >
        {Icon && <Icon size={16} className="text-white/20 shrink-0" />}
        <span className={`flex-1 truncate ${selected || customLabel ? "text-white" : "text-white/30"}`}>
          {selected ? selected.label : customLabel || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-white/30 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-white/10 bg-theme-dark shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
            <Search size={14} className="text-white/30 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent border-none outline-none py-1 text-sm font-bold text-white placeholder:text-white/20"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {showCustomEntry && (
              <button
                type="button"
                onClick={() => {
                  onChange(query.trim());
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-theme-soft hover:bg-white/5 transition-colors"
              >
                <Plus size={14} className="shrink-0" />
                <span className="flex-1 truncate">
                  Use “{query.trim()}”
                </span>
              </button>
            )}
            {filtered.length === 0 && !showCustomEntry ? (
              <p className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">
                {emptyText}
              </p>
            ) : (
              filtered.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-bold transition-colors ${
                    o.value === value
                      ? "bg-theme-soft/10 text-theme-soft"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex-1 truncate">{o.label}</span>
                  {o.value === value && <Check size={14} className="shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
