
import React, { useState } from 'react';
import { Plus, Trash2, Users, MapPin, ClipboardList, History, X } from 'lucide-react';
import { Team, Player, PlayerType, LeagueSettings, User, UserRole } from '../types';

interface TeamsPageProps {
  data: { teams: Team[]; settings: LeagueSettings };
  onUpdate: (newData: any) => void;
  user: User;
}

const TeamsPage: React.FC<TeamsPageProps> = ({ data, onUpdate, user }) => {
  const [teamForm, setTeamForm] = useState({ name: '', homeStadium: '' });
  const [players, setPlayers] = useState<Partial<Player>[]>([
    { id: '1', name: '', birthday: '', type: PlayerType.DOMESTIC, notes: '' },
    { id: '2', name: '', birthday: '', type: PlayerType.DOMESTIC, notes: '' }
  ]);
  const [error, setError] = useState('');

  const canRegister = user.role === UserRole.ADMIN || user.role === UserRole.TEAM_OWNER;

  const addPlayerRow = () => {
    setPlayers([...players, { id: crypto.randomUUID(), name: '', birthday: '', type: PlayerType.DOMESTIC, notes: '' }]);
  };

  const removePlayerRow = (id: string) => {
    if (players.length <= 1) return;
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayer = (id: string, field: keyof Player, value: any) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRegisterTeam = () => {
    setError('');
    if (!teamForm.name || !teamForm.homeStadium) {
      setError('Vui lòng điền tên đội và sân nhà'); return;
    }
    
    const validPlayers = players.filter(p => p.name && p.birthday);
    if (validPlayers.length < data.settings.minPlayers) {
      setError(`Mỗi đội cần tối thiểu ${data.settings.minPlayers} cầu thủ.`); return;
    }
    if (validPlayers.length > data.settings.maxPlayers) {
      setError(`Mỗi đội không được quá ${data.settings.maxPlayers} cầu thủ.`); return;
    }

    const team: Team = { 
      id: `FC${(data.teams.length + 5).toString().padStart(3, '0')}`,
      name: teamForm.name, 
      homeStadium: teamForm.homeStadium, 
      players: validPlayers as Player[],
      ownerId: user.id,
      registrationDate: new Date().toISOString()
    };

    onUpdate({ teams: [...data.teams, team] });
    setTeamForm({ name: '', homeStadium: '' });
    setPlayers([
      { id: '1', name: '', birthday: '', type: PlayerType.DOMESTIC, notes: '' },
      { id: '2', name: '', birthday: '', type: PlayerType.DOMESTIC, notes: '' }
    ]);
    alert('Đăng ký đội bóng thành công!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      {/* Left: Registration Form */}
      <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Section: Hồ Sơ Đội Bóng */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <ClipboardList className="w-6 h-6 text-emerald-500" />
              Hồ Sơ Đội Bóng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Tên đội</label>
                <input 
                  type="text" 
                  value={teamForm.name}
                  onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Nhập tên đội bóng"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Sân nhà</label>
                <input 
                  type="text" 
                  value={teamForm.homeStadium}
                  onChange={e => setTeamForm({...teamForm, homeStadium: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Nhập tên sân vận động"
                />
              </div>
            </div>
          </div>

          {/* Section: Danh sách cầu thủ */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <Users className="w-6 h-6 text-emerald-500" />
              Danh sách cầu thủ
            </h2>
            
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold animate-shake">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="pb-4 pr-4 w-12">STT</th>
                    <th className="pb-4 px-4">Cầu thủ</th>
                    <th className="pb-4 px-4">Ngày sinh</th>
                    <th className="pb-4 px-4">Loại cầu thủ</th>
                    <th className="pb-4 px-4">Ghi chú</th>
                    <th className="pb-4 pl-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {players.map((p, idx) => (
                    <tr key={p.id} className="group">
                      <td className="py-4 pr-4 text-center font-bold text-emerald-500">{idx + 1}</td>
                      <td className="py-4 px-4">
                        <input 
                          type="text" 
                          value={p.name}
                          onChange={e => updatePlayer(p.id!, 'name', e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="date" 
                          value={p.birthday}
                          onChange={e => updatePlayer(p.id!, 'birthday', e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          value={p.type}
                          onChange={e => updatePlayer(p.id!, 'type', e.target.value as PlayerType)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400 cursor-pointer"
                        >
                          <option value={PlayerType.DOMESTIC}>Trong nước</option>
                          <option value={PlayerType.FOREIGN}>Ngoài nước</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="text" 
                          value={p.notes}
                          onChange={e => updatePlayer(p.id!, 'notes', e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400"
                        />
                      </td>
                      <td className="py-4 pl-4 text-center">
                        <button 
                          onClick={() => removePlayerRow(p.id!)}
                          className="p-2 text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-6">
              <button 
                onClick={addPlayerRow}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-slate-600/20"
              >
                <Plus className="w-4 h-4" /> Thêm cầu thủ
              </button>
              
              <button 
                onClick={handleRegisterTeam}
                disabled={!canRegister}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/30"
              >
                Đăng ký đội bóng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: History Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm sticky top-24">
          <div className="flex items-center gap-3 mb-8 text-emerald-600 pb-4 border-b">
            <History className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-900">Lịch sử đăng ký</h3>
          </div>
          
          <div className="space-y-6">
            {data.teams.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                <p className="text-slate-400 text-sm italic">Chưa có đội bóng nào được đăng ký</p>
              </div>
            ) : (
              [...data.teams].reverse().map(t => (
                <div key={t.id} className="flex items-center justify-between group">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 rounded-xl flex items-center justify-center font-bold transition-colors">
                      {t.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {t.id} · {t.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium uppercase truncate">{t.homeStadium}</p>
                    </div>
                  </div>
                  <div className="ml-4 w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                    {t.players.length}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-8 border-t flex justify-center gap-2">
             <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-100">
               <span className="sr-only">Previous</span>
               &lsaquo;
             </button>
             <button className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</button>
             <button className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center text-xs font-bold">2</button>
             <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-100">
               <span className="sr-only">Next</span>
               &rsaquo;
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
