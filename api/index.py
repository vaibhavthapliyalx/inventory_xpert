# Import the modules.
from datetime import datetime, timedelta
from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
import jwt
from pymongo import ASCENDING, DESCENDING, MongoClient
from bson import ObjectId
from functools import wraps
import bcrypt
from dotenv import load_dotenv
import os

# Load environment variables file.
# Here, for security reasons, we are storing the database credentials in a .env file.
# This file is ignored by Git thus ensuring security of our application.
load_dotenv()

# Create the Flask app.
app = Flask(__name__)
CORS(app)

# Connect to MongoDB
uri = os.getenv('MONGO_URI')
client = MongoClient(uri)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Connecting to the database and its collections.
db = client['ikea_database']
products_collection = db['products']
customers_collection = db['customers']
orders_collection = db['orders']
admins_collection = db['admins']
blacklist = db['blacklist']


# Creating unique index for username and email in admins collection.
# This ensures that no two admins can have the same username or email.
admins_collection.create_index([('username', 1)], unique=True)
admins_collection.create_index([('email', 1)], unique=True)

# JWT Authentication, A decorator to check for a valid token.
# Here, we are using JWT authentication to ensure that only logged in admins can access the endpoints.
def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401
        return func(*args, **kwargs)
    return jwt_required_wrapper

# Checking for database connectivity.
@app.route('/api/db_connectivity', methods=['GET'])
def databaseStats():
    return client.admin.command('ping')

# Checking for server connectivity.
@app.route('/api/server_connectivity', methods=['GET'])
def serverStats():
    return make_response(jsonify({'message': 'Flask API is working!'}), 200)

# This endpoint returns all products.
@app.route('/api/all-products', methods=['GET'])
def select_necessary_fields():
    try:
        selected_data = list (products_collection.find({}))
        return make_response(jsonify(selected_data))
    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching the products.', 'details': str(e)}), 500)

# This endpoint returns all customers.
@app.route('/api/all-customers', methods=['GET'])
def select_all_customers():
    try:
        selected_data = list (customers_collection.find({}))
        return make_response(jsonify(selected_data))
    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching the customers.', 'details': str(e)}), 500)

# This endpoint returns all orders.
@app.route('/api/all-orders', methods=['GET'])
def select_all_orders():
    try:
        selected_data = list(orders_collection.find({}))
        return make_response(jsonify(selected_data))
    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching the orders.', 'details': str(e)}), 500)

# Query Type 1: Select only necessary fields.
# This endpoint searches for a customer by their customer id.
@app.route('/api/get-customer-by-customer-id', methods=['GET'])
def find_customer_by_customer_id():
    customer_id = request.args.get('customer_id', type=int)
    try:
        selected_data = customers_collection.find_one({'_id': customer_id})
        if selected_data is None:
            return make_response(jsonify({'error': 'No customer found.', "See": customer_id}), 404)
        return make_response(jsonify(selected_data),200)
    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching the customer.', 'details': str(e)}), 500)

