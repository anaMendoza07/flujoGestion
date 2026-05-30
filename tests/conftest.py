import sys
import os
import pytest

# src/ → permite 'from backend.services.priority_service import ...'
# src/backend/ → permite que app.py haga 'from database import ...' internamente
BASE = os.path.join(os.path.dirname(__file__), "..", "src")
sys.path.insert(0, os.path.join(BASE, "backend"))
sys.path.insert(0, BASE)

import backend.database as database
from backend.app import app as flask_app


@pytest.fixture
def app(tmp_path, monkeypatch):
    db_file = str(tmp_path / "test.db")
    monkeypatch.setattr(database, "DB_PATH", db_file)

    with flask_app.app_context():
        database.init_db()

    flask_app.config["TESTING"] = True
    yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def sample_client(client):
    resp = client.post("/api/clients/", json={
        "full_name": "Laura Gómez",
        "phone": "3001234567",
        "email": "laura@example.com"
    })
    return resp.get_json()
