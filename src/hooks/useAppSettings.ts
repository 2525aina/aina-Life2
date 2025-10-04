import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

// Define the interface for your global app settings
export interface AppSettings {
  initialPetName: string;
  defaultWeightUnit: 'kg' | 'g' | 'lb';
  maxPetsPerUser: number;
  welcomeMessage: string;
  // Add other settings as needed
}

const SETTINGS_DOC_PATH = 'appSettings/global';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, SETTINGS_DOC_PATH);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as AppSettings);
      } else {
        // If the document doesn't exist, initialize with default values
        const defaultSettings: AppSettings = {
          initialPetName: '新しいペット',
          defaultWeightUnit: 'kg',
          maxPetsPerUser: 5,
          welcomeMessage: 'Aina Lifeへようこそ！',
        };
        setDoc(docRef, defaultSettings, { merge: true })
          .then(() => setSettings(defaultSettings))
          .catch((err) => {
            console.error("Error initializing app settings:", err);
            setError(err);
          });
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching app settings:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!settings) {
      toast.error("設定が読み込まれていません。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, SETTINGS_DOC_PATH);
      await updateDoc(docRef, { [key]: value });
      toast.success(`${key} を更新しました。`);
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error(`Error updating setting ${key}:`, err);
      setError(err instanceof Error ? err : new Error(String(err))); // Handle unknown error type
      toast.error(`設定 ${key} の更新に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    if (!settings) {
      toast.error("設定が読み込まれていません。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, SETTINGS_DOC_PATH);
      await updateDoc(docRef, newSettings);
      toast.success("設定を更新しました。");
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error("Error updating app settings:", err);
      setError(err instanceof Error ? err : new Error(String(err))); // Handle unknown error type
      toast.error(`設定の更新に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  return { settings, loading, error, updateSetting, updateSettings };
};
