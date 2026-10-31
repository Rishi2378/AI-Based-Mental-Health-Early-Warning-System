import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from services.voice_service import analyze_voice

voice_bp = Blueprint('voice_bp', __name__)

@voice_bp.route('/api/voice/analyze', methods=['POST'])
def handle_voice_analysis():
    if 'audio' not in request.files:
        return jsonify({"status": "error", "message": "No audio file provided in request."}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file."}), 400

    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'wav'

    if ext not in current_app.config['ALLOWED_AUDIO_EXTENSIONS']:
        return jsonify({"status": "error", "message": f"Invalid audio format '.{ext}'. Supported formats: {', '.join(current_app.config['ALLOWED_AUDIO_EXTENSIONS'])}"}), 400

    # Save temp file
    temp_filename = f"voice_{uuid.uuid4().hex[:8]}.{ext}"
    temp_path = os.path.join(current_app.config['UPLOADS_DIR'], temp_filename)
    file.save(temp_path)

    try:
        result = analyze_voice(temp_path)
        if result.get("status") == "warning":
            return jsonify(result), 400
        return jsonify(result), 200
    finally:
        # Privacy conscious default: Remove raw audio file immediately after processing
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
