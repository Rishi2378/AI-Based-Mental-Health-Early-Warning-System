"""
Production WSGI Entrypoint for MindGuard AI.
Compatible with Gunicorn, Waitress, and any WSGI server.
"""
import sys
import os

# Add backend directory to path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    try:
        from waitress import serve
        print(f"Starting MindGuard AI production server with Waitress on http://0.0.0.0:{port}...")
        serve(app, host='0.0.0.0', port=port, threads=6)
    except ImportError:
        print(f"Starting MindGuard AI with Flask runner on http://0.0.0.0:{port}...")
        app.run(host='0.0.0.0', port=port)
