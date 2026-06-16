"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { ClientSwitcher } from "@/components/ClientSwitcher";
import { QuestionChips } from "@/components/QuestionChips";
import { QuestionInput } from "@/components/QuestionInput";
import { AnswerCard } from "@/components/AnswerCard";
import { LeadModal } from "@/components/LeadModal";
import { Button } from "@/components/ui/button";
import { COMPANIES, DEFAULT_COMPANY_ID, getCompany } from "@/lib/companies";
import { getQuestionGroups } from "@/lib/sample-questions";
import { fetchAnswer } from "@/lib/query-client";
import type { ThreadItem } from "@/lib/types";

let idCounter = 0;
const nextId = () => `q${++idCounter}`;

export default function Home() {
  const [companyId, setCompanyId] = useState(DEFAULT_COMPANY_ID);
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSource, setLeadSource] = useState<string>("header");
  const [softPromptDismissed, setSoftPromptDismissed] = useState(false);

  const openLead = useCallback((source: string) => {
    setLeadSource(source);
    setLeadOpen(true);
  }, []);

  const company = getCompany(companyId);
  const groups = getQuestionGroups(companyId);
  const busy = thread.some((t) => t.status === "thinking");
  const answeredCount = thread.filter((t) => t.status === "done").length;
  const showSoftPrompt = answeredCount >= 3 && !softPromptDismissed && !leadOpen;

  const threadEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Only follow the conversation once it has started — don't scroll past the
    // hero on first load.
    if (thread.length > 0) {
      threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [thread]);

  const ask = useCallback(
    async (question: string, fromChip = false) => {
      const id = nextId();
      setThread((prev) => [
        ...prev,
        { id, question, status: "thinking", fromChip },
      ]);
      try {
        const answer = await fetchAnswer(question, companyId);
        setThread((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "done", answer } : t))
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't read the numbers just then. Please try again.";
        setThread((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: "error", error: message } : t
          )
        );
      }
    },
    [companyId]
  );

  const retry = useCallback(
    (item: ThreadItem) => {
      setThread((prev) => prev.filter((t) => t.id !== item.id));
      ask(item.question, item.fromChip);
    },
    [ask]
  );

  function selectCompany(id: string) {
    if (id === companyId) return;
    setCompanyId(id);
    setThread([]);
    setSoftPromptDismissed(false);
  }

  return (
    <div className="min-h-full">
      <Header onOpenLead={() => openLead("header")} />

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-10 sm:px-8">
        {/* Hero */}
        <section className="mb-9">
          <span className="inline-flex h-[22px] items-center gap-2 rounded-md border border-border bg-bg-tint px-2.5 text-[11px] font-semibold tracking-wide text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-grad" />
            Live demo · sample data
          </span>
          <h1 className="mt-5 font-display text-[2.75rem] font-black leading-[0.98] text-foreground sm:text-[3.75rem]">
            Ask <span className="display-accent">{company.name}</span>&rsquo;s
            financials anything.
          </h1>
          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-ink-2">
            Plain-English questions, board-ready answers — and every figure
            shows its work. This is what your clients would get, branded as you.
          </p>
        </section>

        {/* Client switcher */}
        <section className="mb-7">
          <ClientSwitcher
            companies={COMPANIES}
            activeId={companyId}
            onSelect={selectCompany}
          />
        </section>

        {/* Composer: the free-form bar is the spotlight; chips support it for
            people who don't yet know what to ask. */}
        <section className="mb-8 space-y-6">
          <QuestionInput
            onAsk={(q) => ask(q, false)}
            disabled={busy}
            autoFocus
            placeholder={`Ask anything about ${company.name}'s finances…`}
          />
          <div className="space-y-3">
            <p className="text-[13px] text-ink-3">
              Type any question, or tap an example to get started:
            </p>
            <QuestionChips groups={groups} onAsk={(q) => ask(q, true)} disabled={busy} />
          </div>
        </section>

        {/* Answer thread (newest at the bottom) */}
        <section className="space-y-6">
          {thread.map((item) => (
            <AnswerCard key={item.id} item={item} onRetry={() => retry(item)} />
          ))}

          <AnimatePresence>
            {showSoftPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex flex-col items-start gap-3 overflow-hidden rounded-[14px] border border-border bg-grad-soft p-5 shadow-soft-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-xl font-semibold text-foreground">
                    Imagine this on your client&rsquo;s actual books.
                  </p>
                  <p className="mt-0.5 text-sm text-ink-2">
                    We&rsquo;ll set it up on a sample of your real numbers.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button onClick={() => openLead("soft_prompt")}>
                    Run it on your own numbers
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => setSoftPromptDismissed(true)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Not now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={threadEndRef} />
        </section>

        {/* Honesty label */}
        <p className="mt-10 text-center text-xs text-muted-foreground/70">
          This is a demo running on realistic but fictional sample data. No real
          company numbers are shown.
        </p>
      </main>

      <LeadModal
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        companyViewed={company.name}
        sampleQuestionsAsked={thread.map((t) => t.question)}
        source={leadSource}
      />
    </div>
  );
}
