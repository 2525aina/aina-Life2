'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks, Task } from '@/hooks/useTasks';
import { usePetSelection } from '@/contexts/PetSelectionContext';
import { PetSwitcher } from '@/components/PetSwitcher';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const { selectedPet } = usePetSelection();
  const { tasks, loading: tasksLoading, deleteTask } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const isLoading = authLoading || tasksLoading;

  if (authLoading) {
    return <p>ロード中...</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">このページを表示するにはログインが必要です。</p>
        <Link href="/login">
          <Button>ログインページへ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">タスク管理</h1>
        <Link href="/">
          <Button variant="outline">ホームへ戻る</Button>
        </Link>
      </header>

      <div className="mb-8">
        <PetSwitcher />
      </div>

      {selectedPet ? (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddTask}>新しいタスクを追加</Button>
          </div>
          {tasksLoading ? (
            <p>タスクをロード中...</p>
          ) : tasks.length === 0 ? (
            <p>このペットにはタスクがありません。最初のタスクを追加しましょう。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(task => (
                <Card key={task.id} style={{ backgroundColor: task.color, color: task.textColor }}>
                  <CardHeader>
                    <CardTitle>{task.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEditTask(task)}>編集</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>削除</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p>タスクを表示するには、まずペットを選択してください。</p>
      )}

      {isFormOpen && (
        <TaskForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
}
