export type SubjectId = "math" | "chinese" | "english";

export interface SubjectCompletion {
  completedAt: string;
  sourceDay: number;
  score?: number;
}

export interface ProgramDayProgress {
  subjects: Partial<Record<SubjectId, SubjectCompletion>>;
  completedAt?: string;
  dateKey?: string;
}

export interface HubPreferences {
  sound: boolean;
  focusMode: boolean;
}

export interface HubProgress {
  version: 1;
  currentDay: number;
  coins: number;
  streak: number;
  bestStreak: number;
  days: Record<number, ProgramDayProgress>;
  preferences: HubPreferences;
}

export interface SubjectDefinition {
  id: SubjectId;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  softColor: string;
  totalLabel: string;
}
