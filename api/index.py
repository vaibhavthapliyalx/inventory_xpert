from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from werkzeug.utils import secure_filename
import os
from flask import send_from_directory
from flask_login import UserMixin, current_user, login_required, login_user, logout_user
from flask_login import LoginManager
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
uri = "mongodb+srv://vaibhavthapliyal31:vaibhavThapliyal_Test@cluster0.mq9esm5.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri)
db = client['ikea_database']
products_collection = db['products']
customers_collection = db['customers']
orders_collection = db['orders']
admins_collection = db['admins']

# Path for uploading and serving images
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Set max upload size to 16MB

# Configure Flask-Login
app.secret_key = 'your_secret_key'
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

@login_manager.user_loader
def load_user(user_id):
    # Retrieve user from MongoDB and create a User object
    user = admins_collection.find_one({'_id': ObjectId(user_id)})
    if user:
        return User(user['_id'])
    return None

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif'}

@app.route('/api/db_connectivity', methods=['GET'])
def databaseStats():
    return client.admin.command('ping')

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({'message': 'Flask API is working!'})

# Query Type 1: Select only necessary fields
@app.route('/api/select-necessary-fields', methods=['GET'])
def select_necessary_fields():
    # Use Case: Retrieve names of all products
    selected_data = [product['name'] for product in products_collection.find({}, {'name': 1, '_id': 0})]
    return jsonify(selected_data)

# Query Type 2: Match values in an array
@app.route('/api/match-values-in-array', methods=['GET'])
def match_values_in_array():
    # Use Case: Find products of a specific category
    target_category = request.args.get('category')
    matching_data = list(products_collection.find({'category': target_category}))
    return jsonify(matching_data)

# Query Type 3: Match array elements with multiple criteria
@app.route('/api/match-array-elements-multiple-criteria', methods=['GET'])
def match_array_elements_with_criteria():
    # Use Case: Find products within a price range
    min_price = float(request.args.get('min_price'))
    max_price = float(request.args.get('max_price'))
    matching_data = list(products_collection.find({'price': {'$gte': min_price, '$lte': max_price}}))
    return jsonify(matching_data)

# Query Type 4: Match arrays containing all specified elements
@app.route('/api/match-arrays-containing-elements', methods=['GET'])
def match_arrays_containing_elements():
    # Use Case: Find products that belong to all specified categories
    target_categories = request.args.getlist('categories')
    matching_data = list(products_collection.find({'category': {'$all': target_categories}}))
    return jsonify(matching_data)

# Query Type 5: Iterate over result sets
@app.route('/api/iterate-over-result-sets', methods=['GET'])
def iterate_over_result_sets():
    # Use Case: Perform custom action for each product
    result = []
    for product in products_collection.find():
        # Perform custom actions here
        result.append({'name': product['name'], 'custom_field': product['price'] * 2})
    return jsonify(result)

# Query Type 6: Query embedded documents and arrays
@app.route('/api/query-embedded-documents-arrays', methods=['GET'])
def query_embedded_documents_arrays():
    # Use Case: Find customers by their email address
    target_email = request.args.get('email')
    matching_data = list(customers_collection.find({'contact.email': target_email}))
    return jsonify(matching_data)

# Query Type 7: Match elements in arrays with criteria
@app.route('/api/match-elements-in-arrays-criteria', methods=['GET'])
def match_elements_in_arrays_criteria():
    # Use Case: Find customers by their membership status
    target_status = request.args.get('membership_status')
    matching_data = list(customers_collection.find({'membership_status': target_status}))
    return jsonify(matching_data)

# Query Type 8: Match arrays with all elements specified
@app.route('/api/match-arrays-with-all-elements', methods=['GET'])
def match_arrays_with_all_elements():
    # Use Case: Find customers who have placed specific orders
    target_orders = request.args.getlist('previous_orders')
    matching_data = list(customers_collection.find({'previous_orders': {'$all': target_orders}}))
    return jsonify(matching_data)

# Query Type 9: Perform text search
@app.route('/api/perform-text-search', methods=['GET'])
def perform_text_search():
    # Use Case: Search for products by name (case-insensitive)
    search_query = request.args.get('query')
    matching_data = list(products_collection.find({'name': {'$regex': search_query, '$options': 'i'}}))
    return jsonify(matching_data)

# Query Type 10: Perform a left outer join
@app.route('/api/perform-left-outer-join', methods=['GET'])
def perform_left_outer_join():
    # Use Case: Retrieve orders with customer details
    result = []
    orders = orders_collection.find()
    for order in orders:
        customer = customers_collection.find_one({'_id': order['customer_id']})
        if customer:
            result.append({
                'order_id': order['_id'],
                'customer_name': customer['name'],
                'order_date': order['order_date']
            })
    return jsonify(result)

# Query Type 11: Data transformations
@app.route('/data-transformations', methods=['GET'])
def data_transformations():
    # Use Case: Calculate the total price for each order
    result = []
    for order in orders_collection.find():
        total_price = sum(product['price'] for product in order['products'])
        result.append({
            'order_id': order['_id'],
            'total_price': total_price
        })
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
    return jsonify(result)

