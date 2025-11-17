const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Simpan token ke localStorage
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Ambil token dari localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Hapus token (untuk logout)
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Cek apakah user sudah login
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Simpan data user
export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Ambil data user
export const getUser = (): any | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};