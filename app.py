from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)

# --- КЛЮЧИ И НАСТРОЙКИ ---
# Ключи для безопасности сайта
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'fallback-secret')
RECAPTCHA_SECRET_KEY = os.environ.get('RECAPTCHA_SECRET_KEY')

# Настройки для ВНУТРЕННИХ уведомлений (в ваш Telegram)
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

# Настройки для КЛИЕНТСКОГО бота (в мессенджере MAX)
CLIENT_BOT_TOKEN = os.environ.get('CLIENT_BOT_TOKEN')
# ВНИМАНИЕ: Если у MAX другой формат API URL, его нужно будет поправить здесь
MAX_API_URL = f"https://api.max.ru/bot{CLIENT_BOT_TOKEN}" if CLIENT_BOT_TOKEN else ""

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

def send_bot_message(chat_id, text, reply_markup=None):
    if not CLIENT_BOT_TOKEN:
        return
    
    payload = {
        'chat_id': chat_id,
        'text': text
    }
    
    # Если передана клавиатура, добавляем её к сообщению
    if reply_markup:
        payload['reply_markup'] = reply_markup
        
    try:
        requests.post(f"{MAX_API_URL}/sendMessage", json=payload)
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

# --- WEBHOOK ДЛЯ БОТА MAX ---
@app.route('/bot_webhook', methods=['POST'])
def bot_webhook():
    try:
        update = request.get_json()
        
        # Проверяем, пришло ли текстовое сообщение от клиента
        if update and "message" in update and "text" in update["message"]:
            chat_id = update["message"]["chat"]["id"]

            welcome_text = (
                "Здравствуйте! 👋 Я — виртуальный помощник БЕЗДОЛГОВ.ЛАЙФ.\n\n"
                "Моя главная задача — помочь вам разобраться в вашей финансовой ситуации. "
                "Мы специализируемся на законном сопровождении процедур по 127-ФЗ.\n\n"
                "Нажмите на кнопку ниже, чтобы запустить бесплатный правовой аудит."
            )
            
            # Формируем кнопку для открытия мини-приложения
            keyboard = {
                "inline_keyboard": [
                    [
                        {
                            "text": "🚀 Запустить аудит",
                            "web_app": {
                                "url": "https://bankruptcy-ro8n.onrender.com/"
                            }
                        }
                    ]
                ]
            }
            
            # Отправляем сообщение вместе с кнопкой
            send_bot_message(chat_id, welcome_text, reply_markup=keyboard)
                
        return jsonify({'ok': True}), 200
    except Exception as e:
        print(f"Ошибка в webhook: {e}")
        return jsonify({'error': 'Webhook processing error'}), 500

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
