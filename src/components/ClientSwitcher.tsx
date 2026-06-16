"use client";

import { Check } from "lucide-react";
import type { CompanyMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ClientSwitcher({
  companies,
  activeId,
  onSelect,
}: {
  companies: CompanyMeta[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
        <span>Your clients</span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {companies.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              aria-pressed={active}
              className={cn(
                "group relative flex min-w-[10.5rem] flex-1 flex-col items-start rounded-[14px] border px-4 py-3 text-left shadow-soft-sm transition-all duration-150",
                active
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface-2 hover:border-border-strong hover:bg-white"
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {c.name}
                </span>
                {active && (
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-xs text-ink-3">
                {c.sector} · {c.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
