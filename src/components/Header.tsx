'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PetSwitcher } from '@/components/PetSwitcher';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold whitespace-nowrap">
          aina-Life
        </Link>
        {user && <PetSwitcher />}
      </div>
    </header>
  );
}
