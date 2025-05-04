import { createContext, useContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  loginWithRedirect: () => void;
  logout: () => void;
  getToken: () => Promise<string | undefined>;
  userId?: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
