import os
import sys

# Ensure backend root is in sys.path
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from config import Config
from database.db import init_db

from routes.health_routes import health_bp
from routes.text_routes import text_bp
from routes.voice_routes import voice_bp
from routes.questionnaire_routes import questionnaire_bp
from routes.assessment_routes import assessment_bp
from routes.dashboard_routes import dashboard_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    Config.init_app(app)

    # Enable CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database
    init_db(app)

    # Register Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(text_bp)
    app.register_blueprint(voice_bp)
    app.register_blueprint(questionnaire_bp)
    app.register_blueprint(assessment_bp)
    app.register_blueprint(dashboard_bp)

    # Detect frontend build directory for unified single-port deployment
    dist_dir = os.path.abspath(os.path.join(Config.PROJECT_ROOT, 'frontend', 'dist'))

    if os.path.exists(dist_dir):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_frontend(path):
            if path and os.path.exists(os.path.join(dist_dir, path)):
                return send_from_directory(dist_dir, path)
            return send_from_directory(dist_dir, 'index.html')

    @app.errorhandler(404)
    def not_found(e):
        if request.path.startswith('/api/'):
            return jsonify({"status": "error", "message": "API Resource not found"}), 404
        if os.path.exists(dist_dir):
            return send_from_directory(dist_dir, 'index.html')
        return jsonify({"status": "error", "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"status": "error", "message": f"Internal Server Error: {str(e)}"}), 500

    return app

application = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    use_reloader = os.environ.get("FLASK_USE_RELOADER", "false").lower() in ("true", "1", "yes")
    print("==================================================")
    print(f"MindGuard AI Multimodal Server running on port {port}")
    print(f"Web UI & API: http://127.0.0.1:{port}")
    print("==================================================")
    application.run(host='0.0.0.0', port=port, debug=True, use_reloader=use_reloader)
