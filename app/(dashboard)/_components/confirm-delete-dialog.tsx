"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type DeleteConfirm = {
  title: string;
  description: string;
  /** Button label, defaults to "Delete". */
  confirmLabel?: string;
};

type Props = {
  /** null = closed. */
  confirm: DeleteConfirm | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteDialog({ confirm, onCancel, onConfirm }: Props) {
  return (
    <AlertDialog
      open={confirm !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-red-50 text-red-600">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-[var(--color-ink-900)]">
            {confirm?.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--color-ink-500)]">
            {confirm?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600/30"
          >
            {confirm?.confirmLabel ?? "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
