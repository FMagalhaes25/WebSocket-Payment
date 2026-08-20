import uuid
import qrcode

class Pix:
    def __init__(self): #Construtor da classe
        pass
    
    def create_payment(self):
        # Criar pagamento na instituição financeira
        # Essa classe vai abstrair, diminuir o acoplamento
        bank_payment_id = uuid.uuid4()
        
        #qr_code
        hash_payment = f'hash_payment_{bank_payment_id}'
        
        #cria a imagem do qr code
        img = qrcode.make(hash_payment)
        #salvar a imagem como arquivo PNG
        img.save(f"static/img/qr_code_payment_{bank_payment_id}.png")
         
        
        return {"bank_payment_id": bank_payment_id,
                "qr_code_path": f"qr_code_payment_{bank_payment_id}"}