"use client";

import { useState } from "react";
import { useTasks, Task } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";

interface TaskHistoryProps {
  dogId: string; // useTasksはselectedPetを使うが、明示的にdogIdを受け取る
}

// SortableItemコンポーネント
function SortableItem({ task, dogId, handleEdit, handleDelete, isEditFormOpen, taskToEdit, setIsEditFormOpen }: {
  task: Task;
  dogId: string;
  handleEdit: (task: Task) => void;
  handleDelete: (taskId: string) => void;
  isEditFormOpen: boolean;
  taskToEdit: Task | null;
  setIsEditFormOpen: (isOpen: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell style={{ backgroundColor: task.color, color: task.textColor || '#FFFFFF' }}>{task.name}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: task.color }}></div>
          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: task.textColor || '#FFFFFF' }}></div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Dialog open={isEditFormOpen && taskToEdit?.id === task.id} onOpenChange={setIsEditFormOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>タスクの編集</DialogTitle>
            </DialogHeader>
            <TaskForm isOpen={true} onClose={() => setIsEditFormOpen(false)} taskToEdit={taskToEdit || undefined} />
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function TaskHistory({ dogId }: TaskHistoryProps) {
  const { tasks, loading, deleteTask, reorderTasks } = useTasks();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsEditFormOpen(true);
  };

  const handleDelete = (taskId: string) => {
    setTaskToDeleteId(taskId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDeleteId) {
      await deleteTask(taskToDeleteId);
      toast.success("タスクを削除しました。");
      setTaskToDeleteId(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over?.id);
      const newOrderTasks = arrayMove(tasks, oldIndex, newIndex);

      // Firestoreのorderフィールドを更新
      const updatedTasksWithOrder = newOrderTasks.map((task, index) => ({
        ...task,
        order: index, // 新しい並び順をorderフィールドに設定
      }));
      await reorderTasks(updatedTasksWithOrder);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="ml-2">タスク履歴をロード中...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <p>タスクがありません。</p>;
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タスク名</TableHead>
              <TableHead>色</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableItem
                  key={task.id}
                  task={task}
                  dogId={dogId}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  isEditFormOpen={isEditFormOpen}
                  taskToEdit={taskToEdit}
                  setIsEditFormOpen={setIsEditFormOpen}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="タスクの削除確認"
        message="本当にこのタスクを削除しますか？この操作は元に戻せません。関連するログも非表示になります。"
        onConfirm={handleConfirmDelete}
        confirmButtonText="削除する"
        cancelButtonText="キャンセル"
        isDestructive={true}
      />
    </div>
  );
}
