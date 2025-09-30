"use client";

import { useState, useEffect } from "react";
import { User as FirebaseAuthUser } from "firebase/auth"; // User型をインポート
import { usePets, Pet, Member } from "@/hooks/usePets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User as UserIcon, // 名前が重複するためエイリアスを使用
  PawPrintIcon,
  Mars,
  Venus,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarIcon,
  MicrochipIcon,
  StethoscopeIcon,
  CakeIcon,
  NotebookText,
} from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { calculateAge } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { WeightForm } from "@/components/WeightForm";
import { WeightChart } from "@/components/WeightChart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WeightHistory } from "@/components/WeightHistory";
import { TaskForm } from "@/components/TaskForm";
import { TaskHistory } from "@/components/TaskHistory";
import { useUserProfile } from "@/hooks/useUserProfile";

interface PetCardProps {
  pet: Pet;
  user: FirebaseAuthUser | null; // Firebase User object
  handleEditPet: (pet: Pet) => void;
  handleDeletePet: (petId: string) => void;
  openWeightFormForPetId: string | null;
  setOpenWeightFormForPetId: (petId: string | null) => void;
}

function MemberDisplay({
  member,
  petId,
  currentUserId,
  onRemoveMember,
}: {
  member: Member;
  petId: string;
  currentUserId: string | undefined;
  onRemoveMember: (memberId: string) => Promise<void>;
}) {
  const { userProfile } = useUserProfile(member.uid);

  const getDisplayInfo = () => {
    if (member.status === "pending") {
      return {
        name: member.inviteEmail,
        email: member.inviteEmail,
      };
    }

    // Active members
    if (userProfile) {
      const name = userProfile.nickname || "表示名未設定ユーザー";
      const email =
        userProfile.authEmail || "メールアドレス未登録のためログイン必須";
      const provider = userProfile.authProvider
        ? ` (${userProfile.authProvider})`
        : "";
      return { name: `${name}${provider}`, email };
    } else {
      // Fallback for active members without userProfile (e.g., guest user)
      return {
        name: "ゲストユーザー",
        email: undefined,
      };
    }
  };

  const { name: displayName, email: displayEmail } = getDisplayInfo();

  return (
    <div className="flex items-center justify-between p-2 border rounded-md">
      <div>
        <p className="font-medium">{displayName}</p>
        {displayEmail && (
          <p className="text-sm text-gray-500">{displayEmail}</p>
        )}
        <p className="text-sm text-gray-500">
          役割: {member.role} / ステータス: {member.status}
        </p>
      </div>
      {currentUserId === petId && member.role !== "owner" && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemoveMember(member.id)}
        >
          削除
        </Button>
      )}
    </div>
  );
}

