"use client";

import { useEffect } from "react";
import { usePets } from "@/hooks/usePets";
import { usePetSelection } from "@/contexts/PetSelectionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Loader2 } from 'lucide-react';

export function PetSwitcher() {
  const { pets, loading: petsLoading } = usePets();
  const { selectedPet, setSelectedPet } = usePetSelection();

  // Set a default pet if one isn't set
  useEffect(() => {
    if (!selectedPet && pets.length > 0) {
      setSelectedPet(pets[0]);
    }
    // If the currently selected pet is no longer in the list, clear it
    if (selectedPet && !pets.find((p) => p.id === selectedPet.id)) {
      setSelectedPet(null);
    }
  }, [pets, selectedPet, setSelectedPet]);

  const handleValueChange = (petId: string) => {
    const pet = pets.find((p) => p.id === petId) || null;
    setSelectedPet(pet);
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
      <Select onValueChange={handleValueChange} value={selectedPet?.id || ""}>
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
