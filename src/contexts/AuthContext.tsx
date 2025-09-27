'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Contextの型定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Contextの作成
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// AuthProviderコンポーネントの定義
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChangedで認証状態の変更を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Contextを使用するためのカスタムフック
export const useAuth = () => {
  return useContext(AuthContext);
};
