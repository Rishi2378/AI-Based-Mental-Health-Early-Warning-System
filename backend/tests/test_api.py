import pytest
import sys
import os

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

def test_text_analysis_endpoint(client):
    rv = client.post('/api/text/analyze', json={"text": "I am feeling overwhelmed with my heavy workload and exams."})
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'success'
    assert 'stress_indicator' in data

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
            "emotion": "Stress",
            "sentiment": "Negative",
            "stress_indicator": 70.0,
            "confidence": 0.85,
            "top_features": ["overloaded"]
        },
        "questionnaire_result": {
            "questionnaire_score": 60.0
        }
    }
    rv = client.post('/api/assessment/analyze', json=payload)
    assert rv.status_code == 201
    data = rv.get_json()
    assert data['status'] == 'success'
    assert 'overall_score' in data['fusion_result']

def test_dashboard_and_history(client):
    rv_dash = client.get('/api/dashboard')
    assert rv_dash.status_code == 200

    rv_hist = client.get('/api/history')
    assert rv_hist.status_code == 200
