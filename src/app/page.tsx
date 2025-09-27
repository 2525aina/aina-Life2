'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { PetSwitcher } from '@/components/PetSwitcher';
import { TaskSelector } from '@/components/TaskSelector';
import { LogTimeline } from '@/components/LogTimeline';

export default function Home() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('ログアウトしました');
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
      alert('ログアウトに失敗しました');
    }
  };

  if (loading) {
    return <p>ロード中...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8">aina-Lifeへようこそ！</h1>

      {user ? (
        <div className="w-full max-w-4xl space-y-8">
          <div className="flex justify-between items-center">
            <p className="text-lg">ログイン中: {user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <PetSwitcher />
              <h2 className="text-2xl font-semibold mt-4">今日の記録</h2>
              <TaskSelector />
            </div>
            <div className="md:col-span-2">
              <LogTimeline />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">ログインしていません。</p>
          <Link href="/login">
            <Button>ログインページへ</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
