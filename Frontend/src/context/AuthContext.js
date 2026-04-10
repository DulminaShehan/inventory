import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user]  = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [token] = useState(() => localStorage.getItem('token'));

  const login = (userData, jwt) => {
    localStorage.setItem('user',  JSON.stringify(userData));
    localStorage.setItem('token', jwt);
    window.location.href = '/';
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
