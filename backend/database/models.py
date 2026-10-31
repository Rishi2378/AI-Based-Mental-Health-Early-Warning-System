from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def get_utc_now():
    return datetime.now(timezone.utc)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="Anonymous User")
    email = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=get_utc_now)

    assessments = db.relationship('Assessment', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Assessment(db.Model):
    __tablename__ = 'assessments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=get_utc_now)
    text_score = db.Column(db.Float, nullable=True)
    voice_score = db.Column(db.Float, nullable=True)
    questionnaire_score = db.Column(db.Float, nullable=True)
    overall_score = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # LOW, MODERATE, ELEVATED
    is_crisis = db.Column(db.Boolean, default=False)

    text_result = db.relationship('TextResult', backref='assessment', uselist=False, cascade="all, delete-orphan")
    voice_result = db.relationship('VoiceResult', backref='assessment', uselist=False, cascade="all, delete-orphan")
    questionnaire_result = db.relationship('QuestionnaireResult', backref='assessment', uselist=False, cascade="all, delete-orphan")
    recommendations = db.relationship('Recommendation', backref='assessment', uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "text_score": round(self.text_score, 1) if self.text_score is not None else None,
            "voice_score": round(self.voice_score, 1) if self.voice_score is not None else None,
            "questionnaire_score": round(self.questionnaire_score, 1) if self.questionnaire_score is not None else None,
            "overall_score": round(self.overall_score, 1),
            "category": self.category,
            "is_crisis": self.is_crisis,
            "text_result": self.text_result.to_dict() if self.text_result else None,
            "voice_result": self.voice_result.to_dict() if self.voice_result else None,
            "questionnaire_result": self.questionnaire_result.to_dict() if self.questionnaire_result else None,
            "recommendations": self.recommendations.to_dict() if self.recommendations else None
        }

class TextResult(db.Model):
    __tablename__ = 'text_results'

    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    sentiment = db.Column(db.String(50), nullable=False)
    emotion = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    stress_indicator = db.Column(db.Float, nullable=False)
    top_features_json = db.Column(db.Text, nullable=True) # JSON list of key phrases/tokens
    text_sample = db.Column(db.Text, nullable=True)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "sentiment": self.sentiment,
            "emotion": self.emotion,
            "confidence": round(self.confidence, 2),
            "stress_indicator": round(self.stress_indicator, 1),
            "top_features": json.loads(self.top_features_json) if self.top_features_json else [],
            "text_sample": self.text_sample
        }

class VoiceResult(db.Model):
    __tablename__ = 'voice_results'

    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    emotion = db.Column(db.String(50), nullable=False)
    indicator = db.Column(db.Float, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    features_json = db.Column(db.Text, nullable=True) # Summary pitch, energy, ZCR metrics

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "emotion": self.emotion,
            "indicator": round(self.indicator, 1),
            "confidence": round(self.confidence, 2),
            "features_summary": json.loads(self.features_json) if self.features_json else {}
        }

class QuestionnaireResult(db.Model):
    __tablename__ = 'questionnaire_results'

    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    answers_json = db.Column(db.Text, nullable=True)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "score": round(self.score, 1),
            "answers": json.loads(self.answers_json) if self.answers_json else {}
        }

class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    recommendation_text_json = db.Column(db.Text, nullable=False) # JSON list of recommendation strings

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "items": json.loads(self.recommendation_text_json) if self.recommendation_text_json else []
        }
