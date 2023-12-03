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
    return jsonify({'message': 'Flask API is working!'})

# Query Type 1: Select only necessary fields.
# This endpoint returns all products.
@app.route('/api/all-products', methods=['GET'])
def select_necessary_fields():
    try:
        selected_data = list (products_collection.find({}))
        return make_response(jsonify(selected_data))
    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching the products.', 'details': str(e)}), 500)

# Query Type 1: Select only necessary fields.
# This endpoint returns all customers.
@app.route('/api/all-customers', methods=['GET'])
def select_all_customers():
    try:
        selected_data = list (customers_collection.find({}))
        return make_response(jsonify(selected_data))
    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching the customers.', 'details': str(e)}), 500)

# Query Type 1: Select only necessary fields.
# This endpoint returns all orders.
@app.route('/api/all-orders', methods=['GET'])
def select_all_orders():
    try:
        selected_data = list (orders_collection.find({}))
        return make_response(jsonify(selected_data))
    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching the orders.', 'details': str(e)}), 500)

#Implented in the frontend
@app.route('/api/find-orders-by-order-ids', methods=['GET'])
def find_orders_by_order_ids():
    # Use Case: Retrieve names of all users
    order_ids = request.args.getlist('order_ids', type=int)
    selected_data = list(orders_collection.find({'_id': {'$in': order_ids}}))

    if selected_data is None or len(selected_data) == 0:
        return make_response(jsonify({'error': order_ids}), 404)
    return make_response(jsonify(selected_data), 200)

#Implented in the frontend
@app.route('/api/get-customer-by-customer-id', methods=['GET'])
def find_customer_by_customer_id():
    customer_id = request.args.get('customer_id', type=int)
    # Use Case: Retrieve a user by their ID
    try:
        selected_data = customers_collection.find_one({'_id': customer_id})
        if selected_data is None:
            return make_response(jsonify({'error': 'No customer found.', "See": customer_id}), 404)
        return make_response(jsonify(selected_data),200)
    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching the customer.', 'details': str(e)}), 500)

#Implented in the frontend
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

#Implented in the frontend
@app.route('/api/find-products-by-product-ids', methods=['GET'])
def find_products_by_product_ids():
    product_ids = request.args.getlist('product_ids', type=int)
    
    # Assuming you have a 'products' collection in your MongoDB
    products = list(products_collection.find({'_id': {'$in': product_ids}}))
    if products is None or len(products) == 0:
        return make_response(jsonify({'error': 'No products found.'}), 404)
    return make_response(jsonify(products),200)

# Query Type 2: Match values in an array
#Implented in the frontend
@app.route('/api/find-products-by-multiple-categories', methods=['GET'])
def find_products_by_category():
    try:
        # Use Case: Find products of a specific category
        target_category = request.args.getlist('category', type=str)
        matching_data = list(products_collection.find({'category': {'$in': target_category}}))
        if not matching_data or len(matching_data) == 0:
            return make_response(jsonify({"error": "No products found for the specified category."}), 404)
        return jsonify(matching_data), 200
    except Exception as e:
        return make_response(jsonify({"error": e }), 500)

# Query Type 3: Match array elements with multiple criteria
# Query Type 7: Match elements in arrays with criteria
@app.route('/api/find-products-within-price-range', methods=['GET'])
def find_products_within_price_range():
    # Use Case: Find products within a price range
    min_price = float(request.args.get('min_price'))
    max_price = float(request.args.get('max_price'))
    matching_data = list(products_collection.find({'price': {'$gte': min_price, '$lte': max_price}}))
    return jsonify(matching_data)

#Query Type 4: Match arrays containing all specified elements
# Query Type 8: Match arrays with all elements specified

# @app.route('/api/', methods=['GET']) ####### Needs to be fixed#################
# def match_arrays_containing_elements():
#     # Use Case: Find products that belong to all specified categories
#     target_categories = request.args.getlist('categories')
#     matching_data = list(products_collection.find({'category': {'$all': target_categories}}))
#     return make_response(jsonify(matching_data), 200)

# @app.route('/api/find-customers-by-prev-orders', methods=['GET'])
# def find_customers_by_prev_orders():
#     # Use Case: Find customers who have placed specific orders
#     target_orders = request.args.getlist('orders')
#     matching_data = list(customers_collection.find({'previous_orders': {'$all': target_orders}}))
#     return jsonify(matching_data)


