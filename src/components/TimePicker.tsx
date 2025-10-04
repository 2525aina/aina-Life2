
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  time: string;
  setTime: (time: string) => void;
}

export function TimePicker({ time, setTime }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localTime, setLocalTime] = useState(time);

  const handleReset = () => {
    setLocalTime('00:00:00');
    setTime('00:00:00');
    setIsOpen(false);
  };

  const handleOk = () => {
    setTime(localTime);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className="w-full justify-start text-left font-normal"
        >
          <Clock className="mr-2 h-4 w-4" />
          {time}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-4">
          <Input
            type="time"
            step="1"
            value={localTime}
            onChange={(e) => setLocalTime(e.target.value)}
                  className="w-full"
                />        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={handleReset}>リセット</Button>
          <Button onClick={handleOk}>OK</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
