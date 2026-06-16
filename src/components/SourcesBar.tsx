"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileSpreadsheet, FileText, Files, X, ExternalLink } from "lucide-react";
import type { SourceFileRef } from "@/lib/types";
import { cn } from "@/lib/utils";

function FileGlyph({ type, className }: { type: SourceFileRef["type"]; className?: string }) {
  return type === "spreadsheet" ? (
    <FileSpreadsheet className={cn("text-[#2f8a63]", className)} />
  ) : (
    <FileText className={cn("text-accent", className)} />
  );
}

export function SourcesBar({ sources }: { sources: SourceFileRef[] }) {
  const [selected, setSelected] = useState<SourceFileRef | null>(null);
  if (!sources?.length) return null;

  const spreadsheets = sources.filter((s) => s.type === "spreadsheet").length;
  const documents = sources.length - spreadsheets;
  const breakdown = [
    spreadsheets > 0 ? `${spreadsheets} ${spreadsheets === 1 ? "spreadsheet" : "spreadsheets"}` : null,
    documents > 0 ? `${documents} ${documents === 1 ? "document" : "documents"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] text-ink-3">
        <Files className="h-3.5 w-3.5" />
        <span>
          Built from{" "}
          <span className="font-semibold text-ink-2">{sources.length}</span>{" "}
          {sources.length === 1 ? "source" : "sources"}
          {breakdown && <span className="text-ink-4"> · {breakdown}</span>}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(s)}
            title={`${s.name} — ${s.used_for}`}
            className="group inline-flex max-w-[15rem] items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1 text-[12px] text-ink-2 shadow-soft-sm transition-colors hover:border-border-strong hover:bg-white"
          >
            <FileGlyph type={s.type} className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{s.name}</span>
          </button>
        ))}
      </div>

      {/* Source preview ("link to source") */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-[16px] border border-border bg-surface-2 p-5 shadow-soft-lg"
            >
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-3.5 top-3.5 text-ink-3 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border border-border bg-card shadow-soft-sm">
                  <FileGlyph type={selected.type} className="h-5 w-5" />
                </span>
                <div className="min-w-0 pr-6">
                  <p className="break-words font-semibold leading-snug text-foreground">
                    {selected.name}
                  </p>
                  <span className="mt-1 inline-block rounded-full border border-border-subtle bg-bg-tint px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-3">
                    {selected.type}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[10px] border border-border-subtle bg-bg-tint/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  What Pastel used from this file
                </p>
                <p className="mt-1 text-sm text-ink-2">{selected.used_for}</p>
              </div>

              <button
                disabled
                className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-ink-3"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open source file
                <span className="text-ink-4">(demo)</span>
              </button>
              <p className="mt-2 text-center text-[11px] text-ink-4">
                In the live product this opens the exact cell or page in the
                source file.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
