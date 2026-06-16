"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuestionInput({
  onAsk,
  disabled,
  placeholder,
  autoFocus,
}: {
  onAsk: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Put the cursor in the bar on load (without yanking the page past the hero).
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  function submit() {
    const q = value.trim();
    if (!q || disabled) return;
    onAsk(q);
    setValue("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-2.5 py-2.5 pl-4 shadow-soft-md transition-all",
        "focus-within:border-accent focus-within:shadow-[0_0_0_4px_rgba(110,98,200,0.18)]"
      )}
    >
      <Sparkles className="h-5 w-5 shrink-0 text-accent" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? "Ask anything about the financials…"}
        className="min-w-0 flex-1 bg-transparent text-[17px] text-foreground placeholder:text-ink-4 focus:outline-none disabled:opacity-60"
        aria-label="Ask a question about the financials"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Ask"
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-grad text-foreground shadow-soft-sm transition-all",
          "hover:shadow-[0_8px_30px_rgba(150,140,210,0.32)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        )}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </form>
  );
}
