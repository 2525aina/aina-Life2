'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { HomeIcon, PawPrintIcon, ClipboardListIcon, LogOutIcon } from 'lucide-react';
import { PetSwitcher } from '@/components/PetSwitcher';

export function Header() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('ログアウトしました');
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
      alert('ログアウトに失敗しました');
    }
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          aina-Life
        </Link>
        {user && <PetSwitcher />}
      </div>
    </header>
  );
}
