document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('show-form-btn');
    const quizWrapper = document.getElementById('quiz-wrapper');
    const introBlock = document.getElementById('intro-text-block');
    const quizContainer = document.getElementById('quiz-container');

    // Данные квиза
    const questions = {
        1: { text: "Общая сумма долга?", type: "slider" },
        2: { text: "Есть аресты на картах?", type: "boolean" },
        3: { text: "Есть ипотека или авто?", type: "boolean" },
        4: { text: "Куда прислать результат?", type: "final" }
    };

    let currentStep = 1;
    let userAnswers = {};

    // Открытие квиза
    startBtn.addEventListener('click', () => {
        introBlock.style.display = 'none';
        quizWrapper.style.display = 'block';
        setTimeout(() => { quizWrapper.classList.add('active'); }, 10);
        showStep(1);
    });

    // Логика шагов
    function showStep(step) {
        currentStep = step;
        const progress = (step / 4) * 100;
        
        let html = `
            <div class="progress mb-3" style="height: 4px; background: var(--bg-light);">
                <div class="progress-bar" role="progressbar" style="width: ${progress}%; background-color: var(--accent-color);"></div>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                ${step > 1 ? `<button class="quiz-back-btn" onclick="goBack()">← Назад</button>` : '<div></div>'}
                <h5 class="fw-bold mb-0 text-center">${questions[step].text}</h5>
                <div></div>
            </div>
        `;

        if (questions[step].type === "slider") {
            html += `
                <div class="text-center px-2">
                    <span id="range-value-display" class="range-value-label">500 000 ₽</span>
                    <input type="range" class="form-range" id="debt-range" min="200000" max="5050000" step="50000" value="500000">
                    <div class="d-flex justify-content-between text-muted small mt-2 mb-4">
                        <span>200к</span>
                        <span>> 5 млн</span>
                    </div>
                    <button class="btn btn-start-online w-100 py-2" onclick="saveSliderAndNext()">Далее</button>
                </div>
            `;
        } else if (questions[step].type === "boolean") {
            html += `
                <div class="quiz-grid-options">
                    <button class="btn-quiz-option" onclick="nextQuizStep('Да')">Да</button>
                    <button class="btn-quiz-option" onclick="nextQuizStep('Нет')">Нет</button>
                </div>
            `;
        } else {
            html += `
                <div class="px-2">
                    <div class="mb-2">
                        <input type="text" id="user-name" class="form-control form-control-sm" placeholder="Ваше имя">
                    </div>
                    <div class="mb-3">
                        <input type="tel" id="user-phone" class="form-control form-control-sm" value="+7 ">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="agreeCheckbox" required>
                        <label class="form-check-label small" for="agreeCheckbox">
                            Согласен с <a href="#" class="text-muted">политикой конфиденциальности</a>
                        </label>
                    </div>
                    <button id="submit-btn" class="btn btn-start-online w-100 py-2 fw-bold" onclick="submitQuiz()">Получить разбор</button>
                </div>
            `;
        }
        
        quizContainer.innerHTML = html;

        if (questions[step].type === "slider") {
            const rangeInput = document.getElementById('debt-range');
            const rangeDisplay = document.getElementById('range-value-display');
            rangeInput.addEventListener('input', function() {
                const val = parseInt(this.value);
                rangeDisplay.textContent = (val >= 5050000) ? "> 5 000 000 ₽" : val.toLocaleString('ru-RU') + " ₽";
            });
        }
        
        if (step === 4) applyPhoneMask();
    }

    // Глобальные функции для onclick
    window.goBack = () => {
        if (currentStep > 1) { currentStep--; showStep(currentStep); }
    };

    window.saveSliderAndNext = () => {
        const rangeInput = document.getElementById('debt-range');
        const val = parseInt(rangeInput.value);
        userAnswers[currentStep] = (val >= 5050000) ? "Более 5 млн ₽" : val.toLocaleString('ru-RU') + " ₽";
        showStep(currentStep + 1);
    }

    window.nextQuizStep = (answer) => {
        userAnswers[currentStep] = answer;
        showStep(currentStep + 1);
    };

    window.submitQuiz = () => {
        const name = document.getElementById('user-name').value;
        const phone = document.getElementById('user-phone').value;
        const agreeCheckbox = document.getElementById('agreeCheckbox');
        const submitBtn = document.getElementById('submit-btn');

        if (name.length < 2) { alert("Введите имя"); return; }
        if (phone.length < 16) { alert("Введите корректный номер"); return; }
        if (!agreeCheckbox.checked) { alert("Подтвердите согласие"); return; }

        submitBtn.disabled = true;
        submitBtn.innerText = "⏳";

        // Имитация отправки
        setTimeout(() => {
             quizContainer.innerHTML = `
                <div class="text-center py-4">
                    <div style="font-size: 3rem;">✅</div>
                    <h4 class="fw-bold mt-2">Принято!</h4>
                    <p class="small text-muted">Мы скоро свяжемся с вами.</p>
                </div>
            `;
        }, 1000);
    };

    window.closeQuiz = () => {
        quizWrapper.classList.remove('active');
        setTimeout(() => { quizWrapper.style.display = 'none'; }, 300);
        introBlock.style.display = 'block';
        setTimeout(() => { introBlock.style.opacity = '1'; }, 50);
    };

    function applyPhoneMask() {
        const input = document.getElementById('user-phone');
        input.addEventListener('input', function(e) {
            let matrix = "+7 (___) ___ - __ - __", i = 0, def = matrix.replace(/\D/g, ""), val = this.value.replace(/\D/g, "");
            if (def.length >= val.length) val = def;
            this.value = matrix.replace(/./g, function(a) {
                return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
            });
        });
    }
});
