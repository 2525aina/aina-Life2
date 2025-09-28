'use client';

import { useAuth } from '@/contexts/AuthContext';
import { TaskSelector } from '@/components/TaskSelector';
import { LogTimeline } from '@/components/LogTimeline';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">ロード中...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center px-4 md:px-8"> {/* Removed min-h-screen and pt-16 */}
      {user ? (
        <div className="w-full max-w-4xl space-y-4"> {/* Changed space-y-8 to space-y-4 */}
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
