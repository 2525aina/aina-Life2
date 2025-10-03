
"use client";

import { useTaskLoggerSettings } from "@/hooks/useTaskLoggerSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TaskLoggerSettings() {
  const { settings, updateSettings, loading } = useTaskLoggerSettings();

  if (loading) {
    return <p>設定をロード中...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>タスク記録画面の設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-datetime">日時の表示</Label>
          <Switch
            id="show-datetime"
            checked={settings?.showDateTime}
            onCheckedChange={(checked) => updateSettings({ showDateTime: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-memo">メモの表示</Label>
          <Switch
            id="show-memo"
            checked={settings?.showMemo}
            onCheckedChange={(checked) => updateSettings({ showMemo: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="initial-datetime-open">日時を最初から開く</Label>
          <Switch
            id="initial-datetime-open"
            checked={settings?.initialDateTimeOpen}
            onCheckedChange={(checked) => updateSettings({ initialDateTimeOpen: checked })}
            disabled={!settings?.showDateTime}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="initial-memo-open">メモを最初から開く</Label>
          <Switch
            id="initial-memo-open"
            checked={settings?.initialMemoOpen}
            onCheckedChange={(checked) => updateSettings({ initialMemoOpen: checked })}
            disabled={!settings?.showMemo}
          />
        </div>
      </CardContent>
    </Card>
  );
}
