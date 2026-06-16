// The example-question chips, grouped into the five-rung ladder
// (simple -> impressive). Wording is tuned per company but the rungs stay fixed.

export type QuestionRung =
  | "Lookup"
  | "Analysis"
  | "Decision"
  | "Generation"
  | "Monitoring";

export type QuestionGroup = {
  rung: QuestionRung;
  questions: string[];
};

const MERIDIAN_QUESTIONS: QuestionGroup[] = [
  {
    rung: "Lookup",
    questions: [
      "What was revenue last month?",
      "How much cash do we have right now?",
    ],
  },
  {
    rung: "Analysis",
    questions: [
      "Why did gross margin drop in Q2 2025?",
      "What are our top 5 expense categories and how have they grown?",
      "How exposed are we to our biggest customers?",
    ],
  },
  {
    rung: "Decision",
    questions: [
      "Can we afford to hire two engineers at £80k each? What does it do to runway?",
      "If revenue keeps growing at the current rate, when do we hit breakeven?",
    ],
  },
  {
    rung: "Generation",
    questions: [
      "Draft a board update for last month.",
      "Summarise the three things I should flag to this client this month.",
    ],
  },
  {
    rung: "Monitoring",
    questions: [
      "Flag anything unusual in last month's spend.",
      "What is overdue in accounts receivable and how worried should I be?",
    ],
  },
];

const HARBOR_QUESTIONS: QuestionGroup[] = [
  {
    rung: "Lookup",
    questions: [
      "What was revenue last month?",
      "How much cash do we have right now?",
    ],
  },
  {
    rung: "Analysis",
    questions: [
      "How seasonal is our revenue across the year?",
      "What are our top 5 expense categories and how have they grown?",
      "How much cash is tied up in inventory?",
    ],
  },
  {
    rung: "Decision",
    questions: [
      "Can we afford a £150k inventory buy before peak season?",
      "If growth holds, when do we turn profitable?",
    ],
  },
  {
    rung: "Generation",
    questions: [
      "Draft a board update for last month.",
      "Summarise the three things I should flag to this client this month.",
    ],
  },
  {
    rung: "Monitoring",
    questions: [
      "Flag anything unusual in last month's spend.",
      "How big is our accounts payable and is anything overdue?",
    ],
  },
];

const VANTAGE_QUESTIONS: QuestionGroup[] = [
  {
    rung: "Lookup",
    questions: [
      "What was revenue last month?",
      "How much cash do we have right now?",
    ],
  },
  {
    rung: "Analysis",
    questions: [
      "How has team utilization trended this year?",
      "What are our top 5 expense categories and how have they grown?",
      "How exposed are we to our biggest clients?",
    ],
  },
  {
    rung: "Decision",
    questions: [
      "Can we afford to hire two consultants at £70k each? What does it do to runway?",
      "If billings keep growing at the current rate, when do we hit our profit target?",
    ],
  },
  {
    rung: "Generation",
    questions: [
      "Draft a board update for last month.",
      "Summarise the three things I should flag to this client this month.",
    ],
  },
  {
    rung: "Monitoring",
    questions: [
      "Flag anything unusual in last month's spend.",
      "What is overdue in accounts receivable and how worried should I be?",
    ],
  },
];

const QUESTIONS_BY_COMPANY: Record<string, QuestionGroup[]> = {
  meridian: MERIDIAN_QUESTIONS,
  harbor: HARBOR_QUESTIONS,
  vantage: VANTAGE_QUESTIONS,
};

export function getQuestionGroups(companyId: string): QuestionGroup[] {
  return QUESTIONS_BY_COMPANY[companyId] ?? MERIDIAN_QUESTIONS;
}
