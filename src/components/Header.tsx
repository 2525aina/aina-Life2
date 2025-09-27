'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { HomeIcon, PawPrintIcon, ClipboardListIcon, LogOutIcon } from 'lucide-react';

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

        {user ? (
          <nav className="flex items-center gap-2 sm:gap-4">
            {/* Placeholder for user info or settings if needed */}
            <Button onClick={handleLogout} variant="secondary">ログアウト</Button>
          </nav>
        ) : (
          <Link href="/login">
            <Button variant="secondary">ログイン</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
