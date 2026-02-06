
import React, { useState } from 'react';
import { Search as SearchIcon, Users, Calendar, Award, Shield, User, Printer } from 'lucide-react';
import { Team, Player, PlayerType, Match } from '../types';

interface SearchPageProps {
  data: { teams: Team[]; matches: Match[] };
}

const SearchPage: React.FC<SearchPageProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const allPlayers = data.teams.flatMap(t => t.players.map(p => ({
    ...p,
    teamName: t.name,
    teamId: t.id,
    totalGoals: data.matches.reduce((acc, m) => acc + m.goals.filter(g => g.playerId === p.id).length, 0)
  })));

  const filteredPlayers = searchTerm.trim() === '' 
    ? allPlayers 
    : allPlayers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const printPlayers = () => {
    const printSection = document.getElementById('print-section');
    if (!printSection) return;
    printSection.innerHTML = `
      <div style="display: flex; margin-bottom: 20px; align-items: stretch;">
        <div style="border: 2px solid black; flex: 1; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; text-transform: uppercase;">Danh Sách Cầu Thủ</div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: black; color: white;">
            <th style="border: 1px solid black; padding: 8px;">STT</th>
            <th style="border: 1px solid black; padding: 8px;">Cầu Thủ</th>
            <th style="border: 1px solid black; padding: 8px;">Đội</th>
            <th style="border: 1px solid black; padding: 8px;">Loại Cầu Thủ</th>
            <th style="border: 1px solid black; padding: 8px;">Tổng Số Bàn Thắng</th>
          </tr>
        </thead>
        <tbody>
          ${filteredPlayers.map((p, idx) => `
            <tr>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${idx + 1}</td>
              <td style="border: 1px solid black; padding: 8px;">${p.name}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${p.teamName}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${p.type}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${p.totalGoals}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    window.print();
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Tra Cứu Cầu Thủ</h1><p className="text-slate-500">Danh sách cầu thủ giải đấu</p></div>
        <button onClick={printPlayers} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg"><Printer className="w-5 h-5" /> In Danh Sách </button>
      </div>
      <div className="relative max-w-xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><SearchIcon className="w-5 h-5" /></div>
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-white border rounded-3xl font-medium outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nhập tên cầu thủ..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map(player => (
          <div key={player.id} className="bg-white rounded-3xl border p-6 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xl">{player.name[0]}</div>
              <div><h4 className="font-black text-slate-900 leading-tight">{player.name}</h4><p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Shield className="w-3 h-3" /> {player.teamName}</p></div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Ngày sinh:</span><span className="font-bold">{new Date(player.birthday).toLocaleDateString('vi-VN')}</span></div>
              <div className="flex justify-between"><span>Loại:</span><span className="font-bold text-xs uppercase">{player.type}</span></div>
              <div className="flex justify-between pt-3 border-t"><span>Bàn thắng:</span><span className="text-xl font-black">{player.totalGoals}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
