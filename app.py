from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret')

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

RECAPTCHA_SECRET_KEY = os.environ.get('SECRET_KEY')

def verify_recaptcha(token):
    try:
        response = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': RECAPTCHA_SECRET_KEY,
                'response': token
            },
            timeout=5
        )
        return response.json().get('success', False)
    except Exception as e:
        print("reCAPTCHA error:", e)
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/offer')
def offer():
    return render_template('offer.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

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

👤 Имя: {data.get('name')}
📞 Телефон: {data.get('phone')}
📊 Долг: {data.get('total_debt')}
"""

    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        requests.post(url, data={
            'chat_id': TELEGRAM_CHAT_ID,
            'text': message
        })
    except Exception as e:
        print("Telegram error:", e)
        return jsonify({'error': 'telegram'}), 500

    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run()
