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
        const phoneInput = document.getElementById('final-phone');
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
        5: { text: "Последний шаг: Ваши контакты", type: "final" }
    };

    // === ПОКАЗ ШАГА ===
    function showStep(step) {
        if (!questions[step]) return;

        let html = `<div class="step-content text-center">`;
        html += `<h4 class="mb-4">${questions[step].text}</h4>`;

        if (questions[step].type === "boolean") {
            html += `
                <div class="d-grid gap-2" style="max-width: 300px; margin: 0 auto;">
                    <button class="btn btn-primary" style="padding: 10px 16px;" onclick="recordAnswer(${step}, 'Да')">Да</button>
                    <button class="btn btn-outline-secondary" style="padding: 10px 16px;" onclick="recordAnswer(${step}, 'Нет')">Нет</button>
                </div>
            `;
        } else if (questions[step].type === "final") {
            html += `
                <div class="text-start" style="max-width: 400px; margin: 0 auto;">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Ваше имя</label>
                        <input type="text" id="final-name" class="form-control" placeholder="Иван" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Телефон или WhatsApp</label>
                        <input type="tel" id="final-phone" class="form-control" placeholder="+7 (   )   -  -  " required>
                    </div>
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" id="agree-step" checked required>
                        <label class="form-check-label small" for="agree-step">
                            Я принимаю условия <a href="/offer" target="_blank">публичной оферты</a>
                        </label>
                    </div>
                    <div class="d-grid">
                        <button class="btn btn-success btn-lg" onclick="submitQuiz()">Получить консультацию</button>
                    </div>
                </div>
            `;
        }

        html += `
            <button class="btn btn-sm btn-link text-muted mt-4" onclick="goBackToMain()">
                ← Вернуться позже
            </button>
        </div>`;
        
        quizContainer.innerHTML = html;

        if (step === 5) {
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

    window.submitQuiz = function() {
        const nameVal = document.getElementById('final-name').value.trim();
        const phoneVal = document.getElementById('final-phone').value.trim();
        const agree = document.getElementById('agree-step').checked;

        if (!nameVal) {
            alert('Пожалуйста, введите имя.');
            return;
        }
        if (phoneVal.replace(/\D/g, '').length < 11) {
            alert('Пожалуйста, укажите полный номер телефона.');
            return;
        }
        if (!agree) {
            alert('Пожалуйста, примите оферту.');
            return;
        }

        const payload = {
            name: nameVal,
            phone: phoneVal,
            agree: 'Да',
            total_debt: (answers[1] === 'Да' ? '200k-500k' : 'under200k'),
            arrests: answers[2],
            extra_property: answers[3],
            extra_car: answers[4],
            'g-recaptcha-response': ''
        };

        grecaptcha.ready(() => {
            grecaptcha.execute('6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK', {action: 'submit'}).then(token => {
                payload['g-recaptcha-response'] = token;
                fetch('/consult', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                }).then(res => {
                    if (res.ok) {
                        window.location.href = '/thanks';
                    } else {
                        alert('Ошибка отправки. Попробуйте ещё раз.');
                    }
                });
            });
        });
    };
});
