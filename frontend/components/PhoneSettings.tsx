'use client';

import { useState, useEffect } from 'react';
import { Phone, Settings, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneSettingsProps {
  onPhoneNumberChange?: (phoneNumber: string) => void;
  onSMSToggle?: (enabled: boolean) => void;
}

export function PhoneSettings({ onPhoneNumberChange, onSMSToggle }: PhoneSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Load settings from localStorage on client mount
  useEffect(() => {
    setIsMounted(true);
    const savedPhone = localStorage.getItem('alertPhoneNumber') || '';
    const savedSmsEnabled = JSON.parse(localStorage.getItem('smsAlertsEnabled') || 'true');
    
    setPhoneNumber(savedPhone);
    setSmsEnabled(savedSmsEnabled);
  }, []);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handleSave = () => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    localStorage.setItem('alertPhoneNumber', cleanedPhone);
    localStorage.setItem('smsAlertsEnabled', JSON.stringify(smsEnabled));
    
    onPhoneNumberChange?.(cleanedPhone);
    onSMSToggle?.(smsEnabled);
    
    setIsSaved(true);
    setError('');
    
    setTimeout(() => {
      setIsSaved(false);
      setIsOpen(false);
    }, 2000);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-[#00ff9f]/10 border border-[#00ff9f]/30 hover:bg-[#00ff9f]/20 transition-all"
        title="Alert Settings"
      >
        <Settings className="w-5 h-5 text-[#00ff9f]" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="glass-effect rounded-2xl p-6 border border-[#00ff9f]/30 w-full max-w-md mx-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-[#00ff9f]" />
                <h2 className="text-2xl font-bold text-[#00ff9f]">Alert Settings</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-300">
                Phone Number for SMS Alerts
              </label>
              <input
                type="tel"
                value={formatPhoneNumber(phoneNumber)}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="(702) 634-8138"
                className="w-full px-4 py-3 bg-[#1a1f3a] border-2 border-[#00ff9f]/30 rounded-lg text-white placeholder-gray-500 focus:border-[#00ff9f] focus:outline-none transition"
              />
              {error && <p className="text-[#ff3b3b] text-sm">{error}</p>}
              <p className="text-xs text-gray-400">Enter 10-digit US phone number</p>
            </div>

            {/* SMS Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#0a0e27]/50 rounded-lg border border-[#00ff9f]/20">
              <div>
                <p className="font-semibold text-white">SMS Alerts Enabled</p>
                <p className="text-xs text-gray-400 mt-1">Receive text message alerts for all signal detections</p>
              </div>
              <button
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-all",
                  smsEnabled ? 'bg-[#00ff9f]' : 'bg-gray-600'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-6 h-6 bg-white rounded-full transition-transform',
                    smsEnabled ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Alert Types Info */}
            <div className="space-y-3 p-4 bg-[#0a0e27]/50 rounded-lg border border-[#00ff9f]/20">
              <p className="font-semibold text-white text-sm">Alert Types:</p>
              <div className="space-y-2 text-xs text-gray-300">
                <p>• RED: "STOP - Red light detected"</p>
                <p>• YELLOW: "WAIT - Yellow light detected"</p>
                <p>• GREEN: "GO - Green light detected"</p>
                <p>• EMERGENCY: "Emergency vehicle detected"</p>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={cn(
                'w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2',
                isSaved
                  ? 'bg-[#00ff9f] text-black'
                  : 'bg-[#00ff9f] hover:bg-[#00ff9f]/90 text-black'
              )}
            >
              {isSaved ? (
                <>
                  <Check className="w-5 h-5" />
                  Settings Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
