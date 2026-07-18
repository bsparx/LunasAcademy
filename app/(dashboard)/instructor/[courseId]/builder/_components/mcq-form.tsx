"use client";

import { useState } from "react";
import { Check, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { registerUploadedImage, discardUploadedImage } from "../actions";

const MAX_OPTIONS = 12;
const MIN_OPTIONS = 2;

export type McqImage = { url: string; publicID: string };

export type McqValue = {
  question: string;
  options: string[];
  correctIndices: number[];
  image: McqImage | null;
};

type Props = {
  initial: McqValue | null;
  saveLabel: string;
  /** Extra fields rendered above the question (e.g. the pause-time input). */
  children?: React.ReactNode;
  /** Returns an error message to show, or null on success (form closes). */
  onSave: (value: McqValue) => Promise<string | null>;
  onCancel: () => void;
};

export function McqForm({ initial, saveLabel, children, onSave, onCancel }: Props) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [options, setOptions] = useState<string[]>(
    initial ? [...initial.options] : ["", ""]
  );
  const [correct, setCorrect] = useState<Set<number>>(
    new Set(initial?.correctIndices ?? [0])
  );
  const [image, setImage] = useState<McqImage | null>(initial?.image ?? null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function toggleCorrect(i: number) {
    setCorrect((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function removeOption(i: number) {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
    setCorrect((prev) => {
      const next = new Set<number>();
      for (const idx of prev) {
        if (idx === i) continue;
        next.add(idx > i ? idx - 1 : idx);
      }
      return next;
    });
  }

  // The image already saved on the question/check (if any) — the form never
  // discards it; replacement/removal is handled server-side on save.
  const initialPublicID = initial?.image?.publicID ?? null;

  function discardIfUnsaved(img: McqImage | null) {
    if (img && img.publicID !== initialPublicID) {
      void discardUploadedImage(img.publicID);
    }
  }

  async function handleImageFile(file: File) {
    setError(null);
    setUploadPct(0);
    try {
      const uploaded = await uploadImageToCloudinary(file, setUploadPct);
      // Track the upload in the DB immediately so it can always be cleaned up.
      const registered = await registerUploadedImage(
        uploaded.url,
        uploaded.publicID
      );
      if (!registered.ok) {
        setError(registered.error);
        return;
      }
      setImage({ url: uploaded.url, publicID: uploaded.publicID });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed.");
    } finally {
      setUploadPct(null);
    }
  }

  async function save() {
    if (!question.trim()) {
      setError("Write the question.");
      return;
    }
    if (options.some((o) => !o.trim())) {
      setError("Fill in every answer (or remove empty ones).");
      return;
    }
    if (correct.size === 0) {
      setError("Mark at least one correct answer.");
      return;
    }
    setSaving(true);
    setError(null);
    const err = await onSave({
      question: question.trim(),
      options: options.map((o) => o.trim()),
      correctIndices: Array.from(correct).sort((a, b) => a - b),
      image,
    });
    setSaving(false);
    if (err) setError(err);
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/50 p-3">
      {children}

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question…"
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-md border border-[var(--color-ink-200)] bg-white px-2.5 py-2 text-[12px] leading-snug text-[var(--color-ink-900)] focus:outline-none focus:border-[var(--color-mint-500)] transition-colors"
      />

      {/* OPTIONAL IMAGE */}
      {image ? (
        <div className="relative overflow-hidden rounded-lg border border-[var(--color-ink-200)]/60">
          {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, no next/image config for remote host */}
          <img src={image.url} alt="Question illustration" className="max-h-40 w-full object-contain bg-white" />
          <button
            type="button"
            onClick={() => {
              discardIfUnsaved(image);
              setImage(null);
            }}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-forest-900)]/80 text-white hover:bg-[var(--color-forest-900)] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : uploadPct !== null ? (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-ink-200)]/60 bg-white px-3 py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-mint-600)]" />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-ink-200)]/50">
            <div
              className="h-full rounded-full bg-[var(--color-mint-500)] transition-[width]"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-[var(--color-ink-500)]">
            {uploadPct}%
          </span>
        </div>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors">
          <ImagePlus className="h-3.5 w-3.5" />
          Add image (optional)
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImageFile(file);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {/* ANSWERS */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
          Answers · tick every correct answer
        </div>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleCorrect(i)}
              aria-label={`Mark answer ${i + 1} as correct`}
              aria-pressed={correct.has(i)}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors cursor-pointer",
                correct.has(i)
                  ? "border-[var(--color-mint-500)] bg-[var(--color-mint-500)] text-white"
                  : "border-[var(--color-ink-300)] hover:border-[var(--color-mint-500)]"
              )}
            >
              {correct.has(i) && <Check className="h-3 w-3" strokeWidth={3} />}
            </button>
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Answer ${i + 1}`}
              maxLength={200}
              className="min-w-0 flex-1 rounded-md border border-[var(--color-ink-200)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--color-ink-900)] focus:outline-none focus:border-[var(--color-mint-500)] transition-colors"
            />
            <button
              type="button"
              onClick={() => removeOption(i)}
              disabled={options.length <= MIN_OPTIONS}
              aria-label={`Remove answer ${i + 1}`}
              className="text-[var(--color-ink-300)] hover:text-red-500 disabled:opacity-30 disabled:hover:text-[var(--color-ink-300)] cursor-pointer disabled:cursor-not-allowed"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {options.length < MAX_OPTIONS && (
          <button
            type="button"
            onClick={() => setOptions((prev) => [...prev, ""])}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Add answer ({options.length}/{MAX_OPTIONS})
          </button>
        )}
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-red-600">{error}</p>
      ) : null}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving || uploadPct !== null}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--color-forest-900)] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[var(--color-forest-800)] disabled:opacity-60 transition-colors cursor-pointer"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          )}
          {saveLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            discardIfUnsaved(image);
            onCancel();
          }}
          disabled={saving}
          className="rounded-md border border-[var(--color-ink-200)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--cream-50)] disabled:opacity-60 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
