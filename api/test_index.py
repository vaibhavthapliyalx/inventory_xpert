# This file contains all the unit tests for the backend of our application.
import pytest
import json
from index import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    # Creating a test client
    with app.test_client() as client:
        yield client

def test_database_connectivity(client):
    response = client.get('/api/db_connectivity')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert data['ok'] == 1

def test_server_connectivity(client):
    response = client.get('/api/server_connectivity')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert data['message'] == 'Flask API is working!'

def test_all_products(client):
    response = client.get('/api/all-products')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200

def test_all_orders(client):
    response = client.get('/api/all-orders')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200

def test_all_customers(client):
    response = client.get('/api/all-customers')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200

def test_get_customers_by_customer_id(client):
    response = client.get('/api/get-customer-by-customer-id?customer_id=301')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, dict)

def test_find_customers_by_membership_status(client):
    response = client.get('/api/find-customers-by-membership-status?membership_status=Member')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_find_orders_by_order_ids(client):
    response = client.get('/api/find-orders-by-order-ids?order_ids=404')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_find_products_by_product_ids(client):
    response = client.get('/api/find-products-by-product-ids?product_ids=201&product_ids=202&product_ids=203')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_find_products_by_multiple_categories(client):
    response = client.get('/api/find-products-by-multiple-categories?category=Chairs&category=Shelves&category=Beds')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_find_products_within_price_range(client):
    response = client.get('/api/find-products-within-price-range?min_price=10&max_price=150')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_get_orders_with_number_of_products(client):
    response = client.get('/api/orders-with-number-of-products?num_products=2')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_get_products_sorted_by_price(client):
    response = client.get('/api/products-sorted-by-price?sort_order=desc')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_find_customer_by_email(client):
    response = client.get('/api/find-customer-by-email?email=alice.johnson@example.com')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_search_products_by_name(client):
    response = client.get('/api/search-products-by-name?query=table')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_search_customers_by_name(client):
    response = client.get('/api/search-customers-by-name?query=alice')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_fetch_orders_with_details(client):
    response = client.get('/api/fetch-orders-with-details')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_get_total_sales_per_customer(client):
    response = client.get('/api/total-sales-per-customer')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_update_order_status(client):
    response = client.put('/api/update-order-status', json={
        'order_id': 401,
        'order_status': 'Awaiting'
    })

    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'message' in data
    assert data['message'] == 'Order 401 marked as Awaiting successfully !'



