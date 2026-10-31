from config import Config
from services.recommendation_service import generate_recommendations

def run_multimodal_fusion(
    text_result: dict = None,
    voice_result: dict = None,
    questionnaire_result: dict = None,
    custom_weights: dict = None
) -> dict:
    """
    Transparent Multimodal Fusion Engine combining Text, Voice, and Questionnaire scores.
    Dynamically re-weights active modalities if any modality is omitted.
    """
    weights = custom_weights or Config.FUSION_WEIGHTS.copy()
    
    active_modalities = {}
    
    # Text Modality
    if text_result and text_result.get("status") == "success":
        active_modalities["text"] = float(text_result.get("stress_indicator", 0.0))
    
    # Voice Modality
    if voice_result and voice_result.get("status") == "success":
        active_modalities["voice"] = float(voice_result.get("indicator", 0.0))
        
    # Questionnaire Modality
    if questionnaire_result and ("questionnaire_score" in questionnaire_result or "score" in questionnaire_result):
        score = questionnaire_result.get("questionnaire_score", questionnaire_result.get("score", 0.0))
        active_modalities["questionnaire"] = float(score)

    if not active_modalities:
        return {
            "status": "error",
            "message": "Insufficient inputs provided. At least one analysis modality must be completed.",
            "overall_score": 0.0,
            "category": "LOW"
        }

    # Normalize weights among active modalities
    total_active_weight = sum(weights.get(m, 0.33) for m in active_modalities.keys())
    if total_active_weight <= 0:
        total_active_weight = 1.0

    normalized_weights = {
        m: round(weights.get(m, 0.33) / total_active_weight, 4)
        for m in active_modalities.keys()
    }

    # Calculate contributions & overall score
    contributions = {}
    overall_score = 0.0

    for m, score in active_modalities.items():
        w = normalized_weights[m]
        contrib = score * w
        contributions[m] = round(contrib, 2)
        overall_score += contrib

    overall_score = round(max(0.0, min(100.0, overall_score)), 1)

    # Determine Non-Diagnostic Category
    if overall_score <= Config.THRESHOLD_LOW_MAX:
        category = "LOW"
    elif overall_score <= Config.THRESHOLD_MODERATE_MAX:
        category = "MODERATE"
    else:
        category = "ELEVATED"

    # Check for crisis override
    is_crisis = False
    if text_result and text_result.get("is_crisis"):
        is_crisis = True
        category = "ELEVATED"
        overall_score = 95.0

    # Determine dominant emotion across modalities
    dominant_emotion = None
    if text_result and text_result.get("emotion"):
        dominant_emotion = text_result.get("emotion")
    elif voice_result and voice_result.get("emotion"):
        dominant_emotion = voice_result.get("emotion")

    # Generate personalized recommendations
    recommendations = generate_recommendations(overall_score, category, dominant_emotion, is_crisis)

    # Generate fusion explainability text
    breakdown_explanations = [
        f"Multimodal Fusion calculation applied across {len(active_modalities)} active input modalities."
    ]
    for m in active_modalities.keys():
        score = active_modalities[m]
        w_pct = round(normalized_weights[m] * 100, 1)
        c_val = contributions[m]
        breakdown_explanations.append(f"{m.capitalize()} Modality Score ({score:.1f}) × Weight ({w_pct}%) = {c_val:.1f} pts contribution.")

    breakdown_explanations.append(f"Overall Multimodal Stress Indicator: {overall_score:.1f}/100 -> Category: {category}.")

    return {
        "status": "success",
        "overall_score": overall_score,
        "category": category,
        "is_crisis": is_crisis,
        "weights_used": normalized_weights,
        "component_scores": active_modalities,
        "contributions": contributions,
        "dominant_emotion": dominant_emotion,
        "explainability": breakdown_explanations,
        "recommendations": recommendations,
        "disclaimer": "This indicator is a non-diagnostic wellness metric calculated from user inputs and must not be interpreted as a clinical diagnosis."
    }
