import os
from flask import Blueprint, jsonify, request
from database.models import Assessment, TextResult, VoiceResult
from ml.evaluate_models import get_model_evaluation_summary

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/api/dashboard', methods=['GET'])
def get_dashboard_summary():
    assessments = Assessment.query.order_by(Assessment.created_at.desc()).all()

    total_assessments = len(assessments)
    if total_assessments == 0:
        return jsonify({
            "status": "success",
            "has_data": False,
            "total_assessments": 0,
            "current_indicator": None,
            "category_counts": {"LOW": 0, "MODERATE": 0, "ELEVATED": 0},
            "emotion_distribution": {},
            "trend_data": [],
            "recent_assessments": []
        }), 200

    latest = assessments[0].to_dict()

    # Category distribution
    cat_counts = {"LOW": 0, "MODERATE": 0, "ELEVATED": 0}
    for a in assessments:
        cat_counts[a.category] = cat_counts.get(a.category, 0) + 1

    # Emotion distribution from text & voice results
    emotion_counts = {}
    for a in assessments:
        if a.text_result and a.text_result.emotion:
            emo = a.text_result.emotion
            emotion_counts[emo] = emotion_counts.get(emo, 0) + 1
        if a.voice_result and a.voice_result.emotion:
            emo = a.voice_result.emotion
            emotion_counts[emo] = emotion_counts.get(emo, 0) + 1

    # Trend data ordered chronologically
    chronological = sorted(assessments, key=lambda x: x.created_at)
    trend_data = []
    for idx, a in enumerate(chronological, start=1):
        trend_data.append({
            "id": a.id,
            "date": a.created_at.strftime("%b %d, %H:%M"),
            "overall": round(a.overall_score, 1),
            "text": round(a.text_score, 1) if a.text_score is not None else None,
            "voice": round(a.voice_score, 1) if a.voice_score is not None else None,
            "questionnaire": round(a.questionnaire_score, 1) if a.questionnaire_score is not None else None,
            "category": a.category
        })

    recent_list = [a.to_dict() for a in assessments[:10]]

    return jsonify({
        "status": "success",
        "has_data": True,
        "total_assessments": total_assessments,
        "current_indicator": {
            "score": round(latest["overall_score"], 1),
            "category": latest["category"],
            "created_at": latest["created_at"],
            "is_crisis": latest["is_crisis"]
        },
        "category_counts": cat_counts,
        "emotion_distribution": emotion_counts,
        "trend_data": trend_data,
        "recent_assessments": recent_list
    }), 200

@dashboard_bp.route('/api/history', methods=['GET'])
def get_assessment_history():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = Assessment.query.order_by(Assessment.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    items = [a.to_dict() for a in pagination.items]

    return jsonify({
        "status": "success",
        "assessments": items,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page
    }), 200

@dashboard_bp.route('/api/model-evaluation', methods=['GET'])
def get_model_evaluation():
    eval_summary = get_model_evaluation_summary()
    return jsonify({
        "status": "success",
        "models": eval_summary
    }), 200

@dashboard_bp.route('/api/retrain-models', methods=['POST'])
def retrain_models():
    try:
        from ml.train_text_model import train_text_nlp_model
        from ml.train_voice_model import train_voice_emotion_model
        from ml.generate_datasets import generate_nlp_dataset, generate_voice_dataset
        
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        raw_dir = os.path.abspath(os.path.join(base_dir, '..', 'data', 'raw'))
        nlp_path = os.path.join(raw_dir, 'nlp_mental_health_dataset.csv')
        voice_path = os.path.join(raw_dir, 'voice_emotion_features.csv')

        generate_nlp_dataset(nlp_path)
        generate_voice_dataset(voice_path)

        text_artifacts = train_text_nlp_model()
        voice_artifacts = train_voice_emotion_model()

        return jsonify({
            "status": "success",
            "message": "AI Ensemble models retrained successfully!",
            "text_metrics": text_artifacts.get("metrics"),
            "voice_metrics": voice_artifacts.get("metrics")
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrain models: {str(e)}"
        }), 500

