'use client';

import { useState, useEffect } from 'react';
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
  taskName: string;
  taskId: string;
  timestamp: Timestamp;
  note?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  taskColor?: string; // タスクの色を追加
  taskTextColor?: string; // タスクの文字色を追加
}

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

        return {
          ...logData,
          taskColor: task?.color || '#cccccc', // デフォルト色
          taskTextColor: task?.textColor || '#000000', // デフォルト文字色
        };
      });
      const enrichedLogs = await Promise.all(fetchedLogsPromises);
      setLogs(enrichedLogs);
      setLoading(false);
    }, (error) => {
      console.error('ログの取得に失敗しました:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedPet, targetDate]);

  // ログを追加
  const addLog = async (task: Task, note?: string, timestamp?: Date) => {
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
  };

  // ログを更新
  const updateLog = async (logId: string, updatedData: Partial<Omit<Log, 'id' | 'petId' | 'createdBy' | 'createdAt'>>) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    const logRef = doc(db, 'dogs', selectedPet.id, 'logs', logId);
    await updateDoc(logRef, {
      ...updatedData,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
      // timestampがDateオブジェクトで渡された場合、Timestamp型に変換
      ...(updatedData.timestamp && { timestamp: Timestamp.fromDate(updatedData.timestamp as unknown as Date) }),
    });
  };

  // ログを削除
  const deleteLog = async (logId: string) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    if (!confirm('本当にこのログを削除しますか？')) return;
    const logRef = doc(db, 'dogs', selectedPet.id, 'logs', logId);
    await deleteDoc(logRef);
  };

  return { logs, loading, addLog, updateLog, deleteLog };
};
