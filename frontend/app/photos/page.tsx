'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { PhotoGallery } from '@/components/PhotoGallery';
import { LogOut, Camera } from 'lucide-react';

export default function PhotosPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1433] to-[#141829] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1433] to-[#141829] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00ff9f]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff3b3b]/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 lg:p-8 border-b border-[#00ff9f]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00ff9f]/10 rounded-lg border border-[#00ff9f]/30">
              <Camera className="w-6 h-6 text-[#00ff9f]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#00ff9f]">Traffic Signal Gallery</h1>
              <p className="text-gray-400 text-sm">View photos captured from all your devices</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Logged in as</div>
              <div className="font-semibold text-[#00ff9f]">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff3b3b]/10 border-2 border-[#ff3b3b] hover:bg-[#ff3b3b]/20 transition-all text-[#ff3b3b] font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 p-6 lg:p-8 max-w-7xl mx-auto">
        <PhotoGallery />
      </div>

      {/* Footer Info */}
      <div className="relative z-10 p-6 lg:p-8 max-w-7xl mx-auto mt-12 border-t border-[#00ff9f]/10">
        <div className="glass-effect rounded-2xl p-6 border border-[#00ff9f]/20">
          <h3 className="text-lg font-bold text-[#00ff9f] mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <div className="font-semibold text-[#00ff9f] mb-1">1. Capture on Mobile</div>
              <p>Use your mobile device to capture photos of traffic signals with the camera.</p>
            </div>
            <div>
              <div className="font-semibold text-[#00ff9f] mb-1">2. Auto Detection</div>
              <p>AI automatically detects the signal color (RED/YELLOW/GREEN) and confidence.</p>
            </div>
            <div>
              <div className="font-semibold text-[#00ff9f] mb-1">3. Real-Time Sync</div>
              <p>All photos sync across devices instantly and appear in this gallery.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
