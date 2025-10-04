'use client';

import React, { useState, useEffect } from "react";
import { useLogActions, Log } from "@/hooks/useLogs";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

import { useTasks } from "@/hooks/useTasks";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { usePetSelection } from "../contexts/PetSelectionContext";
import { TimePicker } from "./TimePicker";

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  logToEdit?: Log | null;
  initialDate?: Date;
}

export function LogFormModal({
  isOpen,
  onClose,
  logToEdit,
  initialDate,
}: LogFormModalProps) {
  const { selectedPet } = usePetSelection();
  const { tasks } = useTasks(selectedPet?.id || "");
  const { addLog, updateLog } = useLogActions();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate || new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    format(initialDate || new Date(), "HH:mm:ss")
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
    undefined
  );
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (logToEdit) {
        setSelectedDate(logToEdit.timestamp.toDate());
        setSelectedTaskId(logToEdit.taskId);
        setNote(logToEdit.note || "");
        setSelectedTime(format(logToEdit.timestamp.toDate(), "HH:mm:ss"));
      } else {
        const now = new Date();
        const dateWithCurrentTime = initialDate ? new Date(initialDate) : now;
        dateWithCurrentTime.setHours(now.getHours());
        dateWithCurrentTime.setMinutes(now.getMinutes());
        dateWithCurrentTime.setSeconds(now.getSeconds());

        setSelectedDate(dateWithCurrentTime);
        setSelectedTaskId(undefined);
        setNote("");
        setSelectedTime(format(now, "HH:mm:ss"));
      }
    }
  }, [isOpen, logToEdit, initialDate]);

  useEffect(() => {
    if (isOpen && selectedPet && tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [isOpen, selectedPet, tasks, selectedTaskId]);

  const handleSubmit = async () => {
    if (!selectedPet) {
      toast.error("ログを記録するペットを選択してください。");
      return;
    }
    if (!selectedTaskId) {
      toast.error("記録するタスクを選択してください。");
      return;
    }
    if (!selectedDate) {
      toast.error("ログを記録する日付を選択してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const task = tasks.find((t) => t.id === selectedTaskId);
      if (task) {
        const [hours, minutes, seconds] = selectedTime.split(":").map(Number);
        const logDateTime = new Date(selectedDate);
        logDateTime.setHours(hours);
        logDateTime.setMinutes(minutes);
        logDateTime.setSeconds(seconds);

        if (logToEdit) {
          await updateLog(logToEdit.id, {
            taskId: task.id,
            taskName: task.name,
            timestamp: Timestamp.fromDate(selectedDate),
            note,
          });
          toast.success(
            `ログを更新しました: ${task.name} (${format(
              logDateTime,
              "yyyy/MM/dd HH:mm:ss"
            )})`
          );
        } else {
          await addLog(task, logDateTime, note);
          toast.success(
            `ログを記録しました: ${task.name} (${format(
              logDateTime,
              "yyyy/MM/dd HH:mm:ss"
            )})`
          );
        }
        if (typeof onClose === "function") {
          onClose();
        }
      }
    } catch (error) {
      console.error("ログの保存に失敗しました", error);
      toast.error("ログの保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {logToEdit ? "ログを編集" : "手動でログを追加"}
          </DialogTitle>
          <DialogDescription>
            {logToEdit
              ? "ログの情報を編集します。"
              : "日付とタスクを選択してログを記録します。"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pet" className="text-right">
              ペット
            </Label>
            <Input
              id="pet"
              value={selectedPet?.name || "ペットが選択されていません"}
              readOnly
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              日付
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "yyyy/MM/dd", { locale: ja })
                  ) : (
                    <span>日付を選択</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      const newDate = new Date(date);
                      if (selectedDate) {
                        newDate.setHours(selectedDate.getHours());
                        newDate.setMinutes(selectedDate.getMinutes());
                        newDate.setSeconds(selectedDate.getSeconds());
                      }
                      setSelectedDate(newDate);
                    }
                  }}
                  initialFocus
                  locale={ja}
                />
                <div className="flex justify-end gap-2 p-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDate(new Date());
                      setIsDatePickerOpen(false);
                    }}
                  >
                    リセット
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDatePickerOpen(false);
                    }}
                  >
                    OK
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              時刻
            </Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => {
                const timeParts = e.target.value.split(":").map(Number);
                const hours = timeParts[0];
                const minutes = timeParts[1];
                const seconds = timeParts[2] || 0;

                if (selectedDate) {
                  const newDate = new Date(selectedDate);
                  newDate.setHours(hours);
                  newDate.setMinutes(minutes);
                  newDate.setSeconds(seconds);
                  setSelectedDate(newDate);
                }
                setSelectedTime(e.target.value);
              }}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task" className="text-right">
              タスク
            </Label>
            <Select onValueChange={setSelectedTaskId} value={selectedTaskId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="タスクを選択" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              メモ
            </Label>
            <Textarea
              id="note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3"
              placeholder="ログに関するメモ"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            キャンセル
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isSubmitting || !selectedPet || !selectedTaskId || !selectedDate
            }
          >
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
