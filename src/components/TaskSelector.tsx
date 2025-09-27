"use client";

import { useTasks } from "@/hooks/useTasks";
import { useLogs, useLogActions } from "@/hooks/useLogs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMemo } from "react";
import Link from "next/link";

export function TaskSelector() {
  const { tasks, loading: tasksLoading } = useTasks();
  const today = useMemo(() => new Date(), []);
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
      <div className="text-center space-y-4">
        <p>②記録するタスクがありません。</p>
        <Link href="/tasks">
          <Button>②タスクを作成する</Button>
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
