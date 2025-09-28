'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { usePetSelection } from '@/contexts/PetSelectionContext';
import { Task } from './useTasks';
import { UserProfile } from './useUser';

// ログデータ型定義
export interface Log {
  id: string;
  petId: string;
  taskId: string;
  taskName: string;
  timestamp: Timestamp;
  note?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  taskColor?: string;
  taskTextColor?: string;
  deleted?: boolean; // 論理削除フラグ (ログ自体の削除用)
  deletedAt?: Timestamp | null; // 削除日時 (ログ自体の削除用)
  isTaskDeleted?: boolean; // 関連タスクが削除されているか
  createdByName?: string; // ログを作成したユーザーの表示名
  updatedByName?: string; // ログを更新したユーザーの表示名
  creatorNameBgColor?: string;
  creatorNameTextColor?: string;
  timeBgColor?: string;
  timeTextColor?: string;
}

// ログの追加、更新、削除アクションを提供するフック
export const useLogActions = () => {
  const { user } = useAuth();
  const { selectedPet } = usePetSelection();

  // ログを追加
  const addLog = useCallback(async (task: Task, timestamp?: Date, note?: string) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    
    const logData = {
      petId: selectedPet.id,
      taskId: task.id,
      taskName: task.name,
      timestamp: timestamp ? Timestamp.fromDate(timestamp) : serverTimestamp(),
      note: note || '',
      createdBy: user.uid,
      updatedBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const logsCollection = collection(db, 'dogs', selectedPet.id, 'logs');
    await addDoc(logsCollection, logData);
  }, [user, selectedPet]);

  // ログを更新
  const updateLog = useCallback(async (logId: string, updatedData: Partial<Omit<Log, 'id' | 'petId' | 'createdBy' | 'createdAt'>>) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    const logRef = doc(db, 'dogs', selectedPet.id, 'logs', logId);
    await updateDoc(logRef, {
      ...updatedData,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
      // timestampがDateオブジェクトで渡された場合、Timestamp型に変換
      ...(updatedData.timestamp && { timestamp: updatedData.timestamp }),
    });
  }, [user, selectedPet]);

  // ログを削除
  const deleteLog = useCallback(async (logId: string) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    if (!confirm('本当にこのログを削除しますか？')) return;
    const logRef = doc(db, 'dogs', selectedPet.id, 'logs', logId);
    await deleteDoc(logRef);
  }, [user, selectedPet]);

  return { addLog, updateLog, deleteLog };
};

// 特定の日付のログをフェッチするフック
export const useLogs = (targetDate: Date) => {
  const { user } = useAuth();
  const { selectedPet } = usePetSelection();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !selectedPet) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const petId = selectedPet.id;

    // 日付範囲を設定
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const logsCollection = collection(db, 'dogs', petId, 'logs');
    const logsQuery = query(
      logsCollection,
      where('timestamp', '>=', startOfDay),
      where('timestamp', '<=', endOfDay),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(logsQuery, async (snapshot) => {
      const fetchedLogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Log, 'id'>),
      }));

      const uniqueUserIds = Array.from(new Set([
        ...fetchedLogs.map(log => log.createdBy),
        ...fetchedLogs.map(log => log.updatedBy) // Include updatedBy
      ]));
      const userProfilesCache: { [uid: string]: UserProfile } = {};

      // Fetch all unique user profiles
      const userProfilePromises = uniqueUserIds.map(async (uid) => {
        if (uid) {
          const userProfileRef = doc(db, 'users', uid);
          const userProfileSnap = await getDoc(userProfileRef);
          if (userProfileSnap.exists()) {
            userProfilesCache[uid] = userProfileSnap.data() as UserProfile;
          }
        }
      });
      await Promise.all(userProfilePromises);

      const enrichedLogsPromises = fetchedLogs.map(async (logData) => {
        // Get createdByName from cache
        let createdByName: string | undefined;
        if (logData.createdBy && userProfilesCache[logData.createdBy]) {
          const userProfileData = userProfilesCache[logData.createdBy];
          createdByName = userProfileData.nickname || userProfileData.authName || userProfileData.authEmail;
        }

        // Get updatedByName from cache
        let updatedByName: string | undefined;
        if (logData.updatedBy && userProfilesCache[logData.updatedBy]) {
          const userProfileData = userProfilesCache[logData.updatedBy];
          updatedByName = userProfileData.nickname || userProfileData.authName || userProfileData.authEmail;
        }

        // Fetch user-specific log display colors
        let creatorNameBgColor: string | undefined;
        let creatorNameTextColor: string | undefined;
        let timeBgColor: string | undefined;
        let timeTextColor: string | undefined;

        if (logData.createdBy && userProfilesCache[logData.createdBy]) {
          const userProfileData = userProfilesCache[logData.createdBy];
          creatorNameBgColor = userProfileData.settings?.logDisplayColors?.creatorNameBg || '#e5e7eb'; // Default gray-100
          creatorNameTextColor = userProfileData.settings?.logDisplayColors?.creatorNameText || '#6b7280'; // Default gray-500
          timeBgColor = userProfileData.settings?.logDisplayColors?.timeBg || '#e5e7eb'; // Default gray-100
          timeTextColor = userProfileData.settings?.logDisplayColors?.timeText || '#4b5563'; // Default gray-700
        } else {
          // Fallback for unknown users or if createdBy is missing
          creatorNameBgColor = '#e5e7eb'; // Default gray-100
          creatorNameTextColor = '#6b7280'; // Default gray-500
          timeBgColor = '#e5e7eb'; // Default gray-100
          timeTextColor = '#4b5563'; // Default gray-700
        }

        // Fetch task details
        const taskRef = doc(db, 'dogs', petId, 'tasks', logData.taskId);
        const taskSnap = await getDoc(taskRef);
        const task = taskSnap.exists() ? (taskSnap.data() as Task) : null;
        const isTaskDeleted = !taskSnap.exists() || (task?.deleted === true);

        return {
          ...logData,
          taskColor: task?.color || '#cccccc',
          taskTextColor: task?.textColor || '#000000',
          isTaskDeleted: isTaskDeleted,
          createdByName: createdByName,
          updatedByName: updatedByName,
          creatorNameBgColor: creatorNameBgColor,
          creatorNameTextColor: creatorNameTextColor,
          timeBgColor: timeBgColor,
          timeTextColor: timeTextColor,
        };
      });

      const enrichedLogs = await Promise.all(enrichedLogsPromises);
      enrichedLogs.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
      setLogs(enrichedLogs);
      setLoading(false);
    }, (error) => {
      console.error('ログの取得に失敗しました:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedPet, targetDate]);

  return { logs, loading };
};