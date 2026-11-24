import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/endpoints';
import { tokenStore, UNAUTHORIZED_EVENT } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  // Restore the session from a saved token.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi.me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const login = async (username, password) => {
    const { token, user: u } = await authApi.login(username, password);
    tokenStore.set(token);
    setUser(u);
    return u;
  };

  const signup = async (data) => {
    await authApi.signup(data);
    return login(data.username, data.password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
