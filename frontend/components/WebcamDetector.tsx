'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Camera, AlertCircle } from 'lucide-react';
import { useEmergencyDetector } from './EmergencyDetector';

interface Detection {
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
  x: number;
  y: number;
  radius: number;
}

interface WebcamDetectorProps {
  onDetection?: (detection: Detection) => void;
  onEmergency?: (isEmergency: boolean) => void;
}

export function WebcamDetector({ onDetection, onEmergency }: WebcamDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [detection, setDetection] = useState<Detection>({
    signal: null,
    confidence: 0,
    x: 0,
    y: 0,
    radius: 0,
  });
  const { detectEmergency } = useEmergencyDetector();
  
  // Use refs to store callbacks and avoid dependency array changes
  const onDetectionRef = useRef(onDetection);
  const onEmergencyRef = useRef(onEmergency);

  // Update refs when props change
  useEffect(() => {
    onDetectionRef.current = onDetection;
    onEmergencyRef.current = onEmergency;
  }, [onDetection, onEmergency]);

  // Initialize webcam with better error handling
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setPermission('granted');
          };
        }
      } catch (error: any) {
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

  // Improved color detection algorithm
  const detectSignal = (imageData: ImageData): Detection => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let redCount = 0, greenCount = 0, yellowCount = 0;
    const redPixels: Array<[number, number]> = [];
    const greenPixels: Array<[number, number]> = [];
    const yellowPixels: Array<[number, number]> = [];

    // Sample every 4th pixel to speed up processing
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 100) continue;

      // Calculate pixel position
      const pixelIdx = i / 4;
      const x = pixelIdx % width;
      const y = Math.floor(pixelIdx / width);

      // HSL-based color detection with relaxed thresholds
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const luminance = (max + min) / 2;

      // Skip very dark and very bright pixels (likely noise or glare)
      if (luminance < 30 || luminance > 240) continue;

      const saturation = max === min ? 0 : (luminance > 128 ? (max - min) / (510 - max - min) : (max - min) / (max + min));

      // Must have reasonable saturation to be a color
      if (saturation < 0.3) continue;

      // RED detection: R dominant, G and B low
      if (r > 120 && r > g + 40 && r > b + 40) {
        redCount++;
        redPixels.push([x, y]);
      }
      // GREEN detection: G dominant, R and B low
      else if (g > 120 && g > r + 40 && g > b + 40) {
        greenCount++;
        greenPixels.push([x, y]);
      }
      // YELLOW detection: R and G high, B low
      else if (r > 120 && g > 120 && b < 100 && Math.abs(r - g) < 60) {
        yellowCount++;
        yellowPixels.push([x, y]);
      }
    }

    let signal: 'RED' | 'YELLOW' | 'GREEN' | null = null;
    let confidence = 0;
    let centerX = width / 2;
    let centerY = height / 2;
    let radius = 40;

    // Determine dominant color
    if (redCount > greenCount && redCount > yellowCount && redCount > 20) {
      signal = 'RED';
      confidence = Math.min(Math.round((redCount / (width * height / 16)) * 100), 99);
      
      // Calculate centroid
      if (redPixels.length > 0) {
        const sumX = redPixels.reduce((a, p) => a + p[0], 0);
        const sumY = redPixels.reduce((a, p) => a + p[1], 0);
        centerX = sumX / redPixels.length;
        centerY = sumY / redPixels.length;
        radius = Math.sqrt((redPixels.length * 16) / Math.PI) * 0.6;
      }
    } else if (greenCount > redCount && greenCount > yellowCount && greenCount > 20) {
      signal = 'GREEN';
      confidence = Math.min(Math.round((greenCount / (width * height / 16)) * 100), 99);
      
      if (greenPixels.length > 0) {
        const sumX = greenPixels.reduce((a, p) => a + p[0], 0);
        const sumY = greenPixels.reduce((a, p) => a + p[1], 0);
        centerX = sumX / greenPixels.length;
        centerY = sumY / greenPixels.length;
        radius = Math.sqrt((greenPixels.length * 16) / Math.PI) * 0.6;
      }
    } else if (yellowCount > redCount && yellowCount > greenCount && yellowCount > 20) {
      signal = 'YELLOW';
      confidence = Math.min(Math.round((yellowCount / (width * height / 16)) * 100), 99);
      
      if (yellowPixels.length > 0) {
        const sumX = yellowPixels.reduce((a, p) => a + p[0], 0);
        const sumY = yellowPixels.reduce((a, p) => a + p[1], 0);
        centerX = sumX / yellowPixels.length;
        centerY = sumY / yellowPixels.length;
        radius = Math.sqrt((yellowPixels.length * 16) / Math.PI) * 0.6;
      }
    }

    return { signal, confidence, x: centerX, y: centerY, radius: Math.max(radius, 20) };
  };

  // Frame analysis loop
  useEffect(() => {
    if (permission !== 'granted' || !videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return;

    const videoElement = videoRef.current;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlayCanvas.getContext('2d');

    if (!ctx || !overlayCtx) return;

    const analyzeFrame = () => {
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        // Set canvas dimensions
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        overlayCanvas.width = videoElement.videoWidth;
        overlayCanvas.height = videoElement.videoHeight;

        // Draw video to canvas
        ctx.drawImage(videoElement, 0, 0);
        
        // Get image data and analyze
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newDetection = detectSignal(imageData);

        // Check for emergency vehicles
        const isEmergency = detectEmergency(imageData);
        onEmergencyRef.current?.(isEmergency);

        // Clear and redraw overlay
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        if (newDetection.signal) {
          const color = newDetection.signal === 'RED' ? '#ff3b3b' :
                       newDetection.signal === 'GREEN' ? '#00ff9f' : '#ffd60a';
          
          // Draw detection circle
          overlayCtx.strokeStyle = color;
          overlayCtx.lineWidth = 4;
          overlayCtx.shadowColor = color;
          overlayCtx.shadowBlur = 30;
          overlayCtx.beginPath();
          overlayCtx.arc(newDetection.x, newDetection.y, newDetection.radius, 0, Math.PI * 2);
          overlayCtx.stroke();

          // Draw crosshair
          overlayCtx.strokeStyle = color;
          overlayCtx.lineWidth = 2;
          overlayCtx.beginPath();
          overlayCtx.moveTo(newDetection.x - 10, newDetection.y);
          overlayCtx.lineTo(newDetection.x + 10, newDetection.y);
          overlayCtx.moveTo(newDetection.x, newDetection.y - 10);
          overlayCtx.lineTo(newDetection.x, newDetection.y + 10);
          overlayCtx.stroke();
        }

        setDetection(newDetection);
        onDetectionRef.current?.(newDetection);
      }

      requestAnimationFrame(analyzeFrame);
    };

    const frameId = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(frameId);
  }, [permission]);

  const getSignalColor = () => {
    switch (detection.signal) {
      case 'RED': return 'text-[#ff3b3b] border-[#ff3b3b]';
      case 'GREEN': return 'text-[#00ff9f] border-[#00ff9f]';
      case 'YELLOW': return 'text-[#ffd60a] border-[#ffd60a]';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  if (permission === 'denied') {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden glass-effect flex items-center justify-center flex-col gap-4 border-2 border-[#ff3b3b]/50">
        <AlertCircle className="w-12 h-12 text-[#ff3b3b]" />
        <div className="text-center">
          <div className="font-bold text-lg">Camera Permission Denied</div>
          <p className="text-gray-400 text-sm">Please enable camera access in your browser settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-effect border-2 border-[#00ff9f]/30 group">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Detection Overlay */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Hidden analysis canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Detection Badge */}
      <div className={cn("absolute top-6 right-6 glass-effect px-6 py-3 rounded-lg border-2 font-bold text-2xl transition-all duration-300", getSignalColor())}>
        {detection.signal || 'SCANNING...'}
      </div>

      {/* Confidence */}
      {detection.signal && (
        <div className="absolute top-6 left-6 glass-effect px-4 py-2 rounded-lg border-2 border-[#00ff9f]/50 text-sm">
          <div className="text-gray-400 uppercase text-xs">Confidence</div>
          <div className="text-lg font-bold text-[#00ff9f]">{detection.confidence}%</div>
        </div>
      )}

      {/* Instructions */}
      {!detection.signal && permission === 'granted' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 px-6 py-4 rounded-lg text-center">
            <p className="text-gray-300">Point camera at traffic light</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {permission === 'pending' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3">
            <Camera className="w-8 h-8 animate-pulse text-[#00ff9f]" />
            <span className="text-gray-300">Requesting camera access...</span>
          </div>
        </div>
      )}

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent group-hover:bg-gradient-to-t group-hover:from-transparent group-hover:via-[rgba(0,255,159,0.05)] group-hover:to-transparent transition-all duration-300 pointer-events-none" />
    </div>
  );
}
