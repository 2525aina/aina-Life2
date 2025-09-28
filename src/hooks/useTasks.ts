'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { usePetSelection } from '@/contexts/PetSelectionContext';

// タスクデータ型定義
export interface Task {
  id: string;
  name: string;
  color: string;
  order: number;
  textColor?: string;
  deleted?: boolean; // 論理削除フラグ
  deletedAt?: Timestamp | null; // 削除日時
}

export const useTasks = () => {
  const { user } = useAuth();
  const { selectedPet } = usePetSelection();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !selectedPet) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const petId = selectedPet.id;

    const tasksCollection = collection(db, 'dogs', petId, 'tasks');
    const tasksQuery = query(tasksCollection, orderBy('order'));

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, 'id'>),
      })).filter(task => !task.deleted); // クライアント側で論理削除されたタスクを除外
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error('タスクの取得に失敗しました:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedPet]);

  // タスクを追加
  const addTask = async (taskData: Omit<Task, 'id'>) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    const tasksCollection = collection(db, 'dogs', selectedPet.id, 'tasks');
    await addDoc(tasksCollection, {
      ...taskData,
      deleted: false, // 新規タスクは論理削除されていない状態
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    });
  };

  // タスクを更新
  const updateTask = async (taskId: string, updatedData: Partial<Omit<Task, 'id'>>) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');

    const batch = writeBatch(db);
    const taskRef = doc(db, 'dogs', selectedPet.id, 'tasks', taskId);

    // Update the task document
    batch.update(taskRef, {
      ...updatedData,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    });

    // If task name is updated, update all associated logs
    if (updatedData.name) {
      const logsQuery = query(
        collection(db, 'dogs', selectedPet.id, 'logs'),
        where('taskId', '==', taskId)
      );
      const logsSnapshot = await getDocs(logsQuery);

      logsSnapshot.forEach((logDoc) => {
        batch.update(logDoc.ref, {
          taskName: updatedData.name,
          updatedBy: user.uid,
          updatedAt: serverTimestamp(),
        });
      });
    }

    await batch.commit();
  };

  // タスクを削除
  const deleteTask = async (taskId: string) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    if (!confirm('本当にこのタスクを削除しますか？関連するログも非表示になります。')) return;

    const batch = writeBatch(db);
    const taskRef = doc(db, 'dogs', selectedPet.id, 'tasks', taskId);

    // タスクを論理削除
    batch.update(taskRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    });

    // 関連するログも論理削除
    const logsQuery = query(
      collection(db, 'dogs', selectedPet.id, 'logs'),
      where('taskId', '==', taskId)
    );
    const logsSnapshot = await getDocs(logsQuery);

    logsSnapshot.forEach((logDoc) => {
      batch.update(logDoc.ref, {
        deleted: true,
        deletedAt: serverTimestamp(),
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  };

  // タスクの並び順を更新する関数
  const reorderTasks = async (reorderedTasks: Task[]) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    try {
      for (const task of reorderedTasks) {
        const taskRef = doc(db, 'dogs', selectedPet.id, 'tasks', task.id);
        await updateDoc(taskRef, {
          order: task.order,
          updatedBy: user.uid,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      console.error('タスクの並び順の更新に失敗しました:', errorMessage);
      alert('タスクの並び順の更新に失敗しました。');
    }
  };

  return { tasks, loading, addTask, updateTask, deleteTask, reorderTasks };
};
