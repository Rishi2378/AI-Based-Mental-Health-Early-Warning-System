import os
import numpy as np
import librosa
import soundfile as sf
import scipy.io.wavfile as wavfile

def validate_audio_file(file_path: str, min_duration: float = 0.5, max_duration: float = 60.0) -> tuple[bool, str, dict]:
    """
    Validates audio file integrity, duration, and sampling.
    Returns (is_valid, error_message, metadata).
    """
    if not os.path.exists(file_path):
        return False, "Audio file does not exist on disk.", {}

    # 1. Try soundfile
    try:
        info = sf.info(file_path)
        duration = float(info.duration)
        samplerate = int(info.samplerate)
        channels = int(info.channels)

        if duration < min_duration:
            return False, f"Audio duration too short ({duration:.2f}s). Please record or upload at least {min_duration}s of voice audio.", {}
        
        if duration > max_duration:
            return False, f"Audio duration exceeds maximum limit ({duration:.2f}s > {max_duration}s).", {}

        return True, "", {
            "duration": round(duration, 2),
            "samplerate": samplerate,
            "channels": channels
        }
    except Exception:
        pass

    # 2. Try scipy.io.wavfile fallback for WAV files
    try:
        sr, data = wavfile.read(file_path)
        duration = float(len(data)) / float(sr)
        if duration < min_duration:
            return False, f"Audio duration too short ({duration:.2f}s).", {}
        return True, "", {
            "duration": round(duration, 2),
            "samplerate": int(sr),
            "channels": 1 if data.ndim == 1 else int(data.shape[1])
        }
    except Exception:
        pass

    # 3. Fallback load using librosa
    try:
        y, sr = librosa.load(file_path, sr=None)
        duration = float(len(y)) / float(sr)
        if duration < min_duration:
            return False, f"Audio duration too short ({duration:.2f}s).", {}
        return True, "", {
            "duration": round(duration, 2),
            "samplerate": int(sr),
            "channels": 1
        }
    except Exception as ex:
        return False, f"Unsupported or unreadable audio format. Please ensure your browser recorded in WAV or upload a valid .wav / .mp3 / .ogg file ({str(ex)}).", {}

def extract_audio_features(file_path: str) -> dict:
    """
    Extracts 38 acoustic signal features:
    - 26 MFCCs (13 mean + 13 std)
    - 2 Zero Crossing Rate (mean + std)
    - 2 RMS Energy (mean + std)
    - 2 Spectral Centroid (mean + std)
    - 2 Spectral Bandwidth (mean + std)
    - 2 Spectral Rolloff (mean + std)
    - 2 Fundamental Frequency F0 (mean + std)
    """
    valid, msg, meta = validate_audio_file(file_path)
    if not valid:
        raise ValueError(msg)

    y = None
    sr = 22050

    # Primary loader: librosa
    try:
        y, sr = librosa.load(file_path, sr=22050, mono=True)
    except Exception:
        # Fallback to scipy.io.wavfile
        try:
            sr_raw, raw_data = wavfile.read(file_path)
            if raw_data.ndim > 1:
                raw_data = np.mean(raw_data, axis=1)
            if raw_data.dtype == np.int16:
                y = raw_data.astype(np.float32) / 32768.0
            elif raw_data.dtype == np.int32:
                y = raw_data.astype(np.float32) / 2147483648.0
            elif raw_data.dtype == np.uint8:
                y = (raw_data.astype(np.float32) - 128) / 128.0
            else:
                y = raw_data.astype(np.float32)
            sr = sr_raw
        except Exception as e:
            raise ValueError(f"Could not load audio signal: {str(e)}")

    if y is None or len(y) == 0:
        raise ValueError("Audio clip contains no audible samples.")

    # Trim silence
    try:
        y_trimmed, _ = librosa.effects.trim(y, top_db=25)
        if len(y_trimmed) > sr * 0.3:
            y = y_trimmed
    except Exception:
        pass

    # 1. MFCCs (13 coefficients -> mean & std)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfccs, axis=1)
    mfcc_std = np.std(mfccs, axis=1)

    # 2. Zero Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(y)
    zcr_mean = float(np.mean(zcr))
    zcr_std = float(np.std(zcr))

    # 3. RMS Energy
    rms = librosa.feature.rms(y=y)
    rms_mean = float(np.mean(rms))
    rms_std = float(np.std(rms))

    # 4. Spectral Centroid
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    centroid_mean = float(np.mean(centroid))
    centroid_std = float(np.std(centroid))

    # 5. Spectral Bandwidth
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    bandwidth_mean = float(np.mean(bandwidth))
    bandwidth_std = float(np.std(bandwidth))

    # 6. Spectral Rolloff
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    rolloff_mean = float(np.mean(rolloff))
    rolloff_std = float(np.std(rolloff))

    # 7. Pitch (F0 estimation with robust fast fallback)
    try:
        # Use fast frame-based pitch tracking
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=65, fmax=500)
        pitch_vals = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_vals.append(pitch)
        if len(pitch_vals) > 0:
            pitch_mean = float(np.mean(pitch_vals))
            pitch_std = float(np.std(pitch_vals))
        else:
            pitch_mean, pitch_std = 140.0, 15.0
    except Exception:
        pitch_mean, pitch_std = 140.0, 15.0

    # Combine into 38 features
    feature_vector = np.hstack([
        mfcc_mean, mfcc_std,
        [zcr_mean, zcr_std],
        [rms_mean, rms_std],
        [centroid_mean, centroid_std],
        [bandwidth_mean, bandwidth_std],
        [rolloff_mean, rolloff_std],
        [pitch_mean, pitch_std]
    ])

    return {
        "feature_vector": feature_vector.tolist(),
        "summary": {
            "duration_sec": meta.get("duration", round(len(y)/sr, 2)),
            "sample_rate": sr,
            "rms_energy_mean": round(rms_mean, 4),
            "zcr_mean": round(zcr_mean, 4),
            "spectral_centroid_hz": round(centroid_mean, 1),
            "spectral_rolloff_hz": round(rolloff_mean, 1),
            "estimated_pitch_hz": round(pitch_mean, 1)
        }
    }
