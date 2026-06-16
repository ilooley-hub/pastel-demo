"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuestionInput({
  onAsk,
  disabled,
  placeholder,
}: {
  onAsk: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

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
        "flex items-center gap-2 rounded-[14px] border border-border bg-surface-2 px-2 py-2 pl-4 shadow-soft-sm transition-all",
        "focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(110,98,200,0.22)]"
      )}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? "Ask a question about the financials…"}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-ink-4 focus:outline-none disabled:opacity-60"
        aria-label="Ask a question about the financials"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Ask"
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-grad text-foreground shadow-soft-sm transition-all",
          "hover:shadow-[0_8px_30px_rgba(150,140,210,0.32)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        )}
      >
        <ArrowUp className="h-4.5 w-4.5" strokeWidth={2.5} />
      </button>
    </form>
  );
}
