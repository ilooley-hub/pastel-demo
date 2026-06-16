"use client";

import type { QuestionGroup } from "@/lib/sample-questions";
import { cn } from "@/lib/utils";

export function QuestionChips({
  groups,
  onAsk,
  disabled,
}: {
  groups: QuestionGroup[];
  onAsk: (question: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.rung} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <span className="mt-2 w-20 shrink-0 select-none text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
            {group.rung}
          </span>
          <div className="flex flex-wrap gap-2">
            {group.questions.map((q) => (
              <button
                key={q}
                onClick={() => onAsk(q)}
                disabled={disabled}
                className={cn(
                  "rounded-full border border-border bg-surface-2 px-3.5 py-1.5 text-[13px] font-medium text-ink-2 shadow-soft-sm transition-all duration-150",
                  "hover:-translate-y-px hover:border-border-strong hover:bg-white hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
