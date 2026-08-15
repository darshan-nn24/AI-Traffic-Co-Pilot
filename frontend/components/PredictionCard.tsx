'use client';

export function PredictionCard() {
  return (
    <div className="glass-effect rounded-2xl p-6 border border-[#00ff9f]/20 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Signal Prediction</h3>
        <div className="w-3 h-3 rounded-full bg-[#00ff9f] animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Next Signal</span>
          <span className="text-lg font-bold text-[#00ff9f]">GREEN</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Probability</span>
          <span className="text-lg font-bold text-[#00ff9f]">98%</span>
        </div>

        <div className="w-full bg-gray-800 rounded-lg h-2">
          <div className="bg-[#00ff9f] h-full rounded-lg w-[98%] shadow-[0_0_10px_#00ff9f]" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-400">Time to change</span>
          <span className="text-lg font-bold text-[#ffd60a]">3.2s</span>
        </div>
      </div>
    </div>
  );
}
