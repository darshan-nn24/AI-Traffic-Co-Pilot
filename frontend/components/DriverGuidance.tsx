'use client';

import { AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverGuidanceProps {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
  emergency: boolean;
}

export function DriverGuidance({ signal, confidence, emergency }: DriverGuidanceProps) {
  const getGuidanceText = () => {
    if (emergency) {
      return {
        instruction: 'EMERGENCY VEHICLE',
        detail: 'Pull over to the side and stop',
        urgency: 'critical',
        icon: AlertTriangle,
      };
    }

    switch (signal) {
      case 'RED':
        return {
          instruction: 'STOP AT THE LINE',
          detail: 'Do not enter the intersection',
          urgency: 'high',
          icon: AlertTriangle,
        };
      case 'YELLOW':
        return {
          instruction: 'PREPARE TO STOP',
          detail: 'Traffic light will turn red soon',
          urgency: 'medium',
          icon: AlertTriangle,
        };
      case 'GREEN':
        return {
          instruction: 'PROCEED WITH CAUTION',
          detail: 'Check for cross traffic before entering',
          urgency: 'low',
          icon: ChevronRight,
        };
      default:
        return {
          instruction: 'ANALYZING SIGNAL',
          detail: 'Point camera at traffic light',
          urgency: 'neutral',
          icon: ChevronRight,
        };
    }
  };

  const guidance = getGuidanceText();
  const Icon = guidance.icon;

  const getColors = () => {
    switch (guidance.urgency) {
      case 'critical':
        return {
          bg: 'bg-[#ff3b3b]/10',
          border: 'border-[#ff3b3b]',
          text: 'text-[#ff3b3b]',
          glow: 'shadow-[0_0_30px_rgba(255,59,59,0.5)]',
        };
      case 'high':
        return {
          bg: 'bg-[#ff3b3b]/10',
          border: 'border-[#ff3b3b]',
          text: 'text-[#ff3b3b]',
          glow: 'shadow-[0_0_20px_rgba(255,59,59,0.3)]',
        };
      case 'medium':
        return {
          bg: 'bg-[#ffd60a]/10',
          border: 'border-[#ffd60a]',
          text: 'text-[#ffd60a]',
          glow: 'shadow-[0_0_20px_rgba(255,214,10,0.3)]',
        };
      case 'low':
        return {
          bg: 'bg-[#00ff9f]/10',
          border: 'border-[#00ff9f]',
          text: 'text-[#00ff9f]',
          glow: 'shadow-[0_0_20px_rgba(0,255,159,0.2)]',
        };
      default:
        return {
          bg: 'bg-slate-800/10',
          border: 'border-slate-700',
          text: 'text-slate-400',
          glow: '',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={cn(
        'glass-effect rounded-2xl p-6 border-2 transition-all duration-500',
        colors.bg,
        colors.border,
        colors.glow,
        emergency && 'animate-pulse'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn('p-3 rounded-lg bg-black/30', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.text)} />
        </div>
        <div className="flex-1">
          <h3 className={cn('text-2xl font-bold tracking-wider', colors.text)}>
            {guidance.instruction}
          </h3>
          <p className="text-gray-400 text-sm mt-1">{guidance.detail}</p>
        </div>
      </div>

      {/* Confidence Bar */}
      {signal && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase text-gray-500 font-semibold">Signal Confidence</span>
            <span className={cn('text-sm font-bold', colors.text)}>{confidence}%</span>
          </div>
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', colors.text)}
              style={{
                width: `${confidence}%`,
                backgroundColor: colors.text === 'text-[#ff3b3b]' ? '#ff3b3b' :
                                colors.text === 'text-[#ffd60a]' ? '#ffd60a' :
                                colors.text === 'text-[#00ff9f]' ? '#00ff9f' :
                                '#94a3b8',
              }}
            />
          </div>
        </div>
      )}

      {/* Emergency Alert */}
      {emergency && (
        <div className="mt-4 pt-4 border-t border-[#ff3b3b]/50">
          <div className="bg-[#ff3b3b]/20 rounded-lg p-3 border border-[#ff3b3b]/50">
            <p className="text-[#ff3b3b] text-sm font-semibold">
              Priority Alert: Emergency vehicle sirens detected. Give right of way.
            </p>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <div className={cn('w-2 h-2 rounded-full', 
          emergency ? 'bg-[#ff3b3b] animate-pulse' : 
          signal === 'RED' ? 'bg-[#ff3b3b]' :
          signal === 'YELLOW' ? 'bg-[#ffd60a]' :
          signal === 'GREEN' ? 'bg-[#00ff9f]' :
          'bg-slate-600'
        )} />
        <span>
          {emergency ? 'EMERGENCY ALERT' :
           signal === 'RED' ? 'STOP - Red Light' :
           signal === 'YELLOW' ? 'CAUTION - Yellow Light' :
           signal === 'GREEN' ? 'GO - Green Light' :
           'Scanning for signal'}
        </span>
      </div>
    </div>
  );
}
