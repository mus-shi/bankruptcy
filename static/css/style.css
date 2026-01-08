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
    let answers = {};

    if (showQuizBtn) {
        showQuizBtn.addEventListener('click', () => {
            quizSection.style.display = 'block';
            quizSection.scrollIntoView({ behavior: 'smooth' });
            showStep(1);
        });
    }

    function showStep(step) {
        currentStep = step;
        const totalSteps = 5;
        const progress = (step / totalSteps) * 100;

        let html = `
            <div class="mb-4">
                <div class="progress" style="height: 6px; border-radius: 10px; background-color: #eee;">
                    <div class="progress-bar" style="width: ${progress}%; background-color: #2d5e4a; transition: 0.4s;"></div>
                </div>
            </div>
            <div class="step-fade-in">
                <h4 class="mb-4 text-center" style="font-weight: 500; font-family: 'Lora', serif;">${questions[step].text}</h4>
        `;

        if (questions[step].type === "boolean") {
            html += `
                <div class="d-flex flex-column gap-3 mb-4" style="max-width: 280px; margin: 0 auto;">
                    <button class="btn btn-lg btn-success py-3" onclick="recordAnswer(${step}, 'Да')">Да</button>
                    <button class="btn btn-lg btn-outline-secondary py-3" onclick="recordAnswer(${step}, 'Нет')">Нет</button>
                </div>
            `;
        } else if (questions[step].type === "final") {
            html += `
                <div class="text-start" style="max-width: 400px; margin: 0 auto;">
                    <div class="mb-3"><label class="small fw-bold">Имя</label><input type="text" id="final-name" class="form-control form-control-lg" required></div>
                    <div class="mb-3"><label class="small fw-bold">Телефон</label><input type="tel" id="final-phone" class="form-control form-control-lg" required></div>
                    <div class="form-check mb-4"><input class="form-check-input" type="checkbox" id="agree-step" checked required><label class="small text-muted">Согласен с политикой</label></div>
                    <button class="btn btn-success btn-lg w-100 py-3" onclick="submitQuiz()">ПОЛУЧИТЬ КОНСУЛЬТАЦИЮ</button>
                </div>
            `;
        }

        html += `
            <div class="d-flex justify-content-between mt-4 border-top pt-3">
                ${step > 1 ? `<button class="btn btn-link text-muted small p-0" onclick="prevStep()">← Назад</button>` : '<span></span>'}
                <button class="btn btn-link text-muted small p-0" onclick="goBackToMain()">Вернуться позже</button>
            </div>
        </div>`;

        quizContainer.innerHTML = html;
        if (step === 5) setTimeout(initPhoneMask, 50);
    }

    window.recordAnswer = (step, value) => { answers[step] = value; showStep(step + 1); };
    window.prevStep = () => { if (currentStep > 1) showStep(currentStep - 1); };
    window.goBackToMain = () => { quizSection.style.display = 'none'; };

    function initPhoneMask() {
        const el = document.getElementById('final-phone');
        if (el) {
            el.value = '+7 ';
            el.addEventListener('input', () => {
                let v = el.value.replace(/\D/g, '');
                if (v[0] === '7' || v[0] === '8') v = v.substring(1);
                v = v.substring(0, 10);
                let r = '+7 ';
                if (v.length > 0) r += '(' + v.substring(0,3);
                if (v.length > 3) r += ') ' + v.substring(3,6);
                if (v.length > 6) r += '-' + v.substring(6,8);
                if (v.length > 8) r += '-' + v.substring(8,10);
                el.value = r;
            });
        }
    }

    window.submitQuiz = function() {
        const name = document.getElementById('final-name').value;
        const phone = document.getElementById('final-phone').value;
        if (!name || phone.length < 10) return alert('Заполните данные');
        
        grecaptcha.ready(() => {
            grecaptcha.execute('6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK', {action: 'submit'}).then(token => {
                fetch('/consult', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name, phone, arrests: answers[2], extra_property: answers[3], extra_car: answers[4], 'g-recaptcha-response': token })
                }).then(res => { if (res.ok) window.location.href = '/thanks'; });
            });
        });
    };
});
