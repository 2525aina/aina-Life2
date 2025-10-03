
"use client";

import { useCallback } from 'react';
import { useUser } from './useUser';

export const useTaskLoggerSettings = () => {
  const { userProfile, updateUserProfile, loading } = useUser();

  const settings = userProfile?.settings?.taskLogger;

  const updateSettings = useCallback(async (newSettings: Partial<typeof settings>) => {
    if (!userProfile) return;

    await updateUserProfile({
      ...userProfile,
      settings: {
        ...userProfile.settings,
        taskLogger: {
          ...userProfile.settings.taskLogger,
          ...newSettings,
        },
      },
    });
  }, [userProfile, updateUserProfile]);

  return { settings, updateSettings, loading };
};
