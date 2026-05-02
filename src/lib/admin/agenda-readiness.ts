import type { CatalogProperty } from "@/data/catalog-properties";
import type { TeamMember } from "@/data/team";

export type AgendaReadiness = {
  errors: string[];
  warnings: string[];
  /** Sin errores de contenido (servidor aparte). */
  contentReady: boolean;
};

function normalizeFeaturedIds(ids: readonly string[], catalog: readonly CatalogProperty[]): string[] {
  const catalogIds = new Set(catalog.map((c) => c.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!catalogIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * Comprueba que lo editable en Listas cubre lo necesario para agenda en sitio
 * (equipo, correos, mapa de asesores, destacadas). Redis/correo transaccional son del servidor.
 */
export function computeAgendaReadiness(input: {
  team: TeamMember[];
  propertyAdvisorByCatalogId: Record<string, string>;
  featuredCatalogIds: readonly string[];
  catalog: readonly CatalogProperty[];
}): AgendaReadiness {
  const { team, propertyAdvisorByCatalogId: map, featuredCatalogIds, catalog } = input;
  const errors: string[] = [];
  const warnings: string[] = [];

  const teamById = new Map(team.map((m) => [m.id, m]));
  const withEmail = team.filter((m) => m.email?.trim());

  if (withEmail.length === 0) {
    errors.push("Equipo: hace falta al menos un correo para agendar, avisar pendientes y recordatorios.");
  }

  for (const [, advisorId] of Object.entries(map)) {
    const aid = advisorId?.trim();
    if (!aid) continue;
    const member = teamById.get(aid);
    if (!member) {
      errors.push(`Asesores en propiedades: hay un ID de catálogo enlazado a «${aid}», que no está en Equipo.`);
      continue;
    }
    if (!member.email?.trim()) {
      errors.push(
        `Asesores en propiedades: ${member.name.trim() || aid} está asignado a una ficha pero no tiene correo en Equipo.`,
      );
    }
  }

  const featured = normalizeFeaturedIds(featuredCatalogIds, catalog);
  const unmapped = featured.filter((id) => !map[id]?.trim());
  if (unmapped.length > 0 && withEmail.length > 0) {
    warnings.push(
      `${unmapped.length} destacada(s) en inicio sin entrada en «Asesores en propiedades»: la agenda usará la unión de horarios del equipo; en Calendario se puede asignar asesor al confirmar.`,
    );
  }

  return { errors, warnings, contentReady: errors.length === 0 };
}
