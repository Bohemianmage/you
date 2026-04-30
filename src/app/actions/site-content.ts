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

async function requireAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) redirect("/admin/login");
}

function editorJsonToFile(raw: unknown): SiteContentFile {
  return parseSiteContentFile(raw);
}

export async function saveSiteContent(json: string) {
  await requireAdminSession();

  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    redirect("/admin?error=invalid_json");
  }

  let file: SiteContentFile;
  try {
    file = editorJsonToFile(parsed);
  } catch (e) {
    if (e instanceof ZodError) {
      console.error("[site-content]", e.flatten());
      redirect("/admin?error=validation");
    }
    throw e;
  }

  const gh = getGithubPublishConfig();
  if (gh) {
    try {
      await publishSiteContentToGithub(file, gh);
    } catch (e) {
      if (e instanceof GithubPublishError) {
        redirect(`/admin?error=github_${e.code}`);
      }
      console.error("[site-content] github", e);
      redirect("/admin?error=github_unknown");
    }
    try {
      await writeSiteContentFile(file);
    } catch {
      /* copia local opcional tras commit */
    }
  } else {
    try {
      await writeSiteContentFile(file);
    } catch (err) {
      console.error("[site-content] write", err);
      redirect("/admin?error=write_failed");
    }
  }

  updateTag("site-content");
  redirect("/admin?saved=1");
}