export function PetCard({
  pet,
  user,
  handleEditPet,
  handleDeletePet,
  openWeightFormForPetId,
  setOpenWeightFormForPetId,
}: PetCardProps) {
  const { inviteMember, getSharedMembers, removeMember } = usePets();

  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [sharedMembers, setSharedMembers] = useState<Member[]>([]);
  const [selectedSharingTab, setSelectedSharingTab] = useState<string | null>(
    null
  );
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);

  useEffect(() => {
    if (selectedSharingTab !== "sharing") {
      setSharedMembers([]);
      return;
    }

    const unsubscribe = getSharedMembers(pet.id, (members) => {
      setSharedMembers(members);
    });

    return () => unsubscribe();
  }, [selectedSharingTab, pet.id, getSharedMembers]);

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error("メールアドレスを入力してください。");
      return;
    }
    try {
      await inviteMember(pet.id, inviteEmail);
      toast.success(`${inviteEmail} を招待しました！`);
      setInviteEmail("");
    } catch (error) {
      // エラーはフック内でトースト表示される
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(pet.id, memberId);
      toast.success("メンバーを削除しました。");
    } catch (error) {
      // エラーはフック内でトースト表示される
    }
  };

  return (
    <Collapsible key={pet.id} asChild>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <CollapsibleTrigger className="w-full text-left group">
            <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer">
              {pet.profileImageUrl ? (
                <Image
                  src={pet.profileImageUrl}
                  alt={pet.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <PawPrintIcon className="h-24 w-24 text-gray-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4 text-white z-10">
                <div className="flex items-center gap-2">
                  {pet.gender === "male" && (
                    <Mars className="h-6 w-6 text-blue-300 drop-shadow" />
                  )}
                  {pet.gender === "female" && (
                    <Venus className="h-6 w-6 text-pink-300 drop-shadow" />
                  )}
                  <CardTitle className="text-2xl font-bold drop-shadow">
                    {pet.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-200 drop-shadow">
                  {pet.breed || "種類未設定"}
                  {pet.birthday && ` (${calculateAge(pet.birthday)})`}
                </CardDescription>
              </div>
              <div className="absolute bottom-4 right-4 z-10 text-white/70 transform transition-transform duration-200 group-data-[state=open]:rotate-180">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
          </CollapsibleTrigger>
          <div className="absolute top-2 right-2 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/50 text-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditPet(pet)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>編集</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeletePet(pet.id)}
                  className="text-red-500 focus:text-red-500 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>削除</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CollapsibleContent>
          <CardContent className="p-4">
            {/* 新しいタブセクション */}
            <Tabs
              defaultValue="details"
              onValueChange={(value) => {
                setSelectedSharingTab(value);
              }}
            >
              <TabsList className="grid w-full grid-cols-4">
                {" "}
                {/* タブ数を4に調整 */}
                <TabsTrigger value="details">詳細</TabsTrigger>
                <TabsTrigger value="weights">体重記録</TabsTrigger>
                <TabsTrigger value="tasks">タスク</TabsTrigger>
                <TabsTrigger value="sharing">共有</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                {" "}
                {/* 既存のペット詳細情報をここに移動または表示 */}
                {/* 現在のCardContentの内容をここに配置 */}
                <div className="space-y-2 text-gray-700 mb-4">
                  {pet.gender && (
                    <p className="flex items-center text-sm">
                      <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="font-semibold">性別:</span>{" "}
                      {pet.gender === "male"
                        ? "男の子"
                        : pet.gender === "female"
                        ? "女の子"
                        : "その他"}
                    </p>
                  )}
                  {pet.birthday && (
                    <p className="flex items-center text-sm">
                      <CakeIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="font-semibold">誕生日:</span>{" "}
                      {pet.birthday}
                    </p>
                  )}
                  {pet.adoptionDate && (
                    <p className="flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="font-semibold">お迎え日:</span>{" "}
                      {pet.adoptionDate}
                    </p>
                  )}
                  {pet.microchipId && (
                    <p className="flex items-center text-sm">
                      <MicrochipIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="font-semibold">
                        マイクロチップ:
                      </span>{" "}
                      {pet.microchipId}
                    </p>
                  )}
                </div>
                {(pet.medicalNotes ||
                  (pet.vetInfo && pet.vetInfo.length > 0)) && (
                  <div className="mt-4">
                    {pet.medicalNotes && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-1 flex items-center">
                          <NotebookText className="mr-2 h-4 w-4 text-gray-500" />
                          メモ:
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap pl-6">
                          {pet.medicalNotes}
                        </p>
                      </div>
                    )}
                    {pet.vetInfo && pet.vetInfo.length > 0 && (
                      <div>
                        <p className="font-semibold text-sm mb-2 flex items-center">
                          <StethoscopeIcon className="mr-2 h-4 w-4 text-gray-500" />
                          かかりつけ医情報:
                        </p>
                        <div className="pl-6 space-y-2">
                          {pet.vetInfo.map((vet, index) => (
                            <div
                              key={index}
                              className="text-sm text-gray-600 border-t pt-2 first:border-t-0 first:pt-0"
                            >
                              <p>
                                <strong>病院名:</strong> {vet.name}
                              </p>
                              <p>
                                <strong>電話番号:</strong> {vet.phone}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="weights" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Dialog
                    open={openWeightFormForPetId === pet.id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setOpenWeightFormForPetId(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => setOpenWeightFormForPetId(pet.id)}>
                        体重を追加
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>体重記録の追加</DialogTitle>
                      </DialogHeader>
                      <WeightForm
                        dogId={pet.id}
                        onSuccess={() => setOpenWeightFormForPetId(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                {/* 体重記録サブタブ */}
                <Tabs defaultValue="chart">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chart">体重の推移</TabsTrigger>
                    <TabsTrigger value="history">体重の履歴</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chart" className="mt-4">
                    <WeightChart dogId={pet.id} />
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <WeightHistory dogId={pet.id} />
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="tasks" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Dialog
                    open={isAddTaskFormOpen}
                    onOpenChange={setIsAddTaskFormOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>タスクを追加</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>新しいタスクを追加</DialogTitle>
                      </DialogHeader>
                      <TaskForm
                        petId={pet.id}
                        isOpen={isAddTaskFormOpen}
                        onClose={() => setIsAddTaskFormOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <TaskHistory dogId={pet.id} />
              </TabsContent>
              <TabsContent value="sharing" className="mt-4">
                <h3 className="text-lg font-semibold mb-2">メンバーを招待</h3>
                <div className="flex space-x-2 mb-4">
                  <Input
                    type="email"
                    placeholder="招待するユーザーのメールアドレス"
                    className="flex-grow"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={() => handleInviteMember()}>招待</Button>
                </div>

                <h3 className="text-lg font-semibold mb-2">共有メンバー</h3>
                {sharedMembers.length === 0 ? (
                  <p className="text-gray-500">まだ共有メンバーはいません。</p>
                ) : (
                  <div className="space-y-2">
                    {sharedMembers.map((member) => (
                      <MemberDisplay
                        key={member.id}
                        member={member}
                        petId={pet.id}
                        currentUserId={user?.uid}
                        onRemoveMember={handleRemoveMember}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>{" "}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
