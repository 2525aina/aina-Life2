"use client";

import { useState } from "react";
import { usePetSelection } from "@/contexts/PetSelectionContext";
import { useLogs, Log, useLogActions } from "@/hooks/useLogs";
import { Button } from "@/components/ui/button";
import { format, addDays, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, ClipboardListIcon, PawPrintIcon } from "lucide-react";
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
  const { logs } = useLogs(currentDate);
  const { deleteLog } = useLogActions();
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<Log | null>(null);

  // Define empty message text locally
  const emptyMessageText = "この日の記録はありません。";

  const handleAddLog = () => {
    setLogToEdit(null);
    setIsLogFormOpen(true);
  };

  const handleEditLog = (log: Log) => {
    setLogToEdit(log);
    setIsLogFormOpen(true);
  };

  if (!selectedPet) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <PawPrintIcon className="h-16 w-16 mb-4 text-gray-400" />
        <p className="text-lg font-semibold mb-2">ログを表示するには、まずペットを選択してください。</p>
        <p className="text-md">ペットが登録されていない場合は、ペット管理画面から追加してください。</p>
      </div>
    );
  }

    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background pb-4"> {/* Sticky container with background and padding */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {/* Date navigation buttons */}
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
                  "flex-1 sm:w-[240px] justify-start text-left font-normal", // Changed w-full to flex-1
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
      </div> {/* End of sticky container */}

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <ClipboardListIcon className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">{emptyMessageText}</p>
          <p className="text-md">手動でログを追加するか、タスクを実行して記録しましょう！</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li
              key={log.id}
              className={cn(
                "flex items-center p-3 rounded-lg shadow-sm border transition-colors",
                log.isTaskDeleted
                  ? "bg-gray-200 text-gray-500 opacity-60 border-gray-300"
                  : "bg-white border-gray-100 hover:bg-gray-50"
              )}
              style={{
                backgroundColor: log.isTaskDeleted ? undefined : log.taskColor,
                color: log.isTaskDeleted ? undefined : log.taskTextColor,
              }}
            >
              <div className="flex flex-col items-center mr-4">
                {/* 作成者/更新者名 */}
                {(() => {
                  const primaryName = log.createdByName || "unknown";
                  const truncatedPrimaryName = primaryName.substring(0, 6);
                  return (
                    <span
                      className="font-mono text-sm mb-1 px-2 py-1 rounded"
                      style={{
                        backgroundColor: log.creatorNameBgColor,
                        color: log.creatorNameTextColor,
                      }}
                    >
                      {truncatedPrimaryName}
                      {log.updatedByName &&
                        log.createdByName !== log.createdByName && (
                          <span> (更新者: {log.updatedByName})</span>
                        )}
                    </span>
                  );
                })()}
                {/* 時刻表示 */}
                <span
                  className="font-mono text-sm px-2 py-1 rounded"
                  style={{
                    backgroundColor: log.timeBgColor,
                    color: log.timeTextColor,
                  }}
                >
                  {format(log.timestamp.toDate(), "HH:mm:ss")}
                </span>
              </div>
              <span className="ml-4 font-medium text-base" style={{ color: log.taskTextColor }}>
                {log.taskName}
              </span>
              {log.note && (
                <span className="ml-2 text-sm" style={{ color: log.taskTextColor }}>
                  ({log.note})
                </span>
              )}
              <div className="ml-auto flex space-x-2">
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
            </li>
          ))}
        </ul>
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
}
