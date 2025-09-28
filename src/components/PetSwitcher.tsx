"use client";

import { useEffect } from "react";
import { usePets } from "@/hooks/usePets";
import { usePetSelection } from "@/contexts/PetSelectionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    return <div>ペット情報をロード中...</div>;
  }

  if (pets.length === 0) {
    return (
      <div className="text-center space-y-4">
        <p>①ペットがまだ登録されていません。</p>
        <Link href="/pets">
          <Button>①ペットを登録する</Button>
        </Link>
      </div>
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
