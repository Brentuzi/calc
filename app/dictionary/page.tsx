"use client";

import { useState, useEffect, useMemo } from "react";
import { words, partsOfSpeech, PartOfSpeech } from "@/lib/words";
import { loadProgress, getWordProgress, WordStatus } from "@/lib/progress";
import { useLang } from "@/lib/LanguageContext";
import SpeakButton from "@/components/SpeakButton";

export default function DictionaryPage() {
  const { tr } = useLang();
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState<PartOfSpeech | "all">("all");
  const [statusFilter, setStatusFilter] = useState<WordStatus | "all">("all");
  const [progressMap, setProgressMap] = useState<Record<number, WordStatus>>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const progress = loadProgress();
    const map: Record<number, WordStatus> = {};
    for (const w of words) map[w.id] = getWordProgress(progress, w.id).status;
    setProgressMap(map);
  }, []);

  const statusLabel: Record<WordStatus, string> = {
    new: tr.dictionary.statusNew,
    learning: tr.dictionary.statusLearning,
    known: tr.dictionary.statusKnown,
  };

  const statusColor: Record<WordStatus, string> = {
    new: "bg-gray-100 text-gray-600",
    learning: "bg-yellow-100 text-yellow-700",
    known: "bg-green-100 text-green-700",
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return words.filter((w) => {
      if (posFilter !== "all" && w.partOfSpeech !== posFilter) return false;
      if (statusFilter !== "all" && progressMap[w.id] !== statusFilter) return false;
      if (!q) return true;
      return w.hanzi.includes(q) || w.pinyin.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q);
    });
  }, [search, posFilter, statusFilter, progressMap]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">{tr.dictionary.title}</h1>
        <span className="text-sm text-gray-500">{filtered.length} {tr.dictionary.words}</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={tr.dictionary.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-52 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value as PartOfSpeech | "all")}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-700"
        >
          <option value="all">{tr.dictionary.allPos}</option>
          {partsOfSpeech.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WordStatus | "all")}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-700"
        >
          <option value="all">{tr.dictionary.allStatus}</option>
          <option value="new">{tr.dictionary.statusNew}</option>
          <option value="learning">{tr.dictionary.statusLearning}</option>
          <option value="known">{tr.dictionary.statusKnown}</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">{tr.dictionary.notFound}</div>
        )}
        {filtered.map((word) => {
          const status = progressMap[word.id] ?? "new";
          const isOpen = expanded === word.id;
          return (
            <div key={word.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full text-left p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : word.id)}
              >
                <div className="text-3xl hanzi font-bold text-gray-900 w-16 text-center shrink-0">{word.hanzi}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-red-500 font-medium">{word.pinyin}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{word.partOfSpeech}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColor[status]}`}>{statusLabel[status]}</span>
                  </div>
                  <div className="text-gray-700 text-sm mt-0.5 truncate">{word.meaning}</div>
                </div>
                <SpeakButton text={word.hanzi} className="shrink-0" />
                <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 space-y-2">
                  <div className="pt-3">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{tr.dictionary.example}</div>
                    <div className="hanzi text-gray-800 text-lg">{word.exampleHanzi}</div>
                    <div className="text-gray-500 text-sm italic">{word.examplePinyin}</div>
                    <div className="text-gray-500 text-sm">{word.exampleMeaning}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <SpeakButton text={word.exampleHanzi} />
                    <span className="text-xs text-gray-400 self-center">{tr.dictionary.speakExample}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
