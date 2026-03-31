import { API_BASE_URL } from '../config';

// ...
const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form) // giữ password + confirmPassword plain
});