'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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
      if (docSnap.exists()) {
        setUserProfile({ uid: user.uid, ...(docSnap.data() as Omit<UserProfile, 'uid'>) });
      } else {
        // Create a new profile if it doesn't exist
        const newProfile: UserProfile = {
          uid: user.uid,
          authEmail: user.email || '',
          authName: user.displayName || '',
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
        setUserProfile(newProfile);
      }
      setLoading(false);
    };

    fetchProfile();

    // Optionally, listen for real-time updates
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
    // Optimistically update state
    setUserProfile(prev => prev ? { ...prev, ...data, updatedAt: serverTimestamp() as Timestamp } : null);
  }, [user]);

  return { userProfile, loading, updateUserProfile };
};
