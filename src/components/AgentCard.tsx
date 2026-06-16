"use client";

import { useState } from "react";
import { Zap, Clock, Eye, Flag, ArrowRight, Check } from "lucide-react";
import type { AgentSpec } from "@/lib/types";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
      <p className="text-[13px] leading-snug text-ink-2">
        <span className="font-semibold text-foreground">{label} </span>
        {value}
      </p>
    </div>
  );
}

export function AgentCard({ agent }: { agent: AgentSpec }) {
  const [active, setActive] = useState(false);

  return (
    <div className="mt-4 overflow-hidden rounded-[12px] border border-accent/30 bg-grad-soft p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-white/70 text-accent shadow-soft-sm">
          <Zap className="h-3.5 w-3.5" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Turn this into an agent
        </span>
      </div>

      <p className="font-display text-lg font-semibold leading-tight text-foreground">
        {agent.name}
      </p>

      <div className="mt-3 space-y-1.5">
        <Row icon={Clock} label="Runs" value={agent.frequency} />
        <Row icon={Eye} label="Watches" value={agent.watches} />
        <Row icon={Flag} label="If" value={agent.condition} />
        <Row icon={ArrowRight} label="Routes to" value={agent.route_to} />
      </div>

      <div className="mt-3.5">
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-1.5 text-sm font-medium text-foreground shadow-soft-sm">
            <Check className="h-4 w-4 text-[#2f8a63]" strokeWidth={3} />
            Agent active — running on every new sync
            <span className="ml-1 text-ink-4">(demo)</span>
          </span>
        ) : (
          <button
            onClick={() => setActive(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Zap className="h-3.5 w-3.5" />
            Activate agent
          </button>
        )}
      </div>
    </div>
  );
}
