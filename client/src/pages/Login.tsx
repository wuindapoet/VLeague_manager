import { API_BASE_URL } from '../config';

// ...

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!username || !password) {
    setError('Vui lòng điền đầy đủ thông tin');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json().catch(() => ({}));
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