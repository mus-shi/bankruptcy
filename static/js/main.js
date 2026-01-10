document.addEventListener('DOMContentLoaded', function() {

    // === reCAPTCHA v3 ===
    const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';

    // === ЛОГИКА ТЕМНОЙ ТЕМЫ ===
    const themeLightBtn = document.getElementById('theme-light');
    const themeDarkBtn = document.getElementById('theme-dark');
    const body = document.body;

    // Проверяем сохраненную тему
    if (localStorage.getItem('theme') === 'dark') {
        enableDarkMode();
    }

    if (themeLightBtn && themeDarkBtn) {
        themeLightBtn.addEventListener('click', () => {
            disableDarkMode();
        });
        themeDarkBtn.addEventListener('click', () => {
            enableDarkMode();
        });
    }

    function enableDarkMode() {
        body.classList.add('dark-mode');
        themeDarkBtn.classList.add('active');
        themeLightBtn.classList.remove('active');
        localStorage.setItem('theme', 'dark');
    }

    function disableDarkMode() {
        body.classList.remove('dark-mode');
        themeLightBtn.classList.add('active');
        themeDarkBtn.classList.remove('active');
        localStorage.setItem('theme', 'light');
    }


    // === ЛИПКОЕ МЕНЮ (Sticky Header) ===
    const stickyHeader = document.getElementById('sticky-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            stickyHeader.classList.add('visible');
        } else {
            stickyHeader.classList.remove('visible');
        }
    });

    // Функция скролла и открытия квиза из липкого меню
    window.scrollToQuiz = function() {
        // Скроллим к якорю
        document.getElementById('cta-anchor').scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Открываем квиз (эмулируем клик по главной кнопке, если квиз еще закрыт)
        const quizWrapper = document.getElementById('quiz-wrapper');
        if (quizWrapper.style.display === 'none' || quizWrapper.style.display === '') {
            document.getElementById('show-form-btn').click();
        }
    };


    // === ЛОГИКА "ВЫПАДАЮЩЕГО" ОПРОСА ===
    const startBtn = document.getElementById('show-form-btn');
    const quizWrapper = document.getElementById('quiz-wrapper');
    const introBlock = document.getElementById('intro-text-block');

    if (startBtn && quizWrapper) {
        startBtn.addEventListener('click', () => {
            introBlock.style.opacity = '0';
            setTimeout(() => {
                introBlock.style.display = 'none';
                quizWrapper.style.display = 'block';
                setTimeout(() => {
                    quizWrapper.classList.add('active');
                }, 10);
            }, 300);
            showStep(1);
        });
    }

    // === КВИЗ ===
    const quizContainer = document.getElementById('quiz-container');

    const questions = {
        1: { text: "Общая сумма долга?", type: "slider" },
        2: { text: "Есть аресты на картах?", type: "boolean" },
        3: { text: "Есть ипотека или авто?", type: "boolean" },
        4: { text: "Куда прислать результат?", type: "final" }
    };

    let currentStep = 1;
    let userAnswers = {};

    function showStep(step) {
        currentStep = step;
        const progress = (step / 4) * 100;
        
        // Шапка квиза
        let html = `
            <div class="progress" style="height: 4px; margin-bottom: 20px;">
                <div class="progress-bar" role="progressbar" style="width: ${progress}%; background-color: var(--quiz-theme-color);"></div>
            </div>
            <div class="text-center mb-3">
                <h5 class="fw-bold mb-0">${questions[step].text}</h5>
            </div>
        `;

        if (questions[step].type === "slider") {
            html += `
                <div class="text-center px-2">
                    <span id="range-value-display" class="range-value-label">500 000 ₽</span>
                    <input type="range" class="form-range" id="debt-range" min="200000" max="5050000" step="50000" value="500000">
                    <div class="d-flex justify-content-between text-muted-custom small mt-1 mb-4" style="font-size: 0.7rem;">
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
                        <label class="form-check-label small text-muted-custom" for="agreeCheckbox" style="font-size: 0.7rem; line-height: 1.2;">
                            Согласен с <a href="/privacy" target="_blank">политикой конфиденциальности</a>
                        </label>
                    </div>
                    <button id="submit-btn" class="btn btn-success w-100 py-2 fw-bold shadow-sm" onclick="submitQuiz()">Получить разбор</button>
                </div>
            `;
        }
        
        quizContainer.innerHTML = html;

        if (questions[step].type === "slider") {
            const rangeInput = document.getElementById('debt-range');
            const rangeDisplay = document.getElementById('range-value-display');
            rangeInput.addEventListener('input', function() {
                const val = parseInt(this.value);
                if (val >= 5050000) rangeDisplay.textContent = "> 5 000 000 ₽";
                else rangeDisplay.textContent = val.toLocaleString('ru-RU') + " ₽";
            });
        }
        
        if (step === 4) applyPhoneMask();
    }

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

        grecaptcha.ready(() => {
            grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(token => {
                fetch('/consult', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        phone: phone,
                        agree: "Да",
                        total_debt: userAnswers[1] || "-",
                        arrests: userAnswers[2] || "-",
                        extra_property: userAnswers[3] || "-",
                        extra_car: "-",
                        'g-recaptcha-response': token
                    })
                })
                .then(response => {
                    if (response.ok) {
                        quizContainer.innerHTML = `
                            <div class="text-center py-4">
                                <div style="font-size: 3rem;">✅</div>
                                <h4 class="fw-bold mt-2">Принято!</h4>
                                <p class="small text-muted-custom">Я скоро позвоню вам.</p>
                            </div>
                        `;
                    } else {
                        alert("Ошибка. Попробуйте позже.");
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Попробовать снова";
                    }
                });
            });
        });
    };

    function applyPhoneMask() {
        const input = document.getElementById('user-phone');
        input.addEventListener('input', function(e) {
            let matrix = "+7 (___) ___ - __ - __",
                i = 0,
                def = matrix.replace(/\D/g, ""),
                val = this.value.replace(/\D/g, "");
            if (def.length >= val.length) val = def;
            this.value = matrix.replace(/./g, function(a) {
                return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
            });
        });
    }
});
