import crypto from "crypto";

type DestroyResult = { ok: true } | { ok: false; error: string };

/**
 * Deletes an asset from Cloudinary via the signed destroy endpoint.
 * Server-only: signs the request with CLOUDINARY_API_SECRET.
 */
export async function destroyCloudinaryAsset(
  publicID: string,
  resourceType: string
): Promise<DestroyResult> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !apiKey || !apiSecret) {
    return { ok: false, error: "Cloudinary admin credentials are not configured." };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // Params in the signature must be sorted alphabetically, then the secret appended.
  const toSign = `invalidate=true&public_id=${publicID}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  const type = ["image", "video", "raw"].includes(resourceType)
    ? resourceType
    : "raw";

  let res: Response;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${type}/destroy`, {
      method: "POST",
      body: new URLSearchParams({
        public_id: publicID,
        invalidate: "true",
        timestamp: String(timestamp),
        api_key: apiKey,
        signature,
      }),
    });
  } catch {
    return { ok: false, error: "Couldn't reach Cloudinary to delete the file." };
  }

  const json = (await res.json().catch(() => null)) as
    | { result?: string; error?: { message?: string } }
    | null;

  if (!res.ok) {
    return {
      ok: false,
      error: json?.error?.message ?? `Cloudinary responded with ${res.status}.`,
    };
  }
  // "not found" means the file is already gone — safe to remove our record.
  if (json?.result === "ok" || json?.result === "not found") return { ok: true };
  return {
    ok: false,
    error: `Cloudinary refused the deletion (${json?.result ?? "unknown"}).`,
  };
}
