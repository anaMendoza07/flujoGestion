"""
Fixtures compartidas para todos los tests.

Usa un archivo SQLite temporal por cada test session,
evitando el problema de conexiones cerradas con :memory:.
"""
import sys
import os
import tempfile
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src", "backend"))

# Mock flask_cors antes de importar app (no disponible en algunos entornos)
from unittest.mock import MagicMock
sys.modules.setdefault("flask_cors", MagicMock())


@pytest.fixture
def app():
    """Flask app con DB en archivo temporal aislado por test."""
    from backend import database
    from backend import app as flask_app

    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    original_path = database.DB_PATH
    database.DB_PATH = db_path
    database.init_db()

    flask_app.app.config["TESTING"] = True

    yield flask_app.app

    database.DB_PATH = original_path
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    return app.test_client()