'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInstructionsProps {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  emergency: boolean;
  timeToChange?: number;
  nextSignal?: 'RED' | 'YELLOW' | 'GREEN' | null;
}

export function VoiceInstructions({ signal, emergency, timeToChange, nextSignal }: VoiceInstructionsProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastAnnounced, setLastAnnounced] = useState<string | null>(null);
  const [lastProactiveAnnounce, setLastProactiveAnnounce] = useState<number>(0);

  // Announce signal changes and proactive warnings
  useEffect(() => {
    if (!voiceEnabled || !signal) return;

    const now = Date.now();

    // Primary announcement: signal change
    if (lastAnnounced !== signal) {
      let announcement = '';
      switch (signal) {
        case 'RED':
          announcement = emergency ? 'Emergency vehicle approaching. Stop immediately.' : 'Stop. Red light.';
          break;
        case 'YELLOW':
          announcement = emergency ? 'Emergency vehicle. Prepare to stop.' : 'Caution. Yellow light. Prepare to stop.';
          break;
        case 'GREEN':
          announcement = 'Go. Green light. Proceed with caution.';
          break;
      }

      if (announcement) {
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
        setLastAnnounced(signal);
      }
    }

    // Proactive announcement: predict when signal will change
    if (timeToChange && timeToChange === 5 && now - lastProactiveAnnounce > 4000) {
      let proactive = '';
      if (signal === 'RED' && nextSignal === 'GREEN') {
        proactive = 'Red light ending in 5 seconds. Prepare to proceed.';
      } else if (signal === 'GREEN' && nextSignal === 'YELLOW') {
        proactive = 'Green light ending in 5 seconds. Prepare to slow down.';
      } else if (signal === 'YELLOW' && nextSignal === 'RED') {
        proactive = 'Yellow light ending in 5 seconds. Be ready to stop.';
      }

      if (proactive && voiceEnabled) {
        const utterance = new SpeechSynthesisUtterance(proactive);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);

        // Queue after current speech if any
        setTimeout(() => {
          speechSynthesis.speak(utterance);
        }, 100);
        
        setLastProactiveAnnounce(now);
      }
    }
  }, [signal, voiceEnabled, emergency, timeToChange, nextSignal, lastAnnounced, lastProactiveAnnounce]);

  // Stop voice on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <button
      onClick={() => {
        setVoiceEnabled(!voiceEnabled);
        if (isPlaying) speechSynthesis.cancel();
      }}
      className={cn(
        'p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2',
        voiceEnabled
          ? 'bg-[#00ff9f]/10 border-[#00ff9f] text-[#00ff9f] hover:shadow-[0_0_15px_rgba(0,255,159,0.5)]'
          : 'bg-slate-800/30 border-slate-700 text-gray-400 hover:border-slate-600'
      )}
      title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
    >
      {voiceEnabled ? (
        <Volume2 className={cn('w-5 h-5', isPlaying && 'animate-pulse')} />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </button>
  );
}
