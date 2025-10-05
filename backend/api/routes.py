from flask import Blueprint, jsonify
import requests

api = Blueprint('api', __name__)

DB_SERVICE_URL = "http://localhost:5001"

@api.route('/api/products')
def products():
    resp = requests.get(f"{DB_SERVICE_URL}/api/products")
    return jsonify(resp.json())