'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PetSwitcher } from '@/components/PetSwitcher';
import { Bell } from 'lucide-react';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-4 shadow-md">
      <div className="flex justify-between items-center"> {/* Removed px-4 */}
        <Link href="/" className="text-2xl font-bold whitespace-nowrap">
          aina-Life
        </Link>
        {user && (
          <div className="flex items-center space-x-4">
            <Link href="/invitations" className="text-primary-foreground hover:text-primary-foreground/80">
              <Bell className="h-6 w-6" />
            </Link>
            <PetSwitcher />
          </div>
        )}
      </div>
    </header>
  );
}
