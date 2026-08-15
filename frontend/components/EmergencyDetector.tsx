'use client';

interface EmergencyDetectorProps {
  imageData: ImageData | null;
  onEmergencyDetected: (isEmergency: boolean) => void;
}

export function useEmergencyDetector() {
  let frameCount = 0;
  let emergencyActive = false;
  let emergencyTimeout: NodeJS.Timeout | null = null;
  let audioContext: AudioContext | null = null;

  const playSirenAlert = () => {
    try {
      // Initialize Web Audio API
      if (!audioContext) {
        audioContext = new (window as any).AudioContext();
      }

      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.5;

      // Create siren sound: alternating high-low tones
      const oscillator1 = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator1.connect(gain);
      oscillator2.connect(gain);
      gain.connect(ctx.destination);

      // Red/Blue emergency pattern
      oscillator1.frequency.setValueAtTime(1000, now); // High tone
      oscillator1.frequency.setValueAtTime(500, now + 0.15); // Low tone
      oscillator2.frequency.setValueAtTime(1200, now);
      oscillator2.frequency.setValueAtTime(600, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setValueAtTime(0, now + duration);

      oscillator1.start(now);
      oscillator2.start(now);
      oscillator1.stop(now + duration);
      oscillator2.stop(now + duration);
    } catch (error) {
      console.log('[v0] Web Audio API not available for siren');
    }
  };

  const detectEmergency = (imageData: ImageData | null): boolean => {
    if (!imageData) return emergencyActive;

    frameCount++;

    // Check every 10 frames for performance
    if (frameCount % 10 !== 0) return emergencyActive;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let redFlashPixels = 0;
    let blueFlashPixels = 0;
    const centerRegion = {
      x: Math.floor(width * 0.25),
      y: Math.floor(height * 0.25),
      width: Math.floor(width * 0.5),
      height: Math.floor(height * 0.5),
    };

    // Analyze center region for emergency light patterns
    for (let i = 0; i < data.length; i += 4) {
      const pixelIdx = i / 4;
      const x = pixelIdx % width;
      const y = Math.floor(pixelIdx / width);

      // Only check center region
      if (
        x < centerRegion.x ||
        x > centerRegion.x + centerRegion.width ||
        y < centerRegion.y ||
        y > centerRegion.y + centerRegion.height
      ) {
        continue;
      }

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 100) continue;

      // RED flashing light: very bright red
      if (r > 180 && g < 80 && b < 80) {
        redFlashPixels++;
      }
      // BLUE flashing light: very bright blue
      else if (b > 180 && r < 80 && g < 150) {
        blueFlashPixels++;
      }
    }

    const centerPixels = centerRegion.width * centerRegion.height;
    const redFlashRatio = redFlashPixels / centerPixels;
    const blueFlashRatio = blueFlashPixels / centerPixels;

    // Emergency detected if significant red or blue flashing
    const isEmergency = redFlashRatio > 0.06 || blueFlashRatio > 0.06;

    if (isEmergency && !emergencyActive) {
      console.log('[v0] EMERGENCY DETECTED - Emergency vehicle approaching!');
      emergencyActive = true;

      // Play siren alert sound
      playSirenAlert();

      // Auto-clear after 5 seconds
      if (emergencyTimeout) clearTimeout(emergencyTimeout);
      emergencyTimeout = setTimeout(() => {
        emergencyActive = false;
        console.log('[v0] Emergency cleared');
      }, 5000);
    }

    return emergencyActive;
  };

  return { detectEmergency };
}

export const EmergencyDetector = {
  useEmergencyDetector,
};
