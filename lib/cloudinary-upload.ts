// Client-side unsigned uploads straight to Cloudinary. Files never touch our
// server (Vercel body-size/time limits), so the preset must be UNSIGNED.

export type UploadedAsset = {
  url: string;
  publicID: string;
  resourceType: string;
  format: string | null;
  bytes: number | null;
  duration: number | null;
};

export type ResourceKind = "VIDEO" | "LECTURE" | "FILE";

export function kindForFile(file: File): ResourceKind {
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type === "text/markdown" || /\.(md|markdown)$/i.test(file.name)) {
    return "LECTURE";
  }
  return "FILE";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function uploadToCloudinary(
  file: File,
  onProgress: (pct: number) => void
): { promise: Promise<UploadedAsset>; abort: () => void } {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const xhr = new XMLHttpRequest();

  const promise = new Promise<UploadedAsset>((resolve, reject) => {
    if (!cloud || !preset) {
      reject(
        new Error(
          "Cloudinary is not configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
        )
      );
      return;
    }

    const kind = kindForFile(file);

    // Videos go to the video endpoint (returns duration); everything else
    // uses `auto` and we store whatever resource_type Cloudinary assigns.
    const endpointType = kind === "VIDEO" ? "video" : "auto";
    const url = `https://api.cloudinary.com/v1_1/${cloud}/${endpointType}/upload`;

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", preset);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error(`Upload of ${file.name} failed — network error.`));
    xhr.onabort = () => reject(new Error(`Upload of ${file.name} was cancelled.`));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            url: res.secure_url,
            publicID: res.public_id,
            resourceType: res.resource_type,
            format: res.format ?? null,
            bytes: res.bytes ?? null,
            duration: typeof res.duration === "number" ? res.duration : null,
          });
        } catch {
          reject(new Error(`Cloudinary returned an unreadable response for ${file.name}.`));
        }
        return;
      }
      let detail = `HTTP ${xhr.status}`;
      try {
        detail = JSON.parse(xhr.responseText)?.error?.message ?? detail;
      } catch {
        // keep the status code
      }
      reject(new Error(`Upload of ${file.name} failed: ${detail}`));
    };

    xhr.open("POST", url);
    xhr.send(body);
  });

  return { promise, abort: () => xhr.abort() };
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Unsigned upload for MCQ/question images. Returns the stored URL + publicID. */
export function uploadImageToCloudinary(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ url: string; publicID: string }> {
  return new Promise((resolve, reject) => {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      reject(new Error("Cloudinary is not configured."));
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("Only image files can be attached to a question."));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(
        new Error(
          `${file.name} is too large (${formatBytes(file.size)}). Max for images is ${formatBytes(MAX_IMAGE_BYTES)}.`
        )
      );
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", preset);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Image upload failed — network error."));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({ url: res.secure_url, publicID: res.public_id });
        } catch {
          reject(new Error("Cloudinary returned an unreadable response."));
        }
        return;
      }
      let detail = `HTTP ${xhr.status}`;
      try {
        detail = JSON.parse(xhr.responseText)?.error?.message ?? detail;
      } catch {
        // keep the status code
      }
      reject(new Error(`Image upload failed: ${detail}`));
    };

    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud}/image/upload`);
    xhr.send(body);
  });
}
