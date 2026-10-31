import pytest
import sys
import os
import io
import numpy as np
import scipy.io.wavfile as wavfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from database.models import db

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def test_health_check(client):
    rv = client.get('/api/health')
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert json_data['status'] == 'healthy'

def test_get_questionnaire_questions(client):
    rv = client.get('/api/questionnaire/questions')
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert len(json_data['questions']) == 10

def test_text_analysis_endpoint_success(client):
    rv = client.post('/api/text/analyze', json={"text": "I am feeling overwhelmed with my heavy workload and exams."})
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'success'
    assert 'stress_indicator' in data
    assert data['emotion'] in ['Stress', 'Anxiety', 'Sadness', 'Anger', 'Neutral', 'Positive']

def test_text_analysis_endpoint_validation_rejection(client):
    # Reject empty
    rv_empty = client.post('/api/text/analyze', json={"text": ""})
    assert rv_empty.status_code == 400
    assert rv_empty.get_json()['status'] == 'warning'

    # Reject gibberish / too brief
    rv_gib = client.post('/api/text/analyze', json={"text": "asdf qwer zxcv"})
    assert rv_gib.status_code == 400

    # Reject repeating spam
    rv_spam = client.post('/api/text/analyze', json={"text": "word word word word word word"})
    assert rv_spam.status_code == 400

def test_voice_analysis_endpoint_silence_rejection(client):
    # Generate 2 seconds of silence wav
    sr = 22050
    silence = np.zeros(sr * 2, dtype=np.int16)
    buf = io.BytesIO()
    wavfile.write(buf, sr, silence)
    buf.seek(0)

    data = {
        'audio': (buf, 'silence.wav')
    }
    rv = client.post('/api/voice/analyze', data=data, content_type='multipart/form-data')
    assert rv.status_code == 400
    assert rv.get_json()['status'] == 'warning'

def test_questionnaire_analysis_endpoint(client):
    answers = {"q1": 3, "q2": 2, "q3": 3, "q4": 1, "q5": 2, "q6": 3, "q7": 3, "q8": 2, "q9": 1, "q10": 2}
    rv = client.post('/api/questionnaire/analyze', json={"answers": answers})
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'success'
    assert 'questionnaire_score' in data['result']

def test_multimodal_assessment_creation(client):
    payload = {
        "text_result": {
            "status": "success",
            "stress_indicator": 78.0,
            "confidence": 0.88,
            "emotion": "Stress"
        },
        "voice_result": {
            "status": "success",
            "indicator": 72.0,
            "confidence": 0.85,
            "emotion": "Anxiety"
        },
        "questionnaire_result": {
            "status": "success",
            "questionnaire_score": 65.0
        }
    }
    rv = client.post('/api/assessment/analyze', json=payload)
    assert rv.status_code in [200, 201]
    data = rv.get_json()
    assert data['status'] == 'success'
    assert 'fusion_result' in data
    assert data['fusion_result']['overall_score'] > 0
    assert 'recommendations' in data['fusion_result']
