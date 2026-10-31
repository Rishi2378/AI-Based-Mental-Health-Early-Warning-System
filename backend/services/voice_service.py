import os
import joblib
import numpy as np
from ml.voice_feature_extractor import validate_audio_file, extract_audio_features

_voice_model_artifacts = None

def get_voice_model():
    global _voice_model_artifacts
    if _voice_model_artifacts is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'voice_emotion_model.joblib')
        if not os.path.exists(model_path):
            from ml.train_voice_model import train_voice_emotion_model
            _voice_model_artifacts = train_voice_emotion_model()
        else:
            _voice_model_artifacts = joblib.load(model_path)
    return _voice_model_artifacts

def analyze_voice(file_path: str) -> dict:
    """
    Analyzes an audio file and returns acoustic emotion and voice stress indicator.
    """
    valid, msg, meta = validate_audio_file(file_path)
    if not valid:
        return {
            "status": "error",
            "message": msg,
            "indicator": 0.0,
            "confidence": 0.0,
            "emotion": "Unknown",
            "features_summary": {},
            "explanation": [f"Audio validation failed: {msg}"]
        }

    try:
        extracted = extract_audio_features(file_path)
        feat_vector = np.array(extracted["feature_vector"]).reshape(1, -1)
        summary = extracted["summary"]

        artifacts = get_voice_model()
        scaler = artifacts["scaler"]
        classifier = artifacts["classifier"]
        regressor = artifacts["regressor"]
        classes = artifacts["classes"]

        # Scale features
        feat_scaled = scaler.transform(feat_vector)

        # Predict emotion probabilities
        emo_probs = classifier.predict_proba(feat_scaled)[0]
        pred_idx = int(np.argmax(emo_probs))
        pred_emotion = classes[pred_idx]
        confidence = float(emo_probs[pred_idx])

        # Predict voice stress indicator
        pred_stress = float(regressor.predict(feat_scaled)[0])
        pred_stress = max(0.0, min(100.0, pred_stress))

        # Formulate non-diagnostic explanations based on acoustic measurements
        explanations = [
            f"Acoustic duration: {summary['duration_sec']:.1f}s at {summary['sample_rate']}Hz.",
            f"Dominant vocal acoustic pattern: {pred_emotion} (confidence: {round(confidence*100)}%)."
        ]

        if summary['estimated_pitch_hz'] > 220:
            explanations.append("Elevated vocal pitch variations detected.")
        if summary['rms_energy_mean'] > 0.08:
            explanations.append("High vocal energy modulation detected in signal.")

        return {
            "status": "success",
            "emotion": pred_emotion,
            "indicator": round(pred_stress, 1),
            "confidence": round(confidence, 2),
            "features_summary": summary,
            "feature_importances": artifacts.get("feature_importances", {}),
            "explanation": explanations,
            "class_probabilities": {c: round(float(p), 2) for c, p in zip(classes, emo_probs)}
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Voice signal processing error: {str(e)}",
            "indicator": 0.0,
            "confidence": 0.0,
            "emotion": "Error",
            "features_summary": {},
            "explanation": [f"Failed to extract voice features: {str(e)}"]
        }
