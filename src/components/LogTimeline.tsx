'use client';

import { useState } from 'react';
import { usePetSelection } from '@/contexts/PetSelectionContext';
import { useLogs, Log } from '@/hooks/useLogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, addDays, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { LogFormModal } from '@/components/LogFormModal';

export function LogTimeline() {
  const { selectedPet } = usePetSelection();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { logs, loading, deleteLog } = useLogs(currentDate);
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
    return <p>ログを表示するには、まずペットを選択してください。</p>;
  }

  if (loading) {
    return <p>ログをロード中...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => setCurrentDate(subDays(currentDate, 1))}>前日</Button>
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
              {currentDate ? format(currentDate, "yyyy年MM月dd日 (eee)", { locale: ja }) : <span>日付を選択</span>}
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
        <Button variant="outline" onClick={() => setCurrentDate(addDays(currentDate, 1))}>翌日</Button>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddLog}>手動でログを追加</Button>
      </div>

      {logs.length === 0 ? (
        <p>この日の記録はありません。</p>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <Card key={log.id} style={{ backgroundColor: log.taskColor, color: log.taskTextColor }}>
              <CardHeader>
                <CardTitle className="flex flex-wrap justify-between items-center">
                  <span>{log.taskName}</span>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button variant="secondary" size="sm" onClick={() => handleEditLog(log)}>編集</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteLog(log.id)}>削除</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {format(log.timestamp.toDate(), 'HH:mm')}
                </p>
                {log.note && <p className="mt-2">メモ: {log.note}</p>}
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
