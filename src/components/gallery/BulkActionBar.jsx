import React from "react";
import { motion } from "framer-motion";
import { Download, Trash2, X, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BulkActionBar({ count, onExport, onDelete, onCancel, exporting, deleting }) {
  const busy = exporting || deleting;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-stone-900 text-stone-50 rounded-full pl-5 pr-2 py-2 shadow-xl"
    >
      <span className="text-sm whitespace-nowrap">
        {count} selected
      </span>
      <button
        onClick={onExport}
        disabled={count === 0 || busy}
        className="flex items-center gap-1.5 text-sm rounded-full px-4 py-2 hover:bg-stone-700 transition-colors disabled:opacity-40"
      >
        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export
      </button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            disabled={count === 0 || busy}
            className="flex items-center gap-1.5 text-sm rounded-full px-4 py-2 text-red-300 hover:bg-stone-700 transition-colors disabled:opacity-40"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-[#faf8f4]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-normal text-2xl text-stone-900">
              Delete {count} version{count > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the selected design versions and their renders. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep them</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="rounded-full bg-red-800 hover:bg-red-900">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <button
        onClick={onCancel}
        disabled={busy}
        className="rounded-full p-2 hover:bg-stone-700 transition-colors"
        aria-label="Cancel selection"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}