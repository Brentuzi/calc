export type WordStatus = "new" | "learning" | "known";

export interface WordProgress {
  wordId: number;
  status: WordStatus;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: number;
  nextReview: number;
  interval: number;
}

export interface AppProgress {
  words: Record<number, WordProgress>;
  totalSessions: number;
  lastStudied: number;
  streak: number;
  lastStreakDate: string;
}

const STORAGE_KEY = "hsk1_progress";

const INTERVALS: Record<number, number> = {
  0: 1,
  1: 3,
  2: 7,
  3: 14,
  4: 30,
};

function getNextInterval(current: number, correct: boolean): number {
  if (!correct) return 1;
  const next = current + 1;
  return INTERVALS[next] ?? 60;
}

export function loadProgress(): AppProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppProgress;
  } catch {
    // ignore
  }
  return emptyProgress();
}

function emptyProgress(): AppProgress {
  return {
    words: {},
    totalSessions: 0,
    lastStudied: 0,
    streak: 0,
    lastStreakDate: "",
  };
}

export function saveProgress(progress: AppProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getWordProgress(progress: AppProgress, wordId: number): WordProgress {
  return (
    progress.words[wordId] ?? {
      wordId,
      status: "new",
      correctCount: 0,
      incorrectCount: 0,
      lastReviewed: 0,
      nextReview: 0,
      interval: 0,
    }
  );
}

export function recordAnswer(
  progress: AppProgress,
  wordId: number,
  correct: boolean
): AppProgress {
  const wp = getWordProgress(progress, wordId);
  const now = Date.now();
  const newInterval = getNextInterval(wp.interval, correct);
  const newStatus: WordStatus =
    wp.correctCount + (correct ? 1 : 0) >= 3 ? "known" : "learning";

  const updated: WordProgress = {
    ...wp,
    correctCount: wp.correctCount + (correct ? 1 : 0),
    incorrectCount: wp.incorrectCount + (correct ? 0 : 1),
    lastReviewed: now,
    nextReview: now + newInterval * 24 * 60 * 60 * 1000,
    interval: correct ? newInterval : 0,
    status: correct ? newStatus : "learning",
  };

  return {
    ...progress,
    words: { ...progress.words, [wordId]: updated },
    lastStudied: now,
  };
}

export function updateStreak(progress: AppProgress): AppProgress {
  const today = new Date().toDateString();
  if (progress.lastStreakDate === today) return progress;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const streak =
    progress.lastStreakDate === yesterday ? progress.streak + 1 : 1;

  return { ...progress, streak, lastStreakDate: today };
}

export function getDueWords(progress: AppProgress, allIds: number[]): number[] {
  const now = Date.now();
  return allIds.filter((id) => {
    const wp = progress.words[id];
    if (!wp) return true;
    if (wp.status === "known" && wp.nextReview > now) return false;
    return true;
  });
}

export function getStats(progress: AppProgress, total: number) {
  const statuses = Object.values(progress.words);
  const known = statuses.filter((w) => w.status === "known").length;
  const learning = statuses.filter((w) => w.status === "learning").length;
  const newWords = total - known - learning;
  return { known, learning, newWords, total };
}
