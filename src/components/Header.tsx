"use client";

import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";

export function Header({ onOpenLead }: { onOpenLead: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-[rgba(244,242,235,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="hidden h-5 w-px bg-border md:block" />
          <p className="hidden truncate text-sm text-ink-3 md:block">
            Ask this company&rsquo;s financials anything
          </p>
        </div>
        <Button size="sm" onClick={onOpenLead} className="shrink-0">
          <span className="hidden sm:inline">Run it on your own numbers</span>
          <span className="sm:hidden">Try your numbers</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
