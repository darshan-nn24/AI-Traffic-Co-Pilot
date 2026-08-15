'use client';

import { cn } from '@/lib/utils';

interface TrafficLightIndicatorProps {
  signal: 'RED' | 'YELLOW' | 'GREEN';
}

export function TrafficLightIndicator({ signal }: TrafficLightIndicatorProps) {
  const getSignalColor = (light: 'red' | 'yellow' | 'green') => {
    const isActive = signal === 'RED' && light === 'red' ? true : signal === 'YELLOW' && light === 'yellow' ? true : signal === 'GREEN' && light === 'green';
    
    if (light === 'red') {
      return isActive ? 'bg-[#ff3b3b] shadow-[0_0_30px_#ff3b3b]' : 'bg-red-950';
    } else if (light === 'yellow') {
      return isActive ? 'bg-[#ffd60a] shadow-[0_0_30px_#ffd60a]' : 'bg-yellow-900';
    } else {
      return isActive ? 'bg-[#00ff9f] shadow-[0_0_30px_#00ff9f]' : 'bg-green-900';
    }
  };

  const getMessage = () => {
    switch (signal) {
      case 'RED': return 'STOP';
      case 'YELLOW': return 'SLOW DOWN';
      case 'GREEN': return 'GO';
    }
  };

  const getTextColor = () => {
    switch (signal) {
      case 'RED': return 'text-[#ff3b3b]';
      case 'YELLOW': return 'text-[#ffd60a]';
      case 'GREEN': return 'text-[#00ff9f]';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative w-32 h-48 glass-effect rounded-full flex flex-col gap-4 p-4 items-center justify-center">
        <div className={cn("w-20 h-20 rounded-full transition-all duration-300", getSignalColor('red'))} />
        <div className={cn("w-20 h-20 rounded-full transition-all duration-300", getSignalColor('yellow'))} />
        <div className={cn("w-20 h-20 rounded-full transition-all duration-300", getSignalColor('green'))} />
      </div>
      
      <div className={cn("text-4xl font-bold tracking-widest transition-all duration-500", getTextColor(), signal !== 'RED' && 'neon-glow')}>
        {getMessage()}
      </div>

      <div className="flex items-center gap-3 glass-effect px-6 py-3 rounded-lg">
        <div className="w-3 h-3 rounded-full bg-[#00ff9f] animate-pulse" />
        <span className="text-sm font-medium text-gray-300">AI Assistant Speaking...</span>
      </div>
    </div>
  );
}
