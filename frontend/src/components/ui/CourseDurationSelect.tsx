// The canonical set of course durations offered across the app. Used by the
// public registration form and the admin/staff student editors so the value is
// always one of a fixed set (instead of free text that drifts: "1 Year" vs
// "1 Years").
export const COURSE_DURATIONS = ["3 Months", "6 Months", "1 Year", "2 Years", "3 Years", "4 Years"] as const;

interface CourseDurationSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  name?: string;
}

/**
 * Dropdown of the standard course durations. If the current value is not one of
 * the standard options (e.g. legacy "4 Years"), it is kept as an extra option so
 * editing an unrelated field never silently rewrites the duration.
 */
export function CourseDurationSelect({ value, onChange, className, id, name }: CourseDurationSelectProps) {
  const isKnown = (COURSE_DURATIONS as readonly string[]).includes(value);
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="" className="bg-theme-dark">Select duration…</option>
      {value && !isKnown && (
        <option value={value} className="bg-theme-dark">{value}</option>
      )}
      {COURSE_DURATIONS.map((d) => (
        <option key={d} value={d} className="bg-theme-dark">{d}</option>
      ))}
    </select>
  );
}
