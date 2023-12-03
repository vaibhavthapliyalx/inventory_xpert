import pytest
from index import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_all_orders(client):
    response = client.get('/api/all-orders')
    assert response.status_code == 200

def test_get_orders_with_customer_details(client):
    response = client.get('/api/get-orders-with-customer-details', query_string={'product_ids': [1, 2]})
    assert response.status_code == 200

