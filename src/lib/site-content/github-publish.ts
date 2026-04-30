import "server-only";

import type { SiteContentFile } from "./types";

export type GithubPublishConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  commitPrefix: string;
};

export type GithubErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limit"
  | "unknown";

export class GithubPublishError extends Error {
  readonly code: GithubErrorCode;

  constructor(code: GithubErrorCode, detail?: string) {
    super(detail ?? code);
    this.name = "GithubPublishError";
    this.code = code;
  }
}

function mapStatus(status: number): GithubErrorCode {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 429) return "rate_limit";
  return "unknown";
}

const githubHeaders = (token: string) =>
  ({
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }) as const;

export function getGithubPublishConfig(): GithubPublishConfig | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repoFull = process.env.GITHUB_REPO?.trim();
  if (!token || !repoFull) return null;
  const parts = repoFull.split("/").filter(Boolean);
  if (parts.length !== 2) return null;
  const [owner, repo] = parts;
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  const path = process.env.GITHUB_SITE_CONTENT_PATH?.trim() || "content/site-content.json";
  const commitPrefix = process.env.GITHUB_COMMIT_PREFIX?.trim() || "chore(site): actualizar contenido (admin)";
  return { token, owner, repo, branch, path, commitPrefix };
}

function contentsUrl(cfg: GithubPublishConfig): string {
  const pathEnc = encodeURIComponent(cfg.path);
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${pathEnc}`;
}

/**
 * Crea o actualiza el archivo en GitHub (un commit vía REST Contents API).
 * @see https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
 */
export async function publishSiteContentToGithub(content: SiteContentFile, cfg: GithubPublishConfig): Promise<void> {
  const raw = `${JSON.stringify(content, null, 2)}\n`;
  const base64 = Buffer.from(raw, "utf-8").toString("base64");
  const message = `${cfg.commitPrefix} · ${new Date().toISOString().slice(0, 19).replace("T", " ")} UTC`;

  const url = contentsUrl(cfg);
  const headers = {
    ...githubHeaders(cfg.token),
    "Content-Type": "application/json",
  };

  let sha: string | undefined;
  const getRes = await fetch(`${url}?ref=${encodeURIComponent(cfg.branch)}`, {
    headers: githubHeaders(cfg.token),
  });

  if (getRes.status === 200) {
    const meta = (await getRes.json()) as { sha?: string };
    sha = meta.sha;
  } else if (getRes.status !== 404) {
    const text = await getRes.text();
    console.error("[github-publish] GET", getRes.status, text);
    throw new GithubPublishError(mapStatus(getRes.status), text);
  }

  const putBody: Record<string, string> = {
    message,
    content: base64,
    branch: cfg.branch,
  };
  if (sha) putBody.sha = sha;

  const putRes = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    console.error("[github-publish] PUT", putRes.status, text);
    throw new GithubPublishError(mapStatus(putRes.status), text);
  }
}
