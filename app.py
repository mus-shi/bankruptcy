from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)
# SECRET_KEY в Render — это reCAPTCHA Secret Key!
app.secret_key = os.environ.get('SECRET_KEY', 'fallback-secret')

# Telegram
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

# reCAPTCHA: SECRET_KEY из Render — это secret key!
RECAPTCHA_SECRET_KEY = os.environ.get('SECRET_KEY')

def verify_recaptcha(token):
    if not RECAPTCHA_SECRET_KEY:
        return True  # fallback for dev
    try:
        resp = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={'secret': RECAPTCHA_SECRET_KEY, 'response': token}
        )
        result = resp.json()
        print("reCAPTCHA:", result)
        return result.get('success', False)
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
    try:
        data = request.get_json()
        recaptcha_token = data.get('g-recaptcha-response')
        name = data.get('name', '—')
        phone = data.get('phone', '—')

        # 1. Проверяем reCAPTCHA
        if not verify_recaptcha(recaptcha_token):
            print("❌ reCAPTCHA failed")
            return jsonify({'error': 'reCAPTCHA failed'}), 400

        # 2. Формируем сообщение
        message = f"""
🆕 Новая заявка!

👤 Имя: {name}
📱 Телефон: {phone}
✅ Согласен: Да

1. Долг: Менее 200 тыс. ₽
2. Аресты: Не указано
3. Недвижимость: Не указано
4. Автомобиль: Не указано
        """

        # 3. Отправляем в Telegram
        if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
            try:
                url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
                response = requests.post(url, data={
                    'chat_id': TELEGRAM_CHAT_ID,
                    'text': message
                })
                if not response.ok:
                    raise Exception(f"Telegram error: {response.text}")
                print("✅ Заявка отправлена в Telegram")
            except Exception as e:
                print("❌ Telegram error:", e)
                return jsonify({'error': 'Telegram error'}), 500

        return jsonify({'ok': True})

    except Exception as e:
        print("🔥 Ошибка в /consult:", str(e))
        return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
