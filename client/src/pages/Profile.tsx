
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  UserCircle, Save, KeyRound, AlertCircle, 
  CheckCircle2, Mail, Calendar, Shield, Eye, EyeOff, Loader2 
} from 'lucide-react';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const hashPassword = async (password: string) => {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName,
    email: user.email,
    birthday: user.birthday,
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUser = { ...user, ...profileForm };
      
      // Update local storage
      const localUsersJson = localStorage.getItem('vleague_local_users');
      if (localUsersJson) {
        const localUsers: User[] = JSON.parse(localUsersJson);
        const updatedList = localUsers.map(u => u.username === user.username ? updatedUser : u);
        localStorage.setItem('vleague_local_users', JSON.stringify(updatedList));
      }

      onUpdateUser(updatedUser);
      setMessage({ text: 'Cập nhật thông tin thành công!', type: 'success' });
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }, 800);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      setMessage({ text: 'Vui lòng nhập đầy đủ thông tin để thay đổi mật khẩu!', type: 'error' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setMessage({ text: 'Mật khẩu mới không khớp', type: 'error' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ text: 'Mật khẩu mới phải có ít nhất 8 ký tự', type: 'error' });
      return;
    }

    setLoading(true);
    const hashedOld = await hashPassword(passwordForm.oldPassword);
    
    // Check old password
    const localUsersJson = localStorage.getItem('vleague_local_users');
    let localUsers: User[] = localUsersJson ? JSON.parse(localUsersJson) : [];
    
    // Assume admin default password is "Password123" hashed
    const targetUser = localUsers.find(u => u.username === user.username) || (user.username === 'admin' ? user : null);
    
    if (user.username === 'admin' && hashedOld !== "ef92b778baac7713c8a68886f330ad3d6e53c44c520a271253e6b772c686f05f") {
       // ef92... là hash của Password123
       setMessage({ text: 'Mật khẩu cũ không chính xác!', type: 'error' });
       setLoading(false);
       return;
    }

    if (targetUser && targetUser.password && hashedOld !== targetUser.password) {
      setMessage({ text: 'Mật khẩu cũ không chính xác!', type: 'error' });
      setLoading(false);
      return;
    }

    // Change password
    const hashedNew = await hashPassword(passwordForm.newPassword);
    const updatedUser = { ...user, password: hashedNew };

    const updatedList = localUsers.map(u => u.username === user.username ? updatedUser : u);
    localStorage.setItem('vleague_local_users', JSON.stringify(updatedList));
    
    onUpdateUser(updatedUser);
    setMessage({ text: 'Đổi mật khẩu thành công!', type: 'success' });
    setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    setLoading(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[40px] p-10 border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[32px] bg-emerald-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-emerald-600/30">
            {user.fullName[0]}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-white">
            <UserCircle className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black text-emerald-900 mb-2">{user.fullName}</h1>
          <div className="flex flex-wrap gap-4 items-center text-slate-500">
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-100 uppercase tracking-widest">
               <Shield className="w-3.5 h-3.5" /> {user.role}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Mail className="w-4 h-4 text-emerald-500" /> {user.email}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Calendar className="w-4 h-4 text-emerald-500" /> {new Date(user.birthday).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-2xl flex items-center gap-4 border animate-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <p className="font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Edit */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <UserCircle className="w-7 h-7 text-emerald-600" />
            Chỉnh sửa thông tin
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Họ và tên</label>
              <input 
                type="text"
                value={profileForm.fullName}
                onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
              <input 
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ngày sinh</label>
              <input 
                type="date"
                value={profileForm.birthday}
                onChange={e => setProfileForm({...profileForm, birthday: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Lưu thay đổi</>}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <KeyRound className="w-7 h-7 text-amber-500" />
            Đổi mật khẩu
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mật khẩu cũ</label>
              <div className="relative">
                <input 
                  type={showOldPw ? "text" : "password"}
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  className="w-full p-4 bg-amber-50/50 border border-amber-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold"
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm border border-amber-200">
                  {showOldPw ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-amber-600" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mật khẩu mới</label>
              <div className="relative">
                <input 
                  type={showNewPw ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                  placeholder="Ít nhất 8 ký tự"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm border border-emerald-200">
                  {showNewPw ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input 
                  type={showConfirmPw ? "text" : "password"}
                  value={passwordForm.confirmNewPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})}
                  className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm border border-emerald-200">
                  {showConfirmPw ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-5 h-5" /> Thay đổi mật khẩu</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
