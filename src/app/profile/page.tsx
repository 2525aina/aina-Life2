"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, LogOutIcon } from "lucide-react";
import { useUser, UserProfile } from "@/hooks/useUser";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { usePets } from "@/hooks/usePets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const {
    userProfile,
    loading: userProfileLoading,
    updateUserProfile,
  } = useUser();
  const { pets, loading: petsLoading } = usePets();
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (userProfile) {
      setFormData({
        nickname: userProfile.nickname || "",
        profileImageUrl: userProfile.profileImageUrl || "",
        birthday: userProfile.birthday || "",
        gender: userProfile.gender || "other",
        introduction: userProfile.introduction || "",
        primaryPetId: userProfile.primaryPetId || "",
        settings: {
          ...userProfile.settings,
          logDisplayColors: {
            creatorNameBg: userProfile.settings?.logDisplayColors?.creatorNameBg || "#e5e7eb",
            creatorNameText: userProfile.settings?.logDisplayColors?.creatorNameText || "#6b7280",
            timeBg: userProfile.settings?.logDisplayColors?.timeBg || "#e5e7eb",
            timeText: userProfile.settings?.logDisplayColors?.timeText || "#4b5563",
            deletedTaskBg: userProfile.settings?.logDisplayColors?.deletedTaskBg || "#e5e7eb", // New field
            deletedTaskText: userProfile.settings?.logDisplayColors?.deletedTaskText || "#9ca3af", // New field
            enabled: userProfile.settings?.logDisplayColors?.enabled ?? true, // Default to true
          },
          toastPosition: userProfile.settings?.toastPosition || 'bottom-right', // Default to bottom-right
        },
      });
    }
  }, [authLoading, user, router, userProfile, pets]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Partial<UserProfile>] as object),
            [child]: value,
          },
        };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleChangeColor = (
    category: 'creatorName' | 'time' | 'deletedTask',
    type: 'Bg' | 'Text',
    value: string
  ) => {
    setFormData((prev) => {
      const currentSettings = prev.settings || {
        notifications: { dailySummary: false },
        theme: 'system',
      };
      const currentLogDisplayColors = currentSettings.logDisplayColors || {};

      return {
        ...prev,
        settings: {
          ...currentSettings,
          logDisplayColors: {
            ...currentLogDisplayColors,
            [`${category}${type}`]: value,
          },
        },
      };
    });
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData((prev) => {
      const currentSettings = prev.settings || {
        notifications: { dailySummary: false },
        theme: 'system',
      };
      const currentLogDisplayColors = currentSettings.logDisplayColors || {};

      return {
        ...prev,
        settings: {
          ...currentSettings,
          logDisplayColors: {
            ...currentLogDisplayColors,
            enabled: checked,
          },
        },
      };
    });
  };

  const handleUpdateProfile = async () => {
    if (!formData.nickname) {
      toast.error("表示名は必須です。");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateUserProfile(formData);
      toast.success("プロフィールを更新しました！");
    } catch (error) {
      console.error("プロフィールの更新に失敗しました", error);
      toast.error("プロフィールの更新に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Redirect to login page after logout
      toast.success("ログアウトしました");
    } catch (error) {
      console.error("ログアウトに失敗しました", error);
      toast.error("ログアウトに失敗しました");
    }
  };

  if (authLoading || userProfileLoading || petsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">ロード中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">このページを表示するにはログインが必要です。</p>
        <Link href="/login">
          <Button>ログインページへ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">プロフィール</CardTitle>
          <CardDescription>ユーザー情報を管理します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" value={user.email || ""} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="authName">認証プロバイダ名</Label>
            <Input
              id="authName"
              type="text"
              value={userProfile?.authName || ""}
              readOnly
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nickname">表示名</Label>
            <Input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profileImageUrl">プロフィール画像URL</Label>
            <Input
              id="profileImageUrl"
              name="profileImageUrl"
              type="text"
              value={formData.profileImageUrl || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="birthday">誕生日</Label>
            <Input
              id="birthday"
              name="birthday"
              type="date"
              value={formData.birthday || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">性別</Label>
            <Select
              onValueChange={(value) => handleSelectChange("gender", value)}
              value={formData.gender || "other"}
            >
              <SelectTrigger>
                <SelectValue placeholder="性別を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男性</SelectItem>
                <SelectItem value="female">女性</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="introduction">自己紹介</Label>
            <Textarea
              id="introduction"
              name="introduction"
              value={formData.introduction || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryPetId">メインペット</Label>
            <Select
              onValueChange={(value) =>
                handleSelectChange("primaryPetId", value)
              }
              value={formData.primaryPetId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="メインペットを選択" />
              </SelectTrigger>
              <SelectContent>
                {pets.length === 0 ? (
                  <SelectItem value="no-pets" disabled>
                    ペットがいません
                  </SelectItem>
                ) : (
                  pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {userProfile?.lastLoginAt && (
            <div className="grid gap-2">
              <Label>最終ログイン</Label>
              <p className="text-sm text-muted-foreground">
                {userProfile.lastLoginAt.toDate().toLocaleString()}
              </p>
            </div>
          )}

          {/* ログ表示色設定 */}
          <div className="grid gap-4 mt-6">
            <h3 className="text-lg font-semibold">ログ表示色設定</h3>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enableCustomColors">カスタム色を有効にする</Label>
              <input
                id="enableCustomColors"
                type="checkbox"
                checked={formData.settings?.logDisplayColors?.enabled || false}
                onChange={(e) => handleToggleChange(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" // Basic styling
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="creatorNameBg">作成者名 背景色</Label>
              <div className="flex gap-2">
                <Input
                  id="creatorNameBg"
                  type="color"
                  value={formData.settings?.logDisplayColors?.creatorNameBg || "#e5e7eb"}
                  onChange={(e) => handleChangeColor("creatorName", "Bg", e.target.value)}
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
                <Input
                  type="text"
                  value={formData.settings?.logDisplayColors?.creatorNameBg || "#e5e7eb"}
                  onChange={(e) => handleChangeColor("creatorName", "Bg", e.target.value)}
                  placeholder="#RRGGBB"
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="creatorNameText">作成者名 文字色</Label>
              <div className="flex gap-2">
                <Input
                  id="creatorNameText"
                  type="color"
                  value={formData.settings?.logDisplayColors?.creatorNameText || "#6b7280"}
                  onChange={(e) => handleChangeColor("creatorName", "Text", e.target.value)}
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
                <Input
                  type="text"
                  value={formData.settings?.logDisplayColors?.creatorNameText || "#6b7280"}
                  onChange={(e) => handleChangeColor("creatorName", "Text", e.target.value)}
                  placeholder="#RRGGBB"
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeBg">時刻 背景色</Label>
              <div className="flex gap-2">
                <Input
                  id="timeBg"
                  type="color"
                  value={formData.settings?.logDisplayColors?.timeBg || "#e5e7eb"}
                  onChange={(e) => handleChangeColor("time", "Bg", e.target.value)}
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
                <Input
                  type="text"
                  value={formData.settings?.logDisplayColors?.timeBg || "#e5e7eb"}
                  onChange={(e) => handleChangeColor("time", "Bg", e.target.value)}
                  placeholder="#RRGGBB"
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeText">時刻 文字色</Label>
              <div className="flex gap-2">
                <Input
                  id="timeText"
                  type="color"
                  value={formData.settings?.logDisplayColors?.timeText || "#4b5563"}
                  onChange={(e) => handleChangeColor("time", "Text", e.target.value)}
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
                <Input
                  type="text"
                  value={formData.settings?.logDisplayColors?.timeText || "#4b5563"}
                  onChange={(e) => handleChangeColor("time", "Text", e.target.value)}
                  placeholder="#RRGGBB"
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
              </div>
            </div>
            {/* New fields for Deleted Task Log Colors */}
            <div className="grid gap-2">
              <Label htmlFor="deletedTaskBg">削除済みタスク 背景色</Label>
              <div className="flex gap-2">
                <Input
                  id="deletedTaskBg"
                  type="color"
                  value={formData.settings?.logDisplayColors?.deletedTaskBg || "#e5e7eb"}
                  onChange={(e) => handleChangeColor("deletedTask", "Bg", e.target.value)}
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
                <Input
                  type="text"
                  value={formData.settings?.logDisplayColors?.deletedTaskBg || "#e5e7eb"}
                  onChange={(e) => handleChangeColor("deletedTask", "Bg", e.target.value)}
                  placeholder="#RRGGBB"
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deletedTaskText">削除済みタスク 文字色</Label>
              <div className="flex gap-2">
                <Input
                  id="deletedTaskText"
                  type="color"
                  value={formData.settings?.logDisplayColors?.deletedTaskText || "#9ca3af"}
                  onChange={(e) => handleChangeColor("deletedTask", "Text", e.target.value)}
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
                <Input
                  type="text"
                  value={formData.settings?.logDisplayColors?.deletedTaskText || "#9ca3af"}
                  onChange={(e) => handleChangeColor("deletedTask", "Text", e.target.value)}
                  placeholder="#RRGGBB"
                  className="w-1/2"
                  disabled={!formData.settings?.logDisplayColors?.enabled}
                />
              </div>
            </div>
          </div>
          {/* Toast Position Setting */}
          <div className="grid gap-4 mt-6">
            <h3 className="text-lg font-semibold">トースト表示位置</h3>
            <div className="grid gap-2">
              <Label htmlFor="toastPosition">表示位置</Label>
              <Select
                onValueChange={(value) => handleSelectChange("settings.toastPosition", value)}
                value={formData.settings?.toastPosition || "bottom-right"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="位置を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">左上</SelectItem>
                  <SelectItem value="top-center">上中央</SelectItem>
                  <SelectItem value="top-right">右上</SelectItem>
                  <SelectItem value="bottom-left">左下</SelectItem>
                  <SelectItem value="bottom-center">下中央</SelectItem>
                  <SelectItem value="bottom-right">右下</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleUpdateProfile}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </>
            ) : (
              "プロフィールを更新"
            )}
          </Button>
        </CardFooter>
        <CardFooter className="mt-4"> {/* Added mt-4 for extra spacing */}
          <Button
            className="w-full" // Removed mt-2 as CardFooter itself provides spacing
            variant="destructive"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
