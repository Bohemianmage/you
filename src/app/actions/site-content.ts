"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/admin/auth";
import { writeSiteContentFile } from "@/lib/site-content/file-store";
import { getGithubPublishConfig, GithubPublishError, publishSiteContentToGithub } from "@/lib/site-content/github-publish";
import { parseSiteContentFile } from "@/lib/site-content/schema";
import type { SiteContentFile } from "@/lib/site-content/types";
import { ZodError } from "zod";

export type SaveSiteContentError =
  | "invalid_json"
  | "validation"
  | "write_failed"
  | "github_unauthorized"
  | "github_forbidden"
  | "github_not_found"
  | "github_conflict"
  | "github_validation"
  | "github_rate_limit"
  | "github_unknown";

export type SaveSiteContentResult = { ok: true } | { ok: false; error: SaveSiteContentError };

async function requireAdminSessionOrRedirect() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) redirect("/admin/login");
}

function editorJsonToFile(raw: unknown): SiteContentFile {
  return parseSiteContentFile(raw);
}

export async function saveSiteContent(json: string): Promise<SaveSiteContentResult> {
  await requireAdminSessionOrRedirect();

  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    return { ok: false, error: "invalid_json" };
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    delete (parsed as Record<string, unknown>).catalogProperties;
  }

  let file: SiteContentFile;
  try {
    file = editorJsonToFile(parsed);
  } catch (e) {
    if (e instanceof ZodError) {
      console.error("[site-content]", e.flatten());
      return { ok: false, error: "validation" };
    }
    throw e;
  }

  const gh = getGithubPublishConfig();
  if (gh) {
    try {
      await publishSiteContentToGithub(file, gh);
    } catch (e) {
      if (e instanceof GithubPublishError) {
        return { ok: false, error: `github_${e.code}` as SaveSiteContentError };
      }
      console.error("[site-content] github", e);
      return { ok: false, error: "github_unknown" };
    }
    try {
      await writeSiteContentFile(file);
    } catch {
      /* opcional */
    }
  } else {
    try {
      await writeSiteContentFile(file);
    } catch (err) {
      console.error("[site-content] write", err);
      return { ok: false, error: "write_failed" };
    }
  }

  updateTag("site-content");
  return { ok: true };
}
