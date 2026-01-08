from flask import Flask, render_template, request
import os
import requests

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-for-consult')

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')
RECAPTCHA_SECRET_KEY = os.environ.get('RECAPTCHA_SECRET_KEY', '6Lc_4kIsAAAAABoxguHakNk3gp3xBTKplzgoduqB')

def verify_recaptcha(token):
    if not RECAPTCHA_SECRET_KEY:
        return True  # отключено в dev
    try:
        resp = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={'secret': RECAPTCHA_SECRET_KEY, 'response': token}
        )
        return resp.json().get('success', False)
    except:
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/offer')
def offer():
    return render_template('offer.html')

@app.route('/thanks')
def thanks():
    return render_template('thanks.html')

@app.route('/consult', methods=['POST'])
def consult():
    # Общий debt_map
    debt_map = {
        'under200k': 'До 200 тыс. ₽',
        '200k-500k': '200 тыс. – 500 тыс. ₽',
        '500k-1m': '500 тыс. – 1 млн ₽',
        'over1m': 'Более 1 млн ₽'
    }

    # Определяем тип данных
    if request.is_json:
        data = request.get_json()
        recaptcha_token = data.get('g-recaptcha-response')
        name = data.get('name', '—')
        phone = data.get('phone', '—')
        agree = data.get('agree', 'Нет')
        total_debt_key = data.get('total_debt', 'under200k')
        arrests = data.get('arrests', 'Не указано')
        extra_property = data.get('extra_property', 'Не указано')
        extra_car = data.get('extra_car', 'Не указано')
        total_debt = debt_map.get(total_debt_key, 'Не указано')
    else:
        # Старый способ (form-data)
        recaptcha_token = request.form.get('g-recaptcha-response')
        name = request.form.get('name', '—')
        phone = request.form.get('phone', '—')
        agree = request.form.get('agree', 'Нет')
        total_debt_key = request.form.get('total_debt', 'under200k')
        arrests = request.form.get('arrests', 'Не указано')
        extra_property = request.form.get('extra_property', 'Не указано')
        extra_car = request.form.get('extra_car', 'Не указано')
        total_debt = debt_map.get(total_debt_key, 'Не указано')

    # 👇 ОТЛАДКА: Выводим в логи
    print(f"🔍 reCAPTCHA token: {recaptcha_token}")
    print(f"📊 Score: N/A (v3 не возвращает score напрямую)")

    if not verify_recaptcha(recaptcha_token):
        print("❌ reCAPTCHA failed!")
        return 'reCAPTCHA failed', 400

    message = f"""
🆕 Новая заявка!

👤 Имя: {name}
📱 Телефон: {phone}
✅ Согласен с офертой: {agree}

1. Долг: {total_debt}
2. Аресты: {arrests}
3. Недвижимость: {extra_property}
4. Автомобиль: {extra_car}
    """

    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            requests.post(url, data={'chat_id': TELEGRAM_CHAT_ID, 'text': message})
        except Exception as e:
            print("Ошибка Telegram:", e)

    return '', 204

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
