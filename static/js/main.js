document.addEventListener('DOMContentLoaded', function() {
    const showQuizBtn = document.getElementById('show-form-btn');
    const quizSection = document.getElementById('quiz-section');
    const quizContainer = document.getElementById('quiz-container');

    const questions = {
        1: { text: "1. Есть ли у вас долги от 200 000 ₽?", type: "boolean" },
        2: { text: "2. Есть ли у вас аресты на счетах или картах?", type: "boolean" },
        3: { text: "3. Есть ли у вас недвижимость, кроме единственного жилья?", type: "boolean" },
        4: { text: "4. Есть ли у вас автомобиль?", type: "boolean" },
        5: { text: "Последний шаг: Ваши контакты", type: "final" }
    };

    let currentStep = 1;
    const answers = {};

    if (showQuizBtn) {
        showQuizBtn.addEventListener('click', () => {
            quizSection.style.display = 'block';
            quizSection.scrollIntoView({ behavior: 'smooth' });
            showStep(1);
        });
    }

    function showStep(step) {
        currentStep = step;
        const totalSteps = Object.keys(questions).length;
        const progress = (step / totalSteps) * 100;

        // Генерация HTML
        let html = `
            <div class="quiz-progress-wrapper mb-4">
                <div class="progress" style="height: 8px; border-radius: 10px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${progress}%; transition: width 0.4s ease;"></div>
                </div>
                <div class="text-muted small mt-1 text-end">Шаг ${step} из ${totalSteps}</div>
            </div>
            <div class="step-fade-in">
                <h4 class="mb-4 text-center fw-bold">${questions[step].text}</h4>
        `;

        if (questions[step].type === "boolean") {
            html += `
                <div class="d-flex flex-column gap-3 mb-4" style="max-width: 320px; margin: 0 auto;">
                    <button class="btn btn-lg btn-success py-3 fw-bold" onclick="recordAnswer(${step}, 'Да')">ДА</button>
                    <button class="btn btn-lg btn-light border py-3 fw-bold" onclick="recordAnswer(${step}, 'Нет')">НЕТ</button>
                </div>
            `;
        } else if (questions[step].type === "final") {
            html += `
                <div class="text-start" style="max-width: 400px; margin: 0 auto;">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Ваше имя</label>
                        <input type="text" id="final-name" class="form-control form-control-lg" placeholder="Алексей" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Телефон или WhatsApp</label>
                        <input type="tel" id="final-phone" class="form-control form-control-lg" required>
                    </div>
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" id="agree-step" checked required>
                        <label class="form-check-label small" for="agree-step">
                            Я согласен с <a href="/offer" target="_blank">офертой</a> и <a href="/privacy" target="_blank">политикой конфиденциальности</a>
                        </label>
                    </div>
                    <button class="btn btn-success btn-lg w-100 py-3 fw-bold" onclick="submitQuiz()">ПОЛУЧИТЬ КОНСУЛЬТАЦИЮ</button>
                </div>
            `;
        }

        // Кнопки навигации снизу
        html += `<div class="d-flex justify-content-between align-items-center mt-4 border-top pt-3">`;
        if (step > 1) {
            html += `<button class="btn btn-link text-decoration-none text-muted p-0" onclick="prevStep() text-decoration-none">← Назад</button>`;
        } else {
            html += `<span></span>`;
        }
        html += `<button class="btn btn-link text-decoration-none text-muted p-0" onclick="goBackToMain()">Закрыть квиз</button>`;
        html += `</div></div>`;

        quizContainer.innerHTML = html;

        if (step === 5) setTimeout(initPhoneMask, 50);
    }

    window.recordAnswer = (step, value) => {
        answers[step] = value;
        showStep(step + 1);
    };

    window.prevStep = () => {
        if (currentStep > 1) showStep(currentStep - 1);
    };

    window.goBackToMain = () => { quizSection.style.display = 'none'; };

    // Исправленная маска (как в прошлом сообщении)
    function applyPhoneMask(input) {
        input.addEventListener('input', () => {
            let value = input.value.replace(/\D/g, '');
            if (!value) { input.value = '+7 '; return; }
            if (value[0] === '7' || value[0] === '8') value = value.substring(1);
            value = value.substring(0, 10);
            let res = '+7 ';
            if (value.length > 0) res += '(' + value.substring(0, 3);
            if (value.length > 3) res += ') ' + value.substring(3, 6);
            if (value.length > 6) res += '-' + value.substring(6, 8);
            if (value.length > 8) res += '-' + value.substring(8, 10);
            input.value = res;
        });
    }

    function initPhoneMask() {
        const el = document.getElementById('final-phone');
        if (el && !el.dataset.masked) {
            el.value = '+7 ';
            applyPhoneMask(el);
            el.dataset.masked = 'true';
        }
    }

    window.submitQuiz = function() {
        const name = document.getElementById('final-name').value.trim();
        const phone = document.getElementById('final-phone').value.trim();
        const agree = document.getElementById('agree-step').checked;

        if (!name || phone.replace(/\D/g, '').length < 11 || !agree) {
            alert('Пожалуйста, заполните все поля и примите условия.');
            return;
        }

        grecaptcha.ready(() => {
            grecaptcha.execute('6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK', {action: 'submit'}).then(token => {
                const payload = {
                    name, phone, agree: 'Да',
                    total_debt: (answers[1] === 'Да' ? '200k-500k' : 'under200k'),
                    arrests: answers[2],
                    extra_property: answers[3],
                    extra_car: answers[4],
                    'g-recaptcha-response': token
                };
                fetch('/consult', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                }).then(res => { if (res.ok) window.location.href = '/thanks'; });
            });
        });
    };
});
