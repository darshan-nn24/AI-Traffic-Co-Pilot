'use client';

interface SystemInsightsProps {
  trafficStatus: 'normal' | 'busy';
  confidence: number;
}

export function SystemInsights({ trafficStatus, confidence }: SystemInsightsProps) {
  return (
    <div className="glass-effect rounded-2xl p-6 border border-[#00ff9f]/20 space-y-4">
      <h3 className="text-lg font-bold text-white">System Insights</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Traffic Status</span>
            <span className={`font-bold text-sm px-3 py-1 rounded-full ${
              trafficStatus === 'normal' 
                ? 'bg-[#00ff9f]/20 text-[#00ff9f]' 
                : 'bg-[#ffd60a]/20 text-[#ffd60a]'
            }`}>
              {trafficStatus === 'normal' ? 'Normal' : 'Busy'}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">AI Confidence</span>
            <span className="text-lg font-bold text-[#00ff9f]">{confidence}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-lg h-3">
            <div 
              className="bg-[#00ff9f] h-full rounded-lg transition-all duration-500 shadow-[0_0_10px_#00ff9f]" 
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Camera Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff9f] animate-pulse" />
              <span className="text-sm font-medium text-[#00ff9f]">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
