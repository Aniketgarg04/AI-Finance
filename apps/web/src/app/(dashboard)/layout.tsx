'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  useEffect(() => {
    if (_hasHydrated) {
      if (!user) router.push('/login');
      else if (user.isProfileComplete === false) router.push('/onboarding');
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated || !user || user.isProfileComplete === false) return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />

      <div className={cn('main-content', sidebarOpen && 'open')}>
        <TopNav />
        <main className="flex-1 px-5 py-6 md:px-6 md:py-7 lg:px-8 lg:py-8 overflow-x-hidden">
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
