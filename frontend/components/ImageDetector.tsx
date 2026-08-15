'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface Detection {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
  x: number;
  y: number;
  radius: number;
}

interface ImageDetectorProps {
  onDetection?: (detection: Detection) => void;
}

export function ImageDetector({ onDetection }: ImageDetectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [detection, setDetection] = useState<Detection>({
    signal: null,
    confidence: 0,
    x: 0,
    y: 0,
    radius: 0,
  });

  const detectSignal = (imageData: ImageData): Detection => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let redPixels = 0, greenPixels = 0, yellowPixels = 0;
    const colorMap = new Uint8ClampedArray(width * height);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelIndex = i / 4;

      if (r > 180 && g < 100 && b < 100) {
        redPixels++;
        colorMap[pixelIndex] = 1;
      } else if (g > 180 && r < 100 && b < 100) {
        greenPixels++;
        colorMap[pixelIndex] = 2;
      } else if (r > 160 && g > 160 && b < 100) {
        yellowPixels++;
        colorMap[pixelIndex] = 3;
      }
    }

    let signal: 'RED' | 'YELLOW' | 'GREEN' | null = null;
    let confidence = 0;

    if (redPixels > greenPixels && redPixels > yellowPixels && redPixels > 100) {
      signal = 'RED';
      confidence = Math.round((redPixels / (width * height)) * 100);
    } else if (greenPixels > redPixels && greenPixels > yellowPixels && greenPixels > 100) {
      signal = 'GREEN';
      confidence = Math.round((greenPixels / (width * height)) * 100);
    } else if (yellowPixels > redPixels && yellowPixels > greenPixels && yellowPixels > 100) {
      signal = 'YELLOW';
      confidence = Math.round((yellowPixels / (width * height)) * 100);
    }

    let centerX = width / 2, centerY = height / 2, radius = 60;
    
    if (signal) {
      let sumX = 0, sumY = 0, count = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const targetColor = signal === 'RED' ? 1 : signal === 'GREEN' ? 2 : 3;
          if (colorMap[idx] === targetColor) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }
      if (count > 0) {
        centerX = sumX / count;
        centerY = sumY / count;
        radius = Math.sqrt(count / Math.PI);
      }
    }

    return { signal, confidence: Math.min(confidence, 99), x: centerX, y: centerY, radius };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!canvas || !overlayCanvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        overlayCanvas.width = img.width;
        overlayCanvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newDetection = detectSignal(imageData);

        // Draw overlay
        const overlayCtx = overlayCanvas.getContext('2d');
        if (overlayCtx && newDetection.signal) {
          const color = newDetection.signal === 'RED' ? '#ff3b3b' :
                       newDetection.signal === 'GREEN' ? '#00ff9f' : '#ffd60a';
          
          overlayCtx.strokeStyle = color;
          overlayCtx.lineWidth = 4;
          overlayCtx.beginPath();
          overlayCtx.arc(newDetection.x, newDetection.y, newDetection.radius, 0, Math.PI * 2);
          overlayCtx.stroke();

          overlayCtx.shadowColor = color;
          overlayCtx.shadowBlur = 30;
        }

        setDetection(newDetection);
        onDetection?.(newDetection);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const getSignalColor = () => {
    switch (detection.signal) {
      case 'RED': return 'text-[#ff3b3b] border-[#ff3b3b]';
      case 'GREEN': return 'text-[#00ff9f] border-[#00ff9f]';
      case 'YELLOW': return 'text-[#ffd60a] border-[#ffd60a]';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full aspect-video rounded-2xl overflow-hidden glass-effect border-2 border-dashed border-[#00ff9f]/50 hover:border-[#00ff9f] transition-all cursor-pointer group flex items-center justify-center"
      >
        {imageSrc ? (
          <div className="relative w-full h-full">
            <img src={imageSrc} alt="Upload" className="w-full h-full object-cover" />
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full"
            />
            
            {/* Detection Badge on Image */}
            <div className={cn("absolute top-6 right-6 glass-effect px-6 py-3 rounded-lg border-2 font-bold text-2xl transition-all duration-300", getSignalColor())}>
              {detection.signal || 'ANALYZING...'}
            </div>

            {detection.signal && (
              <div className="absolute top-6 left-6 glass-effect px-4 py-2 rounded-lg border-2 border-[#00ff9f]/50 text-sm">
                <div className="text-gray-400 uppercase text-xs">Confidence</div>
                <div className="text-lg font-bold text-[#00ff9f]">{detection.confidence}%</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 group-hover:scale-110 transition-transform">
            <div className="p-4 bg-[#00ff9f]/10 rounded-full border-2 border-[#00ff9f]/30">
              <Upload className="w-8 h-8 text-[#00ff9f]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-white">Upload Traffic Signal Image</p>
              <p className="text-gray-400 text-sm">Click to select image</p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Hidden canvases */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Detection Result */}
      {detection.signal && (
        <div className="glass-effect rounded-lg p-4 border-2 border-[#00ff9f]/30 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-4 h-4 rounded-full',
                detection.signal === 'RED' ? 'bg-[#ff3b3b] shadow-[0_0_20px_rgba(255,59,59,0.8)]' :
                detection.signal === 'GREEN' ? 'bg-[#00ff9f] shadow-[0_0_20px_rgba(0,255,159,0.8)]' :
                'bg-[#ffd60a] shadow-[0_0_20px_rgba(255,214,10,0.8)]'
              )}
            />
            <span className="text-sm text-gray-300">Detected Signal</span>
          </div>
          <div className={cn("text-3xl font-bold", getSignalColor())}>
            {detection.signal === 'RED' ? 'STOP' : detection.signal === 'GREEN' ? 'GO' : 'SLOW DOWN'}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Confidence: <span className="text-[#00ff9f] font-bold">{detection.confidence}%</span></span>
            <span>Color: <span className="font-bold">{detection.signal}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
