
import React, { useState } from 'react';
import { ClipboardCheck, Plus, Trash2, Clock, Goal, Trophy, Save, Printer } from 'lucide-react';
import { Team, Match, GoalType, Goal as GoalEntry, LeagueSettings, User, UserRole } from '../types';

interface ResultsPageProps {
  data: { teams: Team[]; matches: Match[]; settings: LeagueSettings };
  onUpdate: (newData: any) => void;
  user: User;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ data, onUpdate, user }) => {
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchGoals, setMatchGoals] = useState<GoalEntry[]>([]);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  const printResult = (match: Match) => {
    const printSection = document.getElementById('print-section');
    if (!printSection) return;
    const team1 = data.teams.find(t => t.id === match.team1Id);
    const team2 = data.teams.find(t => t.id === match.team2Id);
    
    printSection.innerHTML = `
      <div style="display: flex; margin-bottom: 20px; align-items: stretch;">
        <div style="background: black; color: white; padding: 10px 20px; font-weight: bold; border: 2px solid black;">BM3</div>
        <div style="border: 2px solid black; flex: 1; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; text-transform: uppercase;">Kết Quả Thi Đấu</div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div style="flex: 1;">Đội 1: <strong>${team1?.name}</strong></div>
        <div style="flex: 1; text-align: right;">Đội 2: <strong>${team2?.name}</strong></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div style="flex: 1;">Tỷ số: <strong>${match.score1} - ${match.score2}</strong></div>
        <div style="flex: 1; text-align: right;">Sân: <strong>${match.stadium}</strong></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="flex: 1;">Ngày: <strong>${new Date(match.date).toLocaleDateString('vi-VN')}</strong></div>
        <div style="flex: 1; text-align: right;">Giờ: <strong>${match.time}</strong></div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: black; color: white;">
            <th style="border: 1px solid black; padding: 8px;">STT</th>
            <th style="border: 1px solid black; padding: 8px;">Cầu Thủ</th>
            <th style="border: 1px solid black; padding: 8px;">Đội</th>
            <th style="border: 1px solid black; padding: 8px;">Loại Bàn Thắng</th>
            <th style="border: 1px solid black; padding: 8px;">Thời Điểm</th>
          </tr>
        </thead>
        <tbody>
          ${match.goals.map((g, idx) => {
            const scorer = data.teams.flatMap(t => t.players).find(p => p.id === g.playerId);
            const team = data.teams.find(t => t.id === g.teamId);
            return `
              <tr>
                <td style="border: 1px solid black; padding: 8px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid black; padding: 8px;">${scorer?.name}</td>
                <td style="border: 1px solid black; padding: 8px; text-align: center;">${team?.name}</td>
                <td style="border: 1px solid black; padding: 8px; text-align: center;">${g.type}</td>
                <td style="border: 1px solid black; padding: 8px; text-align: center;">${g.time}'</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    window.print();
  };

  const startRecording = (match: Match) => {
    setEditingMatchId(match.id);
    setMatchGoals(match.goals || []);
    setScore1(match.score1 || 0);
    setScore2(match.score2 || 0);
  };

  const addGoal = (teamId: string) => {
    const goal: GoalEntry = { playerId: '', teamId, type: GoalType.A, time: 0 };
    setMatchGoals([...matchGoals, goal]);
    if (teamId === data.matches.find(m => m.id === editingMatchId)?.team1Id) setScore1(score1 + 1);
    else setScore2(score2 + 1);
  };

  const updateGoal = (index: number, updates: Partial<GoalEntry>) => {
    const newGoals = [...matchGoals];
    newGoals[index] = { ...newGoals[index], ...updates };
    setMatchGoals(newGoals);
  };

  const removeGoal = (index: number) => {
    const goal = matchGoals[index];
    const match = data.matches.find(m => m.id === editingMatchId);
    if (goal.teamId === match?.team1Id) setScore1(Math.max(0, score1 - 1));
    else setScore2(Math.max(0, score2 - 1));
    setMatchGoals(matchGoals.filter((_, i) => i !== index));
  };

  const saveResult = () => {
    const isValid = matchGoals.every(g => g.playerId !== '' && g.time >= 0 && g.time <= data.settings.maxGoalTime);
    if (!isValid) {
      alert(`Vui lòng chọn cầu thủ và nhập thời gian (0-${data.settings.maxGoalTime}') cho tất cả bàn thắng.`);
      return;
    }
    const updatedMatches = data.matches.map(m => m.id === editingMatchId ? { ...m, score1, score2, goals: matchGoals, isCompleted: true } : m);
    onUpdate({ matches: updatedMatches });
    setEditingMatchId(null);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-900">Ghi Nhận Kết Quả</h1><p className="text-slate-500">BM3 - Kết quả thi đấu 2026</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> Trận Đấu Đang Chờ</h3>
          {data.matches.filter(m => !m.isCompleted).map(match => (
            <div key={match.id} className="bg-white p-6 rounded-2xl border flex items-center justify-between shadow-sm">
              <span className="font-bold flex-1 text-center">{data.teams.find(t => t.id === match.team1Id)?.name}</span>
              <div className="px-4">
                {user.role === UserRole.ADMIN && (
                  <button onClick={() => startRecording(match)} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg">Ghi Kết Quả</button>
                )}
              </div>
              <span className="font-bold flex-1 text-center">{data.teams.find(t => t.id === match.team2Id)?.name}</span>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-emerald-500" /> Kết Quả Đã Ghi</h3>
          {data.matches.filter(m => m.isCompleted).map(match => (
            <div key={match.id} className="bg-white p-6 rounded-2xl border flex items-center justify-between shadow-sm">
              <span className="font-bold flex-1 text-center">{data.teams.find(t => t.id === match.team1Id)?.name}</span>
              <div className="px-6 flex items-center gap-4">
                <span className="text-xl font-black">{match.score1} - {match.score2}</span>
                <button onClick={() => printResult(match)} className="p-2 text-slate-400 hover:text-slate-900"><Printer className="w-4 h-4" /></button>
              </div>
              <span className="font-bold flex-1 text-center">{data.teams.find(t => t.id === match.team2Id)?.name}</span>
            </div>
          ))}
        </div>
      </div>
      {editingMatchId && user.role === UserRole.ADMIN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-8 bg-slate-900 text-white text-center">
              <div className="flex items-center justify-center gap-12">
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.teams.find(t => t.id === data.matches.find(m => m.id === editingMatchId)?.team1Id)?.name}</div>
                  <div className="text-4xl font-black text-emerald-400">{score1}</div>
                  <button onClick={() => addGoal(data.matches.find(m => m.id === editingMatchId)!.team1Id)} className="mt-2 text-xs opacity-70 underline">+ Thêm BT</button>
                </div>
                <div className="text-4xl">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.teams.find(t => t.id === data.matches.find(m => m.id === editingMatchId)?.team2Id)?.name}</div>
                  <div className="text-4xl font-black text-emerald-400">{score2}</div>
                  <button onClick={() => addGoal(data.matches.find(m => m.id === editingMatchId)!.team2Id)} className="mt-2 text-xs opacity-70 underline">+ Thêm BT</button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-3">
                {matchGoals.map((goal, idx) => {
                  const goalTeam = data.teams.find(t => t.id === goal.teamId);
                  return (
                    <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border">
                      <select value={goal.playerId} onChange={e => updateGoal(idx, { playerId: e.target.value })} className="flex-1 p-2 rounded-lg border">
                        <option value="">Chọn cầu thủ (${goalTeam?.name})</option>
                        {goalTeam?.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <select value={goal.type} onChange={e => updateGoal(idx, { type: e.target.value as GoalType })} className="w-32 p-2 rounded-lg border">
                        {data.settings.goalTypes.map(gt => <option key={gt} value={gt}>{gt}</option>)}
                      </select>
                      <input type="number" value={goal.time} onChange={e => updateGoal(idx, { time: parseInt(e.target.value) || 0 })} className="w-20 p-2 rounded-lg border" placeholder="Phút" />
                      <button onClick={() => removeGoal(idx)} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t flex gap-4">
              <button onClick={() => setEditingMatchId(null)} className="flex-1 py-4 font-bold text-slate-500">Hủy</button>
              <button onClick={saveResult} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold">Lưu Kết Quả</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
