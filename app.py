import os
from flask import Flask, request, jsonify
from repository.database import db
from models.payment import Payment
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

db.init_app(app)

@app.route("/payments/pix", methods=['POST'])
def create_payment_pix():
    data = request.get_json()
    
    value = data.get("value") 
    
    if 'value' not in data:
        return jsonify({"message": "Invalid value"}), 400
    
    expiration_date = datetime.now() + timedelta(minutes=30) #Data atual + 30 minutos (tempo até o pix expirar)
    
    new_payment = Payment(value=value, expiration_date=expiration_date)
    
    db.session.add(new_payment)
    db.session.commit()
    
    return jsonify({"message": "The payment has been created!", 
                    "payment": new_payment.to_dict()})


@app.route("/payments/pix/confirmation", methods=['POST'])
def pix_confirmation():
    data = request.json
    
    return jsonify({"message": "The payment has been confirmed!"})


@app.route("/payments/pix/<int:payment_id>", methods=['GET'])
def payment_pix_page(payment_id):
    return 'pagamento pix'



if __name__ == '__main__':
    app.run(debug=True)