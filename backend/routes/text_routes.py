from flask import Blueprint, request, jsonify
from services.text_service import analyze_text

text_bp = Blueprint('text_bp', __name__)

@text_bp.route('/api/text/analyze', methods=['POST'])
def handle_text_analysis():
    data = request.get_json() or {}
    text_content = data.get('text', '')

    result = analyze_text(text_content)
    if result.get("status") == "warning":
        return jsonify(result), 400

    return jsonify(result), 200
