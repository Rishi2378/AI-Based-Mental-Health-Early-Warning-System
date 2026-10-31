import os
import joblib

def get_model_evaluation_summary():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    text_model_path = os.path.join(base_dir, 'models', 'text_nlp_model.joblib')
    voice_model_path = os.path.join(base_dir, 'models', 'voice_emotion_model.joblib')

    text_eval = None
    voice_eval = None

    if os.path.exists(text_model_path):
        artifacts = joblib.load(text_model_path)
        text_eval = {
            "model_name": "Ensemble Soft Voting Classifier (TF-IDF + LR + Calibrated LinearSVC + MLP)",
            "classes": artifacts.get("classes", []),
            "metrics": artifacts.get("metrics", {})
        }

    if os.path.exists(voice_model_path):
        artifacts = joblib.load(voice_model_path)
        voice_eval = {
            "model_name": "Ensemble Soft Voting Classifier (ExtraTrees + GradientBoosting + RandomForest)",
            "classes": artifacts.get("classes", []),
            "feature_importances": artifacts.get("feature_importances", {}),
            "metrics": artifacts.get("metrics", {})
        }

    return {
        "text_model": text_eval,
        "voice_model": voice_eval
    }

if __name__ == "__main__":
    summary = get_model_evaluation_summary()
    print("=== MODEL EVALUATION SUMMARY ===")
    print(summary)

