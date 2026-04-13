"use client";

import { useEffect, useState, useCallback } from "react";
import { words, Word } from "@/lib/words";
import { loadProgress, saveProgress, recordAnswer, getDueWords, updateStreak } from "@/lib/progress";
import { useLang } from "@/lib/LanguageContext";
import SpeakButton from "@/components/SpeakButton";

type QuizMode = "hanzi-to-meaning" | "meaning-to-hanzi" | "pinyin-to-hanzi";

interface Question {
  word: Word;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(word: Word, mode: QuizMode, allWords: Word[]): Question {
  const getOption = (w: Word) => {
    if (mode === "hanzi-to-meaning") return w.meaning;
    return w.hanzi;
  };
  const correct = getOption(word);
  const distractors = shuffle(allWords.filter((w) => w.id !== word.id)).slice(0, 3).map(getOption);
  const options = shuffle([correct, ...distractors]);
  return { word, options, correctIndex: options.indexOf(correct) };
}

export default function QuizPage() {
  const { tr } = useLang();
  const [mode, setMode] = useState<QuizMode>("hanzi-to-meaning");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [useSpaced, setUseSpaced] = useState(true);

  const buildQuiz = useCallback((m: QuizMode, spaced: boolean) => {
    const progress = loadProgress();
    const ids = spaced ? getDueWords(progress, words.map((w) => w.id)) : words.map((w) => w.id);
    const sel = shuffle(ids).slice(0, 15).map((id) => words.find((w) => w.id === id)!).filter(Boolean);
    setQuestions(sel.map((w) => buildQuestion(w, m, words)));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }, []);

  useEffect(() => { buildQuiz(mode, useSpaced); }, [buildQuiz, mode, useSpaced]);

  const current = questions[index];

  function choose(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    const isCorrect = optionIndex === current.correctIndex;
    if (isCorrect) setScore((s) => s + 1);
    let progress = loadProgress();
    progress = recordAnswer(progress, current.word.id, isCorrect);
    progress = updateStreak(progress);
    saveProgress(progress);
  }

  function next() {
    if (index + 1 >= questions.length) setDone(true);
    else { setIndex((i) => i + 1); setSelected(null); }
  }

  const modeLabels: Record<QuizMode, string> = {
    "hanzi-to-meaning": tr.quiz.modeH2M,
    "meaning-to-hanzi": tr.quiz.modeM2H,
    "pinyin-to-hanzi": tr.quiz.modeP2H,
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
        <h2 className="text-2xl font-bold text-gray-800">{tr.quiz.done}</h2>
        <div className="text-5xl font-bold text-red-600">{pct}%</div>
        <div className="text-gray-500">{tr.quiz.correct.replace("!", "")}: {score} / {questions.length}</div>
        <button onClick={() => buildQuiz(mode, useSpaced)} className="bg-red-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors">
          {tr.quiz.playAgain}
        </button>
      </div>
    );
  }

  if (!current) return null;

  const prompt = (() => {
    if (mode === "hanzi-to-meaning") return { text: current.word.hanzi, isHanzi: true, sub: current.word.pinyin };
    if (mode === "meaning-to-hanzi") return { text: current.word.meaning, isHanzi: false, sub: "" };
    return { text: current.word.pinyin, isHanzi: false, sub: "" };
  })();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">{tr.quiz.title}</h1>
        <div className="flex gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as QuizMode)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700"
          >
            {(Object.entries(modeLabels) as [QuizMode, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <label className="text-sm text-gray-600 cursor-pointer flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <input type="checkbox" checked={useSpaced} onChange={(e) => setUseSpaced(e.target.checked)} />
            {tr.quiz.smartMode}
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-gray-800">{index + 1}</span> / {questions.length}
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full ml-2">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
        <span className="font-medium text-green-600">{score} ✓</span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center min-h-40 flex flex-col items-center justify-center gap-3">
        {prompt.isHanzi ? (
          <>
            <div className="flex items-center gap-3">
              <div className="text-6xl hanzi font-bold text-gray-900">{prompt.text}</div>
              <SpeakButton text={prompt.text} />
            </div>
            <div className="text-xl text-red-500">{prompt.sub}</div>
          </>
        ) : (
          <div className="text-2xl text-gray-800 font-semibold">{prompt.text}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {current.options.map((opt, i) => {
          const isCorrect = i === current.correctIndex;
          const isSelected = i === selected;
          let cls = "p-4 rounded-xl border-2 text-center font-medium transition-all ";
          if (selected === null) {
            cls += "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 cursor-pointer text-gray-800";
          } else if (isCorrect) {
            cls += "border-green-400 bg-green-50 text-green-800";
          } else if (isSelected) {
            cls += "border-red-400 bg-red-50 text-red-800";
          } else {
            cls += "border-gray-100 bg-gray-50 text-gray-400";
          }
          return (
            <button key={i} onClick={() => choose(i)} className={cls}>
              <span className={mode !== "meaning-to-hanzi" ? "" : "hanzi text-xl"}>{opt}</span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className={`rounded-xl p-4 ${selected === current.correctIndex ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className="font-semibold mb-1">
            {selected === current.correctIndex
              ? `✓ ${tr.quiz.correct}`
              : `✗ ${tr.quiz.wrong} ${current.options[current.correctIndex]}`}
          </div>
          <div className="text-sm text-gray-600 hanzi">{current.word.exampleHanzi}</div>
          <div className="text-sm text-gray-500 italic">{current.word.examplePinyin}</div>
          <div className="text-sm text-gray-500">{current.word.exampleMeaning}</div>
          <button onClick={next} className="mt-3 w-full py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors">
            {tr.quiz.next}
          </button>
        </div>
      )}
    </div>
  );
}
