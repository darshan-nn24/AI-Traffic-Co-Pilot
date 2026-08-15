'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertToastProps {
  alerts: string[];
  signal?: 'RED' | 'YELLOW' | 'GREEN' | null;
  emergency?: boolean;
}

export function AlertToast({ alerts, signal, emergency }: AlertToastProps) {
  const [displayAlerts, setDisplayAlerts] = useState<Map<string, { id: string; signal: string; time: number }>>(new Map());

  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1];
      const [sig] = latestAlert.split('-');
      
      // Only add if not already in displayAlerts (prevent duplicates)
      setDisplayAlerts(prev => {
        if (prev.has(latestAlert)) {
          return prev;
        }
        const updated = new Map(prev);
        updated.set(latestAlert, { id: latestAlert, signal: sig, time: Date.now() });
        return updated;
      });

      const timer = setTimeout(() => {
        setDisplayAlerts(prev => {
          const updated = new Map(prev);
          updated.delete(latestAlert);
          return updated;
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alerts]);

  if (displayAlerts.size === 0) return null;

  const getAlertColors = (sig: string) => {
    switch (sig) {
      case 'RED':
        return 'bg-[#ff3b3b]/20 border-[#ff3b3b] text-[#ff3b3b]';
      case 'YELLOW':
        return 'bg-[#ffd60a]/20 border-[#ffd60a] text-[#ffd60a]';
      case 'GREEN':
        return 'bg-[#00ff9f]/20 border-[#00ff9f] text-[#00ff9f]';
      default:
        return 'bg-blue-500/20 border-blue-500 text-blue-400';
    }
  };

  const getAlertMessage = (sig: string) => {
    switch (sig) {
      case 'RED':
        return 'STOP - Red light detected';
      case 'YELLOW':
        return 'WAIT - Yellow light detected';
      case 'GREEN':
        return 'GO - Green light detected';
      default:
        return 'Alert';
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-40 space-y-3 max-w-sm">
      {Array.from(displayAlerts.values()).map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'glass-effect rounded-lg px-4 py-3 border-2 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300',
            getAlertColors(alert.signal)
          )}
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">{getAlertMessage(alert.signal)}</p>
            <p className="text-xs opacity-75">SMS sent to your phone</p>
          </div>
        </div>
      ))}
    </div>
  );
}
