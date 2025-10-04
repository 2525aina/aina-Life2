"use client";

import { useCallback } from 'react';
import { useUser } from './useUser';

export const useTaskLoggerSettings = () => {
  const { userProfile, updateUserProfile, loading } = useUser();

  const settings = userProfile?.settings?.taskLogger;

  const updateSettings = useCallback(async (newSettings: Partial<typeof settings>) => {
    if (!userProfile) return;

    const currentTaskLoggerSettings = userProfile.settings?.taskLogger || {
      showDateTime: true,
      showMemo: true,
      initialDateTimeOpen: true,
      initialMemoOpen: true,
    };

    await updateUserProfile({
      settings: {
        ...userProfile.settings,
        taskLogger: {
          ...currentTaskLoggerSettings,
          ...newSettings,
        },
      },
    });
  }, [userProfile, updateUserProfile]);

  return { settings, updateSettings, loading };
};
