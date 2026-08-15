'use client';

import { cn } from '@/lib/utils';

interface SignalStatusProps {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
}

export function SignalStatus({ signal, confidence }: SignalStatusProps) {
  const getStatusText = () => {
    switch (signal) {
      case 'RED': return 'STOP';
      case 'GREEN': return 'GO';
      case 'YELLOW': return 'SLOW DOWN';
      default: return 'WAITING';
    }
  };

  const getStatusColor = () => {
    switch (signal) {
      case 'RED': return 'text-[#ff3b3b] border-[#ff3b3b]';
      case 'GREEN': return 'text-[#00ff9f] border-[#00ff9f]';
      case 'YELLOW': return 'text-[#ffd60a] border-[#ffd60a]';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getGlowColor = () => {
    switch (signal) {
      case 'RED': return 'shadow-[0_0_40px_rgba(255,59,59,0.8)]';
      case 'GREEN': return 'shadow-[0_0_40px_rgba(0,255,159,0.8)]';
      case 'YELLOW': return 'shadow-[0_0_40px_rgba(255,214,10,0.8)]';
      default: return 'shadow-[0_0_20px_rgba(148,163,184,0.3)]';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Status Text */}
      <div className={cn("glass-effect rounded-2xl p-8 border-2 text-center transition-all duration-300", getStatusColor())}>
        <div className="text-sm uppercase text-gray-400 mb-2">Traffic Signal Status</div>
        <div className={cn("text-6xl font-black neon-glow", getStatusColor())}>
          {getStatusText()}
        </div>
      </div>

      {/* Signal Indicator Lights */}
      <div className="flex justify-center gap-6">
        {['RED', 'YELLOW', 'GREEN'].map((light) => (
          <div
            key={light}
            className={cn(
              'w-20 h-20 rounded-full border-2 transition-all duration-300 flex items-center justify-center',
              signal === light
                ? cn(
                    'border-2 scale-110',
                    light === 'RED' ? 'bg-[#ff3b3b]/20 border-[#ff3b3b] shadow-[0_0_30px_rgba(255,59,59,0.8)]' :
                    light === 'GREEN' ? 'bg-[#00ff9f]/20 border-[#00ff9f] shadow-[0_0_30px_rgba(0,255,159,0.8)]' :
                    'bg-[#ffd60a]/20 border-[#ffd60a] shadow-[0_0_30px_rgba(255,214,10,0.8)]'
                  )
                : 'bg-slate-800/50 border-slate-600 opacity-50'
            )}
          >
            <div
              className={cn(
                'w-16 h-16 rounded-full transition-all',
                signal === light
                  ? light === 'RED' ? 'bg-[#ff3b3b] animate-pulse' :
                    light === 'GREEN' ? 'bg-[#00ff9f] animate-pulse' :
                    'bg-[#ffd60a] animate-pulse'
                  : 'bg-slate-700'
              )}
            />
          </div>
        ))}
      </div>

      {/* Confidence Meter */}
      <div className="glass-effect rounded-lg p-4 border-2 border-[#00ff9f]/30 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm uppercase text-gray-400">Detection Confidence</span>
          <span className="text-lg font-bold text-[#00ff9f]">{confidence}%</span>
        </div>
        <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-[#00ff9f]/20">
          <div
            className="h-full bg-gradient-to-r from-[#00ff9f] to-[#00ffff] transition-all duration-300"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-effect rounded-lg p-4 border-2 border-[#00ff9f]/20 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Current Signal:</span>
          <span className="font-bold">{signal || 'No Signal Detected'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={cn("font-bold", getStatusColor())}>
            {getStatusText()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Detection Mode:</span>
          <span className="font-bold text-[#00ff9f]">AI Vision Active</span>
        </div>
      </div>
    </div>
  );
}