# Query Type 13: MapReduce
@app.route('/api/map-reduce', methods=['GET'])
def map_reduce():
    # Use Case: Calculate the average price per category
    map_function = '''
        function () {
            emit(this.category, this.price);
        }
    '''
    reduce_function = '''
        function (key, values) {
            return Array.avg(values);
        }
    '''
    result = products_collection.map_reduce(map_function, reduce_function, 'average_prices_by_category')
    return jsonify([{'_id': item.key, 'average_price': item.value} for item in result.find()])

# Query Type 14: Use aggregation expressions
@app.route('/api/aggregation', methods=['GET'])
def aggregation():
    # Use Case: Calculate the total sales per customer
    pipeline = [
        {
            '$unwind': '$products'
        },
        {
            '$group': {
                '_id': '$customer_id',
                'total_sales': {'$sum': '$products.price'}
            }
        }
    ]
    result = orders_collection.aggregate(pipeline)
    return jsonify(list(result))

# Query Type 15: Conditional Update
@app.route('/api/conditional-update', methods=['POST'])
def conditional_update():
    # Use Case: Mark orders as 'Completed' where delivery_status is 'Delivered'
    filter_criteria = {'delivery_status': 'Delivered'}
    update_criteria = {'$set': {'delivery_status': 'Completed'}}
    result = orders_collection.update_many(filter_criteria, update_criteria)
    return jsonify({'matched_count': result.matched_count, 'modified_count': result.modified_count})

# Create (POST) operation to add a new product
@app.route('/api/products', methods=['POST'])
def add_product():
    # Use Case: Add a new product
    if 'name' not in request.form or 'price' not in request.form or 'category' not in request.form:
        return jsonify({'error': 'Name, price, and category are required.'}), 400

    name = request.form['name']
    price = float(request.form['price'])
    category = request.form['category']
    
    # Handle image file upload (if provided)
    if 'image' in request.files:
        image_file = request.files['image']
        if image_file and allowed_file(image_file.filename):
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image_file.save(image_path)
        else:
            return jsonify({'error': 'Invalid image file.'}), 400
    else:
        image_path = None

    product = {
        'name': name,
        'price': price,
        'category': category,
        'image_path': image_path
    }

    result = products_collection.insert_one(product)
    return jsonify({'message': 'Product added successfully!', 'product_id': str(result.inserted_id)})

# Retrieve (GET) operation to get product details
@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    # Use Case: Get product details by ID
    product = products_collection.find_one({'_id': ObjectId(product_id)})
    if product is None:
        return jsonify({'error': 'Product not found.'}), 404
    return jsonify(product)

# Update (PUT) operation to update product details
@app.route('/api/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    # Use Case: Update product details
    if 'name' not in request.form or 'price' not in request.form or 'category' not in request.form:
        return jsonify({'error': 'Name, price, and category are required.'}), 400

    name = request.form['name']
    price = float(request.form['price'])
    category = request.form['category']

    # Handle image file upload (if provided)
    if 'image' in request.files:
        image_file = request.files['image']
        if image_file and allowed_file(image_file.filename):
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image_file.save(image_path)
        else:
            return jsonify({'error': 'Invalid image file.'}), 400
    else:
        image_path = None

    result = products_collection.update_one(
        {'_id': ObjectId(product_id)},
        {
            '$set': {
                'name': name,
                'price': price,
                'category': category,
                'image_path': image_path
            }
        }
    )
    
    if result.modified_count == 0:
        return jsonify({'error': 'Product not found or no changes were made.'}), 404
    return jsonify({'message': 'Product updated successfully!'})

# Delete (DELETE) operation to remove a product
@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    # Use Case: Delete a product
    result = products_collection.delete_one({'_id': ObjectId(product_id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Product not found.'}), 404
    return jsonify({'message': 'Product deleted successfully!'})

# Serve images
@app.route('/api/uploads/<filename>', methods=['GET'])
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# User signup (POST) operation
@app.route('/api/signup', methods=['POST'])
def signup():
    username = request.form['username']
    password = request.form['password']
    access_level = request.form.get('access_level', 'basic')  # Default to 'basic' access

    # Check if the username is already taken
    if admins_collection.find_one({'username': username}):
        return jsonify({'error': 'Username already taken.'}), 400

    # Hash the password before storing it
    hashed_password = generate_password_hash(password, method='sha256')

    # Create a new user in the 'admins' collection
    new_user = {
        'username': username,
        'password': hashed_password,
        'access_level': access_level
    }

    result = admins_collection.insert_one(new_user)

    return jsonify({'message': 'User created successfully!', 'user_id': str(result.inserted_id)})

# User login (POST) operation
@app.route('/api/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    user = admins_collection.find_one({'username': username})

    if user and check_password_hash(user['password'], password):
        # Log the user in and create a session
        login_user(User(str(user['_id'])))
        return jsonify({'message': 'Logged in successfully!'})
    else:
        return jsonify({'error': 'Invalid username or password.'}), 401

# User logout operation
@app.route('/api/logout', methods=['GET'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully!'})

# Restrict access to admin-level users for specific operations
@app.route('/api/admin/operation', methods=['GET'])
@login_required
def admin_operation():
    if current_user.access_level == 'admin':
        # Perform admin-level operation
        return jsonify({'message': 'Admin-level operation successful.'})
    else:
        return jsonify({'error': 'Access denied for this operation.'}), 403

if __name__ == '__main__':
    app.run(debug=True)
