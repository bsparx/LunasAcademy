"use client";

import { useRef, useState } from "react";
import {
  uploadToCloudinary,
  kindForFile,
  type ResourceKind,
} from "@/lib/cloudinary-upload";
import { createResource } from "../actions";
import type { ResourceDTO } from "./types";

export type UploadEntry = {
  id: string;
  name: string;
  kind: ResourceKind;
  pct: number;
  status: "uploading" | "saving" | "error";
  error?: string;
};

export function useUploads(
  courseID: number,
  onUploaded: (resource: ResourceDTO) => void
) {
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const counter = useRef(0);

  function patch(id: string, data: Partial<UploadEntry>) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleFiles(files: Iterable<File>) {
    for (const file of files) {
      const id = `u${++counter.current}`;
      const kind = kindForFile(file);
      setEntries((prev) => [
        ...prev,
        { id, name: file.name, kind, pct: 0, status: "uploading" },
      ]);

      try {
        const { promise } = uploadToCloudinary(file, (pct) =>
          patch(id, { pct })
        );
        const asset = await promise;
        patch(id, { status: "saving", pct: 100 });

        const title = file.name.replace(/\.[^.]+$/, "") || file.name;
        const res = await createResource({ courseID, kind, title, ...asset });
        if (!res.ok) throw new Error(res.error);

        remove(id);
        onUploaded({
          resourceID: res.data!.resourceID,
          kind,
          title,
          url: asset.url,
          publicID: asset.publicID,
          format: asset.format,
          bytes: asset.bytes,
          duration: asset.duration,
        });
      } catch (err) {
        patch(id, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed.",
        });
      }
    }
  }

  return { entries, handleFiles, dismiss: remove };
}