# Query Type 1: Select only necessary fields.
# This endpoint returns all customers with the queried membership status.
@app.route('/api/find-customers-by-membership-status', methods=['GET'])
def find_customers_by_membership_status():
    try:
        # Use Case: Find customers by their membership status
        target_status = request.args.get('membership_status')
        if not target_status:
            return make_response(jsonify({"error": "Missing membership_status parameter"}), 400)
        matching_data = list(customers_collection.find({'membership_status': target_status}))
        if not matching_data:
            return make_response(jsonify({"error": "No customers found with the provided membership status"}), 404)
        return make_response(jsonify(matching_data), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# Query Type 2: Match values in an array
# This endpoint returns orders by their order ids.
@app.route('/api/find-orders-by-order-ids', methods=['GET'])
def find_orders_by_order_ids():
    order_ids = request.args.getlist('order_ids', type=int)
    selected_data = list(orders_collection.find({'_id': {'$in': order_ids}}))

    # Check if any orders were found, else return 404 error.
    if selected_data is None or len(selected_data) == 0:
        return make_response(jsonify({'error': order_ids}), 404)
    return make_response(jsonify(selected_data), 200)

# Query Type 2: Match values in an array
# This endpoint returns products by their product ids.
@app.route('/api/find-products-by-product-ids', methods=['GET'])
def find_products_by_product_ids():
    product_ids = request.args.getlist('product_ids', type=int)
    products = list(products_collection.find({'_id': {'$in': product_ids}}))

    if products is None or len(products) == 0:
        return make_response(jsonify({'error': 'No products found.'}), 404)
    return make_response(jsonify(products),200)

# Query Type 2: Match values in an array
# This endpoint returns products with the multiple categories queried.
@app.route('/api/find-products-by-multiple-categories', methods=['GET'])
def find_products_by_category():
    try:
        # Use Case: Find products of a specific category
        target_category = request.args.getlist('category', type=str)
        matching_data = list(products_collection.find({'category': {'$in': target_category}}))
        if not matching_data or len(matching_data) == 0:
            return make_response(jsonify({"error": "No products found for the specified category."}), 404)
        return make_response(jsonify(matching_data), 200)
    except Exception as e:
        return make_response(jsonify({"error": e }), 500)

# Query Type 3: Match array elements with multiple criteria
# Query Type 7: Match elements in arrays with criteria
# This endpoint returns products within a price range.
@app.route('/api/find-products-within-price-range', methods=['GET'])
def find_products_within_price_range():
    try:
        min_price = float(request.args.get('min_price'))
        max_price = float(request.args.get('max_price'))
        matching_data = list(products_collection.find({'price': {'$gte': min_price, '$lte': max_price}}))
        return make_response(jsonify(matching_data))
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Query Type 4: Match arrays containing all specified elements
# Query Type 8: Match arrays with all elements specified
# This endpoint returns orders with specified number of product types/categories.
@app.route('/api/orders-with-number-of-products', methods=['GET'])
def get_orders_by_number_of_products():
    try:
        size = int(request.args.get('num_products'))
        orders = orders_collection.find({'products': {'$size': size}})

        # Gets the orders with all details by calling the fetch_orders_details function.
        response = fetch_orders_details()

        # Since the response is a JSON object, we convert it to a list.
        orders_with_details = response.get_json()

        # Filter the orders with the specified number of products.
        orders = [order for order in orders_with_details if len(order['products']) == size]
        return make_response(jsonify(orders))
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# Query Type 5: Iterate over result sets
# This endpoint returns products sorted by price specified.
@app.route('/api/products-sorted-by-price', methods=['GET'])
def products_sorted_by_price():
    try: 
        sort_order = request.args.get('sort_order', 'asc')
        if sort_order == 'desc':
            sort_order = DESCENDING
        else:
            sort_order = ASCENDING

        result = [product for product in products_collection.find().sort('price', sort_order)]
        return make_response(jsonify(result), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Query Type 6: Query embedded documents and arrays
# This endpoint finds the customers with the specified email address.(case sensitive)
@app.route('/api/find-customer-by-email', methods=['GET'])
def find_customer_by_email():
    target_email = request.args.get('email')
    if not target_email:
        return make_response(jsonify({"error": "Missing email parameter"}), 400)
    try:
        matching_data = list(customers_collection.find({'contact.email': target_email}))
        return jsonify(matching_data)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# Query Type 9: Perform text search
# This endpoint searches for products by their name query parameter (case-insensitive).
@app.route('/api/search-products-by-name', methods=['GET'])
def search_products_by_name():
    # Use Case: Search for products by name (case-insensitive)
    search_query = request.args.get('query')
    matching_data = list(products_collection.find({'name': {'$regex': search_query, '$options': 'i'}}).sort('name'))
    return jsonify(matching_data)

# Query Type 9: Perform text search
# This endpoint searches for customers by their name query parameter (case-insensitive).
@app.route('/api/search-customers-by-name', methods=['GET'])
def find_customers_by_name():
    # Use Case: Find customers with a name containing the specified input
    search_query = request.args.get('query')
    matching_data = list(customers_collection.find({'name': {'$regex': search_query, '$options': 'i'}}).sort('name'))
    return jsonify(matching_data)

# Query Type 13: MapReduce
def perform_map_reduce(collection):
    map_operation = {
        "$group": {
            "_id": "$customer_id",
            "total_sales": {"$sum": "$total_price"}
        }
    }
    project_operation = {
        "$project": {
            "_id": "$_id",
            "total_sales": 1
        }
    }
    result = collection.aggregate([map_operation, project_operation])
    return list(result)


'''
Query Type 10: Left outer join, Query Type 12: Deconstruct array into separate documents & Query Type 14: Use aggregation expressions.

This function performs a left outer join operation on the collection provided as a param.
It uses MongoDB's aggregation pipeline to first unwind the products array in each document,
then performs a lookup (join) operation with the customers and products collections.
It calculates the total price for each product in an order, groups the documents by order and product ID,
and finally groups them by order ID.
The result is a list of orders, each with detailed information about the customer, products, and total prices.
'''
def perform_left_outer_join(collection):
    pipeline = [
        {'$unwind': '$products'},
        {'$lookup': {'from': 'customers', 'localField': 'customer_id', 'foreignField': '_id', 'as': 'customer'}},
        {'$unwind': '$customer'},
        {'$lookup': {'from': 'products', 'localField': 'products.product_id', 'foreignField': '_id', 'as': 'product_details'}},
        {'$unwind': '$product_details'},
        {'$addFields': {'total_price': {'$multiply': ['$product_details.price', '$products.quantity']}}},
        {'$group': {
            '_id': {'order_id': '$_id','product_id': '$products.product_id'},
            'customer_id': {'$first': '$customer_id'},
            'order_date': {'$first': '$order_date'},
            'customer_name': {'$first': '$customer.name'},
            'product_name': {'$first': '$product_details.name'},
            'quantity': {'$sum': '$products.quantity'},
            'price': {'$first': '$product_details.price'},
            'total_price': {'$sum': '$total_price'},
            'delivery_status': {'$first': '$delivery_status'},
            'order_status': {'$first': '$order_status'}
        }},
        {'$group': {
            '_id': '$_id.order_id',
            'customer_id': {'$first': '$customer_id'},
            'order_date': {'$first': '$order_date'},
            'customer_name': {'$first': '$customer_name'},
            'products': {'$push': {'product_name': '$product_name', 'quantity': '$quantity', 'price': '$price', 'total_price': '$total_price'}},
            'total_order_price': {'$sum': '$total_price'},
            'total_quantity': {'$sum': '$quantity'},
            'delivery_status': {'$first': '$delivery_status'},
            'order_status': {'$first': '$order_status'}
        }},
    ]

    result = list(collection.aggregate(pipeline))

    if result is None or len(result) == 0:
        print('No orders found.')
    else: 
        return result

# Query Type 11: Data transformations, Query Type 14: Use aggregation expressions, Query Type 12: Deconstruct array into separate documents
# This endpoint returns the total number of orders for each customer.
@app.route('/api/total-orders-per-customer', methods=['GET'])
def total_orders_per_customer():
    pipeline = [
        {"$lookup": {
            "from": "orders",
            "localField": "_id",
            "foreignField": "customer_id",
            "as": "customer_orders"
        }},
        # Query Type 12: Deconstruct array into separate documents.
        {"$unwind": "$customer_orders"},
        {"$group": {
            "_id": "$_id",
            "total_orders": {"$sum": 1}
        }},
        {"$project": {
            "customer_id": "$_id",
            "total_orders": 1,
            "_id": 0
        }}
    ]
    results = list(customers_collection.aggregate(pipeline))

    if results is None or len(results) == 0:
        return make_response(jsonify({'error': 'No customers found'}), 404)

    return make_response(jsonify(results), 200)
'''
Query Type 11: Data transformations
This function performs a data transformation operation on the data provided as a param.
It takes the result of the left outer join operation and a map-reduce operation as input.
It iterates over the orders data, calculates the total quantity for each order,
and transforms the order data into a new format.
The transformed order data includes the total sales for each customer, which is obtained from the result of the map-reduce operation.
The function returns a list of transformed orders.
'''
def perform_data_transformation(data, result_map_reduce):
    transformed_orders = []
    for order in data:
        transformed_order = {
            'customerId': order['customer_id'],
            'customerName': order.pop('customer_name'),
            'orderDate': datetime.strptime(order.pop('order_date'), '%Y-%m-%d').strftime('%d-%m-%Y'),
            'products': [
                {
                    'name': item['product_name'], 
                    'quantity': item['quantity'], 
                    'price': item['price'], 
                    'totalPrice': "{:.2f}".format(item['total_price'])
                } 
                for item in order.pop('products')
            ],
            'totalPrice': "{:.2f}".format(order.pop('total_order_price')),
            'totalQuantity': order.pop('total_quantity'),
            'totalSales': next(("{:.2f}".format(item['total_sales']) for item in result_map_reduce if item['_id'] == order['customer_id']), 0),
            'deliveryStatus': order.pop('delivery_status'),
            'orderStatus': order.pop('order_status'),
            'id': order['_id'],
        }
        transformed_orders.append(transformed_order)
    return transformed_orders

'''
Query Type 5, 10, 11, 13,14.
This function fetches order details by performing a left outer join operation and a map-reduce operation.
It calls the `perform_left_outer_join` function to perform the left outer join operation,
which returns a list of orders with detailed information about the customer, products, and total prices.
It calls the `perform_map_reduce` function to perform the map-reduce operation,
which returns a list of total sales for each customer.
It then iterates over the result of the left outer join operation,
calculates the total quantity for each order, and transforms the order data into a new format.
The transformed order data includes the total sales for each customer, which is obtained from the result of the map-reduce operation.
The function returns a JSON response containing the transformed order data.
'''
@app.route('/api/fetch-orders-with-details', methods=['GET'])
def fetch_orders_details():
    try:
        # Copy the orders collection to a new variable.
        # This is done to avoid modifying the original collection.
        orders = db['orders']
        result = perform_left_outer_join(orders)

        # Query Type 5: Iterate over result sets.
        for order in result:
            order['total_quantity'] = sum(item['quantity'] for item in order['products']) if 'products' in order else 0

        result_map_reduce = perform_map_reduce(orders)

        orders_with_details = perform_data_transformation(result, result_map_reduce)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

    return make_response(jsonify(orders_with_details), 200)


# Query Type 14: Use aggregation expressions
# This endpoint returns the total sales for each customer.
# It performs an aggregation operation using MongoDB's aggregation pipeline.
@app.route('/api/total-sales-per-customer', methods=['GET'])
def total_sales_per_customer():
    try:
        pipeline = [
            {'$unwind': '$products'},
            {'$lookup': {
                'from': 'products',
                'localField': 'products.product_id',
                'foreignField': '_id',
                'as': 'product_details'
                }
            },
            {'$unwind': '$product_details'},
            {
                '$group': {
                    '_id': '$customer_id',
                    'total_sales': {
                        '$sum': {
                            '$multiply': ['$products.quantity', '$product_details.price']
                        }
                    }
                }
            }
        ]
        result = list(orders_collection.aggregate(pipeline))
        if not result:
            return make_response(jsonify({'error': 'No orders found'}), 404)
        formatted_result = [{'customer_id': item['_id'], 'total_sale': round(item['total_sales'], 2)} for item in result]
        return make_response(jsonify(formatted_result))

    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)


# Query Type 15: Conditional Update
# This endpoint updates the order status of an order.
# It takes the order ID and the new order status as input.
@app.route('/api/update-order-status', methods=['PUT'])
def update_order_status():
    # Use Case: Update the status of an order
    order_data = request.get_json()
    order_id = order_data['order_id']
    order_status = order_data['order_status']
    result = orders_collection.update_one({'_id': order_id}, {'$set': {'order_status': order_status}})
    
    if result.matched_count > 0:
        return make_response(jsonify({'message': f'Order {order_id} marked as {order_status} successfully !'}), 200)
    else:
        return make_response(jsonify({'message': 'Failed to update the status for this order. Please try again!'}), 404)


############################ Authentication Endpoints ############################

# This endpoint signs up a new admin.
# It takes the admin's details as input and creates a new admin in the 'admins' collection.
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    fullname = data.get('fullname')
    password = data.get('password')
    email = data.get('email')
    profile_photo = data.get('profile_photo')

    # Checking if the username is already taken
    if admins_collection.find_one({'email': email}):
        return jsonify({'message': 'An account is already registered with this email. Please log in instead.'}), 400

    if not password:
        return jsonify({'message': 'Password is required.'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create a new admin in the 'admins' collection
    new_admin = {
        'fullname': fullname,
        'username': username,
        'password': hashed_password.decode('utf-8'),
        'email': email,
        'profile_photo': profile_photo
    }
    result = admins_collection.insert_one(new_admin)
    return jsonify({'message': 'Admin created successfully!', 'admin_id': str(result.inserted_id)}, 201)


# This endpoint logs in an admin.
# It takes the admin's username/email and password as input and verifies the credentials.
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    admin = admins_collection.find_one({'username': username})
    if admin is None:
        admin = admins_collection.find_one({'email': username})

    if admin is not None:
        if bcrypt.checkpw(password.encode('utf-8'), admin['password'].encode('utf-8')):

            token = jwt.encode({
                'id': str(admin['_id']),  # Converting ObjectId to string
                'user': admin['username'],
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'])
            return make_response(jsonify({'token': token}), 200)
        else:
            return make_response(jsonify({'message': 'Password is incorrect'}), 401)
    else:
        return make_response(jsonify({'message': 'Username or email not found. Please check your credentials or sign up to create a new account.'}), 401)


# This endpoint logs out an admin.
# It adds the token to the blacklist collection to invalidate it.
@app.route('/api/logout', methods=['GET'])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist.insert_one({"token": token})
    return jsonify({'message': 'Logout successful'})

# This endpoint returns the logged in admin's data.
# It retrieves the admin ID from the token and fetches the admin data from the 'admins' collection.
@app.route('/api/logged-in-admin', methods=['GET'])
@jwt_required
def get_logged_in_admin():
    try:
        token = request.headers.get('x-access-token')  # Get the token from the headers

        # Decode the token and get the admin_id
        data = jwt.decode(token, app.config ['SECRET_KEY'], algorithms=["HS256"])
        admin_id = data['id']

        # Fetch the admin data from the 'admins' collection
        admin = admins_collection.find_one({'_id':  ObjectId(admin_id)})

        if admin:
            # If the admin exists, return their data
            return jsonify({
                'id': str(admin['_id']),  # Converting ObjectId to string
                'fullname': admin['fullname'],
                'username': admin['username'],
                'password': admin['password'],
                'email': admin['email'],
                'profile_photo': admin['profile_photo'],
            }), 200
        else:
            # If the admin does not exist, return an error
            return jsonify({'message': 'Admin not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
