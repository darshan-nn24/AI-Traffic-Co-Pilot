'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface SignalPredictionProps {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  timeToChange: number;
  nextSignal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
}

export function SignalPrediction({ signal, timeToChange, nextSignal, confidence }: SignalPredictionProps) {
  const [displayTime, setDisplayTime] = useState(timeToChange);

  useEffect(() => {
    setDisplayTime(timeToChange);
  }, [timeToChange]);

  const getSignalColor = (sig: 'RED' | 'YELLOW' | 'GREEN') => {
    switch (sig) {
      case 'RED': return 'from-[#ff3b3b] to-[#cc0000]';
      case 'GREEN': return 'from-[#00ff9f] to-[#00cc7f]';
      case 'YELLOW': return 'from-[#ffd60a] to-[#ccaa00]';
    }
  };

  const getSignalLabel = (sig: 'RED' | 'YELLOW' | 'GREEN') => {
    switch (sig) {
      case 'RED': return 'STOP';
      case 'GREEN': return 'GO';
      case 'YELLOW': return 'WAIT';
    }
  };

  if (!signal || !nextSignal) {
    return (
      <div className="glass-effect rounded-xl p-6 border-2 border-[#00ff9f]/20 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00ff9f]" />
          <h3 className="font-bold text-[#00ff9f]">Signal Prediction</h3>
        </div>
        <div className="text-center py-8 text-gray-400">
          Waiting for signal detection...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border-2 border-[#00ff9f]/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#00ff9f]" />
        <h3 className="font-bold text-[#00ff9f]">Signal Prediction</h3>
        <span className="text-xs bg-[#00ff9f]/20 text-[#00ff9f] px-2 py-1 rounded-full ml-auto">
          {confidence}% confident
        </span>
      </div>

      {/* Current Signal */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 uppercase">Current Signal</div>
        <div className={cn(
          'py-3 px-4 rounded-lg font-bold text-center text-2xl',
          signal === 'RED' ? 'bg-[#ff3b3b]/10 text-[#ff3b3b] border-2 border-[#ff3b3b]/50' :
          signal === 'GREEN' ? 'bg-[#00ff9f]/10 text-[#00ff9f] border-2 border-[#00ff9f]/50' :
          'bg-[#ffd60a]/10 text-[#ffd60a] border-2 border-[#ffd60a]/50'
        )}>
          {getSignalLabel(signal)}
        </div>
      </div>

      {/* Time Remaining */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 uppercase">Time to Change</div>
        <div className="text-4xl font-bold text-[#00ff9f] text-center neon-glow">
          {displayTime}s
        </div>
        <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#00ff9f] to-[#00cc7f] h-full transition-all duration-1000"
            style={{ width: `${(displayTime / (signal === 'YELLOW' ? 3 : signal === 'GREEN' ? 8 : 5)) * 100}%` }}
          />
        </div>
      </div>

      {/* Next Signal Prediction */}
      <div className="space-y-2 pt-2 border-t border-gray-600/30">
        <div className="text-xs text-gray-400 uppercase">Next Signal</div>
        <div className={cn(
          'py-2 px-3 rounded-lg font-bold text-center text-lg bg-gradient-to-r',
          getSignalColor(nextSignal)
        )}>
          {getSignalLabel(nextSignal)} Coming
        </div>
      </div>

      {/* Pro Tip */}
      <div className="text-xs text-gray-400 italic pt-2">
        We predict signal transitions to assist proactive driving.
      </div>
    </div>
  );
}
