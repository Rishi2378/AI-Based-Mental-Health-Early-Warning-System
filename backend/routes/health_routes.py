from flask import Blueprint, jsonify
from config import Config

health_bp = Blueprint('health_bp', __name__)

@health_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "system": "MindGuard AI Backend API",
        "version": "1.0.0",
        "non_diagnostic_disclaimer": "This system provides non-diagnostic wellness indicators and does not replace clinical medical advice."
    }), 200
