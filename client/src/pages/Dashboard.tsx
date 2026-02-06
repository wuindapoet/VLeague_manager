
import React from 'react';
import { Users, Calendar, Trophy, ArrowRight, RefreshCw, Goal, ShieldCheck } from 'lucide-react';
import { Team, Match, LeagueSettings, User, UserRole } from '../types';
import { calculateStandings } from '../store';

interface DashboardProps {
  data: { teams: Team[]; matches: Match[]; settings: LeagueSettings };
  onNavigate: (tab: string) => void;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onNavigate, user }) => {
  const standings = calculateStandings(data.teams, data.matches, data.settings);
  const totalGoals = data.matches.reduce((sum, m) => sum + (m.score1 || 0) + (m.score2 || 0), 0);
  const totalPlayers = data.teams.reduce((sum, t) => sum + t.players.length, 0);

  const stats = [
    { label: 'ĐỘI BÓNG', value: data.teams.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'CẦU THỦ', value: totalPlayers, icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: 'TRẬN ĐẤU', value: data.matches.length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'BÀN THẮNG', value: totalGoals, icon: Goal, color: 'text-emerald-700', bg: 'bg-emerald-200' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[40px] p-12 text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden border border-white/10">
        <div className="absolute -top-10 -right-10 opacity-10">
          <Trophy className="w-64 h-64 rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <p className="text-emerald-200 font-bold uppercase tracking-[0.3em] text-[10px] mb-3">V-LEAGUE 2026 DASHBOARD</p>
          <h1 className="text-5xl font-black mb-6 leading-tight">Chào mừng bạn trở lại,<br/> <span className="text-emerald-300">{user.fullName}</span></h1>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all border border-white/20 backdrop-blur-md">
              <RefreshCw className="w-4 h-4" /> Làm mới hệ thống
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-7 h-7 ${s.color}`} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Features Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-8">Bảng xếp hạng Top 5</h3>
          <div className="space-y-4">
            {standings.slice(0, 5).map((s, i) => (
              <div key={i} className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${i === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-6">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
                    {i + 1}
                  </span>
                  <span className="font-bold text-slate-800">{s.teamName}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-600">{s.points} Điểm</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">HS: {s.goalDifference}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-900 rounded-[40px] p-10 text-white flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <Users className="w-48 h-48" />
          </div>
          <div>
            <h3 className="text-2xl font-black mb-4">Ghi nhận trận đấu</h3>
            <p className="text-emerald-300 text-sm leading-relaxed mb-8">
              Cập nhật tỉ số nhanh chóng để bảng xếp hạng được tự động tính toán.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('results')}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/50"
          >
            VÀO GHI NHẬN <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
