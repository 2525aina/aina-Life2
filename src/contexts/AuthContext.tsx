"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean; // Added isAdmin property
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false, // Default to false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Added isAdmin state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => { // Changed to async
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh token to get latest claims
        setIsAdmin(!!idTokenResult.claims.admin); // Check for 'admin' custom claim
      } else {
        setIsAdmin(false);
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading, isAdmin }; // Included isAdmin in the context value

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
