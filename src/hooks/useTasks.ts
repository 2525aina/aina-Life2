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
  deleteDoc,
  writeBatch,
  getDocs,
  where,
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
      }));
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
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    });
  };

  // タスクを更新
  const updateTask = async (taskId: string, updatedData: Partial<Omit<Task, 'id'>>) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    const taskRef = doc(db, 'dogs', selectedPet.id, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updatedData,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    });
  };

  // タスクを削除
  const deleteTask = async (taskId: string) => {
    if (!user || !selectedPet) throw new Error('ユーザーまたはペットが選択されていません。');
    if (!confirm('本当にこのタスクを削除しますか？関連するログは削除されません。')) return;
    const taskRef = doc(db, 'dogs', selectedPet.id, 'tasks', taskId);
    await deleteDoc(taskRef);
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
