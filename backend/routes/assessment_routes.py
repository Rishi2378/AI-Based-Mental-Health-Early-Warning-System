import json
from flask import Blueprint, request, jsonify
from database.models import db, User, Assessment, TextResult, VoiceResult, QuestionnaireResult, Recommendation
from services.fusion_service import run_multimodal_fusion

assessment_bp = Blueprint('assessment_bp', __name__)

@assessment_bp.route('/api/assessment/analyze', methods=['POST'])
def create_multimodal_assessment():
    data = request.get_json() or {}

    text_result = data.get('text_result')
    voice_result = data.get('voice_result')
    questionnaire_result = data.get('questionnaire_result')
    custom_weights = data.get('custom_weights')
    user_id = data.get('user_id', 1)

    fusion_res = run_multimodal_fusion(
        text_result=text_result,
        voice_result=voice_result,
        questionnaire_result=questionnaire_result,
        custom_weights=custom_weights
    )

    if fusion_res.get("status") == "error":
        return jsonify(fusion_res), 400

    # Ensure user exists
    user = db.session.get(User, user_id)
    if not user:
        user = User(id=1, name="Default User")
        db.session.add(user)
        db.session.commit()

    # Save Assessment to Database
    assessment = Assessment(
        user_id=user.id,
        text_score=fusion_res["component_scores"].get("text"),
        voice_score=fusion_res["component_scores"].get("voice"),
        questionnaire_score=fusion_res["component_scores"].get("questionnaire"),
        overall_score=fusion_res["overall_score"],
        category=fusion_res["category"],
        is_crisis=fusion_res.get("is_crisis", False)
    )
    db.session.add(assessment)
    db.session.flush()

    # Save TextResult detail if present
    if text_result and text_result.get("status") == "success":
        t_res = TextResult(
            assessment_id=assessment.id,
            sentiment=text_result.get("sentiment", "Neutral"),
            emotion=text_result.get("emotion", "Neutral"),
            confidence=text_result.get("confidence", 0.0),
            stress_indicator=text_result.get("stress_indicator", 0.0),
            top_features_json=json.dumps(text_result.get("top_features", [])),
            text_sample=data.get("raw_text_sample", "")
        )
        db.session.add(t_res)

    # Save VoiceResult detail if present
    if voice_result and voice_result.get("status") == "success":
        v_res = VoiceResult(
            assessment_id=assessment.id,
            emotion=voice_result.get("emotion", "Neutral"),
            indicator=voice_result.get("indicator", 0.0),
            confidence=voice_result.get("confidence", 0.0),
            features_json=json.dumps(voice_result.get("features_summary", {}))
        )
        db.session.add(v_res)

    # Save QuestionnaireResult detail if present
    if questionnaire_result and ("questionnaire_score" in questionnaire_result or "score" in questionnaire_result):
        score = questionnaire_result.get("questionnaire_score", questionnaire_result.get("score", 0.0))
        q_res = QuestionnaireResult(
            assessment_id=assessment.id,
            score=score,
            answers_json=json.dumps(questionnaire_result.get("answers", {}))
        )
        db.session.add(q_res)

    # Save Recommendation list
    rec = Recommendation(
        assessment_id=assessment.id,
        recommendation_text_json=json.dumps(fusion_res.get("recommendations", []))
    )
    db.session.add(rec)

    db.session.commit()

    return jsonify({
        "status": "success",
        "assessment_id": assessment.id,
        "fusion_result": fusion_res,
        "saved_record": assessment.to_dict()
    }), 201

@assessment_bp.route('/api/assessment/<int:assessment_id>', methods=['GET'])
def get_assessment(assessment_id):
    assessment = db.session.get(Assessment, assessment_id)
    if not assessment:
        return jsonify({"status": "error", "message": "Assessment not found."}), 404

    return jsonify({
        "status": "success",
        "assessment": assessment.to_dict()
    }), 200

@assessment_bp.route('/api/assessment/<int:assessment_id>', methods=['DELETE'])
def delete_assessment(assessment_id):
    assessment = db.session.get(Assessment, assessment_id)
    if not assessment:
        return jsonify({"status": "error", "message": "Assessment not found."}), 404

    db.session.delete(assessment)
    db.session.commit()
    return jsonify({"status": "success", "message": f"Assessment #{assessment_id} deleted."}), 200

@assessment_bp.route('/api/history/clear', methods=['DELETE'])
def clear_all_history():
    try:
        num_deleted = db.session.query(Assessment).delete()
        db.session.commit()
        return jsonify({"status": "success", "message": f"Cleared {num_deleted} historical assessments."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
