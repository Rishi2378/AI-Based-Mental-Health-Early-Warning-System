import os
import re
import joblib
import numpy as np
from services.safety_service import check_crisis_text

_text_model_artifacts = None

def get_text_model():
    global _text_model_artifacts
    if _text_model_artifacts is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'text_nlp_model.joblib')
        if not os.path.exists(model_path):
            from ml.train_text_model import train_text_nlp_model
            _text_model_artifacts = train_text_nlp_model()
        else:
            _text_model_artifacts = joblib.load(model_path)
    return _text_model_artifacts

def clean_and_tokenize(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text.strip()

def analyze_text(text: str) -> dict:
    """
    Performs NLP sentiment, emotion, and stress linguistic pattern analysis.
    """
    if not text or not text.strip():
        return {
            "status": "warning",
            "message": "Insufficient information for a meaningful analysis. Please enter text.",
            "stress_indicator": 0.0,
            "confidence": 0.0,
            "emotion": "Unknown",
            "sentiment": "Neutral",
            "explanation": ["No text provided."],
            "top_features": []
        }

    tokens = clean_and_tokenize(text).split()
    if len(tokens) < 3:
        return {
            "status": "warning",
            "message": "Insufficient information for a meaningful analysis. Please provide at least 3-4 words.",
            "stress_indicator": 0.0,
            "confidence": 0.0,
            "emotion": "Neutral",
            "sentiment": "Neutral",
            "explanation": ["Input text too short to extract linguistic emotion patterns reliably."],
            "top_features": tokens
        }

    # Safety Crisis Check
    crisis_check = check_crisis_text(text)
    if crisis_check.get("is_crisis"):
        return {
            "status": "crisis",
            "is_crisis": True,
            "crisis_details": crisis_check,
            "emotion": "Elevated Distress",
            "sentiment": "Negative",
            "stress_indicator": 95.0,
            "confidence": 0.99,
            "explanation": ["Immediate crisis language identified in input text."],
            "top_features": tokens[:5]
        }

    artifacts = get_text_model()
    vectorizer = artifacts["vectorizer"]
    classifier = artifacts["classifier"]
    regressor = artifacts["regressor"]
    classes = artifacts["classes"]

    # Transform text
    vec = vectorizer.transform([text])

    # Predict emotion & probabilities
    emo_probs = classifier.predict_proba(vec)[0]
    pred_idx = int(np.argmax(emo_probs))
    pred_emotion = classes[pred_idx]
    confidence = float(emo_probs[pred_idx])

    # Predict stress indicator (0-100)
    pred_stress = float(regressor.predict(vec)[0])
    pred_stress = max(0.0, min(100.0, pred_stress))

    # Derive sentiment heuristic
    if pred_emotion in ['Positive', 'Neutral'] and pred_stress < 40:
        sentiment = 'Positive'
    elif pred_stress > 60 or pred_emotion in ['Sadness', 'Anger', 'Anxiety', 'Stress']:
        sentiment = 'Negative'
    else:
        sentiment = 'Neutral'

    # Extract top TF-IDF features present in text for explainability
    feature_names = np.array(vectorizer.get_feature_names_out())
    nonzero_indices = vec.nonzero()[1]
    tfidf_scores = vec.data
    sorted_pairs = sorted(zip(nonzero_indices, tfidf_scores), key=lambda x: x[1], reverse=True)
    top_features = [feature_names[i] for i, score in sorted_pairs[:6]]

    # Formulate measurable explanations
    explanations = []
    if top_features:
        explanations.append(f"Key linguistic terms identified: '{', '.join(top_features[:3])}'")
    
    if pred_stress > 65:
        explanations.append("Linguistic patterns exhibit elevated stress-associated terms.")
    elif pred_stress > 35:
        explanations.append("Linguistic patterns indicate moderate workload or emotional strain.")
    else:
        explanations.append("Linguistic patterns reflect balanced and low-stress sentiment.")

    return {
        "status": "success",
        "is_crisis": False,
        "emotion": pred_emotion,
        "sentiment": sentiment,
        "stress_indicator": round(pred_stress, 1),
        "confidence": round(confidence, 2),
        "explanation": explanations,
        "top_features": top_features,
        "class_probabilities": {c: round(float(p), 2) for c, p in zip(classes, emo_probs)}
    }
