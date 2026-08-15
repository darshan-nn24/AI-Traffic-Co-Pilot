'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Camera, AlertCircle } from 'lucide-react';

interface VideoFeedCardProps {
  signal: 'RED' | 'YELLOW' | 'GREEN';
  countdown: number;
  onDetectedSignal?: (signal: 'RED' | 'YELLOW' | 'GREEN' | null) => void;
}

interface ColorDetection {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
  rgb: { r: number; g: number; b: number };
}

export function VideoFeedCard({ signal, countdown, onDetectedSignal }: VideoFeedCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [detectedSignal, setDetectedSignal] = useState<ColorDetection>({
    signal: null,
    confidence: 0,
    rgb: { r: 0, g: 0, b: 0 },
  });

  const getSignalStyle = () => {
    switch (detectedSignal.signal) {
      case 'RED': return 'text-[#ff3b3b] border-[#ff3b3b]';
      case 'YELLOW': return 'text-[#ffd60a] border-[#ffd60a]';
      case 'GREEN': return 'text-[#00ff9f] border-[#00ff9f]';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  // Detect dominant color from image
  const detectTrafficLight = (imageData: ImageData): ColorDetection => {
    const data = imageData.data;
    let redCount = 0, greenCount = 0, yellowCount = 0;
    let redSum = 0, greenSum = 0, yellowSum = 0;
    let avgR = 0, avgG = 0, avgB = 0;

    // Sample pixels from center region to detect traffic light
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      avgR += r;
      avgG += g;
      avgB += b;

      // Detect RED (high R, low G and B)
      if (r > 150 && g < 100 && b < 100) {
        redCount++;
        redSum += r;
      }
      // Detect GREEN (high G, low R and B)
      else if (g > 150 && r < 100 && b < 100) {
        greenCount++;
        greenSum += g;
      }
      // Detect YELLOW (high R and G, low B)
      else if (r > 150 && g > 150 && b < 100) {
        yellowCount++;
        yellowSum += r + g;
      }
    }

    const pixelCount = data.length / 4;
    avgR = Math.round(avgR / pixelCount);
    avgG = Math.round(avgG / pixelCount);
    avgB = Math.round(avgB / pixelCount);

    // Determine dominant color
    let detectedSignal: 'RED' | 'YELLOW' | 'GREEN' | null = null;
    let confidence = 0;

    if (redCount > greenCount && redCount > yellowCount) {
      detectedSignal = 'RED';
      confidence = Math.round((redCount / pixelCount) * 100);
    } else if (greenCount > redCount && greenCount > yellowCount) {
      detectedSignal = 'GREEN';
      confidence = Math.round((greenCount / pixelCount) * 100);
    } else if (yellowCount > redCount && yellowCount > greenCount) {
      detectedSignal = 'YELLOW';
      confidence = Math.round((yellowCount / pixelCount) * 100);
    }

    return {
      signal: confidence > 5 ? detectedSignal : null,
      confidence: Math.min(confidence, 100),
      rgb: { r: avgR, g: avgG, b: avgB },
    };
  };

  // Initialize webcam
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setPermission('granted');
        }
      } catch (error) {
        console.log('[v0] Camera access denied:', error);
        setPermission('denied');
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Analyze video frames for color detection
  useEffect(() => {
    if (permission !== 'granted' || !videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const analyzeFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvasRef.current!.width = videoRef.current.videoWidth;
        canvasRef.current!.height = videoRef.current.videoHeight;

        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);

        const detection = detectTrafficLight(imageData);
        setDetectedSignal(detection);
        
        if (onDetectedSignal) {
          onDetectedSignal(detection.signal);
        }
      }

      requestAnimationFrame(analyzeFrame);
    };

    const frameId = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(frameId);
  }, [permission, onDetectedSignal]);

  if (permission === 'denied') {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-effect flex items-center justify-center flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-[#ff3b3b]" />
        <div className="text-center">
          <div className="font-bold text-lg mb-2">Camera Permission Denied</div>
          <p className="text-gray-400">Please enable camera access to detect traffic signals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-effect group">
      {/* Webcam feed */}
      {permission === 'granted' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Camera className="w-8 h-8 animate-pulse" />
            <span>Requesting camera access...</span>
          </div>
        </div>
      )}

      {/* Hidden canvas for color detection */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Detection overlay */}
      <div className="absolute inset-0">
        {/* Detection circle highlight */}
        {detectedSignal.signal && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={cn(
                'w-32 h-32 rounded-full border-4 transition-all duration-200',
                detectedSignal.signal === 'RED' ? 'border-[#ff3b3b] shadow-[0_0_30px_rgba(255,59,59,0.6)]' :
                detectedSignal.signal === 'GREEN' ? 'border-[#00ff9f] shadow-[0_0_30px_rgba(0,255,159,0.6)]' :
                'border-[#ffd60a] shadow-[0_0_30px_rgba(255,214,10,0.6)]'
              )}
            />
          </div>
        )}
      </div>

      {/* Signal indicator badge */}
      <div className={cn("absolute top-6 right-6 glass-effect px-6 py-3 rounded-lg border-2 font-bold text-2xl transition-all duration-300", getSignalStyle())}>
        {detectedSignal.signal || 'DETECTING...'}
      </div>

      {/* Confidence display */}
      {detectedSignal.signal && (
        <div className="absolute top-6 left-6 glass-effect px-4 py-2 rounded-lg border-2 border-[#00ff9f]/50">
          <div className="text-xs text-gray-400 uppercase">Confidence</div>
          <div className="text-lg font-bold text-[#00ff9f]">{detectedSignal.confidence}%</div>
        </div>
      )}

      {/* Countdown timer */}
      <div className="absolute bottom-6 left-6 glass-effect px-8 py-4 rounded-xl border-2 border-[#00ff9f]">
        <div className="text-sm text-gray-400 uppercase tracking-wider">Next change in</div>
        <div className="text-5xl font-bold text-[#00ff9f] neon-glow">{countdown}s</div>
      </div>

      {/* RGB color display */}
      <div className="absolute bottom-6 right-6 glass-effect px-4 py-2 rounded-lg border-2 border-[#00ff9f]/50">
        <div className="text-xs text-gray-400 uppercase">RGB</div>
        <div className="text-sm font-mono text-[#00ff9f]">
          ({detectedSignal.rgb.r}, {detectedSignal.rgb.g}, {detectedSignal.rgb.b})
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent group-hover:bg-gradient-to-t group-hover:from-transparent group-hover:via-[rgba(0,255,159,0.05)] group-hover:to-transparent transition-all duration-300 pointer-events-none" />
    </div>
  );
}
