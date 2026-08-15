'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface PredictionData {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  nextSignal: 'RED' | 'YELLOW' | 'GREEN' | null;
  timeToChange: number;
  confidence: number;
  predictedAt: number;
}

const SIGNAL_DURATIONS = {
  RED: 5,
  YELLOW: 3,
  GREEN: 8,
};

const SIGNAL_SEQUENCE: ('RED' | 'YELLOW' | 'GREEN')[] = ['RED', 'GREEN', 'YELLOW'];

export function useSignalPredictor() {
  const [prediction, setPrediction] = useState<PredictionData>({
    signal: null,
    nextSignal: null,
    timeToChange: 0,
    confidence: 0,
    predictedAt: 0,
  });

  const signalHistoryRef = useRef<Array<{ signal: 'RED' | 'YELLOW' | 'GREEN'; timestamp: number }>>([]);
  const lastSignalRef = useRef<'RED' | 'YELLOW' | 'GREEN' | null>(null);
  const signalStartTimeRef = useRef<number>(0);

  const predictNextSignal = useCallback((signal: 'RED' | 'YELLOW' | 'GREEN' | null) => {
    if (!signal) return;

    const now = Date.now();

    // If signal changed, record it
    if (lastSignalRef.current !== signal) {
      lastSignalRef.current = signal;
      signalStartTimeRef.current = now;
      signalHistoryRef.current.push({ signal, timestamp: now });

      // Keep only last 20 signals
      if (signalHistoryRef.current.length > 20) {
        signalHistoryRef.current.shift();
      }
    }

    // Calculate time elapsed in current signal
    const timeElapsed = (now - signalStartTimeRef.current) / 1000;
    const expectedDuration = SIGNAL_DURATIONS[signal];
    const timeRemaining = Math.max(0, expectedDuration - timeElapsed);

    // Determine next signal
    const currentIndex = SIGNAL_SEQUENCE.indexOf(signal);
    const nextSignal = SIGNAL_SEQUENCE[(currentIndex + 1) % SIGNAL_SEQUENCE.length];

    // Calculate confidence based on consistency
    const recentSignals = signalHistoryRef.current.slice(-5);
    const signalPattern = recentSignals.map(s => s.signal).join('');
    const isConsistent = recentSignals.length === 5 && signalPattern === 'RGYRGYRGY'.substring(0, 5);
    const confidence = isConsistent ? 95 : 70 + Math.random() * 20;

    setPrediction({
      signal,
      nextSignal,
      timeToChange: Math.round(timeRemaining),
      confidence: Math.round(confidence),
      predictedAt: now,
    });
  }, []);

  return {
    prediction,
    predictNextSignal,
    history: signalHistoryRef.current,
  };
}
