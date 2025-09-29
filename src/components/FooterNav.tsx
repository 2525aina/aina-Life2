'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, PawPrintIcon, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function FooterNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const navItems = [
    { name: 'ホーム', href: '/', icon: HomeIcon, action: null },
    { name: 'ペット', href: '/pets', icon: PawPrintIcon, action: null },
    { name: 'プロフィール', href: '/profile', icon: UserIcon, action: null },
  ];

  if (loading) return null;
  if (!user) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <nav className="flex justify-around h-16 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href && item.href !== '#';
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              onClick={item.action || undefined}
              className="flex flex-col items-center justify-center flex-grow text-sm"
            >
              <Icon className={cn(
                "h-8 w-8",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs mt-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
