'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks, Task } from '@/hooks/useTasks';
import { usePetSelection } from '@/contexts/PetSelectionContext';
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
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MenuIcon, PlusIcon, Loader2, ClipboardListIcon, PawPrintIcon } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';
import { Checkbox } from '@/components/ui/checkbox';

// Sortableなタスクアイテムコンポーネント
function SortableTaskItem({
  task,
  onEdit,
  isSelected,
  onToggleSelection,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  isSelected: boolean;
  onToggleSelection: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // モバイルでのスクロールとドラッグの競合を防ぐ
  };

  return (
    <Card ref={setNodeRef} style={{ ...style, backgroundColor: task.color, color: task.textColor }} {...attributes} className="cursor-pointer">
      <CardHeader className="flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2 w-full">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(task.id)}
            className="mr-2"
          />
          <div className="cursor-grab" {...listeners}> {/* Drag handle */} 
            <MenuIcon className="h-5 w-5 text-gray-500" />
          </div>
          <CardTitle className="flex-grow" onClick={() => onEdit(task)}>
            <span>{task.name}</span>
          </CardTitle>
        </div>
        {/* Removed Edit and Delete buttons */}
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
  const { tasks, loading: tasksLoading, reorderTasks, bulkDeleteTasks } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // tasksが更新されたらorderedTasksを初期化
  useEffect(() => {
    if (tasks) {
      setOrderedTasks(tasks);
      // タスクが更新されたら選択状態をクリア
      setSelectedTaskIds(new Set());
    }
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const toggleSelection = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
      } else {
        newSelection.add(taskId);
      }
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedTaskIds(new Set());
  };

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

  const handleBulkDelete = async () => {
    if (selectedTaskIds.size === 0) return;

    await bulkDeleteTasks(Array.from(selectedTaskIds));
    clearSelection(); // Clear selection after bulk delete
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">ロード中...</p>
      </div>
    );
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
    <div className="container mx-auto px-4 pt-0">
      <header className="flex justify-between items-center mb-8">
      </header>

      {selectedPet ? (
        <div>
          <div className="flex justify-end mb-4 space-x-2">
            {selectedTaskIds.size > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                選択したタスクを一括削除 ({selectedTaskIds.size})
              </Button>
            )}
            <Button onClick={handleAddTask}>
              <PlusIcon className="mr-2 h-5 w-5" />
              新しいタスクを追加
            </Button>
          </div>
          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="ml-2">タスクをロード中...</p>
            </div>
          ) : orderedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ClipboardListIcon className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">このペットにはタスクがありません。</p>
              <p className="text-md">最初のタスクを追加して、管理を始めましょう！</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orderedTasks.map(task => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      isSelected={selectedTaskIds.has(task.id)}
                      onToggleSelection={toggleSelection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      ) : ( // This is the "no selected pet" display
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <PawPrintIcon className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">タスクを表示するには、まずペットを選択してください。</p>
          <p className="text-md">ペットが登録されていない場合は、ペット管理画面から追加してください。</p>
        </div>
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
