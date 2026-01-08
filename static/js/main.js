document.addEventListener('DOMContentLoaded', function() {
    const showQuizBtn = document.getElementById('show-form-btn');
    const quizSection = document.getElementById('quiz-section');
    const quizContainer = document.getElementById('quiz-container');

    if (showQuizBtn && quizSection) {
        showQuizBtn.addEventListener('click', function(e) {
            e.preventDefault();
            quizSection.style.display = 'block';
            quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showStep(1);
        });
    }

    // === МАСКА ТЕЛЕФОНА ===
    function applyPhoneMask(input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // только цифры
            if (value.startsWith('8')) value = '7' + value.slice(1); // 8 → 7
            if (value.length > 11) value = value.slice(0, 11);

            let formatted = '+7 ';
            if (value.length > 1) {
                formatted += '(' + value.slice(1, 4);
                if (value.length > 4) {
                    formatted += ') ' + value.slice(4, 7);
                    if (value.length > 7) {
                        formatted += '-' + value.slice(7, 9);
                        if (value.length > 9) {
                            formatted += '-' + value.slice(9, 11);
                        }
                    }
                }
            } else if (value) {
                formatted += value;
            }

            e.target.value = formatted;
        });
    }

    function initPhoneMask() {
        const phoneInput = document.getElementById('answer-6');
        if (phoneInput && !phoneInput.dataset.masked) {
            applyPhoneMask(phoneInput);
            phoneInput.dataset.masked = 'true';
        }
    }

    // === ДАННЫЕ ОПРОСА ===
    const answers = {};

    const questions = {
        1: { text: "1. Есть ли у вас долги от 200 000 ₽?", type: "boolean" },
        2: { text: "2. Есть ли у вас аресты на счетах или картах?", type: "boolean" },
        3: { text: "3. Есть ли у вас недвижимость, кроме единственного жилья?", type: "boolean" },
        4: { text: "4. Есть ли у вас автомобиль?", type: "boolean" },
        5: { text: "5. Как вас зовут?", type: "text" },
        6: { text: "6. Ваш телефон или WhatsApp", type: "phone" }
    };

    // === ПОКАЗ ШАГА ===
    function showStep(step) {
        if (!questions[step]) return;

        let html = `<div class="step-content text-center">`;
        html += `<h4 class="mb-4">${questions[step].text}</h4>`;

        if (questions[step].type === "boolean") {
            html += `
                <div class="d-grid gap-2" style="max-width: 300px; margin: 0 auto;">
                    <button class="btn btn-primary" style="padding: 8px 16px; font-size: 1rem;" onclick="recordAnswer(${step}, 'Да')">
                        Да
                    </button>
                    <button class="btn btn-outline-secondary" style="padding: 8px 16px; font-size: 1rem;" onclick="recordAnswer(${step}, 'Нет')">
                        Нет
                    </button>
                </div>
                <button class="btn btn-sm btn-link text-muted mt-3" onclick="goBackToMain()">
                    ← Вернуться к заполнению позже
                </button>
            `;
        } else if (questions[step].type === "text") {
            html += `
                <input type="text" id="answer-${step}" class="form-control mb-3" placeholder="Ваше имя" required>
                <button class="btn btn-primary" onclick="recordTextAnswer(${step})">Продолжить</button>
                <button class="btn btn-sm btn-link text-muted mt-2" onclick="goBackToMain()">
                    ← Вернуться к заполнению позже
                </button>
            `;
        } else if (questions[step].type === "phone") {
            html += `
                <input type="tel" id="answer-${step}" class="form-control mb-3" placeholder="+7 (   )    -  -  " required>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="agree-step" required>
                    <label class="form-check-label" for="agree-step">
                        Я принимаю условия <a href="/offer" target="_blank">публичной оферты</a>
                    </label>
                </div>
                <button class="btn btn-success" onclick="submitQuiz()">Получить консультацию</button>
                <button class="btn btn-sm btn-link text-muted mt-2" onclick="goBackToMain()">
                    ← Вернуться к заполнению позже
                </button>
            `;
        }

        html += `</div>`;
        quizContainer.innerHTML = html;

        if (step === 6) {
            setTimeout(initPhoneMask, 100);
        }
    }

    // === ФУНКЦИИ ===
    window.goBackToMain = function() {
        quizSection.style.display = 'none';
    };

    window.recordAnswer = function(step, value) {
        answers[step] = value;
        showStep(step + 1);
    };

    window.recordTextAnswer = function(step) {
        const input = document.getElementById(`answer-${step}`);
        if (input.value.trim()) {
            answers[step] = input.value.trim();
            showStep(step + 1);
        } else {
            alert('Пожалуйста, введите имя.');
        }
    };

    window.submitQuiz = function() {
        const agree = document.getElementById('agree-step').checked;
        if (!agree) {
            alert('Пожалуйста, примите оферту.');
            return;
        }

        const phoneInput = document.getElementById('answer-6');
        if (!phoneInput.value.trim() || phoneInput.value.replace(/\D/g, '').length < 11) {
            alert('Пожалуйста, укажите полный номер телефона (11 цифр).');
            phoneInput.focus();
            return;
        }

        answers.agree = agree ? 'Да' : 'Нет';
        answers.phone = phoneInput.value.trim();
        answers.name = answers[5];

        const total_debt = answers[1] === 'Да' ? '200k-500k' : 'under200k';
        const payload = {
            name: answers.name,
            phone: answers.phone,
            agree: answers.agree,
            total_debt: total_debt,
            arrests: answers[2],
            extra_property: answers[3],
            extra_car: answers[4],
            'g-recaptcha-response': ''
        };

        // 👇 ОТЛАДКА: Выводим токен в консоль
        console.log("🔍 Отправляем форму с токеном:");
        grecaptcha.ready(() => {
            grecaptcha.execute('6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK', {action: 'submit'}).then(token => {
                console.log("✅ Токен reCAPTCHA:", token);
                payload['g-recaptcha-response'] = token;
                fetch('/consult', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                }).then(res => {
                    if (res.ok) {
                        setTimeout(() => {
                            window.location.href = '/thanks';
                        }, 800);
                    } else {
                        alert('Ошибка отправки. Попробуйте ещё раз.');
                        quizSection.style.display = 'none';
                    }
                });
            });
        });
    };
});
