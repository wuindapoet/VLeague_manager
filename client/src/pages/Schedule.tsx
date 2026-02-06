
import React, { useState } from 'react';
import { Calendar, RefreshCw, MapPin, Clock, Printer } from 'lucide-react';
import { Team, Match, LeagueSettings, User, UserRole } from '../types';
import Modal from '../components/Modal';

interface SchedulePageProps {
  data: { teams: Team[]; matches: Match[]; settings: LeagueSettings };
  onUpdate: (newData: any) => void;
  user: User;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ data, onUpdate, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: 'warning' | 'success' | 'info' | 'error';
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    title: '',
    message: '',
    type: 'info'
  });
  const printSchedule = (round: number) => {
    const printSection = document.getElementById('print-section');
    if (!printSection) return;
    const matches = data.matches.filter(m => m.round === round);
    
    printSection.innerHTML = `
      <div style="display: flex; align-items: stretch; margin-bottom: 10px;">
        <div class="bm-title">Lịch Thi Đấu</div>
      </div>
      <div class="bm-row-info" style="text-align: center;">Vòng thi đấu: <strong>Vòng ${round} (${round === 1 ? 'Lượt Đi' : 'Lượt Về'})</strong></div>
      <table class="bm-table">
        <thead>
          <tr>
            <th style="width: 40px;">STT</th>
            <th>Đội 1</th>
            <th>Đội 2</th>
            <th>Ngày - Giờ</th>
            <th>Sân</th>
          </tr>
        </thead>
        <tbody>
          ${matches.map((m, idx) => {
            const t1 = data.teams.find(t => t.id === m.team1Id);
            const t2 = data.teams.find(t => t.id === m.team2Id);
            return `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td>${t1?.name}</td>
                <td>${t2?.name}</td>
                <td>${new Date(m.date).toLocaleDateString('vi-VN')} - ${m.time}</td>
                <td>${m.stadium}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    window.print();
  };

  const generateSchedule = () => {
    if (data.teams.length < 2) {
      setModalConfig({
        title: 'Không đủ đội bóng',
        message: 'Cần ít nhất 2 đội bóng để lập lịch thi đấu tự động.',
        type: 'warning',
        confirmText: 'Đã hiểu'
      });
      setShowModal(true);
      return;
    }

    setModalConfig({
      title: 'Xác nhận lập lịch',
      message: 'Lập lại lịch sẽ xóa toàn bộ dữ liệu trận đấu cũ. Bạn có chắc chắn muốn tiếp tục?',
      type: 'warning',
      confirmText: 'Lập lịch',
      onConfirm: () => {
        const newMatches: Match[] = [];
        for (let i = 0; i < data.teams.length; i++) {
          for (let j = i + 1; j < data.teams.length; j++) {
            const tA = data.teams[i]; const tB = data.teams[j];
            newMatches.push({ id: crypto.randomUUID(), round: 1, team1Id: tA.id, team2Id: tB.id, date: new Date().toISOString().split('T')[0], time: '17:00', stadium: tA.homeStadium, score1: null, score2: null, goals: [], isCompleted: false });
            newMatches.push({ id: crypto.randomUUID(), round: 2, team1Id: tB.id, team2Id: tA.id, date: new Date().toISOString().split('T')[0], time: '19:00', stadium: tB.homeStadium, score1: null, score2: null, goals: [], isCompleted: false });
          }
        }
        onUpdate({ matches: newMatches });
      }
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Lịch Thi Đấu 2026</h1><p className="text-slate-500"></p></div>
        <div className="flex gap-2">
          <button onClick={() => printSchedule(1)} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"><Printer className="w-4 h-4" /> In Vòng 1</button>
          <button onClick={() => printSchedule(2)} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"><Printer className="w-4 h-4" /> In Vòng 2</button>
          {user.role === UserRole.ADMIN && (
            <button onClick={generateSchedule} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"><RefreshCw className="w-4 h-4" /> Lập Lịch Tự Động</button>
          )}
        </div>
      </div>
      {data.matches.length === 0 ? <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl"><Calendar className="w-12 h-12 mx-auto mb-4 text-slate-200" /><p>Chưa có lịch thi đấu</p></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.matches.map(m => {
             const t1 = data.teams.find(t => t.id === m.team1Id);
             const t2 = data.teams.find(t => t.id === m.team2Id);
             return (
               <div key={m.id} className="bg-white p-6 rounded-2xl border hover:shadow-md transition-all">
                 <div className="text-center text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Vòng {m.round}</div>
                 <div className="flex justify-between items-center gap-4">
                   <span className="text-sm font-bold flex-1 text-center">{t1?.name}</span>
                   <span className="text-xs italic text-slate-300">vs</span>
                   <span className="text-sm font-bold flex-1 text-center">{t2?.name}</span>
                 </div>
                 <div className="mt-4 pt-4 border-t text-xs text-slate-500 space-y-1">
                   <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {m.stadium}</div>
                   <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {m.time} - {new Date(m.date).toLocaleDateString('vi-VN')}</div>
                 </div>
               </div>
             )
          })}
        </div>
      )}
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        showCancel={modalConfig.type === 'warning'}
      />
    </div>
  );
};

export default SchedulePage;
