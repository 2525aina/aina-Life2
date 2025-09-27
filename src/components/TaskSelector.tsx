'use client';

import { useTasks } from '@/hooks/useTasks';
import { useLogs } from '@/hooks/useLogs';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { useMemo } from 'react';

export function TaskSelector() {
  const { tasks, loading: tasksLoading } = useTasks();
  const today = useMemo(() => new Date(), []);
  const { addLog } = useLogs(today); // Logs for today

  const handleTaskClick = async (task: typeof tasks[0]) => {
    try {
      await addLog(task);
      toast.success(`ログを記録しました: ${task.name}`);
    } catch (error) {
      console.error('ログの記録に失敗しました', error);
      toast.error("ログの記録に失敗しました。");
    }
  };

  if (tasksLoading) {
    return <p>タスクをロード中...</p>;
  }

  if (tasks.length === 0) {
    return <p>記録できるタスクがありません。まずはタスク管理ページでタスクを作成してください。</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tasks.map(task => (
        <Button
          key={task.id}
          style={{ backgroundColor: task.color, color: task.textColor }}
          onClick={() => handleTaskClick(task)}
        >
          {task.name}
        </Button>
      ))}
    </div>
  );
}
