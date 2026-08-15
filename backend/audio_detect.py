import sounddevice as sd
import numpy as np

def detect_siren():
    duration = 0.5  # short for speed
    fs = 44100

    try:
        recording = sd.rec(int(duration * fs), samplerate=fs, channels=1)
        sd.wait()

        volume = np.linalg.norm(recording)

        # 🔥 Tune this threshold if needed
        if volume > 60:
            return True
    except:
        return False

    return False