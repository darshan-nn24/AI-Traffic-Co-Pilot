'use client';

import { useRef, useCallback, useState } from 'react';

interface AlertState {
  lastAlertedSignal: string | null;
  lastAlertTime: number;
  phoneNumber: string;
  smsEnabled: boolean;
}

export function useAlertService() {
  const [alerts, setAlerts] = useState<string[]>([]);
  const stateRef = useRef<AlertState>({
    lastAlertedSignal: null,
    lastAlertTime: 0,
    phoneNumber: '',
    smsEnabled: true,
  });
  const alertCounterRef = useRef(0);

  const setPhoneNumber = useCallback((phone: string) => {
    stateRef.current.phoneNumber = phone;
  }, []);

  const setSmsEnabled = useCallback((enabled: boolean) => {
    stateRef.current.smsEnabled = enabled;
  }, []);

  const sendAlert = useCallback(async (signal: 'RED' | 'YELLOW' | 'GREEN' | null, emergency: boolean = false) => {
    if (!signal) return;

    const now = Date.now();
    const state = stateRef.current;

    // Debounce: don't send same signal twice within 5 seconds
    if (state.lastAlertedSignal === signal && now - state.lastAlertTime < 5000) {
      return;
    }

    // Update state
    state.lastAlertedSignal = signal;
    state.lastAlertTime = now;

    // Determine message
    let message = '';
    let title = '';
    
    if (emergency) {
      message = 'Emergency vehicle detected. Stop immediately!';
      title = 'EMERGENCY ALERT';
    } else {
      switch (signal) {
        case 'RED':
          message = 'STOP - Red light detected';
          title = 'RED LIGHT';
          break;
        case 'YELLOW':
          message = 'WAIT - Yellow light detected. Prepare to stop.';
          title = 'YELLOW LIGHT';
          break;
        case 'GREEN':
          message = 'GO - Green light detected. Proceed with caution.';
          title = 'GREEN LIGHT';
          break;
      }
    }

    // In-app notification (toast)
    const alertId = `${signal}-${now}-${++alertCounterRef.current}`;
    setAlerts(prev => [...prev, alertId]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(id => id !== alertId));
    }, 3000);

    // Send SMS if enabled
    if (state.smsEnabled && state.phoneNumber) {
      try {
        const response = await fetch('/api/send-alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: state.phoneNumber,
            message: message,
            signal: signal,
            emergency: emergency,
          }),
        });

        if (!response.ok) {
          console.error('[v0] Failed to send SMS alert');
        }
      } catch (error) {
        console.error('[v0] SMS alert error:', error);
      }
    }

    return { title, message, alertId };
  }, []);

  return {
    sendAlert,
    setPhoneNumber,
    setSmsEnabled,
    alerts,
  };
}
