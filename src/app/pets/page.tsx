'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePets, Pet } from '@/hooks/usePets';
import { PetAddForm } from '@/components/PetAddForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { pets, loading: petsLoading, deletePet } = usePets();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);

  const isLoading = authLoading || petsLoading;

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
    return <p>ロード中...</p>;
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
        <h1 className="text-4xl font-bold">ペット管理</h1>
        <div className="flex gap-4">
          <PetAddForm />
          <Link href="/">
            <Button variant="outline">ホームへ戻る</Button>
          </Link>
        </div>
      </header>

      {pets.length === 0 ? (
        <div className="text-center">
          <p>まだペットが登録されていません。</p>
          <p>最初のペットを追加しましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map(pet => (
            <Card key={pet.id}>
              <CardHeader>
                <CardTitle>{pet.name}</CardTitle>
                <CardDescription>{pet.breed || '種類未設定'}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleEditPet(pet)}>編集</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeletePet(pet.id)}>削除</Button>
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
