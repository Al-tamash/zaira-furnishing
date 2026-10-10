'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingConciergeBar } from '@/components/layout/FloatingConciergeBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { DbCmsContent } from '@/lib/db/types';

interface StorefrontShellProps {
  children: React.ReactNode;
  footerCms?: DbCmsContent | null;
}

export function StorefrontShell({ children, footerCms }: StorefrontShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] font-sans">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer cmsContent={footerCms} />
      <FloatingConciergeBar />
      <MobileBottomNav />
    </>
  );
}
