import os
import numpy as np
import librosa
import soundfile as sf
import scipy.io.wavfile as wavfile

def validate_audio_file(file_path: str, min_duration: float = 0.8, max_duration: float = 60.0) -> tuple[bool, str, dict]:
    """
    Rigorously validates audio file existence, format, duration, audible energy,
    and acoustic speech characteristics (rejects silence and pure synthetic test tones).
    """
    if not os.path.exists(file_path):
        return False, "Audio file does not exist on disk.", {}

    file_size = os.path.getsize(file_path)
    if file_size < 1000:
        return False, "Audio file size is too small or empty. Please record audio properly.", {}

    # Attempt primary load using librosa
    y = None
    sr = 22050
    try:
        y, sr = librosa.load(file_path, sr=22050, mono=True)
    except Exception:
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
            return False, f"Unsupported or unreadable audio format. Please ensure your microphone recorded valid audio ({str(e)}).", {}

    if y is None or len(y) == 0:
        return False, "Audio signal contains zero samples.", {}

    duration = float(len(y)) / float(sr)
    if duration < min_duration:
        return False, f"Audio recording too short ({duration:.2f}s). Please speak into the mic for at least {min_duration} seconds.", {}

    if duration > max_duration:
        return False, f"Audio exceeds maximum permitted duration ({duration:.2f}s > {max_duration}s).", {}

    # 1. RMS Energy Check for Silence / Extremely Faint Input
    rms_frames = librosa.feature.rms(y=y)[0]
    rms_mean = float(np.mean(rms_frames))
    rms_max = float(np.max(rms_frames))

    if rms_mean < 0.002 and rms_max < 0.005:
        return False, "Recorded audio is silent or microphone volume is too low. Please speak closer to your microphone and try again.", {}

    # 2. Pitch Dynamics & Jitter Check (Rejects constant single-frequency buzzer or sine test tone)
    pitch_std = 0.0
    pitch_mean = 0.0
    try:
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=65, fmax=500)
        pitch_vals = [pitches[magnitudes[:, i].argmax(), i] for i in range(pitches.shape[1]) if pitches[magnitudes[:, i].argmax(), i] > 65]
        if len(pitch_vals) > 5:
            pitch_std = float(np.std(pitch_vals))
            pitch_mean = float(np.mean(pitch_vals))
    except Exception:
        pass

    # A single continuous sine tone has a pitch standard deviation near 0 (< 0.15 Hz)
    if pitch_std < 0.15 and len(y) > sr * 1.0 and rms_mean > 0.05:
        return False, "Audio detected as static test tone or monotone buzz rather than human speech. Please speak naturally.", {}

    # 3. Spectral Centroid and Zero Crossing Rate
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    centroid_std = float(np.std(spectral_centroids))
    centroid_mean = float(np.mean(spectral_centroids))

    zcr = librosa.feature.zero_crossing_rate(y)[0]
    zcr_mean = float(np.mean(zcr))

    metadata = {
        "duration": round(duration, 2),
        "samplerate": int(sr),
        "rms_energy_mean": round(rms_mean, 4),
        "rms_energy_max": round(rms_max, 4),
        "spectral_centroid_mean": round(centroid_mean, 1),
        "spectral_centroid_std": round(centroid_std, 1),
        "pitch_mean": round(pitch_mean, 1),
        "pitch_std": round(pitch_std, 2),
        "zcr_mean": round(zcr_mean, 4)
    }

    return True, "", metadata

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

    try:
        y, sr = librosa.load(file_path, sr=22050, mono=True)
    except Exception:
        sr_raw, raw_data = wavfile.read(file_path)
        if raw_data.ndim > 1:
            raw_data = np.mean(raw_data, axis=1)
        if raw_data.dtype == np.int16:
            y = raw_data.astype(np.float32) / 32768.0
        else:
            y = raw_data.astype(np.float32)
        sr = sr_raw

    # Trim silence margins
    try:
        y_trimmed, _ = librosa.effects.trim(y, top_db=25)
        if len(y_trimmed) > sr * 0.4:
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
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=65, fmax=500)
        pitch_vals = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 65 and pitch < 500:
                pitch_vals.append(pitch)
        if len(pitch_vals) > 0:
            pitch_mean = float(np.mean(pitch_vals))
            pitch_std = float(np.std(pitch_vals))
        else:
            pitch_mean, pitch_std = 145.0, 16.0
    except Exception:
        pitch_mean, pitch_std = 145.0, 16.0

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
