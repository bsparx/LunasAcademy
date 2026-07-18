"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ClipboardList, ImageIcon } from "lucide-react";
import type { ExamDTO, QuestionDTO } from "./types";
import type { McqInput } from "../actions";
import { McqForm } from "./mcq-form";

type Props = {
  exam: ExamDTO;
  onCreate: (examID: number, input: McqInput) => Promise<string | null>;
  onUpdate: (
    examID: number,
    questionID: number,
    input: McqInput
  ) => Promise<string | null>;
  onDelete: (examID: number, questionID: number) => void;
};

export function ExamEditor({ exam, onCreate, onUpdate, onDelete }: Props) {
  // null = list view; -1 = creating; otherwise questionID being edited
  const [editing, setEditing] = useState<number | null>(null);

  const editingQuestion =
    editing !== null && editing !== -1
      ? exam.questions.find((q) => q.questionID === editing) ?? null
      : null;

  return (
    <div className="space-y-2 border-t border-[var(--color-ink-200)]/60 pt-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
          <ClipboardList className="h-3.5 w-3.5 text-[#3b5bcc]" />
          Questions
        </span>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing(-1)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--color-mint-600)] hover:text-[var(--color-mint-500)] transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-[var(--color-ink-500)]">
        Multiple-choice questions learners answer to pass this exam. Questions
        can include one image each.
      </p>

      {editing !== null ? (
        <McqForm
          key={editing}
          initial={
            editingQuestion
              ? {
                  question: editingQuestion.question,
                  options: editingQuestion.options,
                  correctIndices: editingQuestion.correctIndices,
                  image:
                    editingQuestion.imageURL && editingQuestion.imagePublicID
                      ? {
                          url: editingQuestion.imageURL,
                          publicID: editingQuestion.imagePublicID,
                        }
                      : null,
                }
              : null
          }
          saveLabel={editingQuestion ? "Save question" : "Add question"}
          onCancel={() => setEditing(null)}
          onSave={async (value) => {
            const input: McqInput = {
              question: value.question,
              options: value.options,
              correctIndices: value.correctIndices,
              imageURL: value.image?.url ?? null,
              imagePublicID: value.image?.publicID ?? null,
            };
            const error = editingQuestion
              ? await onUpdate(exam.examID, editingQuestion.questionID, input)
              : await onCreate(exam.examID, input);
            if (!error) setEditing(null);
            return error;
          }}
        />
      ) : exam.questions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--color-ink-200)] bg-[var(--cream-50)]/60 px-3 py-3 text-center text-[11px] text-[var(--color-ink-500)]">
          No questions yet — add the first one.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {exam.questions.map((q, i) => (
            <QuestionRow
              key={q.questionID}
              index={i}
              question={q}
              onEdit={() => setEditing(q.questionID)}
              onDelete={() => onDelete(exam.examID, q.questionID)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function QuestionRow({
  index,
  question,
  onEdit,
  onDelete,
}: {
  index: number;
  question: QuestionDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="group flex items-center gap-2 rounded-lg border border-[var(--color-ink-200)]/60 bg-white px-2.5 py-2">
      <span className="shrink-0 rounded bg-[#d8e3f4]/60 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-[#3b5bcc]">
        Q{index + 1}
      </span>
      {question.imageURL ? (
        <ImageIcon className="h-3 w-3 shrink-0 text-[var(--color-ink-400)]" />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--color-ink-900)]">
        {question.question}
      </span>
      <span className="shrink-0 text-[10px] text-[var(--color-ink-400)]">
        {question.options.length} answers
      </span>
      <span className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit question"
          className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)] cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete question"
          className="text-[var(--color-ink-400)] hover:text-red-600 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </span>
    </li>
  );
}
