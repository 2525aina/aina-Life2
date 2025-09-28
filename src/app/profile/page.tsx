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
import { Loader2 } from "lucide-react";
import { useUser, UserProfile } from "@/hooks/useUser";
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
                  <SelectItem value="" disabled>
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
      </Card>
    </div>
  );
}
