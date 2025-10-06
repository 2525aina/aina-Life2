import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  authEmail: string;
  authName?: string;
  nickname?: string;
  profileImageUrl?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  introduction?: string;
  primaryPetId?: string;
  lastLoginAt?: Timestamp;
  authProvider?: string | null;
  fcmTokens?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
      settings: {
        notifications: {
          dailySummary: boolean;
        };
        theme: 'system' | 'light' | 'dark';
        timeFormat?: 'HH:mm:ss' | 'H:m:s' | 'HH:mm' | 'H:m';
        toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
        logDisplayColors?: {
          enabled?: boolean;
          creatorNameBg?: string;
          creatorNameText?: string;
          timeBg?: string;
          timeText?: string;
          deletedTaskBg?: string;
          deletedTaskText?: string;
        };
        taskLogger?: {
          showDateTime: boolean;
          showMemo: boolean;
          initialDateTimeOpen: boolean;
          initialMemoOpen: boolean;
        };
      };
}
