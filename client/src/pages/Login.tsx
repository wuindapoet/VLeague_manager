import React, { useState } from 'react';
import { ShieldHalf, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: any) => void;
  onGoRegister: () => void;
}

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
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success) {
        setError(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác');
        return;
      }

      if (data.token) localStorage.setItem('vleague_token', data.token);
      onLogin(data.user);
    } catch (err) {
      setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Lưu ý: phần JSX bạn giữ UI cũ của bạn, chỉ cần đảm bảo <form onSubmit={handleSubmit}> và nút type="submit"
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl shadow-emerald-900/10 overflow-hidden flex flex-col md:flex-row min-h-[520px]">
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <ShieldHalf className="w-10 h-10 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-black text-slate-900">Đăng nhập</h1>
              <p className="text-sm text-slate-500">V-League 2026 Manager</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                placeholder="Username"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                placeholder="Mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black"
            >
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</span> : 'Đăng nhập'}
            </button>

            <button
              type="button"
              onClick={onGoRegister}
              className="w-full py-3 rounded-xl bg-white border border-slate-200 font-black text-slate-700"
            >
              Tạo tài khoản
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;