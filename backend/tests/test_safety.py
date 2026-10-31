import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.safety_service import check_crisis_text
from services.text_service import analyze_text

def test_crisis_keyword_detection():
    crisis_text = "I feel like I want to end my life, everything is hopeless."
    res = check_crisis_text(crisis_text)
    assert res["is_crisis"] is True
    assert "988" in res["helplines"][0]["contact"]

def test_non_crisis_text():
    normal_text = "I had a busy day at work with lots of meetings and feel tired."
    res = check_crisis_text(normal_text)
    assert res["is_crisis"] is False

def test_text_service_crisis_handling():
    crisis_input = "I am cutting myself and cannot go on."
    res = analyze_text(crisis_input)
    assert res["status"] == "crisis"
    assert res["is_crisis"] is True
    assert res["stress_indicator"] == 95.0
