"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "./ui/button";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
};

function Field({ label, name, type = "text", required, placeholder, textarea }: FieldProps) {
  const cls =
    "w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-ink-4 focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-ring";
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold text-ink-2">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} rows={3} placeholder={placeholder} className={cls} />
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} className={cls} />
      )}
    </label>
  );
}

export function LeadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 6 wires storage + team notification here.
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    console.log("[lead] (stub) captured:", data);
    setSubmitted(true);
  }

  function close() {
    onClose();
    // reset after the exit animation
    setTimeout(() => setSubmitted(false), 250);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-[18px] border border-border bg-surface-2 p-6 shadow-soft-lg"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 text-ink-3 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {!submitted ? (
              <>
                <h2 className="font-display text-[1.75rem] font-semibold text-foreground">
                  Run this on your own numbers
                </h2>
                <p className="mt-1.5 text-sm text-ink-2">
                  Tell us where to reach you and we&rsquo;ll set up Pastel on a
                  sample of your client&rsquo;s books.
                </p>
                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                  <Field label="Name" name="name" required placeholder="Jane Doe" />
                  <Field
                    label="Work email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@firm.com"
                  />
                  <Field label="Company" name="company" placeholder="Your CFO practice" />
                  <Field
                    label="What would you most want to ask of your own data?"
                    name="question"
                    textarea
                    placeholder="e.g. Which of my clients is closest to a cash crunch?"
                  />
                  <Button type="submit" size="lg" className="w-full">
                    Request access
                  </Button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-grad-soft">
                  <Check className="h-6 w-6 text-foreground" strokeWidth={2.5} />
                </div>
                <h2 className="mt-4 font-display text-[1.75rem] font-semibold text-foreground">
                  You&rsquo;re on the list
                </h2>
                <p className="mt-1.5 text-sm text-ink-2">
                  We&rsquo;ll be in touch shortly. Want to skip the queue? Grab a
                  time and we&rsquo;ll walk through it live.
                </p>
                <Button
                  size="lg"
                  className="mt-5 w-full"
                  onClick={() => {
                    // Phase 6: real Calendly link.
                    window.open("https://calendly.com/", "_blank");
                  }}
                >
                  Book a 20-minute walkthrough
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
