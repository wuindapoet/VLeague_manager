
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Calendar, Settings as SettingsIcon, Search, 
  ClipboardCheck, TrendingUp, Menu, ShieldHalf, 
  LayoutDashboard, LogOut, UserCog, UserCircle,
  Balloon
} from 'lucide-react';
import { Team, Match, LeagueSettings, User, UserRole } from './types';
import { loadData, saveData, DEFAULT_SETTINGS } from './store';
import toast, { Toaster } from 'react-hot-toast';

// Pages
import Dashboard from './pages/Dashboard';
import TeamsPage from './pages/Teams';
import ClubsPage from './pages/Clubs';
import SchedulePage from './pages/Schedule';
import ResultsPage from './pages/Results';
import StandingsPage from './pages/Standings';
import SettingsPage from './pages/Settings';
import SearchPage from './pages/Search';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import UserManagementPage from './pages/UserManagement';
import ProfilePage from './pages/Profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vleague_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showRegister, setShowRegister] = useState(false);
  const [leagueData, setLeagueData] = useState<{teams: Team[], matches: Match[], settings: LeagueSettings}>({
    teams: [], matches: [], settings: DEFAULT_SETTINGS
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then(data => {
      // Ensure rolePermissions always exist
      if (!data.settings?.rolePermissions) {
        data.settings = { ...data.settings, rolePermissions: DEFAULT_SETTINGS.rolePermissions };
      }
      setLeagueData(data);
      setLoading(false);
    });
  }, []);

  const updateData = async (newData: Partial<typeof leagueData>) => {
    const updated = { ...leagueData, ...newData };
    setLeagueData(updated);
    await saveData(updated);
    
    // Show toast notifications for data changes
    if (newData.matches && newData.matches.length > leagueData.matches.length) {
      toast.success('Trận đấu mới đã được thêm vào!');
    }
    if (newData.teams && newData.teams.length > leagueData.teams.length) {
      toast.success('Đội bóng mới đã được đăng ký!');
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('vleague_user', JSON.stringify(updatedUser));
    toast.success('Thông tin cá nhân đã được cập nhật thành công!');
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-emerald-950 text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold tracking-tighter">V-LEAGUE 2026</h2>
      </div>
    </div>
  );

  if (!currentUser) {
    return showRegister 
      ? <RegisterPage onBack={() => setShowRegister(false)} onRegisterSuccess={(u) => { setCurrentUser(u); localStorage.setItem('vleague_user', JSON.stringify(u)); setShowRegister(false); toast.success(`Chào mừng bạn đến với V-League Manager, ${u.fullName}!`); }} />
      : <LoginPage onLogin={(u) => { setCurrentUser(u); localStorage.setItem('vleague_user', JSON.stringify(u)); toast.success(`Chào mừng quay trở lại, ${u.fullName}!`); }} onGoRegister={() => setShowRegister(true)} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { id: 'teams', label: 'Đăng ký đội bóng', icon: Users },
    { id: 'clubs', label: 'Danh sách Các Đội', icon: Balloon },
    { id: 'schedule', label: 'Lịch thi đấu', icon: Calendar },
    { id: 'results', label: 'Kết quả trận đấu', icon: ClipboardCheck },
    { id: 'standings', label: 'Bảng xếp hạng', icon: TrendingUp },
    { id: 'search', label: 'Tra cứu cầu thủ', icon: Search },
    { id: 'settings', label: 'Cài đặt quy định', icon: SettingsIcon },
    { id: 'users', label: 'Quản trị viên', icon: UserCog },
    { id: 'profile', label: 'Thông tin cá nhân', icon: UserCircle },
  ].filter(item => {
    if (item.id === 'profile') return true;
    return (leagueData.settings.rolePermissions[item.id] || []).includes(currentUser.role);
  });

  return (
    <div className="min-h-screen flex bg-emerald-50 text-slate-900 overflow-hidden font-inter">
      {/* Backdrop - Click to close sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-emerald-900 text-white transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20"><ShieldHalf className="w-8 h-8 text-white" /></div>
            <div><h1 className="text-xl font-black tracking-tight">V-LEAGUE</h1><p className="text-[15px] text-emerald-300 font-black uppercase tracking-[0.2em]">Manager</p></div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-emerald-800 rounded-lg transition-colors lg:hidden"
            title="Đóng menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="mt-6 px-4 space-y-1.5 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 font-bold' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              <item.icon className="w-5 h-5" /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <button onClick={() => { setCurrentUser(null); localStorage.removeItem('vleague_user'); }} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-300 hover:bg-rose-500/10 font-bold border border-rose-500/20 transition-all">
            <LogOut className="w-5 h-5" /> ĐĂNG XUẤT
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 flex items-center justify-between px-10 bg-white border-b border-emerald-100 sticky top-0 z-30">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <h2 className="text-xl font-black text-emerald-900 tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h2>
          <div 
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveTab('profile')}
          >
             <div className="text-right"><p className="text-sm font-black text-slate-900 leading-none mb-1">{currentUser.fullName}</p><p className="text-[10px] text-emerald-600 font-bold uppercase">{currentUser.role}</p></div>
             <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center border-2 border-emerald-200 uppercase">{currentUser.fullName[0]}</div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-10 bg-[#f8faf9] no-print-container">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard data={leagueData} onNavigate={setActiveTab} user={currentUser} />}
            {activeTab === 'teams' && <TeamsPage data={leagueData} onUpdate={updateData} user={currentUser} />}
            {activeTab === 'clubs' && <ClubsPage data={leagueData} />}
            {activeTab === 'schedule' && <SchedulePage data={leagueData} onUpdate={updateData} user={currentUser!} />}
            {activeTab === 'results' && <ResultsPage data={leagueData} onUpdate={updateData} user={currentUser!} />}
            {activeTab === 'standings' && <StandingsPage data={leagueData} />}
            {activeTab === 'search' && <SearchPage data={leagueData} />}
            {activeTab === 'settings' && <SettingsPage data={leagueData} onUpdate={updateData} user={currentUser!} />}
            {activeTab === 'users' && <UserManagementPage leagueData={leagueData} onUpdateSettings={(s) => updateData({ settings: s })} user={currentUser!} />}
            {activeTab === 'profile' && <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} />}
          </div>
        </section>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
};

export default App;