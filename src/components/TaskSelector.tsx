"use client";

import { useTasks } from "@/hooks/useTasks";
import { useLogActions } from "@/hooks/useLogs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { ClipboardListIcon } from 'lucide-react';
import { usePetSelection } from "@/contexts/PetSelectionContext";

export function TaskSelector() {
  const { selectedPet } = usePetSelection();
  const { tasks, loading: tasksLoading } = useTasks(selectedPet?.id || '');
  const { addLog } = useLogActions(); // Use useLogActions

  const handleTaskClick = async (task: (typeof tasks)[0]) => {
    try {
      await addLog(task, new Date());
      toast.success(`ログを記録しました: ${task.name}`);
    } catch (error) {
      console.error("ログの記録に失敗しました", error);
      toast.error("ログの記録に失敗しました。");
    }
  };

  if (tasksLoading) {
    return <p>タスクをロード中...</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <ClipboardListIcon className="h-16 w-16 mb-4 text-gray-400" />
        <p className="text-lg font-semibold mb-2">記録するタスクがありません。</p>
        <Link href="/pets">
          <Button>タスクを作成する</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tasks.map((task) => (
        <Button
          key={task.id}
          style={{ backgroundColor: task.color, color: task.textColor }}
          onClick={() => handleTaskClick(task)}
          className="max-w-[calc(100%-0.5rem)] truncate" // Added max-width and truncate
        >
          {task.name}
        </Button>
      ))}
    </div>
  );
}
