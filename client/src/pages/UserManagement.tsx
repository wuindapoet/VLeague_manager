
import React, { useState, useEffect } from 'react';
import { User, UserRole, LeagueSettings } from '../types';
import { 
  UserCog, Trash2, Search, Shield, ShieldCheck, 
  Loader2, WifiOff, Lock, CheckCircle2, XCircle
} from 'lucide-react';

interface UserManagementProps {
  leagueData: { teams: any[]; matches: any[]; settings: LeagueSettings };
  onUpdateSettings: (newSettings: LeagueSettings) => void;
  user: User;
}

const UserManagementPage: React.FC<UserManagementProps> = ({ leagueData, onUpdateSettings, user }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setIsOffline(false);
    try {
      const res = await fetch('http://localhost:3000/api/users');
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setUsers(data);
      localStorage.setItem('vleague_user_registry_backup', JSON.stringify(data));
    } catch (err) {
      console.warn("Using local user registry fallback");
      setIsOffline(true);
      const localUsersJson = localStorage.getItem('vleague_local_users');
      const registryBackupJson = localStorage.getItem('vleague_user_registry_backup');
      let combinedUsers: User[] = [];
      if (registryBackupJson) combinedUsers = JSON.parse(registryBackupJson);
      if (localUsersJson) {
        const localOnly = JSON.parse(localUsersJson);
        localOnly.forEach((lu: User) => {
          if (!combinedUsers.some(cu => cu.username === lu.username)) {
            combinedUsers.push(lu);
          }
        });
      }
      setUsers(combinedUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (userId: string, newRole: UserRole) => {
    if (userId === user.id) {
      alert('Bạn không thể thay đổi quyền của chính mình!');
      return;
    }
    if (user.role !== UserRole.ADMIN) {
      alert('Chỉ Ban điều hành giải mới có thể thay đổi quyền của người dùng!');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('API Error');
      fetchUsers();
    } catch (err) {
      const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      setUsers(updated);
      const localUsersJson = localStorage.getItem('vleague_local_users');
      if (localUsersJson) {
        const localUsers: User[] = JSON.parse(localUsersJson);
        const newLocal = localUsers.map(u => u.id === userId ? { ...u, role: newRole } : u);
        localStorage.setItem('vleague_local_users', JSON.stringify(newLocal));
      }
    }
  };

  const togglePermission = (featureId: string, role: UserRole) => {
    const currentAllowed = leagueData.settings.rolePermissions[featureId] || [];
    let newAllowed;
    if (currentAllowed.includes(role)) {
      newAllowed = currentAllowed.filter(r => r !== role);
    } else {
      newAllowed = [...currentAllowed, role];
    }
    
    onUpdateSettings({
      ...leagueData.settings,
      rolePermissions: {
        ...leagueData.settings.rolePermissions,
        [featureId]: newAllowed
      }
    });
  };

  const features = [
    { id: 'dashboard', name: 'Trang chủ' },
    { id: 'teams', name: 'Danh sách & Đăng ký đội' },
    { id: 'schedule', name: 'Quản lý lịch thi đấu' },
    { id: 'results', name: 'Ghi nhận kết quả' },
    { id: 'standings', name: 'Xem bảng xếp hạng' },
    { id: 'search', name: 'Tra cứu cầu thủ' },
    { id: 'settings', name: 'Cài đặt giải đấu' },
    { id: 'users', name: 'Quản lý người dùng' },
  ];

  const roles = [UserRole.ADMIN, UserRole.TEAM_OWNER, UserRole.VIEWER];

  const filtered = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            Quản trị hệ thống
            {isOffline && <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1 font-bold animate-pulse"><WifiOff className="w-3 h-3" /> Offline</span>}
          </h1>
          <p className="text-slate-500">Quản lý người dùng và cấu hình quyền hạn truy cập tính năng.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-8 py-4 text-sm font-black transition-all border-b-2 ${activeTab === 'users' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          DANH SÁCH TÀI KHOẢN
        </button>
        <button 
          onClick={() => setActiveTab('permissions')}
          className={`px-8 py-4 text-sm font-black transition-all border-b-2 ${activeTab === 'permissions' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          CẤU HÌNH TRUY CẬP
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="p-6 border-b flex items-center gap-4 bg-slate-50/50">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-sm"
                placeholder="Tìm tên hoặc username..."
              />
            </div>
            <button onClick={fetchUsers} className="p-3 bg-white border rounded-xl hover:bg-slate-50 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-emerald-500" />}
            </button>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-8 py-5">Thành viên</th>
                <th className="px-8 py-5">Phân loại quyền</th>
                <th className="px-8 py-5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-700">
                        {u.fullName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.fullName}</p>
                        <p className="text-xs text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value as UserRole)}
                      disabled={u.id === user.id || user.role !== UserRole.ADMIN}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border outline-none transition-all ${
                        u.id === user.id || user.role !== UserRole.ADMIN ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      } ${
                        u.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        u.role === UserRole.TEAM_OWNER ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <option value={UserRole.ADMIN}>Ban điều hành giải</option>
                      <option value={UserRole.TEAM_OWNER}>Chủ đội bóng</option>
                      <option value={UserRole.VIEWER}>Người xem</option>
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <span className="text-[10px] font-black px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="p-8 border-b bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              Ma trận phân quyền tính năng
            </h3>
            <p className="text-sm text-slate-500 mt-1">Tick chọn để cho phép Role được phép truy cập vào mục tương ứng.</p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-8 py-5">Tính năng hệ thống</th>
                {roles.map(role => (
                  <th key={role} className="px-8 py-5 text-center">{role}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {features.map(feature => (
                <tr key={feature.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-700">{feature.name}</span>
                  </td>
                  {roles.map(role => {
                    const isAllowed = (leagueData.settings.rolePermissions[feature.id] || []).includes(role);
                    const isAdminRequired = feature.id === 'users' || feature.id === 'settings';
                    
                    return (
                      <td key={role} className="px-8 py-5 text-center">
                        <button
                          onClick={() => togglePermission(feature.id, role)}
                          disabled={role === UserRole.ADMIN && isAdminRequired}
                          className={`p-2 rounded-xl transition-all ${isAllowed ? 'text-emerald-600 bg-emerald-50' : 'text-slate-200 hover:text-slate-300'}`}
                        >
                          {isAllowed ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <XCircle className="w-6 h-6" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
