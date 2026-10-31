# REST API Documentation

## Endpoints Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check status & system disclaimer |
| `/api/text/analyze` | POST | Analyze journal text entry via NLP model |
| `/api/voice/analyze` | POST | Upload and process audio recording via Librosa ML |
| `/api/questionnaire/questions` | GET | Retrieve 10-item questionnaire schema |
| `/api/questionnaire/analyze` | POST | Calculate questionnaire score and category breakdown |
| `/api/assessment/analyze` | POST | Execute Multimodal Fusion & save record to database |
| `/api/assessment/<id>` | GET | Fetch detailed assessment record by ID |
| `/api/assessment/<id>` | DELETE | Delete specific assessment record |
| `/api/dashboard` | GET | Retrieve aggregated dashboard statistics and trends |
| `/api/history` | GET | Retrieve paginated assessment history |
| `/api/history/clear` | DELETE | Delete all historical assessment records |
| `/api/model-evaluation` | GET | Fetch trained NLP & Voice ML model evaluation metrics |

---

## Endpoint Details

### 1. `POST /api/text/analyze`

**Request Body:**
```json
{
  "text": "I feel extremely overwhelmed by upcoming exams and work deadlines."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "is_crisis": false,
  "emotion": "Stress",
  "sentiment": "Negative",
  "stress_indicator": 78.4,
  "confidence": 0.88,
  "top_features": ["overwhelmed", "exams", "deadlines"],
  "explanation": [
    "Key linguistic terms identified: 'overwhelmed, exams, deadlines'",
    "Linguistic patterns exhibit elevated stress-associated terms."
  ]
}
```

---

### 2. `POST /api/voice/analyze`

**Form Data:**
- `audio`: File upload (.wav, .mp3, .webm, .ogg)

**Response (200 OK):**
```json
{
  "status": "success",
  "emotion": "Anxiety",
  "indicator": 82.1,
  "confidence": 0.85,
  "features_summary": {
    "duration_sec": 4.2,
    "sample_rate": 22050,
    "estimated_pitch_hz": 242.1,
    "rms_energy_mean": 0.075,
    "spectral_centroid_hz": 2840.5,
    "spectral_rolloff_hz": 5600.0,
    "zcr_mean": 0.112
  },
  "explanation": [
    "Acoustic duration: 4.2s at 22050Hz.",
    "Dominant vocal acoustic pattern: Anxiety (confidence: 85%).",
    "Elevated vocal pitch variations detected."
  ]
}
```

---

### 3. `POST /api/assessment/analyze`

**Request Body:**
```json
{
  "text_result": { "status": "success", "stress_indicator": 70.0, "emotion": "Stress" },
  "voice_result": { "status": "success", "indicator": 50.0, "emotion": "Calm" },
  "questionnaire_result": { "questionnaire_score": 60.0 },
  "custom_weights": { "text": 0.40, "voice": 0.30, "questionnaire": 0.30 }
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "assessment_id": 1,
  "fusion_result": {
    "overall_score": 61.0,
    "category": "MODERATE",
    "contributions": { "text": 28.0, "voice": 15.0, "questionnaire": 18.0 },
    "recommendations": [
      "Take short, structured breaks to rest your mind.",
      "Try deep diaphragmatic breathing exercises when feeling tense."
    ]
  }
}
```
