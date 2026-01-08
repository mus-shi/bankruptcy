document.addEventListener('DOMContentLoaded', function() {

    // === 1. КНОПКА "НАЧАТЬ ОНЛАЙН" ===
    const startBtn = document.getElementById('show-form-btn');
    const quizSection = document.getElementById('quiz-section');
    const hideQuizBtn = document.getElementById('hide-quiz-btn');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            quizSection.style.display = 'block';
            quizSection.scrollIntoView({ behavior: 'smooth' });
            showStep(1);
        });
    }

    if (hideQuizBtn) {
        hideQuizBtn.addEventListener('click', () => {
            quizSection.style.display = 'none';
        });
    }

    // === 2. ПОЛНАЯ ЛОГИКА КВИЗА ===
    const quizContainer = document.getElementById('quiz-container');

    const questions = {
        1: { 
            text: "Какова общая сумма ваших задолженностей?", 
            type: "debt", 
            icon: "https://img.icons8.com/color/48/coins.png" 
        },
        2: { 
            text: "Имеются ли у вас открытые просрочки?", 
            type: "boolean", 
            icon: "https://img.icons8.com/color/48/calendar.png" 
        },
        3: { 
            text: "Есть ли имущество в собственности (кроме единственного жилья)?", 
            type: "boolean", 
            icon: "https://img.icons8.com/color/48/real-estate.png" 
        },
        4: { 
            text: "Оставьте ваши контакты для бесплатного анализа ситуации", 
            type: "final" 
        }
    };

    let currentStep = 1;
    let userAnswers = {};

    function showStep(step) {
        currentStep = step;
        const progress = (step / 4) * 100;
        
        let html = `
            <div class="progress mb-3" style="height: 6px; border-radius: 3px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style="width: ${progress}%; background-color: #1e3a5f;"></div>
            </div>
            <div class="text-center mb-4">
                ${questions[step].icon ? `<img src="${questions[step].icon}" class="quiz-icon-small mb-3" style="width:40px;">` : ''}
                <h4 class="fw-bold">${questions[step].text}</h4>
            </div>
        `;

        if (questions[step].type === "debt") {
            html += `
                <div class="d-grid gap-2 col-md-8 mx-auto">
                    <button class="btn btn-outline-primary btn-xs py-2 fw-medium" onclick="nextQuizStep('under200k')">Менее 200 тыс. ₽</button>
                    <button class="btn btn-outline-primary btn-xs py-2 fw-medium" onclick="nextQuizStep('200k-500k')">От 200 до 500 тыс. ₽</button>
                    <button class="btn btn-outline-primary btn-xs py-2 fw-medium" onclick="nextQuizStep('500k-1m')">От 500 тыс. до 1 млн ₽</button>
                    <button class="btn btn-outline-primary btn-xs py-2 fw-medium" onclick="nextQuizStep('over1m')">Свыше 1 млн ₽</button>
                </div>
            `;
        } else if (questions[step].type === "boolean") {
            html += `
                <div class="d-grid gap-2 col-md-6 mx-auto">
                    <button class="btn btn-outline-primary btn-xs py-2 fw-medium" onclick="nextQuizStep('Да')">Да</button>
                    <button class="btn btn-outline-primary btn-xs py-2 fw-medium" onclick="nextQuizStep('Нет')">Нет</button>
                </div>
            `;
        } else {
            html += `
                <div class="col-md-8 mx-auto">
                    <div class="mb-3">
                        <label class="form-label small text-muted">Ваше имя</label>
                        <input type="text" id="user-name" class="form-control form-control-sm" placeholder="Напр: Иван">
                    </div>
                    <div class="mb-4">
                        <label class="form-label small text-muted">Номер телефона</label>
                        <input type="tel" id="user-phone" class="form-control form-control-sm" value="+7 ">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="agreeCheckbox" required>
                        <label class="form-check-label small" for="agreeCheckbox">
                            Я ознакомился с <a href="/offer" target="_blank">публичной офертой</a> и <a href="/privacy" target="_blank">политикой конфиденциальности</a>
                        </label>
                    </div>
                    <div class="mb-3">
                        <div class="g-recaptcha" data-sitekey="6Lc_4kIsAAAAABoxguHakNk3gp3xBTKplzgoduqB"></div>
                    </div>
                    <button class="btn btn-success w-100 py-2 fw-bold shadow-sm" onclick="submitQuiz()">Получить результат анализа →</button>
                    <p class="text-center small text-muted mt-3">🔒 Ваши данные защищены и не будут переданы третьим лицам</p>
                </div>
            `;
        }
        
        quizContainer.innerHTML = html;
        if (step === 4) applyPhoneMask();
    }

    // Глобальные функции для кнопок в HTML (через onclick)
    window.nextQuizStep = (answer) => {
        userAnswers[currentStep] = answer;
        showStep(currentStep + 1);
    };

    window.submitQuiz = () => {
        const name = document.getElementById('user-name').value;
        const phone = document.getElementById('user-phone').value;
        const agreeCheckbox = document.getElementById('agreeCheckbox');
        const recaptchaResponse = grecaptcha.getResponse();

        if (name.length < 2) {
            alert("Пожалуйста, введите ваше имя");
            return;
        }
        if (phone.length < 16) {
            alert("Пожалуйста, введите корректный номер телефона");
            return;
        }
        if (!agreeCheckbox.checked) {
            alert("Пожалуйста, подтвердите, что вы ознакомились с офертой и политикой конфиденциальности");
            return;
        }
        if (!recaptchaResponse) {
            alert("Пожалуйста, пройдите reCAPTCHA");
            return;
        }

        // Создаем FormData
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('agree', "Да");
        formData.append('total_debt', userAnswers[1] || "under200k");
        formData.append('arrests', userAnswers[2] || "Не указано");
        formData.append('extra_property', userAnswers[3] || "Не указано");
        formData.append('extra_car', "Не указано");
        formData.append('g-recaptcha-response', recaptchaResponse);

        // Отправка данных на сервер
        fetch('/consult', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                quizContainer.innerHTML = `
                    <div class="text-center py-5">
                        <img src="https://img.icons8.com/color/96/ok--v1.png" class="mb-4">
                        <h2 class="fw-bold">Заявка принята!</h2>
                        <p class="text-muted">Спасибо, ${name}. Я изучу ваши ответы и перезвоню вам в течение 15 минут для консультации.</p>
                        <a href="/thanks" class="btn btn-link mt-3">← Вернуться на главную</a>
                    </div>
                `;
            } else {
                throw new Error('Ошибка сервера');
            }
        })
        .catch(err => {
            alert("Произошла ошибка. Попробуйте ещё раз или позвоните нам.");
            console.error("Ошибка отправки:", err);
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

    // === 3. АНИМАЦИЯ ДЛЯ ШАГОВ ПРОЦЕДУРЫ ===
    const processSteps = document.querySelectorAll('.process-step');
    processSteps.forEach(step => {
        step.addEventListener('mouseenter', () => {
            step.style.transform = 'translateY(-8px)';
            step.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
        });
        step.addEventListener('mouseleave', () => {
            step.style.transform = 'translateY(0)';
            step.style.boxShadow = 'none';
        });
    });

});
