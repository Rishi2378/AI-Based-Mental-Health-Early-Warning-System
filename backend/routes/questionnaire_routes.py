from flask import Blueprint, request, jsonify
from services.questionnaire_service import QUESTIONNAIRE_SCHEMA, analyze_questionnaire

questionnaire_bp = Blueprint('questionnaire_bp', __name__)

@questionnaire_bp.route('/api/questionnaire/questions', methods=['GET'])
def get_questions():
    return jsonify({
        "status": "success",
        "questions": QUESTIONNAIRE_SCHEMA
    }), 200

@questionnaire_bp.route('/api/questionnaire/analyze', methods=['POST'])
def handle_questionnaire_analysis():
    data = request.get_json() or {}
    answers = data.get('answers', {})

    if not answers:
        return jsonify({"status": "error", "message": "No questionnaire answers provided."}), 400

    result = analyze_questionnaire(answers)
    return jsonify({
        "status": "success",
        "result": result
    }), 200
