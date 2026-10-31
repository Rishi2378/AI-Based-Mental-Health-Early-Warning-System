import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))

def get_database_uri():
    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        # Normalize relative SQLite paths
        if db_url.startswith('sqlite:///'):
            raw_path = db_url[len('sqlite:///'):]
            if raw_path != ':memory:' and not os.path.isabs(raw_path):
                if raw_path.startswith(('backend/', 'backend\\')):
                    abs_path = os.path.abspath(os.path.join(PROJECT_ROOT, raw_path))
                else:
                    abs_path = os.path.abspath(os.path.join(BASE_DIR, raw_path))
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                return f"sqlite:///{abs_path.replace(os.sep, '/')}"
            elif raw_path != ':memory:':
                return f"sqlite:///{os.path.abspath(raw_path).replace(os.sep, '/')}"
        return db_url

    default_db = os.path.abspath(os.path.join(BASE_DIR, 'database', 'mindguard.db'))
    os.makedirs(os.path.dirname(default_db), exist_ok=True)
    return f"sqlite:///{default_db.replace(os.sep, '/')}"

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'mindguard-ai-secret-key-2026-wellness')
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Directories
    MODELS_DIR = os.path.join(BASE_DIR, 'models')
    UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
    DATASETS_DIR = os.path.join(PROJECT_ROOT, 'data')

    # Upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
    ALLOWED_AUDIO_EXTENSIONS = {'wav', 'mp3', 'ogg', 'webm', 'm4a', 'flac'}

    # Default Multimodal Fusion Weights (Configurable)
    FUSION_WEIGHTS = {
        'text': float(os.environ.get('WEIGHT_TEXT', 0.40)),
        'voice': float(os.environ.get('WEIGHT_VOICE', 0.30)),
        'questionnaire': float(os.environ.get('WEIGHT_QUESTIONNAIRE', 0.30))
    }

    # Stress Thresholds (Project-defined non-diagnostic indicators)
    THRESHOLD_LOW_MAX = 35.0
    THRESHOLD_MODERATE_MAX = 65.0

    BASE_DIR = BASE_DIR
    PROJECT_ROOT = PROJECT_ROOT

    # Ensure required directories exist
    @classmethod
    def init_app(cls, app=None):
        os.makedirs(cls.MODELS_DIR, exist_ok=True)
        os.makedirs(cls.UPLOADS_DIR, exist_ok=True)
        os.makedirs(os.path.join(cls.BASE_DIR, 'database'), exist_ok=True)
        os.makedirs(cls.DATASETS_DIR, exist_ok=True)
        os.makedirs(os.path.join(cls.DATASETS_DIR, 'raw'), exist_ok=True)
        os.makedirs(os.path.join(cls.DATASETS_DIR, 'processed'), exist_ok=True)
        if app is not None and hasattr(app, 'instance_path'):
            os.makedirs(app.instance_path, exist_ok=True)
