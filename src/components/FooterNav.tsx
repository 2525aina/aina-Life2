'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, PawPrintIcon, ClipboardListIcon, LogOutIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';

export function FooterNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('ログアウトしました');
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  const navItems = [
    { name: 'ホーム', href: '/', icon: HomeIcon, action: null },
    { name: 'ペット', href: '/pets', icon: PawPrintIcon, action: null },
    { name: 'タスク', href: '/tasks', icon: ClipboardListIcon, action: null },
    { name: 'ログアウト', href: '#', icon: LogOutIcon, action: handleLogout },
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
