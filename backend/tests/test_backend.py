import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.nlp_service import parse_cook_nlp_response, rule_based_nlp_parser

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_nlp_acceptance_parsing():
    res1 = parse_cook_nlp_response("I can prepare 10 meals")
    assert res1.available is True
    assert res1.capacity == 10
    assert res1.intent == "ACCEPT"

    res2 = parse_cook_nlp_response("I can take 5 orders")
    assert res2.available is True
    assert res2.capacity == 5
    assert res2.intent == "ACCEPT"

def test_nlp_rejection_parsing():
    res1 = parse_cook_nlp_response("I am unavailable today")
    assert res1.available is False
    assert res1.capacity == 0
    assert res1.intent == "REJECT"

    res2 = parse_cook_nlp_response("I cannot accept this order")
    assert res2.available is False
    assert res2.capacity == 0
    assert res2.intent == "REJECT"

def test_get_kitchens_endpoint():
    response = client.get("/api/kitchens")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_analytics_endpoint():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "system_status" in data
