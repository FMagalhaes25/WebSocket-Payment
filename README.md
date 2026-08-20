# WebSocket-Payment

Projeto criado para aprofundar conhecimentos em **WebSocket** com **Python + Flask**, simulando um fluxo de **pagamento Pix em tempo real**.

---

## Tecnologias

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Flask%20SocketIO](https://img.shields.io/badge/Flask_SocketIO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000)

---

## Sobre o projeto

A aplicação simula a criação de um pagamento Pix com QR Code e a confirmação desse pagamento em tempo real.

Quando o pagamento é confirmado no backend, o servidor dispara um evento via WebSocket e a interface do cliente é atualizada automaticamente, sem necessidade de recarregar a página.

Esse projeto foi desenvolvido com foco em:

- comunicação cliente-servidor em tempo real
- integração entre API REST e eventos WebSocket
- prática de arquitetura simples com Flask e SQLAlchemy
- melhoria da experiência do usuário com feedback imediato

---

## Funcionalidades

- Criar pagamento Pix
- Gerar e exibir QR Code
- Confirmar pagamento por endpoint
- Notificar clientes conectados via WebSocket
- Atualizar interface em tempo real quando o pagamento é aprovado

---

## Como executar localmente

### 1) Clone o repositório

```bash
git clone https://github.com/FMagalhaes25/WebSocket-Payment.git
cd WebSocket-Payment
```

### 2) Crie e ative um ambiente virtual

```bash
python -m venv .venv
```

Windows (PowerShell):

```bash
.venv\Scripts\Activate.ps1
```

Windows (CMD):

```bash
.venv\Scripts\activate.bat
```

### 3) Instale as dependências

```bash
pip install -r requirements.txt
```

### 4) Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
SECRET_KEY=sua_chave_secreta
SQLALCHEMY_DATABASE_URI=sqlite:///database.db
```

### 5) Execute o projeto

```bash
python app.py
```

Aplicação disponível em:

```text
http://127.0.0.1:5000
```

---

## Endpoints principais

- `POST /payments/pix` - Cria um novo pagamento
- `GET /payments/pix/qr_code/<file_name>` - Retorna imagem do QR Code
- `POST /payments/pix/confirmation` - Confirma pagamento e emite evento WebSocket
- `GET /payments/pix/<payment_id>` - Página de acompanhamento do pagamento

---

## Estrutura do projeto

```text
.
|-- app.py
|-- requirements.txt
|-- instance/
|-- models/
|   `-- payment.py
|-- payments/
|   `-- pix.py
|-- repository/
|   `-- database.py
|-- static/
|   |-- css/
|   |   `-- styles.css
|   |-- img/
|   |-- js/
|   |   `-- pix-celebration.js
|   `-- template_img/
`-- templates/
	|-- 404.html
	|-- confirmed_payment.html
	`-- payment.html
```

---

## Objetivo de aprendizado

Este projeto faz parte da minha jornada para aprofundar conhecimentos em:

- WebSocket com Flask-SocketIO
- eventos em tempo real
- organização de aplicações web com Python

---
