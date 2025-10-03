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
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import { AccountLinker } from "@/components/ui/AccountLinker";

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
            creatorNameBg:
              userProfile.settings?.logDisplayColors?.creatorNameBg ||
              "#e5e7eb",
            creatorNameText:
              userProfile.settings?.logDisplayColors?.creatorNameText ||
              "#6b7280",
            timeBg: userProfile.settings?.logDisplayColors?.timeBg || "#e5e7eb",
            timeText:
              userProfile.settings?.logDisplayColors?.timeText || "#4b5563",
            deletedTaskBg:
              userProfile.settings?.logDisplayColors?.deletedTaskBg ||
              "#e5e7eb",
            deletedTaskText:
              userProfile.settings?.logDisplayColors?.deletedTaskText ||
              "#9ca3af",
            enabled: userProfile.settings?.logDisplayColors?.enabled ?? true,
          },
          timeFormat: userProfile.settings?.timeFormat || "HH:mm:ss",
          toastPosition: userProfile.settings?.toastPosition || "bottom-right",
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
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
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
    category: "creatorName" | "time" | "deletedTask",
    type: "Bg" | "Text",
    value: string
  ) => {
    setFormData((prev) => {
      const currentSettings = prev.settings || {
        notifications: { dailySummary: false },
        theme: "system",
        logDisplayColors: {},
        toastPosition: "bottom-right",
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
        theme: "system",
        logDisplayColors: {},
        toastPosition: "bottom-right",
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
      toast.success("設定を更新しました！");
    } catch (error) {
      console.error("更新に失敗しました", error);
      toast.error("更新に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
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
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="account">アカウント</TabsTrigger>
          <TabsTrigger value="settings">アプリ設定</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>公開プロフィール</CardTitle>
              <CardDescription>
                他のユーザーに表示される情報を編集します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nickname">表示名</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  value={formData.nickname || ""}
                  onChange={handleChange}
                />
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
              <div className="grid grid-cols-2 gap-4">
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
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          {user.isAnonymous && <AccountLinker />}
          <Card>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>
                ログインに使用するアカウント情報です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile?.authEmail || ""}
                  readOnly
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="authName">認証方法</Label>
                <Input
                  id="authName"
                  type="text"
                  value={userProfile?.authProvider || ""}
                  readOnly
                  disabled
                />
              </div>
              {userProfile?.lastLoginAt && (
                <div className="grid gap-2">
                  <Label>最終ログイン日時</Label>
                  <p className="text-sm text-muted-foreground pt-2">
                    {userProfile.lastLoginAt.toDate().toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>アプリ設定</CardTitle>
              <CardDescription>
                アプリケーションの表示や動作をカスタマイズします。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Log Color Settings */}
              <div className="space-y-4">
                <h3 className="text-md font-medium">ログの配色</h3>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <Label
                    htmlFor="enableCustomColors"
                    className="block text-left"
                  >
                    <span className="block">配色をカスタマイズ</span>
                    <span className="block font-normal leading-snug text-muted-foreground">
                      ログの各要素の色を個別に設定します。
                    </span>
                  </Label>
                  <input
                    id="enableCustomColors"
                    type="checkbox"
                    checked={
                      formData.settings?.logDisplayColors?.enabled || false
                    }
                    onChange={(e) => handleToggleChange(e.target.checked)}
                    className="h-5 w-5"
                  />
                </div>
                <div
                  className={`rounded-lg border ${
                    !formData.settings?.logDisplayColors?.enabled &&
                    "opacity-50 pointer-events-none"
                  }`}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            項目
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            背景色
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            文字色
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            表示
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[
                          {
                            id: "creatorName" as const,
                            label: "作成者名",
                            previewText: "作成者",
                            bg: formData.settings?.logDisplayColors
                              ?.creatorNameBg,
                            text: formData.settings?.logDisplayColors
                              ?.creatorNameText,
                            defaultBg: "#e5e7eb",
                            defaultText: "#6b7280",
                          },
                          {
                            id: "time" as const,
                            label: "時刻",
                            previewText: "14:05:09",
                            bg: formData.settings?.logDisplayColors?.timeBg,
                            text: formData.settings?.logDisplayColors?.timeText,
                            defaultBg: "#e5e7eb",
                            defaultText: "#4b5563",
                          },
                          {
                            id: "deletedTask" as const,
                            label: "削除ログ",
                            previewText: "削除",
                            bg: formData.settings?.logDisplayColors
                              ?.deletedTaskBg,
                            text: formData.settings?.logDisplayColors
                              ?.deletedTaskText,
                            defaultBg: "#e5e7eb",
                            defaultText: "#9ca3af",
                          },
                        ].map((item) => (
                          <tr key={item.id}>
                            <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                              {item.label}
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  value={item.bg || item.defaultBg}
                                  onChange={(e) =>
                                    handleChangeColor(
                                      item.id,
                                      "Bg",
                                      e.target.value
                                    )
                                  }
                                  className="w-10 h-8 p-1 shrink-0"
                                />
                                <Input
                                  value={item.bg || item.defaultBg}
                                  onChange={(e) =>
                                    handleChangeColor(
                                      item.id,
                                      "Bg",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 w-24"
                                  placeholder="#RRGGBB"
                                />
                              </div>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  value={item.text || item.defaultText}
                                  onChange={(e) =>
                                    handleChangeColor(
                                      item.id,
                                      "Text",
                                      e.target.value
                                    )
                                  }
                                  className="w-10 h-8 p-1 shrink-0"
                                />
                                <Input
                                  value={item.text || item.defaultText}
                                  onChange={(e) =>
                                    handleChangeColor(
                                      item.id,
                                      "Text",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 w-24"
                                  placeholder="#RRGGBB"
                                />
                              </div>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                <span
                                  className="px-2 py-1 rounded-md text-sm"
                                  style={{
                                    backgroundColor: item.bg || item.defaultBg,
                                    color: item.text || item.defaultText,
                                  }}
                                >
                                  {item.previewText}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Time Format Settings */}
              <div className="space-y-2">
                <h3 className="text-md font-medium">時刻フォーマット</h3>
                <Label
                  htmlFor="timeFormat"
                  className="text-sm font-normal text-muted-foreground"
                >
                  ログに表示される時刻のフォーマットを選択します。
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("settings.timeFormat", value)
                  }
                  value={formData.settings?.timeFormat || "HH:mm:ss"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="フォーマットを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HH:mm:ss">
                      時間:分:秒 (例: 04:05:09)
                    </SelectItem>
                    <SelectItem value="H:mm:ss">
                      時間:分:秒 (例: 4:05:09)
                    </SelectItem>
                    <SelectItem value="HH:mm">時間:分 (例: 04:05)</SelectItem>
                    <SelectItem value="H:mm">時間:分 (例: 4:05)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Toast Position Settings */}
              <div className="space-y-2">
                <h3 className="text-md font-medium">通知の表示位置</h3>
                <Label
                  htmlFor="toastPosition"
                  className="text-sm font-normal text-muted-foreground"
                >
                  通知（トースト）が画面のどこに表示されるかを設定します。
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("settings.toastPosition", value)
                  }
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6 space-x-4">
        {user && !user.isAnonymous && (
          <Button variant="destructive" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        )}
        <Button onClick={handleUpdateProfile} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              更新中...
            </>
          ) : (
            "保存する"
          )}
        </Button>
      </div>
    </div>
  );
}
