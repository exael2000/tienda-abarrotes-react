from flask import Flask
from flask_cors import CORS
from api.routes import api

app = Flask(__name__)
CORS(app)

# Configure proper headers
@app.after_request
def after_request(response):
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

app.register_blueprint(api)

if __name__ == '__main__':
    app.run(port=5000, debug=True)