"use client";

import React, { useState } from 'react';
import { useAdminPets } from '@/hooks/useAdminPets';
import { Pet } from '@/hooks/usePets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, EditIcon, Trash2Icon } from 'lucide-react';
// import { toast } from 'sonner'; // Removed as toast is handled by useAdminPets
import { ConfirmationModal } from '@/components/ConfirmationModal'; // Assuming this component exists

export function PetListAdmin() {
  const { pets, loading, error, deletePetAdmin } = useAdminPets();
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (pet: Pet) => {
    setPetToDelete(pet);
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (petToDelete) {
      await deletePetAdmin(petToDelete.id);
      setPetToDelete(null);
      setIsConfirmingDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>すべてのペットを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 p-4">ペットの読み込み中にエラーが発生しました: {error.message}</p>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">全ペット管理</h2>
      <Input
        placeholder="ペット名または種類で検索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {filteredPets.length === 0 ? (
        <p className="text-gray-500">表示するペットがいません。</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>性別</TableHead>
                <TableHead>誕生日</TableHead>
                <TableHead>画像URL</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPets.map((pet) => (
                <TableRow key={pet.id}>
                  <TableCell className="font-medium">{pet.name}</TableCell>
                  <TableCell>{pet.breed || '未設定'}</TableCell>
                  <TableCell>{pet.gender || '未設定'}</TableCell>
                  <TableCell>{pet.birthday || '未設定'}</TableCell>
                  <TableCell className="truncate max-w-xs">{pet.profileImageUrl ? <a href={pet.profileImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">表示</a> : 'なし'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="mr-2">
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(pet)}>
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleConfirmDelete}
        title="ペットの削除確認"
        message={`本当にペット「${petToDelete?.name}」を削除しますか？この操作は元に戻せません。`}
        confirmButtonText="削除" // Changed from confirmText
        cancelButtonText="キャンセル" // Changed from cancelText
        isDestructive={true} // Added for destructive action styling
      />
    </div>
  );
}
