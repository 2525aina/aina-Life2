'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePets, Pet } from '@/hooks/usePets';
import { PetAddForm } from '@/components/PetAddForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, User, PawPrintIcon, MicrochipIcon, StethoscopeIcon, CakeIcon, Loader2, ChevronDown, MoreHorizontal, Pencil, Trash2, NotebookText, Mars, Venus } from 'lucide-react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { calculateAge } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // TabsContentを追加
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { toast } from 'sonner';
import { usePetSelection } from '@/contexts/PetSelectionContext'; // usePetSelectionをインポート
import { WeightForm } from '@/components/WeightForm'; // WeightFormをインポート
import { WeightChart } from '@/components/WeightChart'; // WeightChartをインポート
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // Dialogコンポーネントをインポート
import { WeightHistory } from '@/components/WeightHistory'; // WeightHistoryをインポート
import { TaskForm } from '@/components/TaskForm'; // TaskFormをインポート
import { TaskHistory } from '@/components/TaskHistory'; // TaskHistoryをインポート

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { pets, loading: petsLoading, deletePet } = usePets();
  const { selectedPetId } = usePetSelection(); // selectedPetIdを取得
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'male', 'female', 'other'
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [petToDeleteId, setPetToDeleteId] = useState<string | null>(null);
  const [openWeightFormForPetId, setOpenWeightFormForPetId] = useState<string | null>(null);

  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);

  const isLoading = authLoading || petsLoading;

  const filteredPets = pets.filter(pet => {
    const matchesTab = selectedTab === 'all' || pet.gender === selectedTab;
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleEditPet = (pet: Pet) => {
    setPetToEdit(pet);
    setIsFormOpen(true);
  };

  const handleDeletePet = (petId: string) => {
    setPetToDeleteId(petId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeletePet = async () => {
    if (petToDeleteId) {
      await deletePet(petToDeleteId);
      toast.success('ペットを削除しました！');
      setPetToDeleteId(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (isLoading) {
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
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        {/* Removed PetAddForm from here */}
      </header>

      <div className="flex justify-end mb-4"> {/* New div for PetAddForm */}
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="ペットを検索..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <PetAddForm />
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full mb-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="male">男の子</TabsTrigger>
          <TabsTrigger value="female">女の子</TabsTrigger>
          <TabsTrigger value="other">その他</TabsTrigger>
        </TabsList>
      </Tabs>

      {pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <PawPrintIcon className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">まだペットが登録されていません。</p>
          <p className="text-md">新しいペットを登録して、ケアを始めましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map(pet => (
            <Collapsible key={pet.id} asChild>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <CollapsibleTrigger className="w-full text-left group">
                    <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer">
                      {pet.profileImageUrl ? (
                        <Image src={pet.profileImageUrl} alt={pet.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <PawPrintIcon className="h-24 w-24 text-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 text-white z-10">
                        <div className="flex items-center gap-2">
                          {pet.gender === 'male' && <Mars className="h-6 w-6 text-blue-300 drop-shadow" />}
                          {pet.gender === 'female' && <Venus className="h-6 w-6 text-pink-300 drop-shadow" />}
                          <CardTitle className="text-2xl font-bold drop-shadow">{pet.name}</CardTitle>
                        </div>
                        <CardDescription className="text-gray-200 drop-shadow">
                          {pet.breed || '種類未設定'}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/50 text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPet(pet)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>編集</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePet(pet.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
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
                                        <Tabs defaultValue="details" className="mt-4">
                                          <TabsList className="grid w-full grid-cols-3"> {/* タブ数を3に調整 */}
                                            <TabsTrigger value="details">詳細</TabsTrigger>
                                            <TabsTrigger value="weights">体重記録</TabsTrigger>
                                            <TabsTrigger value="tasks">タスク</TabsTrigger>
                                          </TabsList>
                                          <TabsContent value="details" className="mt-4">
                                            {/* 既存のペット詳細情報をここに移動または表示 */}
                                            {/* 現在のCardContentの内容をここに配置 */}
                                            <div className="space-y-2 text-gray-700 mb-4">
                                              {pet.gender && (
                                                <p className="flex items-center text-sm">
                                                  <User className="mr-2 h-4 w-4 text-gray-500" />
                                                  <span className="font-semibold">性別:</span> {pet.gender === 'male' ? '男の子' : pet.gender === 'female' ? '女の子' : 'その他'}
                                                </p>
                                              )}
                                              {pet.birthday && (
                                                <p className="flex items-center text-sm">
                                                  <CakeIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                  <span className="font-semibold">誕生日:</span> {pet.birthday}
                                                </p>
                                              )}
                                              {pet.adoptionDate && (
                                                <p className="flex items-center text-sm">
                                                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                  <span className="font-semibold">お迎え日:</span> {pet.adoptionDate}
                                                </p>
                                              )}
                                              {pet.microchipId && (
                                                <p className="flex items-center text-sm">
                                                  <MicrochipIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                  <span className="font-semibold">マイクロチップ:</span> {pet.microchipId}
                                                </p>
                                              )}
                                            </div>
                    
                                            {(pet.medicalNotes || (pet.vetInfo && pet.vetInfo.length > 0)) && (
                                              <div className="mt-4">
                                                {pet.medicalNotes && (
                                                  <div className="mb-4">
                                                    <p className="font-semibold text-sm mb-1 flex items-center"><NotebookText className="mr-2 h-4 w-4 text-gray-500" />メモ:</p>
                                                    <p className="text-sm text-gray-600 whitespace-pre-wrap pl-6">{pet.medicalNotes}</p>
                                                  </div>
                                                )}
                                                {pet.vetInfo && pet.vetInfo.length > 0 && (
                                                  <div>
                                                    <p className="font-semibold text-sm mb-2 flex items-center"><StethoscopeIcon className="mr-2 h-4 w-4 text-gray-500" />かかりつけ医情報:</p>
                                                    <div className="pl-6 space-y-2">
                                                      {pet.vetInfo.map((vet, index) => (
                                                        <div key={index} className="text-sm text-gray-600 border-t pt-2 first:border-t-0 first:pt-0">
                                                          <p><strong>病院名:</strong> {vet.name}</p>
                                                          <p><strong>電話番号:</strong> {vet.phone}</p>
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
                                              <Dialog open={openWeightFormForPetId === pet.id} onOpenChange={(isOpen) => {
                                                if (!isOpen) {
                                                  setOpenWeightFormForPetId(null);
                                                }
                                              }}>
                                                <DialogTrigger asChild>
                                                  <Button onClick={() => setOpenWeightFormForPetId(pet.id)}>体重を追加</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                  <DialogHeader>
                                                    <DialogTitle>体重記録の追加</DialogTitle>
                                                  </DialogHeader>
                                                  <WeightForm dogId={pet.id} onSuccess={() => setOpenWeightFormForPetId(null)} />
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
                                              <Dialog open={isAddTaskFormOpen} onOpenChange={setIsAddTaskFormOpen}>
                                                <DialogTrigger asChild>
                                                  <Button>タスクを追加</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                  <DialogHeader>
                                                    <DialogTitle>新しいタスクを追加</DialogTitle>
                                                  </DialogHeader>
                                                  <TaskForm petId={pet.id} isOpen={isAddTaskFormOpen} onClose={() => setIsAddTaskFormOpen(false)} />
                                                </DialogContent>
                                              </Dialog>
                                            </div>
                                            <TaskHistory dogId={pet.id} />
                                          </TabsContent>
                                        </Tabs>                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {isFormOpen && (
        <PetAddForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          petToEdit={petToEdit}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="ペットの削除確認"
        message="本当にこのペットを削除しますか？この操作は元に戻せません。関連するタスクやログも全て論理削除されます。"
        onConfirm={handleConfirmDeletePet}
        confirmButtonText="削除する"
        cancelButtonText="キャンセル"
        isDestructive={true}
      />
    </div>
  );
}
