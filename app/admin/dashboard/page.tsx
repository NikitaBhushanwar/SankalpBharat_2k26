'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Wand2,
  Trash2,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LeaderboardEntry {
  id: string;
  rank: number;
  teamName: string;
  projectTitle: string;
  score: number;
  members: number;
}

interface Winner {
  id: string;
  rank: number;
  teamName: string;
  score: number;
  congratsMessage: string;
  imageUrl: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<'leaderboard' | 'winners'>('leaderboard');

  const [resultsDeclared, setResultsDeclared] = useState(false);

  const [entries] = useState<LeaderboardEntry[]>([
    { id: '1', rank: 1, teamName: 'Neural Knights', projectTitle: 'AI Power Grid', score: 985, members: 4 },
    { id: '2', rank: 2, teamName: 'Agri Revolution', projectTitle: 'Drone Swarm Farming', score: 972, members: 3 },
    { id: '3', rank: 3, teamName: 'Eco Builders', projectTitle: 'Plastic-to-Watt Module', score: 940, members: 4 }
  ]);

  const [winners, setWinners] = useState<Winner[]>([]);

  const promote = (team: LeaderboardEntry) => {
    const newWinner: Winner = {
      id: Math.random().toString(),
      rank: winners.length + 1,
      teamName: team.teamName,
      score: team.score,
      congratsMessage: "Outstanding innovation and national impact.",
      imageUrl:
        "https://images.unsplash.com/photo-1522071823991-b9676551b223?q=80&w=200"
    };

    setWinners([...winners, newWinner]);
  };

  return (
    <section className="min-h-screen py-24 px-6 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

      <div className="p-12 md:p-24 rounded-[4rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl">

        <div className="flex flex-col items-center text-center">

          <LayoutDashboard size={48} className="text-orange-500 mb-6" />

          <h2 className="text-5xl font-black uppercase tracking-tight dark:text-white">
            Strategic Command
          </h2>

          {/* Tabs */}
          <div className="flex gap-4 mt-12">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-8 py-3 rounded-full font-black text-xs tracking-widest uppercase transition ${
                activeTab === 'leaderboard'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500'
              }`}
            >
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('winners')}
              className={`px-8 py-3 rounded-full font-black text-xs tracking-widest uppercase transition ${
                activeTab === 'winners'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500'
              }`}
            >
              Winners
            </button>
          </div>

          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div className="w-full max-w-4xl mt-16 space-y-6">
              {entries.map(e => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5"
                >
                  <div className="text-left">
                    <div className="text-xl font-black dark:text-white">
                      {e.teamName}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest">
                      {e.projectTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-black dark:text-white">
                      {e.score}
                    </span>
                    <button
                      onClick={() => promote(e)}
                      className="p-3 bg-orange-500 text-white rounded-xl hover:scale-110 transition"
                    >
                      <Wand2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Winners */}
          {activeTab === 'winners' && (
            <div className="w-full max-w-4xl mt-16 space-y-4">
              {winners.map(w => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={w.imageUrl}
                      className="w-14 h-14 rounded-xl object-cover"
                      alt=""
                    />
                    <div className="text-left">
                      <div className="font-black dark:text-white">
                        {w.teamName}
                      </div>
                      <div className="text-xs text-orange-500 uppercase tracking-widest">
                        Rank #{w.rank}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setWinners(winners.filter(x => x.id !== w.id))
                    }
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {winners.length === 0 && (
                <div className="py-16 text-center text-slate-400 font-black uppercase tracking-widest">
                  No Winners Yet
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => router.push('/admin/login')}
            className="mt-16 flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-xs"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </section>
  );
}