import React, { useState } from 'react';
import { Team, Match, LeagueSettings } from '../types';
import { calculateStandings } from '../store';
import { 
  Building2, Users, MapPin, Trophy, Search, 
  ChevronRight, ArrowLeft, Info, Activity, Star
} from 'lucide-react';

interface ClubsPageProps {
  data: { teams: Team[]; matches: Match[]; settings: LeagueSettings };
}

const ClubsPage: React.FC<ClubsPageProps> = ({ data }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const standings = calculateStandings(data.teams, data.matches, data.settings);
  
  const filteredTeams = data.teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.homeStadium.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTeam = data.teams.find(t => t.id === selectedTeamId);
  const selectedStanding = standings.find(s => s.teamId === selectedTeamId);

  if (selectedTeam) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
        <button 
          onClick={() => setSelectedTeamId(null)}
          className="flex items-center gap-2 text-emerald-700 font-black hover:gap-3 transition-all group"
        >
          <ArrowLeft className="w-5 h-5" /> QUAY LẠI DANH SÁCH
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[40px] p-10 border border-emerald-100 shadow-sm text-center">
              <div className="w-24 h-24 rounded-[32px] bg-emerald-600 flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-xl shadow-emerald-600/20">
                {selectedTeam.name[0]}
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">{selectedTeam.name}</h1>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-6">{selectedTeam.id}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-3xl">
                  <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Hạng hiện tại</p>
                  <p className="text-2xl font-black text-emerald-700">#{selectedStanding?.rank || '-'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Điểm số</p>
                  <p className="text-2xl font-black text-slate-900">{selectedStanding?.points || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-sm tracking-wider">
                <Info className="w-4 h-4 text-emerald-500" /> Thông tin chung
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Sân nhà</p>
                    <p className="text-sm font-bold text-slate-700">{selectedTeam.homeStadium}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Phong độ (5 trận)</p>
                    <div className="flex gap-1 mt-1">
                      {['W', 'D', 'W', 'L', 'W'].map((r, i) => (
                        <span key={i} className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${r === 'W' ? 'bg-emerald-500' : r === 'D' ? 'bg-amber-500' : 'bg-rose-500'}`}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Squad List */}
          <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Users className="w-7 h-7 text-emerald-600" />
                Đội hình CLB
              </h2>
              <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase">
                {selectedTeam.players.length} Cầu thủ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTeam.players.map((p, idx) => (
                <div key={p.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 group-hover:text-emerald-600 transition-colors">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{p.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">{new Date(p.birthday).getFullYear()}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase italic">Thành viên</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Danh Sách Các Đội</h1>
          <p className="text-slate-500 font-medium">Khám phá các đội bóng tham dự V-League 2026</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm CLB..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white rounded-3xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTeams.map((team) => {
          const teamStanding = standings.find(s => s.teamId === team.id);
          return (
            <div 
              key={team.id} 
              onClick={() => setSelectedTeamId(team.id)}
              className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-[24px] bg-emerald-600 flex items-center justify-center text-white text-2xl font-black group-hover:scale-110 transition-transform shadow-lg shadow-emerald-600/20">
                  {team.name[0]}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">RANK</p>
                  <p className="text-2xl font-black text-emerald-600 leading-none">#{teamStanding?.rank || '-'}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-4">{team.name}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-emerald-500" /> {team.homeStadium}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Users className="w-4 h-4 text-emerald-500" /> {team.players.length} Cầu thủ
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-black text-slate-900">{teamStanding?.points || 0} PTS</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-black text-emerald-600 uppercase tracking-widest">
                  Chi tiết <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}

        {filteredTeams.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">Không tìm thấy CLB nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsPage;
