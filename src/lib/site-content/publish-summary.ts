/** Datos públicos para la UI del admin (sin secretos). */
export type AdminGithubPublishSummary = {
  hasToken: boolean;
  hasRepo: boolean;
  enabled: boolean;
  repo: string | null;
  branch: string;
  contentPath: string;
};
