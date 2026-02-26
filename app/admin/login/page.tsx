'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Lock, RefreshCw, LayoutDashboard, Wand2, 
  Trash2, LogOut, BarChart3, ShieldCheck,
  Sun, Moon, Plus, X
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

type Theme = 'light' | 'dark';

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

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// ==========================================
// CONTEXT (Included for self-contained preview)
// ==========================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// ==========================================
// UTILITIES & AI CORE
// ==========================================

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const apiKey = ""; 

async function callGemini(userQuery: string, systemPrompt: string, retryCount = 0): Promise<string> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });

    if (!response.ok) {
      if (response.status === 429 && retryCount < 5) {
        await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1000));
        return callGemini(userQuery, systemPrompt, retryCount + 1);
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "Response unavailable.";
  } catch (error) {
    if (retryCount < 5) {
      await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1000));
      return callGemini(userQuery, systemPrompt, retryCount + 1);
    }
    throw error;
  }
}

// ==========================================
// COMPONENT: ADMIN LOGIN
// ==========================================

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <Lock size={32} />
             </div>
             <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Command Center</h2>
             <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Secure Authentication Required</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Admin Identity</label>
               <input 
                 type="email" 
                 placeholder="admin@sankalpbharat.in" 
                 className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-slate-900 dark:text-white" 
                 required 
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Access Key</label>
               <input 
                 type="password" 
                 placeholder="••••••••" 
                 className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-slate-900 dark:text-white" 
                 required 
               />
             </div>
             <button className="w-full py-5 bg-orange-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all">
                {loading ? <RefreshCw className="animate-spin inline mr-2" size={20} /> : null}
                {loading ? "Decrypting..." : "Initialize Session"}
             </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// COMPONENT: ADMIN DASHBOARD
// ==========================================

