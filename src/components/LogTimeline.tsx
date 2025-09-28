"use client";

import { useState } from "react";
import { usePetSelection } from "@/contexts/PetSelectionContext";
import { useLogs, Log, useLogActions } from "@/hooks/useLogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { LogFormModal } from "@/components/LogFormModal";

export function LogTimeline() {
  const { selectedPet } = usePetSelection();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { logs, loading } = useLogs(currentDate);
  const { deleteLog } = useLogActions();
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<Log | null>(null);

  const handleAddLog = () => {
    setLogToEdit(null);
    setIsLogFormOpen(true);
  };

  const handleEditLog = (log: Log) => {
    setLogToEdit(log);
    setIsLogFormOpen(true);
  };

  if (!selectedPet) {
    return <p>③ログを表示するには、①と②を完了してください。</p>;
  }

  if (loading) {
    return <p>ログをロード中...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
        >
          前日
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !currentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {currentDate ? (
                format(currentDate, "yyyy年MM月dd日 (eee)", { locale: ja })
              ) : (
                <span>日付を選択</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && setCurrentDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
        >
          翌日
        </Button>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddLog}>手動でログを追加</Button>
      </div>

      {logs.length === 0 ? (
        <p>この日の記録はありません。</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card
              key={log.id}
              className={cn(
                log.isTaskDeleted && "bg-gray-200 text-gray-500 opacity-60",
              )}
              style={{
                backgroundColor: log.isTaskDeleted ? undefined : log.taskColor,
                color: log.isTaskDeleted ? undefined : log.taskTextColor,
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    {log.createdByName && (
                      <p className="text-xs text-muted-foreground">
                        {log.createdByName}
                        {log.updatedByName && log.createdByName !== log.updatedByName && (
                          <span> (更新者: {log.updatedByName})</span>
                        )}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <p className="text-sm font-medium">{format(log.timestamp.toDate(), "HH:mm:ss")}</p>
                      <CardTitle className="text-base font-semibold truncate">
                        {log.taskName}
                      </CardTitle>
                      {log.note && <p className="text-sm text-muted-foreground">({log.note})</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditLog(log)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteLog(log.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* CardContent is now empty as note is moved */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLogFormOpen && (
        <LogFormModal
          isOpen={isLogFormOpen}
          onClose={() => setIsLogFormOpen(false)}
          logToEdit={logToEdit}
          initialDate={currentDate}
        />
      )}
    </div>
  );
}