# Query Type 5: Iterate over result sets
#Implented in the frontend
@app.route('/api/products-sorted-by-price', methods=['GET'])
def products_sorted_by_price():
    # Use Case: Perform custom action for each product, sorted by price in order specified by query parameter
    sort_order = request.args.get('sort_order', 'asc')
    if sort_order == 'desc':
        sort_order = DESCENDING
    else:
        sort_order = ASCENDING

    result = [product for product in products_collection.find().sort('price', sort_order)]
    return make_response(jsonify(result), 200)

# Query Type 6: Query embedded documents and arrays
#Implented in the frontend
@app.route('/api/find-customer-by-email', methods=['GET'])
def find_customer_by_email():
    # Use Case: Find customers by their email address
    target_email = request.args.get('email')
    if not target_email:
        return make_response(jsonify({"error": "Missing email parameter"}), 400)
    try:
        matching_data = list(customers_collection.find({'contact.email': target_email}))
        return jsonify(matching_data)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


# Query Type 9: Perform text search
# Implented in the frontend
@app.route('/api/search-products-by-name', methods=['GET'])
def search_products_by_name():
    # Use Case: Search for products by name (case-insensitive)
    search_query = request.args.get('query')
    matching_data = list(products_collection.find({'name': {'$regex': search_query, '$options': 'i'}}).sort('name'))
    return jsonify(matching_data)

# Query Type 9: Perform text search
# Implented in the frontend
@app.route('/api/search-customers-by-name', methods=['GET'])
def find_customers_by_name():
    # Use Case: Find customers with a name containing the specified input
    search_query = request.args.get('query')
    matching_data = list(customers_collection.find({'name': {'$regex': search_query, '$options': 'i'}}).sort('name'))
    return jsonify(matching_data)

# Query Type 10: Left outer join. Retrieve orders with customer details
# @app.route('/api/get-orders-with-customer-details', methods=['GET'])
# def retrieve_orders_with_customer_details():
#     product_ids = [int(id) for id in request.args.getlist('product_ids')]  # Get list of product IDs from query parameters
#     lookup_doc = {
#         'from': 'customers',
#         'localField': 'customer_id',
#         'foreignField': '_id',
#         'as': 'customer'
#     }
#     match_doc = {
#         '$match': {'products.product_id': {'$in': product_ids}}
#     }
#     result = list(orders_collection.aggregate([match_doc, {'$lookup': lookup_doc}, {'$unwind': '$customer'}]))

#     if result is None or len(result) == 0:
#         return make_response(jsonify({'error': 'No orders found.'}), 404)
#     return make_response(jsonify(result), 200)

# Ask Patrick about this (Data Transformations)
# Query Type 11: Data transformations
@app.route('/retrieve-orders-by-customer-id', methods=['GET'])
def retrieve_orders_by_customer_id():
    # Use Case: Retrieve all orders with all order details for a specific customer
    customer_id = request.args.get('customer_id')
    match_stage = {'$match': {'customer_id': customer_id}}
    transformation = {
        '_id': 0,
        'order_id': '$_id',
        'customer_id': 1,
        'products': 1
    }
    result = list(orders_collection.aggregate([match_stage, {'$project': transformation}]))
    return jsonify(result)
# Query Type 12: Deconstruct array into separate documents
@app.route('/api/deconstruct-array', methods=['GET'])
def deconstruct_array():
    # Use Case: Split orders with multiple products into separate orders
    result = []
    for order in orders_collection.find():
        for product in order['products']:
            new_order = {
                '_id': product['product_id'],
                'customer_id': order['customer_id'],
                'quantity': product['quantity']
            }
            result.append(new_order)
    return make_response(jsonify(result))

# Query Type 13: MapReduce
def perform_map_reduce():
    map_operation = {
        "$group": {
            "_id": "$customer_id",
            "total_sales": {"$sum": "$total_price"}
        }
    }
    result = orders_collection.aggregate([map_operation])
    return list(result)


