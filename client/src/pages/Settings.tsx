
import React, { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, AlertCircle, Users, Goal, TrendingUp, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { LeagueSettings, Team, Match, User, UserRole } from '../types';
import { DEFAULT_SETTINGS } from '../store';
import Modal from '../components/Modal';

interface SettingsPageProps {
  data: { teams: Team[]; matches: Match[]; settings: LeagueSettings };
  onUpdate: (newData: any) => void;
  user: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ data, onUpdate, user }) => {
  const [settings, setSettings] = useState<LeagueSettings>(data.settings);
  const [message, setMessage] = useState('');
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
  const [goalTypesInput, setGoalTypesInput] = useState(settings.goalTypes.join(', '));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setGoalTypesInput(settings.goalTypes.join(', '));
  }, [settings.goalTypes]);

  useEffect(() => {
    setSettings(data.settings);
  }, [data.settings]);

  const handleSave = () => {
    if (settings.pointsWin <= settings.pointsDraw || settings.pointsDraw <= settings.pointsLoss) {
      setModalConfig({
        title: 'Cài đặt không hợp lệ',
        message: 'Quy định điểm số không hợp lệ: Điểm thắng > điểm hòa > điểm thua.',
        type: 'error',
        confirmText: 'Đã hiểu'
      });
      setShowModal(true);
      return;
    }
    onUpdate({ settings });
    setMessage('Đã cập nhật quy định thành công!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    setModalConfig({
      title: 'Xác nhận đặt lại',
      message: 'Bạn có chắc muốn đặt lại các quy định về mặc định ban đầu hay không?',
      type: 'warning',
      confirmText: 'Đặt lại',
      onConfirm: () => {
        setSettings(DEFAULT_SETTINGS);
        setGoalTypesInput(DEFAULT_SETTINGS.goalTypes.join(', '));
        onUpdate({ settings: DEFAULT_SETTINGS });
        setMessage('Đã khôi phục quy định mặc định!');
        setTimeout(() => setMessage(''), 3000);
      }
    });
    setShowModal(true);
  };

  const movePriority = (idx: number, direction: 'up' | 'down') => {
    const newPriority = [...settings.rankingPriority];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newPriority.length) return;
    
    [newPriority[idx], newPriority[targetIdx]] = [newPriority[targetIdx], newPriority[idx]];
    setSettings({ ...settings, rankingPriority: newPriority });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPriority = [...settings.rankingPriority];
    const draggedItem = newPriority[draggedIndex];
    
    newPriority.splice(draggedIndex, 1);
    newPriority.splice(dropIndex, 0, draggedItem);
    
    setSettings({ ...settings, rankingPriority: newPriority });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const priorityLabels: Record<string, string> = {
    points: 'Điểm Số',
    goalDifference: 'Hiệu Số',
    totalGoals: 'Tổng Bàn Thắng',
    awayGoals: 'Bàn Thắng Sân Khách',
    headToHead: 'Đối Đầu Trực Tiếp'
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Thay Đổi Qui Định</h1>
          {user.role === UserRole.TEAM_OWNER && (
            <p className="text-sm text-amber-600 font-bold mt-2">Chỉ xem được, không thể thay đổi</p>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            disabled={user.role === UserRole.TEAM_OWNER}
            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-5 h-5" /> Reset Mặc Định
          </button>
          <button 
            onClick={handleSave}
            disabled={user.role === UserRole.TEAM_OWNER}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" /> Lưu Thay Đổi
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5" /> {message}
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${user.role === UserRole.TEAM_OWNER ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* QĐ1 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-black flex items-center gap-3"><Users className="w-6 h-6 text-emerald-500" /> Hồ Sơ & Tuổi Cầu Thủ </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuổi Tối Thiểu</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.minAge || ''}
                onChange={e => {
                  const value = e.target.value;
                  setSettings({
                    ...settings,
                    minAge: value === '' ? 0 : parseInt(value) || 0
                  });
                }}
                placeholder="16"
                className="w-full p-3 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuổi Tối Đa</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxAge || ''}
                onChange={e => {
                  const value = e.target.value;
                  setSettings({
                    ...settings,
                    maxAge: value === '' ? 0 : parseInt(value) || 0
                  });
                }}
                placeholder="40"
                className="w-full p-3 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số Cầu Thủ Tối Thiểu</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.minPlayers || ''}
                onChange={e => {
                  const value = e.target.value;
                  setSettings({
                    ...settings,
                    minPlayers: value === '' ? 0 : parseInt(value) || 0
                  });
                }}
                placeholder="15"
                className="w-full p-3 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số Cầu Thủ Tối Đa</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.maxPlayers || ''}
                onChange={e => {
                  const value = e.target.value;
                  setSettings({
                    ...settings,
                    maxPlayers: value === '' ? 0 : parseInt(value) || 0
                  });
                }}
                placeholder="22"
                className="w-full p-3 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số Cầu Thủ Nước Ngoài Tối Đa</label>
              <input
                type="number"
                min="0"
                max="20"
                value={settings.maxForeignPlayers || ''}
                onChange={e => {
                  const value = e.target.value;
                  setSettings({
                    ...settings,
                    maxForeignPlayers: value === '' ? 0 : parseInt(value) || 0
                  });
                }}
                placeholder="3"
                className="w-full p-3 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>
          </div>
        </div>

        {/* QĐ3 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-black flex items-center gap-3"><Goal className="w-6 h-6 text-amber-500" /> Bàn Thắng & Thời Gian </h3>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại Bàn Thắng (phân cách bằng dấu phẩy)</label>
              <input 
                type="text" 
                value={goalTypesInput} 
                onChange={e => setGoalTypesInput(e.target.value)}
                onBlur={() => {
                  const parsed = goalTypesInput.split(',').map(s => s.trim()).filter(s => s !== '');
                  setSettings({...settings, goalTypes: parsed});
                }}
                placeholder="A, B, C"
                className="w-full p-3 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none font-bold uppercase" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời Điểm Ghi Bàn Tối Đa (phút)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min="1" 
                  max="120" 
                  value={settings.maxGoalTime || ''}
                  onChange={e => {
                    const value = e.target.value;
                    setSettings({...settings, maxGoalTime: value === '' ? 0 : parseInt(value) || 0});
                  }}
                  placeholder="90"
                  className="flex-1 p-3 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                <span className="font-bold text-slate-400">phút</span>
              </div>
            </div>
          </div>
        </div>

        {/* QĐ5 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-black flex items-center gap-3"><TrendingUp className="w-6 h-6 text-emerald-500" /> Điểm Số & Xếp Hạng </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-700">Điểm số từng trận</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase">Thắng</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="10" 
                    value={settings.pointsWin || ''}
                    onChange={e => {
                      const value = e.target.value;
                      setSettings({...settings, pointsWin: value === '' ? 0 : parseInt(value) || 0});
                    }}
                    placeholder="3"
                    className="w-full p-3 bg-emerald-50 text-emerald-700 rounded-xl border-emerald-100 font-black text-center" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-amber-600 uppercase">Hòa</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="10" 
                    value={settings.pointsDraw || ''}
                    onChange={e => {
                      const value = e.target.value;
                      setSettings({...settings, pointsDraw: value === '' ? 0 : parseInt(value) || 0});
                    }}
                    placeholder="1"
                    className="w-full p-3 bg-amber-50 text-amber-700 rounded-xl border-amber-100 font-black text-center" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-rose-600 uppercase">Thua</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="10" 
                    value={settings.pointsLoss || ''}
                    onChange={e => {
                      const value = e.target.value;
                      setSettings({...settings, pointsLoss: value === '' ? 0 : parseInt(value) || 0});
                    }}
                    placeholder="0"
                    className="w-full p-3 bg-rose-50 text-rose-700 rounded-xl border-rose-100 font-black text-center" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-700">Thứ tự ưu tiên xếp hạng (Kéo thả/Mũi tên)</p>
              <div className="space-y-2">
                {settings.rankingPriority.map((p, i) => (
                  <div 
                    key={p} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 bg-slate-50 border rounded-xl cursor-move transition-all ${
                      draggedIndex === i ? 'opacity-50 scale-95' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                      <span className="text-sm font-bold text-slate-700">{priorityLabels[p]}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => movePriority(i, 'up')} className="p-1.5 hover:bg-slate-200 rounded-lg disabled:opacity-20" disabled={i === 0}><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => movePriority(i, 'down')} className="p-1.5 hover:bg-slate-200 rounded-lg disabled:opacity-20" disabled={i === settings.rankingPriority.length - 1}><ChevronDown className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
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

export default SettingsPage;
