'use client';

import { useState, useEffect } from 'react';
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

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MenuIcon } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';

// Sortableなタスクアイテムコンポーネント
function SortableTaskItem({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task) => void; onDelete: (taskId: string) => void; }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // モバイルでのスクロールとドラッグの競合を防ぐ
  };

  return (
    <Card ref={setNodeRef} style={{ ...style, backgroundColor: task.color, color: task.textColor }} {...attributes}>
      <CardHeader className="flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2 w-full">
          <div className="cursor-grab" {...listeners}> {/* Drag handle */} 
            <MenuIcon className="h-5 w-5 text-gray-500" />
          </div>
          <CardTitle className="flex-grow">
            <span>{task.name}</span>
          </CardTitle>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          <Button variant="secondary" size="sm" onClick={() => onEdit(task)}>編集</Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>削除</Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Additional task details if any */}
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const { selectedPet } = usePetSelection();
  const { tasks, loading: tasksLoading, deleteTask, reorderTasks } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);

  // tasksが更新されたらorderedTasksを初期化
  useEffect(() => {
    if (tasks) {
      setOrderedTasks(tasks);
    }
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
    console.log("Adding new task");
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
    console.log("Editing task:", task);
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log("Attempting to delete task:", taskId);
    await deleteTask(taskId);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = orderedTasks.findIndex((task) => task.id === active.id);
      const newIndex = orderedTasks.findIndex((task) => task.id === over.id);
      const newOrderedTasks = arrayMove(orderedTasks, oldIndex, newIndex);

      // UIを即座に更新
      setOrderedTasks(newOrderedTasks);

      // Firestoreのorderフィールドを更新
      const tasksToUpdate = newOrderedTasks.map((task, index) => ({
        ...task,
        order: index, // 新しい順序をorderフィールドに設定
      }));
      await reorderTasks(tasksToUpdate);
    }
  };

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
          ) : orderedTasks.length === 0 ? (
            <p>このペットにはタスクがありません。最初のタスクを追加しましょう。</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orderedTasks.map(task => (
                    <SortableTaskItem key={task.id} task={task} onEdit={handleEditTask} onDelete={deleteTask} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
