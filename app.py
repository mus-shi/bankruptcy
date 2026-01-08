from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-for-consult')

# Получаем переменные окружения
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')
RECAPTCHA_SECRET_KEY = os.environ.get('RECAPTCHA_SECRET_KEY', '6Lc_4kIsAAAAABoxguHakNk3gp3xBTKplzgoduqB')

def verify_recaptcha(token):
    if not RECAPTCHA_SECRET_KEY:
        return True
    try:
        resp = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={'secret': RECAPTCHA_SECRET_KEY, 'response': token}
        )
        result = resp.json()
        print("reCAPTCHA response:", result)  # Логируем для отладки
        return result.get('success', False)
    except Exception as e:
        print("Ошибка reCAPTCHA:", e)
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
        # Получаем данные из формы
        name = request.form.get('name', '—')
        phone = request.form.get('phone', '—')
        agree = request.form.get('agree', 'Нет')
        total_debt_key = request.form.get('total_debt', 'under200k')
        arrests = request.form.get('arrests', 'Не указано')
        extra_property = request.form.get('extra_property', 'Не указано')
        extra_car = request.form.get('extra_car', 'Не указано')
        recaptcha_token = request.form.get('g-recaptcha-response', '')

        # Проверяем reCAPTCHA
        if not verify_recaptcha(recaptcha_token):
            print("reCAPTCHA failed for:", phone)
            return jsonify({'error': 'reCAPTCHA failed'}), 400

        # Сопоставление ключей долгов
        debt_map = {
            'under200k': 'Менее 200 тыс. ₽',
            '200k-500k': 'От 200 до 500 тыс. ₽',
            '500k-1m': 'От 500 тыс. до 1 млн ₽',
            'over1m': 'Свыше 1 млн ₽'
        }
        total_debt = debt_map.get(total_debt_key, 'Не указано')

        # Формируем сообщение
        message = f"""
🆕 Новая заявка!

👤 Имя: {name}
📱 Телефон: {phone}
✅ Согласен: {agree}

1. Долг: {total_debt}
2. Аресты: {arrests}
3. Недвижимость: {extra_property}
4. Автомобиль: {extra_car}
        """

        # Отправляем в Telegram
        if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
            try:
                url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
                response = requests.post(url, data={
                    'chat_id': TELEGRAM_CHAT_ID,
                    'text': message,
                    'parse_mode': 'HTML'
                })
                print("Telegram response:", response.status_code, response.text)
                if not response.ok:
                    raise Exception(f"Telegram error: {response.text}")
            except Exception as e:
                print("Ошибка Telegram:", e)
                return jsonify({'error': 'Telegram send failed'}), 500

        # Успешно
        return '', 204

    except Exception as e:
        print("Ошибка в /consult:", str(e))
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
