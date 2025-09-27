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
      ...(updatedData.timestamp && { timestamp: Timestamp.fromDate(updatedData.timestamp as unknown as Date) }),
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
      const fetchedLogsPromises = snapshot.docs.map(async (logDoc) => {
        const logData = { id: logDoc.id, ...(logDoc.data() as Omit<Log, 'id'>) };
        // タスクの色と文字色を取得
        const taskRef = doc(db, 'dogs', petId, 'tasks', logData.taskId);
        const taskSnap = await getDoc(taskRef);
        const task = taskSnap.exists() ? (taskSnap.data() as Task) : null;
        const isTaskDeleted = !taskSnap.exists() || (task?.deleted === true); // タスクが存在しない、または論理削除されている

        return {
          ...logData,
          taskColor: task?.color || '#cccccc', // デフォルト色
          taskTextColor: task?.textColor || '#000000', // デフォルト文字色
          isTaskDeleted: isTaskDeleted,
        };
      });
      const enrichedLogs = await Promise.all(fetchedLogsPromises);
      // Client-side sort to ensure correct order
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