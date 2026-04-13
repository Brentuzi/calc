"use client";

import { useEffect, useState, useCallback } from "react";
import { words, Word } from "@/lib/words";
import { loadProgress, saveProgress, recordAnswer, getDueWords, updateStreak } from "@/lib/progress";
import { useLang } from "@/lib/LanguageContext";
import SpeakButton from "@/components/SpeakButton";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const { tr } = useLang();
  const [queue, setQueue] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [isSpaced, setIsSpaced] = useState(true);

  const buildQueue = useCallback((spaced: boolean) => {
    const progress = loadProgress();
    const ids = spaced ? getDueWords(progress, words.map((w) => w.id)) : words.map((w) => w.id);
    const selected = shuffle(ids).slice(0, 20).map((id) => words.find((w) => w.id === id)!).filter(Boolean);
    setQueue(selected);
    setIndex(0);
    setFlipped(false);
    setAnswered(false);
    setSessionDone(false);
    setCorrect(0);
    setIncorrect(0);
  }, []);

  useEffect(() => { buildQueue(true); }, [buildQueue]);

  const current = queue[index];

  function flip() { setFlipped(true); }

  function answer(isCorrect: boolean) {
    if (!current) return;
    let progress = loadProgress();
    progress = recordAnswer(progress, current.id, isCorrect);
    progress = updateStreak(progress);
    saveProgress(progress);
    if (isCorrect) setCorrect((c) => c + 1);
    else setIncorrect((c) => c + 1);
    setAnswered(true);
  }

  function next() {
    if (index + 1 >= queue.length) setSessionDone(true);
    else { setIndex((i) => i + 1); setFlipped(false); setAnswered(false); }
  }

  if (!current && !sessionDone) {
    return <div className="text-center py-20 text-gray-500">{tr.flashcards.allDone}</div>;
  }

  if (sessionDone) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">{tr.flashcards.sessionDone}</h2>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{correct}</div>
            <div className="text-sm text-gray-500">{tr.flashcards.correct}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{incorrect}</div>
            <div className="text-sm text-gray-500">{tr.flashcards.errors}</div>
          </div>
        </div>
        <button onClick={() => buildQueue(isSpaced)} className="bg-red-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors">
          {tr.flashcards.again}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{tr.flashcards.title}</h1>
        <label className="text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSpaced}
            onChange={(e) => { setIsSpaced(e.target.checked); buildQueue(e.target.checked); }}
            className="mr-1.5"
          />
          {tr.flashcards.smartMode}
        </label>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-gray-800">{index + 1}</span> / {queue.length}
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full ml-2">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${((index + 1) / queue.length) * 100}%` }} />
        </div>
        <span className="text-green-600 font-medium">{correct} ✓</span>
        <span className="text-red-500 font-medium">{incorrect} ✗</span>
      </div>

      <div
        className={`bg-white rounded-3xl shadow-lg border border-gray-100 min-h-72 flex flex-col items-center justify-center p-8 cursor-pointer select-none transition-all duration-300 ${!flipped ? "hover:shadow-xl" : ""}`}
        onClick={!flipped ? flip : undefined}
      >
        {!flipped ? (
          <div className="text-center space-y-4">
            <div className="text-7xl hanzi font-bold text-gray-900">{current.hanzi}</div>
            <div className="text-gray-400 text-sm mt-6">{tr.flashcards.tapToFlip}</div>
          </div>
        ) : (
          <div className="text-center space-y-4 w-full">
            <div className="flex items-center justify-center gap-3">
              <div className="text-5xl hanzi font-bold text-red-700">{current.hanzi}</div>
              <SpeakButton text={current.hanzi} />
            </div>
            <div className="text-2xl text-red-500 font-medium">{current.pinyin}</div>
            <div className="text-xl text-gray-800 font-semibold">{current.meaning}</div>
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left w-full space-y-1">
              <div className="text-gray-800 hanzi text-lg">{current.exampleHanzi}</div>
              <div className="text-gray-500 text-sm italic">{current.examplePinyin}</div>
              <div className="text-gray-600 text-sm">{current.exampleMeaning}</div>
            </div>
            <div className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
              {current.partOfSpeech}
            </div>
          </div>
        )}
      </div>

      {flipped && !answered && (
        <div className="flex gap-3">
          <button onClick={() => answer(false)} className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors border border-red-200">
            {tr.flashcards.dontKnow}
          </button>
          <button onClick={() => answer(true)} className="flex-1 py-3 rounded-xl bg-green-50 text-green-600 font-semibold hover:bg-green-100 transition-colors border border-green-200">
            {tr.flashcards.knew}
          </button>
        </div>
      )}

      {answered && (
        <button onClick={next} className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 transition-colors">
          {tr.flashcards.next}
        </button>
      )}
    </div>
  );
}
