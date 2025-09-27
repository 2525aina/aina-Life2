'use client';

import { useState, useEffect } from 'react';
import { useLogs, Log } from '@/hooks/useLogs';
import { useTasks, Task } from '@/hooks/useTasks';
import { usePetSelection } from '@/contexts/PetSelectionContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, setHours, setMinutes } from 'date-fns';

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  logToEdit?: Log | null;
  initialDate?: Date; // For manual addition to a specific date
}

export function LogFormModal({ isOpen, onClose, logToEdit, initialDate }: LogFormModalProps) {
  const { selectedPet } = usePetSelection();
  const { tasks } = useTasks();
  const { addLog, updateLog } = useLogs(initialDate || new Date()); // Pass initialDate to useLogs

  const [formData, setFormData] = useState({
    taskId: '',
    note: '',
    date: format(initialDate || new Date(), 'yyyy-MM-dd'),
    time: format(initialDate || new Date(), 'HH:mm'),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (logToEdit) {
        setFormData({
          taskId: logToEdit.taskId,
          note: logToEdit.note || '',
          date: format(logToEdit.timestamp.toDate(), 'yyyy-MM-dd'),
          time: format(logToEdit.timestamp.toDate(), 'HH:mm'),
        });
      } else {
        setFormData({
          taskId: '',
          note: '',
          date: format(initialDate || new Date(), 'yyyy-MM-dd'),
          time: format(initialDate || new Date(), 'HH:mm'),
        });
      }
    }
  }, [isOpen, logToEdit, initialDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, taskId: value }));
  };

  const handleSubmit = async () => {
    if (!selectedPet) {
      alert('ペットが選択されていません。');
      return;
    }
    if (!formData.taskId) {
      alert('タスクを選択してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTask = tasks.find(task => task.id === formData.taskId);
      if (!selectedTask) {
        alert('選択されたタスクが見つかりません。');
        setIsSubmitting(false);
        return;
      }

      // Combine date and time
      let logDateTime = parseISO(formData.date);
      const [hours, minutes] = formData.time.split(':').map(Number);
      logDateTime = setHours(logDateTime, hours);
      logDateTime = setMinutes(logDateTime, minutes);

      if (logToEdit) {
        await updateLog(logToEdit.id, {
          taskId: formData.taskId,
          taskName: selectedTask.name,
          timestamp: logDateTime,
          note: formData.note,
        });
        alert('ログを更新しました！');
      } else {
        await addLog(selectedTask, formData.note, logDateTime);
        alert('ログを追加しました！');
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert('ログの保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{logToEdit ? 'ログを編集' : '新しいログを追加'}</DialogTitle>
          <DialogDescription>
            ログの詳細を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task" className="text-right">タスク *</Label>
            <Select onValueChange={handleSelectChange} value={formData.taskId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="タスクを選択" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">日付</Label>
            <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">時刻</Label>
            <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">メモ</Label>
            <Textarea id="note" name="note" value={formData.note} onChange={handleChange} className="col-span-3" placeholder="ログに関するメモ" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">キャンセル</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
