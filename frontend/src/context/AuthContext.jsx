import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [userToken, setUserToken] = useState(() => localStorage.getItem('userToken') || null);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const userLogin = (newToken) => {
    localStorage.setItem('userToken', newToken);
    setUserToken(newToken);
  };

  const userLogout = () => {
    localStorage.removeItem('userToken');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuth: !!token,
        userToken,
        userLogin,
        userLogout,
        isUser: !!userToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
