'use client';

interface EmergencyAlertProps {
  isActive: boolean;
}

export function EmergencyAlert({ isActive }: EmergencyAlertProps) {
  if (!isActive) return null;

  return (
    <div className={`glass-effect-red alert-pulse rounded-xl p-4 border-2 border-[#ff3b3b] slide-in-up`}>
      <div className="flex items-center gap-4">
        <div className="text-3xl">🚨</div>
        <div>
          <div className="font-bold text-[#ff3b3b] text-lg">Emergency Vehicle Detected!</div>
          <div className="text-sm text-red-300 mt-1">Immediate action recommended</div>
        </div>
      </div>
    </div>
  );
}
