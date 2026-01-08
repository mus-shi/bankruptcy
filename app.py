from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev')

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

RECAPTCHA_SECRET_KEY = os.environ.get('SECRET_KEY')

def verify_recaptcha(token):
    try:
        r = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': RECAPTCHA_SECRET_KEY,
                'response': token
            },
            timeout=5
        )
        return r.json().get('success', False)
    except:
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/thanks')
def thanks():
    return render_template('thanks.html')

@app.route('/consult', methods=['POST'])
def consult():
    data = request.get_json()

    if not verify_recaptcha(data.get('g-recaptcha-response')):
        return jsonify({'error': 'captcha'}), 400

    message = f"""
🆕 Новая заявка

👤 Имя: {data['name']}
📞 Телефон: {data['phone']}
📊 Долг: {data['total_debt']}
"""

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    requests.post(url, data={
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message
    })

    return jsonify({'ok': True})
