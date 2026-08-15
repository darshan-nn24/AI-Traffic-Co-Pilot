'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyBannerProps {
  isEmergency: boolean;
}

export function EmergencyBanner({ isEmergency }: EmergencyBannerProps) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isEmergency) {
      setVisible(true);
      setCountdown(5);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [isEmergency]);

  if (!visible) return null;

  return (
    <>
      {/* Full screen pulse effect */}
      <div className={cn(
        'fixed inset-0 pointer-events-none transition-opacity duration-300',
        isEmergency ? 'opacity-20' : 'opacity-0'
      )} style={{
        background: 'repeating-linear-gradient(90deg, #ff3b3b 0px, #ff3b3b 2px, transparent 2px, transparent 10px)',
        animation: isEmergency ? 'pulse 0.5s infinite' : 'none'
      }} />

      {/* Emergency Banner */}
      <div className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform',
        isEmergency ? 'translate-y-0' : '-translate-y-full'
      )}>
        <div className="bg-gradient-to-r from-[#ff3b3b] to-[#cc0000] py-4 px-6 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
              <div>
                <div className="text-white font-bold text-lg">EMERGENCY VEHICLE DETECTED</div>
                <div className="text-white/80 text-sm">Clear the road immediately. Priority vehicle approaching.</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white text-3xl font-bold tabular-nums">{countdown}s</div>
              <div className="w-1 h-12 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="w-full bg-white transition-all duration-1000"
                  style={{ height: `${(countdown / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Animated top border */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 animate-pulse" />
      </div>
    </>
  );
}
