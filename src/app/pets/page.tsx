'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePets, Pet } from '@/hooks/usePets';
import { PetAddForm } from '@/components/PetAddForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PawPrintIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { pets, loading: petsLoading, deletePet } = usePets();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'male', 'female', 'other'

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

  const handleDeletePet = async (petId: string) => {
    if (confirm('本当にこのペットを削除しますか？')) {
      await deletePet(petId);
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
            <Card key={pet.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              {pet.profileImageUrl ? (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={pet.profileImageUrl} alt={pet.name} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <PawPrintIcon className="h-24 w-24 text-gray-300" />
                </div>
              )}
              <CardHeader className="relative z-10 bg-white bg-opacity-90 p-4">
                <CardTitle className="text-2xl font-bold text-gray-800">{pet.name}</CardTitle>
                <CardDescription className="text-gray-600">{pet.breed || '種類未設定'}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2 text-gray-700">
                {pet.gender && (
                  <p className="flex items-center text-sm">
                    <span className="font-semibold w-20">性別:</span> {pet.gender === 'male' ? '男の子' : pet.gender === 'female' ? '女の子' : 'その他'}
                  </p>
                )}
                {pet.birthday && (
                  <p className="flex items-center text-sm">
                    <span className="font-semibold w-20">誕生日:</span> {pet.birthday}
                  </p>
                )}
                {pet.adoptionDate && (
                  <p className="flex items-center text-sm">
                    <span className="font-semibold w-20">お迎え日:</span> {pet.adoptionDate}
                  </p>
                )}
                {pet.microchipId && (
                  <p className="flex items-center text-sm">
                    <span className="font-semibold w-20">マイクロチップ:</span> {pet.microchipId}
                  </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="secondary" size="sm" onClick={() => handleEditPet(pet)}>編集</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeletePet(pet.id)}>削除</Button>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}
