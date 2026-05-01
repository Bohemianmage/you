const githubErr: Record<string, string> = {
  github_unauthorized: "Token de GitHub inválido o expirado.",
  github_forbidden: "Sin permiso para escribir en el repositorio.",
  github_not_found: "Repo, rama o ruta del archivo incorrectos.",
  github_conflict: "Conflicto al actualizar. Intentá de nuevo.",
  github_validation: "GitHub rechazó la actualización (revisá rama o reglas del repo).",
  github_rate_limit: "Demasiadas solicitudes a GitHub. Esperá un momento.",
  github_unknown: "Error al conectar con GitHub.",
};

export function getAdminSaveErrorMessage(code: string): string | null {
  if (code === "write_failed") return "No se pudo guardar.";
  if (code === "validation") return "Revisá los campos obligatorios (equipo y destacadas).";
  if (code === "invalid_json") return "Datos inválidos.";
  return githubErr[code] ?? null;
}
