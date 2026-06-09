// Thin wrapper around @bangladeshi/bangladesh-address.
//
// The package ships a broken "main" entry in its package.json (it points at
// build/index.js, which doesn't exist — the real entry is build/src/index.js),
// so a bare import fails to resolve. We import the real entry directly here and
// re-export only what the registration form needs, keeping the deep path in one
// place. Revisit if the package fixes its "main" in a future release.
import { allDistricts, upazilaNamesOf } from "@bangladeshi/bangladesh-address/build/src/index.js";

/** All 64 districts (zilla), alphabetically. */
export function getDistricts(): string[] {
  return (allDistricts() as string[]).slice().sort((a, b) => a.localeCompare(b));
}

/** Upazilas belonging to a district, alphabetically. Empty array if unknown. */
export function getUpazilas(district: string): string[] {
  if (!district) return [];
  try {
    return (upazilaNamesOf(district) as string[]).slice().sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
