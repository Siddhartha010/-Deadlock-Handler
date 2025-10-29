from flask import Flask, request, jsonify
from flask_cors import CORS
from api.deadlock_api import deadlock_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(deadlock_bp, url_prefix='/api')

@app.route('/')
def home():
    return jsonify({"message": "Deadlock Handling System API"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)