export function AdminDashboard({ 
  entries, winners, resultsDeclared, setResultsDeclared, setWinners, logout 
}: {
  entries: LeaderboardEntry[];
  winners: Winner[];
  resultsDeclared: boolean;
  setResultsDeclared: (d: boolean) => void;
  setWinners: (w: Winner[]) => void;
  logout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'winners'>('leaderboard');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const promoteWithAi = async (team: LeaderboardEntry) => {
    setIsAiLoading(true);
    try {
      const sys = `Write a highly professional 1-sentence congratulatory blurb for a national hackathon team. Focus on innovation and impact.`;
      const prompt = `Team: ${team.teamName}, Project: ${team.projectTitle}, Score: ${team.score}.`;
      const msg = await callGemini(prompt, sys);
      
      const newWinner: Winner = { 
        id: Math.random().toString(36).substring(7), 
        rank: winners.length + 1, 
        teamName: team.teamName, 
        score: team.score, 
        congratsMessage: msg, 
        imageUrl: "https://images.unsplash.com/photo-1522071823991-b9676551b223?q=80&w=200&auto=format&fit=crop" 
      };
      setWinners([...winners, newWinner]);
    } catch(e) {
      console.error("AI Promotion Failed", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <section className="min-h-screen py-24 px-6 max-w-7xl mx-auto text-left relative bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
       <div className="p-12 md:p-24 rounded-[4rem] md:rounded-[6rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-3xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[1.5rem] border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8">
                <LayoutDashboard size={40} className="text-orange-500" />
             </div>
             <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter dark:text-white mb-2">Strategic Command</h2>
             <p className="text-slate-400 font-bold mb-12 tracking-widest uppercase text-xs opacity-60">National Innovation Database • Node SB-Alpha</p>
             
             {/* Sub-Navigation */}
             <div className="flex gap-2 mb-16 bg-slate-100 dark:bg-white/5 p-2 rounded-[2rem] border border-slate-200 dark:border-white/5">
                <button 
                  onClick={() => setActiveTab('leaderboard')} 
                  className={cn("px-8 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all", 
                    activeTab === 'leaderboard' ? "bg-orange-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
                >
                  Leaderboard
                </button>
                <button 
                  onClick={() => setActiveTab('winners')} 
                  className={cn("px-8 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all", 
                    activeTab === 'winners' ? "bg-orange-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
                >
                  Winners Circle
                </button>
             </div>

             <div className="w-full max-w-4xl space-y-6">
                {activeTab === 'leaderboard' ? (
                   entries.map(e => (
                     <div key={e.id} className="flex items-center justify-between p-6 md:p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] text-left hover:border-orange-500/50 transition-all group">
                        <div>
                           <div className="text-xl md:text-2xl font-black mb-1 dark:text-white group-hover:text-orange-500 transition-colors">{String(e.teamName)}</div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{String(e.projectTitle)}</div>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{Number(e.score)}</span>
                           <button 
                             onClick={() => promoteWithAi(e)} 
                             disabled={isAiLoading}
                             className="p-3.5 bg-orange-500 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                             title="AI Promote to Winner"
                           >
                             {isAiLoading ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
                           </button>
                        </div>
                     </div>
                   ))
                ) : (
                   <div className="space-y-8">
                      {/* Master Toggle for Public Results */}
                      <div className="flex items-center justify-between p-10 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 rounded-[3rem]">
                         <div className="text-left">
                            <div className="font-black uppercase tracking-widest text-[10px] opacity-60 dark:text-white/60 mb-1">Public Display</div>
                            <div className="text-xl font-black dark:text-white">{resultsDeclared ? "DEPLOYED TO LIVE SITE" : "STAGED / LOCAL ONLY"}</div>
                         </div>
                         <button 
                           onClick={() => setResultsDeclared(!resultsDeclared)} 
                           className={cn("px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                            resultsDeclared ? "bg-slate-800 text-white" : "bg-orange-500 text-white shadow-xl")}
                         >
                           {resultsDeclared ? "Withdraw Results" : "Go Live"}
                         </button>
                      </div>

                      {/* Winner List Management */}
                      <div className="grid gap-4">
                        {winners.map(w => (
                          <div key={w.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl">
                              <div className="flex items-center gap-5">
                                <img src={w.imageUrl} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/10" alt="" />
                                <div className="text-left">
                                    <div className="font-black text-lg uppercase tracking-tight dark:text-white">{String(w.teamName)}</div>
                                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Rank #{w.rank} • {Number(w.score)} pts</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setWinners(winners.filter(x => x.id !== w.id))} 
                                className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                          </div>
                        ))}
                      </div>
                      {winners.length === 0 && (
                         <div className="py-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] text-slate-400 font-black uppercase tracking-widest text-sm text-center">
                            The Winners Circle is Empty
                         </div>
                      )}
                   </div>
                )}
             </div>
             
             <button 
               onClick={logout} 
               className="mt-20 flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
             >
               <LogOut size={16} /> Deactivate Command session
             </button>
          </div>
       </div>
    </section>
  );
}

// ==========================================
// MAIN APP ENTRY POINT (FOR CANVAS PREVIEW)
// ==========================================

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [resultsDeclared, setResultsDeclared] = useState(false);
  
  const [entries] = useState<LeaderboardEntry[]>([
    { id: '1', rank: 1, teamName: 'Neural Knights', projectTitle: 'AI Power Grid', score: 985, members: 4 },
    { id: '2', rank: 2, teamName: 'Agri Revolution', projectTitle: 'Drone Swarm Farming', score: 972, members: 3 },
    { id: '3', rank: 3, teamName: 'Eco Builders', projectTitle: 'Plastic-to-Watt Module', score: 940, members: 4 }
  ]);

  const [winners, setWinners] = useState<Winner[]>([]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        {!isAuthenticated ? (
          <AdminLogin onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <AdminDashboard 
            entries={entries}
            winners={winners}
            setWinners={setWinners}
            resultsDeclared={resultsDeclared}
            setResultsDeclared={setResultsDeclared}
            logout={() => setIsAuthenticated(false)}
          />
        )}

        {/* Floating Tooltip for Demo */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/10 opacity-50 pointer-events-none">
          SB-Alpha Command Preview Mode
        </div>
      </div>
    </ThemeProvider>
  );
}