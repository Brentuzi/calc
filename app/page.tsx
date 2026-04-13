"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress, getStats, updateStreak, saveProgress } from "@/lib/progress";
import { words } from "@/lib/words";

export default function HomePage() {
  const [stats, setStats] = useState({ known: 0, learning: 0, newWords: 300, total: 300 });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let progress = loadProgress();
    progress = updateStreak(progress);
    saveProgress(progress);
    setStats(getStats(progress, words.length));
    setStreak(progress.streak);
  }, []);

  const knownPct = Math.round((stats.known / stats.total) * 100);
  const learningPct = Math.round((stats.learning / stats.total) * 100);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">
          <span className="text-red-600 hanzi">汉语</span> HSK1 Тренажёр
        </h1>
        <p className="text-gray-500 text-lg">300 слов уровня HSK1 с примерами предложений</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Всего слов" value={stats.total} color="blue" />
        <StatCard label="Изучаю" value={stats.learning} color="yellow" />
        <StatCard label="Знаю" value={stats.known} color="green" />
        <StatCard label="Дней подряд" value={streak} color="red" suffix="🔥" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Прогресс</span>
          <span>{stats.known} / {stats.total} слов</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-green-500 transition-all duration-700"
              style={{ width: `${knownPct}%` }}
            />
            <div
              className="bg-yellow-400 transition-all duration-700"
              style={{ width: `${learningPct}%` }}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Знаю</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Изучаю</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />Новые</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ModeCard
          href="/flashcards"
          title="Карточки"
          description="Пролистывай карточки: иероглиф → пинь-инь → значение → пример"
          icon="🃏"
          color="red"
        />
        <ModeCard
          href="/quiz"
          title="Тест"
          description="Выбери правильный перевод из 4 вариантов — тренируй память"
          icon="✏️"
          color="blue"
        />
        <ModeCard
          href="/dictionary"
          title="Словарь"
          description="Все 300 слов с поиском и фильтром по части речи"
          icon="📖"
          color="green"
        />
      </div>

      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Слово дня</h2>
        <DailyWord />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  suffix,
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-2xl p-4 ${colors[color]} text-center`}>
      <div className="text-3xl font-bold">{value}{suffix}</div>
      <div className="text-sm mt-1 opacity-80">{label}</div>
    </div>
  );
}

function ModeCard({
  href,
  title,
  description,
  icon,
  color,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    red: "hover:border-red-300 hover:shadow-red-100",
    blue: "hover:border-blue-300 hover:shadow-blue-100",
    green: "hover:border-green-300 hover:shadow-green-100",
  };
  return (
    <Link
      href={href}
      className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all ${colors[color]} flex flex-col gap-3`}
    >
      <span className="text-4xl">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}

function DailyWord() {
  const word = words[(new Date().getDate() * 7 + new Date().getMonth() * 31) % words.length];
  return (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <div className="text-5xl hanzi font-bold text-red-700">{word.hanzi}</div>
        <div className="text-lg text-red-500 mt-1">{word.pinyin}</div>
      </div>
      <div className="flex-1">
        <div className="text-gray-700 font-medium">{word.meaning}</div>
        <div className="mt-2 text-gray-600 text-sm">
          <span className="hanzi">{word.exampleHanzi}</span>
        </div>
        <div className="text-gray-500 text-sm italic">{word.examplePinyin}</div>
        <div className="text-gray-500 text-sm">{word.exampleMeaning}</div>
      </div>
    </div>
  );
}
