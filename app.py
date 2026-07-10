from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)

# --- КЛЮЧИ И НАСТРОЙКИ ---
# Ключи для безопасности сайта
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'fallback-secret')
RECAPTCHA_SECRET_KEY = os.environ.get('RECAPTCHA_SECRET_KEY')

# Настройки для ВНУТРЕННИХ уведомлений (в твой Telegram)
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

# Настройки для КЛИЕНТСКОГО бота (в мессенджере MAX)
CLIENT_BOT_TOKEN = os.environ.get('CLIENT_BOT_TOKEN')
# Новый адрес API из документации MAX
MAX_API_URL = "https://platform-api2.max.ru/messages"

# --- ФУНКЦИИ ---
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

def send_bot_message(chat_id, text, attachments=None):
    if not CLIENT_BOT_TOKEN:
        return
    
    # Токен передается в заголовке Authorization по правилам MAX
    headers = {
        'Authorization': CLIENT_BOT_TOKEN,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'chat_id': chat_id,
        'text': text
    }
    
    # Добавляем вложения (клавиатуру) при наличии
    if attachments:
        payload['attachments'] = attachments
        
    try:
        requests.post(MAX_API_URL, json=payload, headers=headers)
    except Exception as e:
        print(f"Ошибка отправки сообщения ботом MAX: {e}")

# --- СТАНДАРТНЫЕ МАРШРУТЫ САЙТА ---
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

# --- ОБНОВЛЕННЫЙ WEBHOOK ---
@app.route('/bot_webhook', methods=['POST'])
def bot_webhook():
    update = request.get_json()
    # Печатаем в логи все, что пришло от MAX
    print(f"ПОЛУЧЕНО ОТ MAX: {update}") 
    
    if update:
        # Пытаемся найти chat_id в любых возможных местах
        chat_id = update.get("chat_id") or (update.get("message", {}).get("chat", {}).get("id"))
        
        if chat_id:
            print(f"НАЙДЕН CHAT_ID: {chat_id}")
            send_bot_message(chat_id, "Бот получил ваше сообщение!")
        else:
            print("CHAT_ID НЕ НАЙДЕН в этом запросе")
            
    return jsonify({'ok': True}), 200

# --- ОБРАБОТКА ФОРМЫ (КВИЗА) ---
@app.route('/consult', methods=['POST'])
def consult():
    try:
        data = request.get_json()
        if not verify_recaptcha(data.get('g-recaptcha-response')):
            return jsonify({'error': 'reCAPTCHA failed'}), 400

        name = data.get('name', '—')
        phone = data.get('phone', '—')
        city = data.get('city', 'Не указано') 
        
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

        utm_source = data.get('utm_source', 'Прямой заход / Неизвестно')
        utm_medium = data.get('utm_medium', '—')
        utm_campaign = data.get('utm_campaign', '—')

        is_mfc = data.get('is_mfc', False)
        mfc_tag = "❗️ [ВЕТКА МФЦ - Долг менее 300к]\n" if is_mfc else ""

        message = f"""
🔥 НОВЫЙ ЛИД (БЕЗДОЛГОВ.ЛАЙФ)
{mfc_tag}
👤 Имя: {name}
📱 Телефон: {phone}
📍 Город: {city}

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

        # Внутреннее уведомление о новой заявке отправляется в Telegram
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
