'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useUser'; // Import useUser
import { PetSwitcher } from '@/components/PetSwitcher';
import { Toaster } from '@/components/ui/sonner'; // Import Toaster

export function Header() {
  const { user } = useAuth();
  const { userProfile } = useUser(); // Get userProfile

  const toastPosition = userProfile?.settings?.toastPosition || 'bottom-right'; // Default position

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-4 shadow-md">
      <div className="flex justify-between items-center"> {/* Removed px-4 */}
        <Link href="/" className="text-2xl font-bold whitespace-nowrap">
          aina-Life
        </Link>
        {user && <PetSwitcher />}
      </div>
      <Toaster position={toastPosition} /> {/* Render Toaster with configurable position */}
    </header>
  );
}
