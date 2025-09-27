'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { TaskSelector } from '@/components/TaskSelector';
import { LogTimeline } from '@/components/LogTimeline';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('ログアウトしました');
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
      alert('ログアウトに失敗しました');
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <p>ロード中...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 md:px-8 pt-16">
      {user ? (
        <div className="w-full max-w-4xl space-y-8">
          <div className="flex justify-between items-center">
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <TaskSelector />
            </div>
            <div className="md:col-span-2">
              <LogTimeline />
            </div>
          </div>
        </div>
      ) : (
        null
      )}
    </main>
  );
}
