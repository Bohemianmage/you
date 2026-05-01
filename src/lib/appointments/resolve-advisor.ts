import "server-only";

import type { TeamMember } from "@/data/team";
import type { SiteContentFile } from "@/lib/site-content/types";
import { mergeTeamFromFile } from "@/lib/site-content/merge-public";

export type AdvisorResolve =
  | { ok: true; advisor: TeamMember }
  | { ok: false; code: "no_mapping" | "unknown_advisor" | "no_email" };

export function resolveAdvisorForCatalogProperty(
  file: SiteContentFile,
  catalogPropertyId: string,
): AdvisorResolve {
  const advisorId = file.propertyAdvisorByCatalogId?.[catalogPropertyId]?.trim();
  if (!advisorId) return { ok: false, code: "no_mapping" };

  const team = mergeTeamFromFile(file);
  const advisor = team.find((m) => m.id === advisorId);
  if (!advisor) return { ok: false, code: "unknown_advisor" };

  const email = advisor.email?.trim();
  if (!email) return { ok: false, code: "no_email" };

  return { ok: true, advisor };
}
