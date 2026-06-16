"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, RotateCw, Table2 } from "lucide-react";
import type { ThreadItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Markdown } from "./Markdown";
import { AnswerChart } from "./AnswerChart";
import { AgentCard } from "./AgentCard";
import { SourcesBar } from "./SourcesBar";

function ThinkingDots() {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-3">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent"
            style={{
              animation: "thinking-pulse 1.1s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </span>
      <span>Reading the numbers…</span>
    </div>
  );
}

function SourceView({
  rows,
}: {
  rows: { label: string; period?: string; value: string }[];
}) {
  const [open, setOpen] = useState(false);
  if (!rows?.length) return null;

  return (
    <div className="mt-4 rounded-[10px] border border-border-subtle bg-bg-tint/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm font-semibold text-ink-2 hover:text-foreground"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-accent" />
          Show the numbers
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-border px-2 pb-2 pt-1">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td className="py-2 pl-2 pr-3 text-ink-2">{r.label}</td>
                  <td className="py-2 pr-3 text-right text-ink-3 tabular-nums">
                    {r.period ?? ""}
                  </td>
                  <td className="py-2 pr-2 text-right font-mono text-[0.82rem] tabular-nums text-foreground">
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AnswerCard({
  item,
  onRetry,
}: {
  item: ThreadItem;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-2.5"
    >
      {/* The question, as a quiet right-aligned bubble */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[14px] rounded-br-md bg-foreground px-4 py-2 text-[13px] text-background">
          {item.question}
        </div>
      </div>

      {/* The answer card */}
      <div className="rounded-[14px] border border-border bg-card p-5 shadow-soft-md">
        {item.status === "thinking" && <ThinkingDots />}

        {item.status === "error" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-2">
              {item.error ??
                "Something went wrong reading the numbers. Please try again."}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-foreground hover:border-border-strong hover:bg-white"
              >
                <RotateCw className="h-3.5 w-3.5" /> Retry
              </button>
            )}
          </div>
        )}

        {item.status === "done" && item.answer && (
          <div>
            {/* Big headline number — only for short, lookup-style answers, not
                long generation outputs (board updates) where it reads oddly. */}
            {item.answer.headline_number &&
              item.answer.answer.length < 400 && (
                <p className="mb-2 font-display text-[2.5rem] font-black leading-none text-foreground tnum">
                  {item.answer.headline_number}
                </p>
              )}

            <Markdown>{item.answer.answer}</Markdown>

            {item.answer.drivers && (
              <div className="mt-3 border-t border-border-subtle pt-3">
                <Markdown className="text-sm text-ink-2">
                  {item.answer.drivers}
                </Markdown>
              </div>
            )}

            {item.answer.chart && item.answer.chart.type !== "none" && (
              <AnswerChart chart={item.answer.chart} />
            )}

            {item.answer.agent && <AgentCard agent={item.answer.agent} />}

            <SourcesBar sources={item.answer.sources_used} />

            <SourceView rows={item.answer.source_rows} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
