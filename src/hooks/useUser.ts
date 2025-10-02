'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserInfo } from "firebase/auth";

export interface UserProfile {
  uid: string; // Corresponds to Firebase Auth uid, also the document ID
  authEmail: string;
  authName?: string; // Name from auth provider
  nickname?: string; // User's preferred display name
  profileImageUrl?: string; // URL to profile picture
  birthday?: string; // YYYY-MM-DD format
  gender?: 'male' | 'female' | 'other';
  introduction?: string;
  primaryPetId?: string;
  lastLoginAt?: Timestamp; // Timestamp of last login
  authProvider?: string | null; // New field for authentication provider name
  createdAt: Timestamp;
  updatedAt: Timestamp;
      settings: {
        notifications: {
          dailySummary: boolean;
        };
        theme: 'system' | 'light' | 'dark';
        toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'; // New field for toast position
        logDisplayColors?: {
          enabled?: boolean;
          creatorNameBg?: string;
          creatorNameText?: string;
          timeBg?: string;
          timeText?: string;
          deletedTaskBg?: string; // New field for deleted task background color
          deletedTaskText?: string; // New field for deleted task text color
        };
      };}

export const useUser = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);

    const fetchProfile = async () => {
      const docSnap = await getDoc(userDocRef);

      // Helper functions
      const getProviderName = (providerId: string) => {
        if (providerId === 'google.com') return 'Google認証';
        if (providerId === 'password') return 'メール認証';
        return providerId;
      };

      const getAuthNamePart = (provider: UserInfo): string | null => {
          if (provider.providerId === 'password') return 'mailUser';
          if (provider.providerId === 'google.com') return provider.displayName;
          return null;
      }

      if (docSnap.exists()) {
        // UPDATE EXISTING USER
        const existingProfile = docSnap.data() as Omit<UserProfile, 'uid'>;
        const updatedData: Partial<UserProfile> = {};

        if (user.isAnonymous) {
            if (existingProfile.authEmail !== 'アカウント未登録者') updatedData.authEmail = 'アカウント未登録者';
            if (existingProfile.authName !== 'ゲストユーザー') updatedData.authName = 'ゲストユーザー';
            if (existingProfile.authProvider !== '匿名認証') updatedData.authProvider = '匿名認証';
        } else {
            // Handle regular and linked accounts
            const providerNames = user.providerData.map(p => getProviderName(p.providerId)).filter(p => p !== null).sort();
            const newAuthProvider = providerNames.join('&');

            const authNameParts = user.providerData.map(p => getAuthNamePart(p)).filter(p => p !== null).sort();
            const newAuthName = authNameParts.join('&');

            if (user.email && existingProfile.authEmail !== user.email) {
                updatedData.authEmail = user.email;
            }
            if (newAuthName && existingProfile.authName !== newAuthName) {
                updatedData.authName = newAuthName;
            }
            if (newAuthProvider && existingProfile.authProvider !== newAuthProvider) {
                updatedData.authProvider = newAuthProvider;
            }
        }

        if (Object.keys(updatedData).length > 0) {
          await updateDoc(userDocRef, { ...updatedData, updatedAt: serverTimestamp() });
        }
        // The onSnapshot listener will update the state
      } else {
        // CREATE NEW USER
        let authProviderName: string | null;
        let authName: string;
        let authEmail: string;

        if (user.isAnonymous) {
            authEmail = 'アカウント未登録者';
            authName = 'ゲストユーザー';
            authProviderName = '匿名認証';
        } else {
            authEmail = user.email || '';
            const providerId = user.providerData[0]?.providerId;
            if (providerId === 'password') {
                authName = 'mailUser';
                authProviderName = 'メール認証';
            } else if (providerId === 'google.com') {
                authName = user.displayName || '';
                authProviderName = 'Google認証';
            } else {
                // Fallback for other providers
                authName = user.displayName || '';
                authProviderName = providerId ? getProviderName(providerId) : null;
            }
        }

        const newProfile: UserProfile = {
          uid: user.uid,
          authEmail: authEmail,
          authName: authName,
          authProvider: authProviderName,
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          settings: {
            notifications: {
              dailySummary: false,
            },
            theme: 'system',
          },
        };
        await setDoc(userDocRef, newProfile);
      }
      setLoading(false);
    };

    fetchProfile();

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserProfile({ uid: user.uid, ...(doc.data() as Omit<UserProfile, 'uid'>) });
      }
    });
    return () => unsubscribe();

  }, [user]);

  const updateUserProfile = useCallback(async (data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'authEmail'>>) => {
    if (!user) throw new Error('ユーザーが認証されていません。');
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, [user]);

  return { userProfile, loading, updateUserProfile };
};