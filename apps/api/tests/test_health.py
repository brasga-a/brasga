from fastapi.testclient import TestClient

from portfolio_api.main import app


def test_health() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_is_documented() -> None:
    with TestClient(app) as client:
        response = client.get("/openapi.json")

    assert response.status_code == 200
    assert "/api/health" in response.json()["paths"]
