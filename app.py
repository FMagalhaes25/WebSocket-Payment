import os
from flask import Flask, request, jsonify
from repository.database import db
from models.payment import Payment
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

db.init_app(app)

@app.route("/payments/pix", methods=['POST'])
def create_payment_pix():
    data = request.json
    
    return jsonify({"message": "The payment has been created!"})


@app.route("/payments/pix/confirmation", methods=['POST'])
def pix_confirmation():
    data = request.json
    
    return jsonify({"message": "The payment has been confirmed!"})


@app.route("/payments/pix/<int:payment_id>", methods=['GET'])
def payment_pix_page(payment_id):
    return 'pagamento pix'



if __name__ == '__main__':
    app.run(debug=True)