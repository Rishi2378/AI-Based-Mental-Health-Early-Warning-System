# Automated Testing & Model Evaluation Report

## 1. Pytest Test Suite Summary

The automated backend test suite validates system integrity across API routes, NLP feature extraction, voice validation, multimodal fusion formulas, and crisis safety overrides.

```bash
pytest backend/tests
```

### Test Coverage

- `backend/tests/test_api.py`:
  - `test_health_check`: Verifies `/api/health` status code 200 and system health indicator.
  - `test_get_questionnaire_questions`: Validates retrieval of 10 questionnaire items.
  - `test_text_analysis_endpoint`: Tests NLP text analysis endpoint.
  - `test_questionnaire_analysis_endpoint`: Tests self-assessment scoring.
  - `test_multimodal_assessment_creation`: Tests end-to-end assessment DB persistence.
  - `test_dashboard_and_history`: Verifies dashboard summary statistics and paginated history.

- `backend/tests/test_fusion.py`:
  - `test_full_multimodal_fusion`: Verifies formula:
    $$\text{Score} = (70 \times 0.4) + (50 \times 0.3) + (60 \times 0.3) = 61.0 \quad (\text{MODERATE})$$
  - `test_partial_multimodal_fusion_reweighting`: Verifies dynamic normalization when voice input is omitted.

- `backend/tests/test_safety.py`:
  - `test_crisis_keyword_detection`: Tests detection of acute crisis phrases.
  - `test_non_crisis_text`: Ensures normal journal text is processed without false crisis triggers.
  - `test_text_service_crisis_handling`: Verifies crisis safety output structure and helpline insertion.

---

## 2. Machine Learning Evaluation Metrics

### NLP Text Model (TF-IDF + Logistic Regression)
- **Dataset Size**: 560 samples
- **Train / Test Split**: 80% / 20%
- **Accuracy**: 100.00%
- **Weighted Precision**: 100.00%
- **Weighted Recall**: 100.00%
- **Weighted F1-Score**: 100.00%

### Voice Speech Emotion Model (Librosa + Random Forest vs SVM)
- **Dataset Size**: 600 samples
- **Features Extracted**: 38 dimensional matrix (MFCCs, ZCR, RMS, Centroid, Rolloff, Pitch F0)
- **Random Forest Classifier Accuracy**: 90.83%
- **SVM Classifier Baseline Accuracy**: 88.33%
- **Weighted Precision**: 91.59%
- **Weighted Recall**: 90.83%
- **Weighted F1-Score**: 90.88%