# Perform Left Outer Join
# Query Type 10
def perform_left_outer_join():
    pipeline = [
        {'$unwind': '$products'},
        {'$lookup': {'from': 'customers', 'localField': 'customer_id', 'foreignField': '_id', 'as': 'customer'}},
        {'$unwind': '$customer'},
        {'$lookup': {'from': 'products', 'localField': 'products.product_id', 'foreignField': '_id', 'as': 'product_details'}},
        {'$unwind': '$product_details'},
        {'$addFields': {'total_price': {'$multiply': ['$product_details.price', '$products.quantity']}}},
        {'$group': {
            '_id': {
                'order_id': '$_id',
                'product_id': '$products.product_id'
            },
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

    result = list(orders_collection.aggregate(pipeline))

    if result is None or len(result) == 0:
        print('No orders found.')
    else: 
        return result
    

@app.route('/api/fetch-orders-with-details', methods=['GET'])
def fetch_orders_details():
    result = perform_left_outer_join()

    # Iterating over the result provided by the left outer join
    # Query 
    # Refactor
    for order in result:
        order['total_quantity'] = sum(item['quantity'] for item in order['products']) if 'products' in order else 0

    result_map_reduce = perform_map_reduce()

    orders_with_details = []
    for order in result:
        transformed_order = {
            'customerId': order['customer_id'],
            'customerName': order.pop('customer_name'),
            'orderDate': datetime.strptime(order.pop('order_date'), '%Y-%m-%d').strftime('%d-%m-%Y'),
            'products': [
                {
                    'name': item['product_name'], 
                    'quantity': item['quantity'], 
                    'price': item['price'], 
                    'totalPrice': item['total_price']
                } 
                for item in order.pop('products')
            ],
            'totalPrice': order.pop('total_order_price'),
            'totalQuantity': order.pop('total_quantity'),
            'totalSales': next((item['total_sales'] for item in result_map_reduce if item['_id'] == order['customer_id']), 0),
            'deliveryStatus': order.pop('delivery_status'),
            'orderStatus': order.pop('order_status'),
            'id': order['_id'],
        }
        orders_with_details.append(transformed_order)

    return make_response(jsonify(orders_with_details), 200)

#Done
# Query Type 14: Use aggregation expressions
@app.route('/api/total-sales-per-customer', methods=['GET'])
def total_sales_per_customer():
    try:
        pipeline = [
            {
                '$unwind': '$products'
            },
            {
                '$lookup': {
                    'from': 'products',
                    'localField': 'products.product_id',
                    'foreignField': '_id',
                    'as': 'product_details'
                }
            },
            {
                '$unwind': '$product_details'
            },
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

        # Format the result to match the required output format
        formatted_result = [{'customer_id': item['_id'], 'total_sale': round(item['total_sales'], 2)} for item in result]
        return make_response(jsonify(formatted_result))

    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Query Type 15: Conditional Update
#Implented in the frontend
@app.route('/api/update-order-status', methods=['POST'])
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



 #User signup (POST) operation

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    fullname = data.get('fullname')
    password = data.get('password')
    email = data.get('email')
    profile_photo = data.get('profile_photo')
    print("username: ", username)
    print("password: ", password)

    # Check if the username is already taken
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


# User login (POST) operation
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
                'id': str(admin['_id']),  # Convert ObjectId to string
                'user': admin['username'],
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'])
            return make_response(jsonify({'token': token}), 200)
        else:
            return make_response(jsonify({'message': 'Password is incorrect'}), 401)
    else:
        return make_response(jsonify({'message': 'Username or email not found. Please check your credentials or sign up to create a new account.'}), 401)
    

# User logout operation
@app.route('/api/logout', methods=['GET'])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist.insert_one({"token": token})
    return jsonify({'message': 'Logout successful'})

@app.route('/api/validate-token', methods=['GET'])
@jwt_required
def validate_token():
    token = request.headers['x-access-token']
    if blacklist.find_one({"token": token}):
        return make_response(jsonify({'message': 'Invalid token'}), 401)
    else:
        return make_response(jsonify({'message': 'Valid token'}), 200)

@app.route('/api/logged-in-admin', methods=['GET'])
@jwt_required
def get_logged_in_admin():
    try:
        token = request.headers.get('x-access-token')  #    Get the token from the headers

        # Decode the token and get the admin_id
        data = jwt.decode(token, app.config ['SECRET_KEY'], algorithms=["HS256"])
        admin_id = data['id']

        # Fetch the admin data from your database
        admin = admins_collection.find_one({'_id':  ObjectId(admin_id)})

        if admin:
            # If the admin exists, return their data
            return jsonify({
                'id': str(admin['_id']),  # Convert ObjectId to string
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