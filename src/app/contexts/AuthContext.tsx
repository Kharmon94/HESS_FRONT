import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../data/users";
import { api, getStoredToken, setStoredToken } from "@/services/api";
import { userFromApi } from "@/utils/mapUser";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }
    const res = await api.me();
    setCurrentUser(userFromApi(res.user));
  };

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser()
      .catch(() => {
        setStoredToken(null);
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setStoredToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
