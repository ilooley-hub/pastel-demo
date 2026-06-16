// Shared types for the Pastel demo.

/** A single cited figure shown in the "show the numbers" source view. */
export type SourceRow = {
  label: string;
  period?: string;
  value: string;
};

export type ChartPoint = {
  /** Category / x-axis label, e.g. "Jan 2025" or "S&M". */
  x: string;
  /** Numeric value. */
  y: number;
};

export type ChartSeries = {
  name: string;
  points: ChartPoint[];
};

export type ChartSpec = {
  type: "line" | "bar" | "none";
  title?: string;
  series: ChartSeries[];
  /** Optional formatting hint for axis/tooltips, e.g. "£" or "%". */
  unit?: string;
};

/** A source file the answer drew on (an Excel/CSV spreadsheet or a PDF/doc). */
export type SourceFileRef = {
  name: string;
  type: "spreadsheet" | "document";
  /** Short note on what was taken from this file. */
  used_for: string;
};

/**
 * A proposed monitoring agent — the "set it once, run it on every new data sync,
 * route issues to the right person" concept. Populated for monitoring/assurance
 * questions; null otherwise.
 */
export type AgentSpec = {
  name: string;
  /** When it runs, e.g. "Every month, on each new data sync". */
  frequency: string;
  /** What it watches. */
  watches: string;
  /** The trigger condition that constitutes an issue. */
  condition: string;
  /** Who the flag is routed to (a named person/role from the data). */
  route_to: string;
};

/** The structured answer returned by the query engine (see PRD appendix). */
export type AnswerPayload = {
  answer: string;
  headline_number: string | null;
  drivers: string;
  source_rows: SourceRow[];
  /** The files (Excels + documents) this answer was built from. */
  sources_used: SourceFileRef[];
  chart: ChartSpec | null;
  /** A monitoring agent this answer could become, or null. */
  agent: AgentSpec | null;
};

export type ThreadStatus = "thinking" | "done" | "error";

/** One Q&A exchange in the chat-style thread. */
export type ThreadItem = {
  id: string;
  question: string;
  status: ThreadStatus;
  /** True when the question came from a chip rather than free text (analytics). */
  fromChip?: boolean;
  answer?: AnswerPayload;
  error?: string;
};

/** Public-facing metadata for a sample company (drives the switcher). */
export type CompanyMeta = {
  id: string;
  name: string;
  sector: string;
  /** One-line descriptor shown under the name in the switcher. */
  tagline: string;
  /** Currency symbol used throughout this company's figures. */
  currency: string;
};
