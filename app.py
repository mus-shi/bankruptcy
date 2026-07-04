from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)
# Теперь ключи разделены для безопасности
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'fallback-secret')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')
RECAPTCHA_SECRET_KEY = os.environ.get('RECAPTCHA_SECRET_KEY')

def verify_recaptcha(token):
    if not RECAPTCHA_SECRET_KEY:
        return True 
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
        if not verify_recaptcha(data.get('g-recaptcha-response')):
            return jsonify({'error': 'reCAPTCHA failed'}), 400

        name = data.get('name', '—')
        phone = data.get('phone', '—')
        
        # Обновленные ключи из нового квиза
        debt_map = {
            'under200k': 'Менее 200 тыс. ₽',
            '200k-500k': 'От 200 до 500 тыс. ₽',
            '500k-1m': 'От 500 тыс. до 1 млн ₽',
            'over1m': 'Свыше 1 млн ₽'
        }
        total_debt = debt_map.get(data.get('total_debt'), 'Не указано')
        debt_structure = data.get('debt_structure', 'Не указано')
        property_deals = data.get('property_deals', 'Не указано')
        current_stage = data.get('current_stage', 'Не указано')

        # Получаем UTM-метки
        utm_source = data.get('utm_source', 'Прямой заход / Неизвестно')
        utm_medium = data.get('utm_medium', '—')
        utm_campaign = data.get('utm_campaign', '—')

        message = f"""
🔥 НОВЫЙ ЛИД (БЕЗДОЛГОВ.ЛАЙФ)

👤 Имя: {name}
📱 Телефон: {phone}

📊 АНАЛИЗ СИТУАЦИИ:
1. Сумма: {total_debt}
2. Кому должны: {debt_structure}
3. Сделки за 3 года: {property_deals}
4. Текущая стадия: {current_stage}

🎯 ОТКУДА ПРИШЕЛ:
• Источник: {utm_source}
• Тип трафика: {utm_medium}
• Кампания: {utm_campaign}
        """

        if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
            requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", data={
                'chat_id': TELEGRAM_CHAT_ID,
                'text': message
            })

        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
