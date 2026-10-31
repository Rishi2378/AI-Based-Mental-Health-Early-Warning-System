import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.fusion_service import run_multimodal_fusion

def test_full_multimodal_fusion():
    text_res = {"status": "success", "stress_indicator": 70.0, "emotion": "Stress"}
    voice_res = {"status": "success", "indicator": 50.0, "emotion": "Calm"}
    q_res = {"questionnaire_score": 60.0}

    # Custom weights: Text 40%, Voice 30%, Questionnaire 30%
    # Expected: (70 * 0.4) + (50 * 0.3) + (60 * 0.3) = 28 + 15 + 18 = 61.0 (MODERATE)
    res = run_multimodal_fusion(text_res, voice_res, q_res, {"text": 0.40, "voice": 0.30, "questionnaire": 0.30})
    
    assert res["status"] == "success"
    assert res["overall_score"] == 61.0
    assert res["category"] == "MODERATE"
    assert res["contributions"]["text"] == 28.0
    assert res["contributions"]["voice"] == 15.0
    assert res["contributions"]["questionnaire"] == 18.0

def test_partial_multimodal_fusion_reweighting():
    # Only Text and Questionnaire active
    text_res = {"status": "success", "stress_indicator": 80.0}
    q_res = {"questionnaire_score": 40.0}

    # Weights text: 0.4, quest: 0.3 -> Total active: 0.7 -> Text: 0.4/0.7 = 57.14%, Quest: 0.3/0.7 = 42.86%
    res = run_multimodal_fusion(text_res, None, q_res, {"text": 0.40, "voice": 0.30, "questionnaire": 0.30})

    assert res["status"] == "success"
    assert "voice" not in res["component_scores"]
    assert res["overall_score"] > 0
