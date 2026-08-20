import os
from flask import Flask, request, jsonify, send_file, render_template
from flask_socketio import SocketIO
from repository.database import db
from models.payment import Payment
from datetime import datetime, timedelta
from dotenv import load_dotenv
from payments.pix import Pix

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

db.init_app(app)
socketio = SocketIO(app)

@app.route("/payments/pix", methods=['POST'])
def create_payment_pix():
    data = request.get_json()
    
    value = data.get("value") 
    
    if 'value' not in data:
        return jsonify({"message": "Invalid value"}), 400
    
    expiration_date = datetime.now() + timedelta(minutes=30) #Data atual + 30 minutos (tempo até o pix expirar)
    
    new_payment = Payment(value=value, expiration_date=expiration_date)
    
    pix_obj = Pix() #Criação do objeto pix, sem parametros para o construtor
    data_payment_pix = pix_obj.create_payment()
    
    new_payment.bank_payment_id = data_payment_pix['bank_payment_id']
    new_payment.qr_code = data_payment_pix['qr_code_path']
    
    db.session.add(new_payment)
    db.session.commit()
    
    return jsonify({"message": "The payment has been created!", 
                    "payment": new_payment.to_dict()})
    

@app.route("/payments/pix/qr_code/<file_name>", methods=['GET'])
def get_image(file_name):
    return send_file(f"static/img/{file_name}.png", mimetype='image/png')


@app.route("/payments/pix/confirmation", methods=['POST'])
def pix_confirmation():
    data = request.json
    
    return jsonify({"message": "The payment has been confirmed!"})


@app.route("/payments/pix/<int:payment_id>", methods=['GET'])
def payment_pix_page(payment_id):
    
    payment = Payment.query.get(payment_id)
    
    return render_template('payment.html', 
                           payment_id=payment_id,
                           value=payment.value,
                           host="http://127.0.0.1:5000", 
                           qr_code=payment.qr_code)
    
    
# WebSockets
@socketio.on('connect')
def handle_connect():
    print("client connected to server")


if __name__ == '__main__':
    socketio.run(app, debug=True)