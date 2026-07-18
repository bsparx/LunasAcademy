"use client";

import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { createCapstoneResource } from "../actions";
import type { CapstoneResourceDTO } from "./types";

export type CapstoneUploadEntry = {
  id: string;
  name: string;
  pct: number;
  status: "uploading" | "saving" | "error";
  error?: string;
};

export function useCapstoneResourceUploads(
  capstoneID: number,
  onUploaded: (resource: CapstoneResourceDTO) => void
) {
  const [entries, setEntries] = useState<CapstoneUploadEntry[]>([]);
  const counter = useRef(0);

  function patch(id: string, data: Partial<CapstoneUploadEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleFiles(files: Iterable<File>) {
    for (const file of files) {
      const id = `cu${++counter.current}`;
      setEntries((prev) => [
        ...prev,
        { id, name: file.name, pct: 0, status: "uploading" },
      ]);

      try {
        const { promise } = uploadToCloudinary(file, (pct) => patch(id, { pct }));
        const asset = await promise;
        patch(id, { status: "saving", pct: 100 });

        const res = await createCapstoneResource(capstoneID, {
          name: file.name,
          url: asset.url,
          publicID: asset.publicID,
          resourceType: asset.resourceType,
          bytes: asset.bytes,
        });
        if (!res.ok) throw new Error(res.error);

        remove(id);
        onUploaded({
          resourceID: res.data!.resourceID,
          name: file.name,
          url: asset.url,
          publicID: asset.publicID,
          resourceType: asset.resourceType,
          bytes: asset.bytes,
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
