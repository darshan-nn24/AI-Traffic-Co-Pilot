'use client';

import { useState, useRef, useEffect } from 'react';

export interface CapturedPhoto {
  data: string; // base64
  timestamp: number;
  signal?: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence?: number;
}

export function useMobilePhotoCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [error, setError] = useState<string>('');

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        setError('Camera access denied');
        console.error('[v0] Camera error:', err);
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

  // Capture photo
  const capturePhoto = async (detectedSignal?: 'RED' | 'YELLOW' | 'GREEN', confidence?: number): Promise<CapturedPhoto | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const base64Data = canvas.toDataURL('image/jpeg', 0.95);

    const photo: CapturedPhoto = {
      data: base64Data,
      timestamp: Date.now(),
      signal: detectedSignal || null,
      confidence: confidence || 0
    };

    setCapturedPhoto(photo);
    return photo;
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  return {
    videoRef,
    canvasRef,
    isCameraReady,
    capturedPhoto,
    error,
    capturePhoto,
    retakePhoto
  };
}
