'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertNotification {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  message: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface AlertSystemProps {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
}

export function AlertSystem({ signal, confidence }: AlertSystemProps) {
  const [alert, setAlert] = useState<AlertNotification | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const getAlert = (): AlertNotification | null => {
    switch (signal) {
      case 'RED':
        return {
          signal: 'RED',
          message: 'STOP',
          icon: <AlertCircle className="w-8 h-8" />,
          color: 'text-[#ff3b3b]',
          bgColor: 'bg-[#ff3b3b]/10 border-[#ff3b3b]',
        };
      case 'YELLOW':
        return {
          signal: 'YELLOW',
          message: 'WAIT',
          icon: <AlertTriangle className="w-8 h-8" />,
          color: 'text-[#ffd60a]',
          bgColor: 'bg-[#ffd60a]/10 border-[#ffd60a]',
        };
      case 'GREEN':
        return {
          signal: 'GREEN',
          message: 'GO',
          icon: <CheckCircle className="w-8 h-8" />,
          color: 'text-[#00ff9f]',
          bgColor: 'bg-[#00ff9f]/10 border-[#00ff9f]',
        };
      default:
        return null;
    }
  };

  useEffect(() => {
    const newAlert = getAlert();
    if (newAlert && newAlert.signal !== alert?.signal) {
      setAlert(newAlert);
      setShowAlert(true);

      // Keep alert visible for 2 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [signal, alert?.signal]);

  if (!alert || !showAlert) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div
        className={cn(
          'glass-effect rounded-2xl p-6 border-2 flex items-center gap-4 shadow-2xl',
          alert.bgColor,
          alert.signal === 'RED' && 'shadow-[0_0_50px_rgba(255,59,59,0.6)]',
          alert.signal === 'YELLOW' && 'shadow-[0_0_50px_rgba(255,214,10,0.6)]',
          alert.signal === 'GREEN' && 'shadow-[0_0_50px_rgba(0,255,159,0.6)]'
        )}
      >
        <div className={cn('animate-pulse', alert.color)}>
          {alert.icon}
        </div>
        <div>
          <div className={cn('text-3xl font-black', alert.color)}>
            {alert.message}
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Confidence: {confidence}%
          </div>
        </div>
      </div>
    </div>
  );
}
