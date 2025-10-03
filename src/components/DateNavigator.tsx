
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/DatePicker';
import { subDays, addDays, isToday } from 'date-fns';

interface DateNavigatorProps {
  onDateChange: (date: Date) => void;
}

export function DateNavigator({ onDateChange }: DateNavigatorProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    onDateChange(currentDate);
  }, [currentDate, onDateChange]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline" onClick={() => setCurrentDate(subDays(currentDate, 1))}>前日</Button>
      <div className="">
        <DatePicker date={currentDate} setDate={setCurrentDate} />
      </div>
      <Button variant="outline" onClick={() => setCurrentDate(new Date())} disabled={isToday(currentDate)}>今日</Button>
      <Button variant="outline" onClick={() => setCurrentDate(addDays(currentDate, 1))}>翌日</Button>
    </div>
  );
}
