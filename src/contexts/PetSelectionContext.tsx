'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Pet } from '@/hooks/usePets';

// Contextの型定義
interface PetSelectionContextType {
  selectedPet: Pet | null;
  setSelectedPet: (pet: Pet | null) => void;
}

// Contextの作成
const PetSelectionContext = createContext<PetSelectionContextType | undefined>(undefined);

// PetSelectionProviderコンポーネントの定義
export function PetSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // useMemoでcontextの値をメモ化し、不要な再レンダリングを防ぐ
  const value = useMemo(() => ({ selectedPet, setSelectedPet }), [selectedPet]);

  return (
    <PetSelectionContext.Provider value={value}>
      {children}
    </PetSelectionContext.Provider>
  );
}

// Contextを使用するためのカスタムフック
export const usePetSelection = () => {
  const context = useContext(PetSelectionContext);
  if (context === undefined) {
    throw new Error('usePetSelection must be used within a PetSelectionProvider');
  }
  return context;
};
