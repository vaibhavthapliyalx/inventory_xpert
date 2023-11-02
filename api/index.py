from flask import Flask, request, jsonify
from pymongo.server_api import ServerApi
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
uri = "mongodb+srv://vaibhavthapliyal31:vaibhavThapliyal_Test@cluster0.mq9esm5.mongodb.net/?retryWrites=true&w=majority"
CORS(app)
# Create a new client and connect to the server
client = MongoClient(uri)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client['ikea_database']  # Replace 'inventory_db' with your database name
products_collection = db['products']
customers_collection = db['customers']
orders_collection = db['orders']
print('Connected to the database successfully!')
print('Number of products:', products_collection.count_documents({}))
print('Number of customers:', customers_collection.count_documents({}))
print('Number of orders:', orders_collection.count_documents({}))

@app.route('/api/db_connectivity', methods=['GET'])
def databaseStats():
    return client.admin.command('ping')
@app.route('/api/test', methods=['GET'])
def test_endpoint():
    print('Flask API is working!')
    return jsonify({'message': 'Flask API is working!'})

# Query Type 0: Get all documents
@app.route('/api/get-all-documents', methods=['GET'])
def get_all_documents():
    all_data = list(products_collection.find())
    print(all_data)
    print(products_collection.find())
    return jsonify(all_data)


# Query Type 1: Select only necessary fields
@app.route('/api/select-necessary-fields', methods=['GET'])
def select_necessary_fields():
    selected_data = [product['name'] for product in products_collection.find({}, {'name': 1, '_id': 0})]
    print(selected_data)
    return jsonify(selected_data)

# Query Type 2: Match values in an array
@app.route('/api/match-values-in-array', methods=['GET'])
def match_values_in_array():
    target_category = request.args.get('category')
    matching_data = list(products_collection.find({'category': target_category}))
    return jsonify(matching_data)

# Query Type 3: Match array elements with multiple criteria
@app.route('/api/match-array-elements-multiple-criteria', methods=['GET'])
def match_array_elements_with_criteria():
    min_price = float(request.args.get('min_price'))
    max_price = float(request.args.get('max_price'))
    matching_data = list(products_collection.find({'price': {'$gte': min_price, '$lte': max_price}}))
    return jsonify(matching_data)

# Query Type 4: Match arrays containing all specified elements
@app.route('/api/match-arrays-containing-elements', methods=['GET'])
def match_arrays_containing_elements():
    target_categories = request.args.getlist('categories')
    matching_data = list(products_collection.find({'category': {'$all': target_categories}}))
    return jsonify(matching_data)

# Query Type 5: Iterate over result sets
@app.route('/api/iterate-over-result-sets', methods=['GET'])
def iterate_over_result_sets():
    result = []
    for product in products_collection.find():
        # Perform custom actions here
        result.append({'name': product['name'], 'custom_field': product['price'] * 2})
    return jsonify(result)

# Query Type 6: Query embedded documents and arrays
@app.route('/api/query-embedded-documents-arrays', methods=['GET'])
def query_embedded_documents_arrays():
    target_email = request.args.get('email')
    matching_data = list(customers_collection.find({'contact.email': target_email}))
    return jsonify(matching_data)

# Query Type 7: Match elements in arrays with criteria
@app.route('/api/match-elements-in-arrays-criteria', methods=['GET'])
def match_elements_in_arrays_criteria():
    target_status = request.args.get('membership_status')
    matching_data = list(customers_collection.find({'membership_status': target_status}))
    return jsonify(matching_data)

# Query Type 8: Match arrays with all elements specified
@app.route('/api/match-arrays-with-all-elements', methods=['GET'])
def match_arrays_with_all_elements():
    target_orders = request.args.getlist('previous_orders')
    matching_data = list(customers_collection.find({'previous_orders': {'$all': target_orders}}))
    return jsonify(matching_data)

# Query Type 9: Perform text search
@app.route('/api/perform-text-search', methods=['GET'])
def perform_text_search():
    search_query = request.args.get('query')
    matching_data = list(products_collection.find({'name': {'$regex': search_query, '$options': 'i'}}))
    return jsonify(matching_data)

# Query Type 10: Perform a left outer join
@app.route('/api/perform-left-outer-join', methods=['GET'])
def perform_left_outer_join():
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
    # Your implementation for data transformations here
    # Example: Calculate the total price for each order
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
    # Your implementation to deconstruct arrays into separate documents
    # Example: Split orders with multiple products into separate orders
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
    # Your implementation for MapReduce here
    # Example: Calculate the average price per category
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
    # Your implementation for aggregation expressions here
    # Example: Calculate the total sales per customer
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
    # Your implementation for conditional updates here
    # Example: Mark orders as 'Completed' where delivery_status is 'Delivered'
    filter_criteria = {'delivery_status': 'Delivered'}
    update_criteria = {'$set': {'delivery_status': 'Completed'}}
    result = orders_collection.update_many(filter_criteria, update_criteria)
    return jsonify({'matched_count': result.matched_count, 'modified_count': result.modified_count})

if __name__ == '__main__':
    app.run(debug=True)
