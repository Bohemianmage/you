import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { isAdminRequest } from "@/lib/admin/request-auth";

const MARKETING_PREFIX = "marketing/";

/**
 * Client uploads (Vercel Blob): genera token y completa subidas.
 * Requiere sesión admin + `BLOB_READ_WRITE_TOKEN` en el entorno.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await isAdminRequest(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "BLOB_READ_WRITE_TOKEN no configurado" }, { status: 503 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith(MARKETING_PREFIX)) {
          throw new Error("Ruta no permitida");
        }

        let kind: string | undefined;
        try {
          kind = clientPayload ? (JSON.parse(clientPayload) as { kind?: string }).kind : undefined;
        } catch {
          throw new Error("Payload inválido");
        }

        if (kind === "pdf") {
          return {
            allowedContentTypes: ["application/pdf"],
            maximumSizeInBytes: 25 * 1024 * 1024,
            addRandomSuffix: true,
          };
        }

        if (kind === "image") {
          return {
            allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
            maximumSizeInBytes: 8 * 1024 * 1024,
            addRandomSuffix: true,
          };
        }

        throw new Error("Tipo de subida no permitido");
      },
    });

    return Response.json(jsonResponse);
  } catch (e) {
    console.error("[blob-upload]", e);
    const message = e instanceof Error ? e.message : "Error de subida";
    return Response.json({ error: message }, { status: 400 });
  }
}
