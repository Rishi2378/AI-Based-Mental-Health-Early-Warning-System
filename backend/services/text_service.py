import os
import re
import joblib
import numpy as np
from services.safety_service import check_crisis_text

# Optional VADER sentiment analyzer initialization
_vader_analyzer = None
def get_vader():
    global _vader_analyzer
    if _vader_analyzer is None:
        try:
            import nltk
            from nltk.sentiment.vader import SentimentIntensityAnalyzer
            try:
                nltk.data.find('sentiment/vader_lexicon.zip')
            except LookupError:
                nltk.download('vader_lexicon', quiet=True)
            _vader_analyzer = SentimentIntensityAnalyzer()
        except Exception:
            _vader_analyzer = False
    return _vader_analyzer if _vader_analyzer is not False else None

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

def clean_and_tokenize(text: str) -> list[str]:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    tokens = [t.strip() for t in text.split() if t.strip()]
    return tokens

# Common English vocabulary filter for gibberish detection
COMMON_ENGLISH_WORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
    'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
    'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'can', 'will', 'just', 'don', 'should', 'now', 'feeling', 'feel',
    'felt', 'work', 'day', 'today', 'night', 'time', 'life', 'mind', 'stress', 'tired',
    'sleep', 'good', 'bad', 'happy', 'sad', 'anxious', 'angry', 'scared', 'worry',
    'down', 'help', 'friend', 'friends', 'people', 'home', 'family', 'job', 'exams',
    'school', 'study', 'pressure', 'hard', 'fine', 'okay', 'great', 'well', 'heart',
    'body', 'head', 'thoughts', 'hoping', 'hope', 'wish', 'try', 'trying', 'crying',
    'tears', 'alone', 'lonely', 'exhausted', 'peace', 'calm', 'rest', 'break', 'done'
}

def validate_text_entry(text: str) -> tuple[bool, str, dict]:
    """
    Rigorously validates text quality, linguistic diversity, and semantic presence.
    Detects empty inputs, extreme brevity, repeated characters, gibberish strings,
    and single-word loops.
    """
    if not text or not text.strip():
        return False, "Input is empty. Please enter your thoughts, reflections, or journal entry.", {}

    raw_len = len(text.strip())
    if raw_len < 12:
        return False, f"Journal entry is too brief ({raw_len} chars). Please write at least one complete sentence.", {}

    # Check for character repetition keyboard spam (e.g., 'aaaaaaa', 'zzzzzzzzz')
    if re.search(r'(.)\1{5,}', text):
        return False, "Input contains excessive repeated characters (e.g. keyboard spam). Please write meaningful words.", {}

    tokens = clean_and_tokenize(text)
    if len(tokens) < 4:
        return False, f"Please provide at least 4 meaningful words to allow reliable linguistic analysis (found {len(tokens)}).", {}

    # Check lexical diversity (unique word ratio)
    unique_tokens = set(tokens)
    diversity_ratio = len(unique_tokens) / len(tokens)
    if len(tokens) >= 5 and diversity_ratio < 0.35:
        return False, "Input shows low vocabulary variation (repeating the same words). Please provide a natural journal entry.", {}

    # Check recognizability / gibberish detection
    recognized_count = 0
    for tok in unique_tokens:
        if tok in COMMON_ENGLISH_WORDS or len(tok) >= 3:
            # Check vowel-consonant presence (gibberish usually has abnormal letter distribution)
            vowels = set('aeiouy')
            has_vowel = any(c in vowels for c in tok)
            has_consonant = any(c.isalpha() and c not in vowels for c in tok)
            if has_vowel and has_consonant:
                recognized_count += 1
            elif tok in COMMON_ENGLISH_WORDS:
                recognized_count += 1

    validity_ratio = recognized_count / max(1, len(unique_tokens))
    if validity_ratio < 0.40:
        return False, "Input appears to contain random letters or unreadable text. Please write in recognizable sentences.", {}

    meta = {
        "word_count": len(tokens),
        "unique_word_count": len(unique_tokens),
        "diversity_ratio": round(diversity_ratio, 2),
        "validity_ratio": round(validity_ratio, 2)
    }
    return True, "", meta

