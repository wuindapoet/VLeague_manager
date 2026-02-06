
import React, { useState } from 'react';
import { ShieldHalf, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserRole, User } from '../types';

interface LoginPageProps {
  onLogin: (user: any) => void;
  onGoRegister: () => void;
}

// Hàm băm SHA-256
const hashPassword = async (password: string) => {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const hashedPassword = await hashPassword(password);
      
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: hashedPassword })
      });
      
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
        return;
      } else {
        setError(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    } catch (err) {
      console.warn("Backend not reachable, checking local storage...");
      const hashedPassword = await hashPassword(password);
      
      // Fallback 1: Default Admin (P1234567 băm SHA-256)
      const adminHash = "85c7a9da847fe03efb97d62bcbfd4bf7f6b6c41e2cee3206cc60e980ac4b6afb";
      if (username === 'admin' && hashedPassword === adminHash) {
        onLogin({
          id: 'admin-default',
          username: 'admin',
          fullName: 'Hệ Thống Admin',
          role: UserRole.ADMIN
        });
        return;
      }

      // Fallback 2: Check locally registered users
      const localUsersJson = localStorage.getItem('vleague_local_users');
      if (localUsersJson) {
        const localUsers: User[] = JSON.parse(localUsersJson);
        const found = localUsers.find(u => u.username === username && u.password === hashedPassword);
        if (found) {
          onLogin(found);
          return;
        }
      }
      
      setError('Sai tài khoản/mật khẩu hoặc máy chủ đang bảo trì');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl shadow-emerald-900/10 overflow-hidden flex flex-col md:flex-row min-h-[520px]">

        {/* Left Side: Login Form */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-emerald-900 mb-2">
              Đăng nhập
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 border border-rose-200 text-sm font-bold animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-emerald-900 bg-emerald-50/50 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                placeholder="Email hoặc tên đăng nhập"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-16 py-4 text-emerald-900 bg-emerald-50/50 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                placeholder="Mật khẩu"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-emerald-700 hover:text-emerald-900 transition-colors bg-emerald-200 rounded-xl border border-emerald-300 shadow-sm z-10"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Đăng nhập'}
            </button>
          </form>
        </div>

        {/* Right Side: Welcome */}
        <div className="flex-1 bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 p-12 md:p-16 flex flex-col items-center justify-center text-center text-white relative">
          <div className="absolute top-10 left-10 opacity-20">
            <ShieldHalf className="w-24 h-24" />
          </div>

          <h2 className="text-5xl font-black mb-6 leading-tight">
            Xin chào!
          </h2>

          <p className="text-emerald-100 font-medium mb-12 text-lg leading-relaxed max-w-sm">
            Chưa có tài khoản? Đăng ký ngay để theo dõi giải đấu ngay hôm nay!
          </p>
          <button
            onClick={onGoRegister}
            className="px-12 py-4 bg-white text-emerald-700 hover:bg-emerald-50 rounded-full font-black shadow-lg shadow-emerald-900/25 transition-all"
          >
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
