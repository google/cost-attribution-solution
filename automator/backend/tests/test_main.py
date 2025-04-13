import os
from fastapi.testclient import TestClient
from pytest import fixture

@fixture
def client():
    os.environ["SCOPE"] = "test"

    from main import app
    yield TestClient(app)


def test_health_check(client):
    """Tests the health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"detail": "OK"}
