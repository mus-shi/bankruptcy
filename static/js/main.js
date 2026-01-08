document.addEventListener('DOMContentLoaded', function() {
    const showQuizBtn = document.getElementById('show-form-btn');
    const quizSection = document.getElementById('quiz-section');
    const quizContainer = document.getElementById('quiz-container');

    const questions = {
        1: { text: "Есть ли у вас долги от 200 000 ₽?", type: "boolean" },
        2: { text: "Есть ли у вас аресты на счетах или картах?", type: "boolean" },
        3: { text: "Есть ли у вас недвижимость, кроме единственного жилья?", type: "boolean" },
        4: { text: "Есть ли у вас автомобиль?", type: "boolean" },
        5: { text: "Ваши контактные данные", type: "final" }
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

        let html = `
            <div class="quiz-progress-wrapper mb-4">
                <div class="progress" style="height: 6px; border-radius: 10px; background-color: #f0f0f0;">
                    <div class="progress-bar" role="progressbar" style="width: ${progress}%; background-color: #2d5e4a; transition: width 0.4s ease;"></div>
                </div>
            </div>
            <div class="step-fade-in">
                <h4 class="mb-4 text-center" style="font-weight: 500; font-family: 'Lora', serif; color: #333;">${questions[step].text}</h4>
        `;

        if (questions[step].type === "boolean") {
            html += `
                <div class="d-flex flex-column gap-3 mb-4" style="max-width: 280px; margin: 0 auto;">
                    <button class="btn btn-lg btn-success py-3" style="border-radius: 50px; font-weight: 500; background-color: #2d5e4a; border: none;" onclick="recordAnswer(${step}, 'Да')">Да</button>
                    <button class="btn btn-lg btn-outline-secondary py-3" style="border-radius: 50px; font-weight: 500; color: #666;" onclick="recordAnswer(${step}, 'Нет')">Нет</button>
                </div>
            `;
        } else if (questions[step].type === "final") {
            html += `
                <div class="text-start" style="max-width: 400px; margin: 0 auto;">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Ваше имя</label>
                        <input type="text" id="final-name" class="form-control form-control-lg" style="border-radius: 10px;" placeholder="Иван" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Телефон или WhatsApp</label>
                        <input type="tel" id="final-phone" class="form-control form-control-lg" style="border-radius: 10px;" required>
                    </div>
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" id="agree-step" checked required>
                        <label class="form-check-label small text-muted" for="agree-step">
                            Я согласен с <a href="/offer" target="_blank">офертой</a> и <a href="/privacy" target="_blank">политикой конфиденциальности</a>
                        </label>
                    </div>
                    <button class="btn btn-success btn-lg w-100 py-3 fw-bold" style="border-radius: 50px; background-color: #2d5e4a; border: none;" onclick="submitQuiz()">ПОЛУЧИТЬ КОНСУЛЬТАЦИЮ</button>
                </div>
            `;
        }

        html += `
            <div class="d-flex justify-content-between align-items-center mt-4 border-top pt-3">
                ${step > 1 ? `<button class="btn btn-link text-decoration-none text-muted small p-0" onclick="prevStep()">← Назад</button>` : '<span></span>'}
                <button class="btn btn-link text-decoration-none text-muted small p-0" onclick="goBackToMain()">Вернуться позже</button>
            </div>
        </div>`;

        quizContainer.innerHTML = html;
        if (step === 5) setTimeout(initPhoneMask, 50);
    }

    window.recordAnswer = (step, value) => { answers[step] = value; showStep(step + 1); };
    window.prevStep = () => { if (currentStep > 1) showStep(currentStep - 1); };
    window.goBackToMain = () => { quizSection.style.display = 'none'; };

    function applyPhoneMask(input) {
        input.addEventListener('input', () => {
            let v = input.value.replace(/\D/g, '');
            if (!v) { input.value = '+7 '; return; }
            if (v[0] === '7' || v[0] === '8') v = v.substring(1);
            v = v.substring(0, 10);
            let r = '+7 ';
            if (v.length > 0) r += '(' + v.substring(0, 3);
            if (v.length > 3) r += ') ' + v.substring(3, 6);
            if (v.length > 6) r += '-' + v.substring(6, 8);
            if (v.length > 8) r += '-' + v.substring(8, 10);
            input.value = r;
        });
    }

    function initPhoneMask() {
        const el = document.getElementById('final-phone');
        if (el && !el.dataset.masked) { el.value = '+7 '; applyPhoneMask(el); el.dataset.masked = 'true'; }
    }

    window.submitQuiz = function() {
        const name = document.getElementById('final-name').value.trim();
        const phone = document.getElementById('final-phone').value.trim();
        const agree = document.getElementById('agree-step').checked;

        if (!name || phone.replace(/\D/g, '').length < 11 || !agree) {
            alert('Пожалуйста, заполните данные корректно.');
            return;
        }

        grecaptcha.ready(() => {
            grecaptcha.execute('6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK', {action: 'submit'}).then(token => {
                fetch('/consult', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name, phone, agree: 'Да',
                        total_debt: answers[1],
                        arrests: answers[2],
                        extra_property: answers[3],
                        extra_car: answers[4],
                        'g-recaptcha-response': token
                    })
                }).then(res => { if (res.ok) window.location.href = '/thanks'; });
            });
        });
    };
});