def analyze_text(text: str) -> dict:
    """
    Performs NLP sentiment, emotion, and stress linguistic pattern analysis with
    enhanced input verification and multi-model calibration.
    """
    # 1. Linguistic Quality Validation
    is_valid, val_msg, meta = validate_text_entry(text)
    if not is_valid:
        return {
            "status": "warning",
            "message": val_msg,
            "stress_indicator": 0.0,
            "confidence": 0.0,
            "emotion": "Invalid Input",
            "sentiment": "Neutral",
            "explanation": [val_msg],
            "top_features": [],
            "validation": meta
        }

    tokens = clean_and_tokenize(text)

    # 2. High-Priority Safety Crisis Check
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
            "top_features": tokens[:5],
            "validation": meta
        }

    # 3. Model Inference
    artifacts = get_text_model()
    vectorizer = artifacts["vectorizer"]
    classifier = artifacts["classifier"]
    regressor = artifacts["regressor"]
    classes = artifacts["classes"]

    vec = vectorizer.transform([text])

    # Predict emotion & probabilities
    emo_probs = classifier.predict_proba(vec)[0]
    pred_idx = int(np.argmax(emo_probs))
    pred_emotion = classes[pred_idx]
    model_conf = float(emo_probs[pred_idx])

    # Predict stress indicator (0-100)
    pred_stress = float(regressor.predict(vec)[0])
    pred_stress = max(0.0, min(100.0, pred_stress))

    # 4. Integrate VADER Sentiment calibration if available
    vader = get_vader()
    vader_scores = None
    if vader:
        vader_scores = vader.polarity_scores(text)
        compound = vader_scores['compound']
        neg = vader_scores['neg']
        pos = vader_scores['pos']

        # Calibrate sentiment based on combined TF-IDF + VADER
        if compound >= 0.25 and pos > neg:
            sentiment = 'Positive'
            if pred_emotion in ['Positive', 'Neutral']:
                pred_stress = min(pred_stress, max(5.0, 30.0 - compound * 25.0))
        elif compound <= -0.25 and neg > pos:
            sentiment = 'Negative'
            if pred_emotion in ['Sadness', 'Anxiety', 'Anger', 'Stress']:
                pred_stress = max(pred_stress, min(95.0, 60.0 + abs(compound) * 35.0))
        else:
            sentiment = 'Neutral'
    else:
        if pred_emotion in ['Positive', 'Neutral'] and pred_stress < 40:
            sentiment = 'Positive'
        elif pred_stress > 60 or pred_emotion in ['Sadness', 'Anger', 'Anxiety', 'Stress']:
            sentiment = 'Negative'
        else:
            sentiment = 'Neutral'

    # 5. Extract Top Salient Linguistic Features
    feature_names = np.array(vectorizer.get_feature_names_out())
    nonzero_indices = vec.nonzero()[1]
    tfidf_scores = vec.data
    sorted_pairs = sorted(zip(nonzero_indices, tfidf_scores), key=lambda x: x[1], reverse=True)
    top_features = [feature_names[idx] for idx, _ in sorted_pairs[:8]]

    # 6. Formulate Clear Interpretability Explanations
    explanations = []
    if top_features:
        features_str = ", ".join(top_features[:4])
        explanations.append(f"Key linguistic terms identified: '{features_str}'")

    if pred_stress >= 66.0:
        explanations.append("Linguistic patterns exhibit elevated stress or fatigue terms.")
    elif pred_stress >= 36.0:
        explanations.append("Linguistic patterns reflect moderate strain or cognitive workload.")
    else:
        explanations.append("Linguistic patterns indicate a steady, balanced, or positive emotional state.")

    # Confidence calculation: blend maximum probability with vocabulary coverage
    vocab_coverage = min(1.0, len(nonzero_indices) / max(3, len(tokens) * 0.4))
    calibrated_confidence = round(float(np.clip(model_conf * 0.7 + vocab_coverage * 0.3, 0.45, 0.99)), 2)

    return {
        "status": "success",
        "is_crisis": False,
        "emotion": pred_emotion,
        "sentiment": sentiment,
        "stress_indicator": round(pred_stress, 1),
        "confidence": calibrated_confidence,
        "explanation": explanations,
        "top_features": top_features,
        "class_probabilities": {c: round(float(p), 2) for c, p in zip(classes, emo_probs)},
        "vader_sentiment": vader_scores,
        "validation": meta
    }
