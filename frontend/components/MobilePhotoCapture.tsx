'use client';

import { Camera, RotateCcw, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobilePhotoCapture } from '@/hooks/useMobilePhotoCapture';
import { useState } from 'react';

interface MobilePhotoCaptureProps {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
  onPhotoCapture?: (photo: string) => void;
}

export function MobilePhotoCapture({ signal, confidence, onPhotoCapture }: MobilePhotoCaptureProps) {
  const { videoRef, canvasRef, isCameraReady, capturedPhoto, error, capturePhoto, retakePhoto } = useMobilePhotoCapture();
  const [isUploading, setIsUploading] = useState(false);

  const handleCapture = async () => {
    const photo = await capturePhoto(signal, confidence);
    if (photo && onPhotoCapture) {
      onPhotoCapture(photo.data);
    }
  };

  const handleUpload = async () => {
    if (!capturedPhoto) return;

    setIsUploading(true);
    try {
      // Upload will be handled by parent component
      if (onPhotoCapture) {
        onPhotoCapture(capturedPhoto.data);
      }
    } catch (err) {
      console.error('[v0] Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (error) {
    return (
      <div className="w-full aspect-video rounded-2xl glass-effect flex items-center justify-center text-center p-4">
        <div>
          <p className="text-[#ff3b3b] font-bold mb-2">Camera Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!isCameraReady) {
    return (
      <div className="w-full aspect-video rounded-2xl glass-effect flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Camera className="w-8 h-8 animate-pulse text-[#00ff9f]" />
          <span className="text-gray-300">Loading camera...</span>
        </div>
      </div>
    );
  }

  if (capturedPhoto) {
    return (
      <div className="w-full space-y-4">
        {/* Preview */}
        <div className="w-full rounded-2xl overflow-hidden glass-effect border-2 border-[#00ff9f]/30">
          <img 
            src={capturedPhoto.data} 
            alt="Captured" 
            className="w-full h-auto"
          />
        </div>

        {/* Signal Info */}
        {capturedPhoto.signal && (
          <div className="glass-effect rounded-2xl p-4 border border-[#00ff9f]/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Detected Signal</div>
                <div className={cn(
                  "text-2xl font-bold",
                  capturedPhoto.signal === 'RED' ? 'text-[#ff3b3b]' :
                  capturedPhoto.signal === 'GREEN' ? 'text-[#00ff9f]' :
                  'text-[#ffd60a]'
                )}>
                  {capturedPhoto.signal}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Confidence</div>
                <div className="text-2xl font-bold text-[#00ff9f]">{capturedPhoto.confidence}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={retakePhoto}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg glass-effect border-2 border-gray-600 hover:border-[#00ff9f] transition-all text-gray-300 hover:text-[#00ff9f] font-semibold"
          >
            <RotateCcw className="w-5 h-5" />
            Retake
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00ff9f]/10 border-2 border-[#00ff9f] hover:bg-[#00ff9f]/20 transition-all text-[#00ff9f] font-semibold disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {isUploading ? 'Uploading...' : 'Share to Desktop'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Camera View */}
      <div className="w-full rounded-2xl overflow-hidden glass-effect border-2 border-[#00ff9f]/30 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Signal Indicator Overlay */}
        {signal && (
          <div className="absolute top-4 right-4 glass-effect px-4 py-2 rounded-lg border-2 border-[#00ff9f]">
            <div className={cn(
              "font-bold text-lg",
              signal === 'RED' ? 'text-[#ff3b3b]' :
              signal === 'GREEN' ? 'text-[#00ff9f]' :
              'text-[#ffd60a]'
            )}>
              {signal}
            </div>
          </div>
        )}
      </div>

      {/* Capture Button */}
      <button
        onClick={handleCapture}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-[#00ff9f]/10 border-2 border-[#00ff9f] hover:bg-[#00ff9f]/20 transition-all text-[#00ff9f] font-bold text-lg"
      >
        <Camera className="w-6 h-6" />
        Capture Photo
      </button>

      {/* Instructions */}
      <div className="glass-effect rounded-2xl p-4 border border-[#00ff9f]/20 text-sm text-gray-400">
        Point your camera at a traffic signal and tap to capture. The AI will automatically detect the signal color and confidence level.
      </div>
    </div>
  );
}
