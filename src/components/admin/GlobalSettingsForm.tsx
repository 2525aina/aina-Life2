"use client";

import React, { useState, useEffect } from 'react';
import { useAppSettings, AppSettings } from '@/hooks/useAppSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function GlobalSettingsForm() {
  const { settings, loading, error, updateSettings } = useAppSettings();
  const [formData, setFormData] = useState<Partial<AppSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof AppSettings, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !settings) {
      toast.error("設定が読み込まれていません。");
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success("グローバル設定を更新しました。");
    } catch (err) {
      console.error("Failed to save global settings:", err);
      toast.error("グローバル設定の保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>設定を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 p-4">設定の読み込み中にエラーが発生しました: {error.message}</p>;
  };

  if (!settings) {
    return <p className="p-4">設定が見つかりません。</p>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">グローバル設定</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="initialPetName">初期ペット名</Label>
          <Input
            id="initialPetName"
            name="initialPetName"
            value={formData.initialPetName || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="defaultWeightUnit">デフォルト体重単位</Label>
          <Select
            value={formData.defaultWeightUnit || 'kg'}
            onValueChange={(value) => handleSelectChange('defaultWeightUnit', value as AppSettings['defaultWeightUnit'])} 
          >
            <SelectTrigger>
              <SelectValue placeholder="単位を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="lb">lb</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="maxPetsPerUser">ユーザーあたりの最大ペット数</Label>
          <Input
            id="maxPetsPerUser"
            name="maxPetsPerUser"
            type="number"
            value={formData.maxPetsPerUser || 0}
            onChange={handleNumberChange}
          />
        </div>
        <div>
          <Label htmlFor="welcomeMessage">ウェルカムメッセージ</Label>
          <Textarea
            id="welcomeMessage"
            name="welcomeMessage"
            value={formData.welcomeMessage || ''}
            onChange={handleChange}
          />
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "設定を保存"
          )}
        </Button>
      </form>
    </div>
  );
}
