import React, { useRef, useState } from 'react';
import { User, UserRole } from '../types';
import {
  ChevronDown,
  ShieldHalf,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface RegisterPageProps {
  onBack: () => void;
  onRegisterSuccess: (user: any) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onRegisterSuccess }) => {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    birthday: '',
    role: UserRole.VIEWER,
    password: '',
    confirmPassword: '',
  });

  const [roleOpen, setRoleOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const birthdayInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pw: string) => {
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    return pw.length >= 8 && hasLetter && hasNumber;
  };

  const handleOpenPicker = () => {
    // optional helper; safe on browsers that support it
    if (birthdayInputRef.current && 'showPicker' in birthdayInputRef.current) {
      try {
        (birthdayInputRef.current as any).showPicker();
      } catch {
        birthdayInputRef.current.focus();
      }
    } else {
      birthdayInputRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (Object.values(form).some((v) => v === '')) {
      setError('Vui lòng điền đầy đủ tất cả thông tin');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Mật khẩu phải tối thiểu 8 ký tự, gồm cả chữ cái và số!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success) {
        setError(data.error || 'Lỗi đăng ký tài khoản');
        return;
      }

      // nếu backend trả token sau khi register thì lưu luôn
      if (data.token) localStorage.setItem('vleague_token', data.token);

      onRegisterSuccess(data.user);
    } catch (err) {
      setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
      <div className="max-w-5xl w-full bg-white rounded-[40px] shadow-2xl shadow-emerald-900/10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left: Welcome area */}
        <div className="flex-1 bg-gradient-to-br from-emerald-600 to-emerald-700 p-12 flex flex-col items-center justify-center text-center text-white relative">
          <div className="absolute top-10 left-10 opacity-20">
            <ShieldHalf className="w-24 h-24" />
          </div>

          <h2 className="text-4xl font-black mb-6">Chào mừng trở lại!</h2>
          <p className="text-emerald-100 font-medium mb-10 leading-relaxed max-w-xs">
            Đăng nhập để sử dụng toàn bộ tính năng của hệ thống.
          </p>

          <button
            onClick={onBack}
            className="px-10 py-3 bg-white text-emerald-700 hover:bg-emerald-50 rounded-full font-black shadow-lg shadow-emerald-900/25 transition-all"
          >
            Đăng nhập
          </button>
        </div>

        {/* Right: Registration form */}
        <div className="flex-[1.5] p-12 overflow-y-auto max-h-[95vh] scrollbar-hide">
          <h1 className="text-3xl font-black text-emerald-900 mb-2">Tạo tài khoản</h1>
          <p className="text-emerald-500 font-medium mb-8 text-sm opacity-70">
            Điền thông tin cá nhân để kích hoạt quyền truy cập.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {error && (
              <div className="col-span-2 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">
                Tên tài khoản
              </label>
              <input
                type="text"
                placeholder="Nhập tên tài khoản"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl outline-none text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl outline-none text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl outline-none text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">
                Ngày sinh
              </label>
              <div className="relative">
                <input
                  ref={birthdayInputRef}
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                  className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl outline-none text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 font-medium cursor-text"
                  onClick={handleOpenPicker}
                />
              </div>
            </div>

            <div className="col-span-2 space-y-1 relative">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">
                Chọn chức vụ (tùy chọn)
              </label>

              {/* Trigger */}
              <button
                type="button"
                onClick={() => setRoleOpen((v) => !v)}
                className="
                  w-full px-4 py-3 rounded-xl border
                  bg-emerald-50/50 border-emerald-100
                  text-left font-medium text-emerald-900
                  flex items-center justify-between
                  focus:ring-2 focus:ring-emerald-500/20
                "
              >
                <span>
                  {form.role === UserRole.VIEWER && 'Người xem'}
                  {form.role === UserRole.TEAM_OWNER && 'Chủ đội bóng'}
                  {form.role === UserRole.ADMIN && 'Ban điều hành giải'}
                </span>

                <ChevronDown className={`w-5 h-5 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              <div
                className={`
                  absolute z-20 mt-2 w-full rounded-2xl overflow-hidden
                  bg-white border border-emerald-100 shadow-xl
                  transition-all duration-200 origin-top
                  ${roleOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                `}
              >
                {[
                  { label: 'Người xem', value: UserRole.VIEWER },
                  { label: 'Chủ đội bóng', value: UserRole.TEAM_OWNER },
                  { label: 'Ban điều hành giải', value: UserRole.ADMIN },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, role: opt.value });
                      setRoleOpen(false);
                    }}
                    className="
                      w-full px-4 py-3 text-left text-sm font-semibold
                      hover:bg-emerald-50 text-emerald-800
                      transition-colors
                    "
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">
                Mật khẩu
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-4 pr-12 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl outline-none text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-700 hover:text-emerald-900 bg-emerald-200 rounded-lg border border-emerald-300 shadow-sm"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">
                Xác nhận mật khẩu
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-4 pr-12 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl outline-none text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-700 hover:text-emerald-900 bg-emerald-200 rounded-lg border border-emerald-300 shadow-sm"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="col-span-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;