"use client";

import { useEffect } from "react";
import { usePets } from "@/hooks/usePets";
import { usePetSelection } from "@/contexts/PetSelectionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Loader2 } from 'lucide-react';

export function PetSwitcher() {
  const { pets, loading: petsLoading } = usePets();
  const { selectedPetId, setSelectedPetId, selectedPet } = usePetSelection();

  // Set a default pet if one isn't set
  useEffect(() => {
    // selectedPetIdがnullで、かつペットが存在する場合のみ処理
    if (selectedPetId === null && pets.length > 0) {
      // PetSelectionContextで既にprimaryPetIdや最初のペットが設定されているはずなので、ここでは何もしない
      // もしselectedPetIdがまだnullであれば、PetSelectionContextのロジックがまだ実行されていないか、
      // またはprimaryPetIdも最初のペットも設定できなかったケースなので、ここでは何もしない
    }
    // If the currently selected pet is no longer in the list, clear it
    if (selectedPetId && !pets.find((p) => p.id === selectedPetId)) {
      setSelectedPetId(null);
    }
  }, [pets, selectedPetId, setSelectedPetId]);

  const handleValueChange = (petId: string) => {
    setSelectedPetId(petId);
  };

  if (petsLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="ml-2 text-sm">ペット情報をロード中...</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <Link href="/pets" className="text-sm text-muted-foreground hover:text-primary">
        ペットを追加
      </Link>
    );
  }

  return (
    <div className="w-full max-w-xs">
      <Select onValueChange={handleValueChange} value={selectedPetId || ""}>
        <SelectTrigger id="pet-switcher">
          <SelectValue placeholder="ペットを選択..." />
        </SelectTrigger>
        <SelectContent>
          {pets.map((pet) => (
            <SelectItem key={pet.id} value={pet.id}>
              {pet.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
