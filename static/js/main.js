document.addEventListener('DOMContentLoaded', function() {

    // === reCAPTCHA v3 ===
    const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';

    // === КНОПКА "НАЧАТЬ ОНЛАЙН" ===
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

    // === КВИЗ ===
    const quizContainer = document.getElementById('quiz-container');

    const questions = {
        1: { 
            text: "Какова общая сумма ваших задолженностей?", 
            type: "slider", // Новый тип
            icon: "https://img.icons8.com/color/48/coins.png" 
        },
        2: { 
            text: "Есть ли у вас аресты на счетах (картах)?", 
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

    // Глобальная функция инициализации квиза (для вызова из HTML если нужно)
    window.initQuiz = function() {
        showStep(1);
    }

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

        if (questions[step].type === "slider") {
            // ЛОГИКА СЛАЙДЕРА
            html += `
                <div class="col-md-8 mx-auto text-center">
                    <span id="range-value-display" class="range-value-label">500 000 ₽</span>
                    <input type="range" class="form-range" id="debt-range" min="200000" max="5050000" step="50000" value="500000">
                    <div class="d-flex justify-content-between text-muted small mt-2">
                        <span>200 тыс.</span>
                        <span>> 5 млн</span>
                    </div>
                    <button class="btn btn-primary mt-4 px-5 py-2 fw-bold" onclick="saveSliderAndNext()">Далее →</button>
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
                    <button id="submit-btn" class="btn btn-success w-100 py-2 fw-bold shadow-sm" onclick="submitQuiz()">Получить результат анализа →</button>
                    <p class="text-center small text-muted mt-3">🔒 Ваши данные защищены и не будут переданы третьим лицам</p>
                </div>
            `;
        }
        
        quizContainer.innerHTML = html;

        // Обработчик ползунка
        if (questions[step].type === "slider") {
            const rangeInput = document.getElementById('debt-range');
            const rangeDisplay = document.getElementById('range-value-display');
            
            rangeInput.addEventListener('input', function() {
                const val = parseInt(this.value);
                if (val >= 5050000) {
                    rangeDisplay.textContent = "Более 5 000 000 ₽";
                } else {
                    rangeDisplay.textContent = val.toLocaleString('ru-RU') + " ₽";
                }
            });
        }
        
        if (step === 4) applyPhoneMask();
    }

    // Сохранение значения слайдера
    window.saveSliderAndNext = () => {
        const rangeInput = document.getElementById('debt-range');
        const val = parseInt(rangeInput.value);
        let textVal = "";
        
        if (val >= 5050000) {
            textVal = "Более 5 млн ₽";
        } else {
            textVal = val.toLocaleString('ru-RU') + " ₽";
        }
        
        userAnswers[currentStep] = textVal;
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

        // Блокируем кнопку
        submitBtn.disabled = true;
        submitBtn.innerText = "Отправка...";

        // Получаем токен reCAPTCHA
        grecaptcha.ready(() => {
            grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(token => {
                fetch('/consult', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        phone: phone,
                        agree: "Да",
                        total_debt: userAnswers[1] || "Не указано",
                        arrests: userAnswers[2] || "Не указано",
                        extra_property: userAnswers[3] || "Не указано",
                        extra_car: "Не указано",
                        'g-recaptcha-response': token
                    })
                })
                .then(response => {
                    if (response.ok) {
                        // УСПЕХ: Показываем сообщение прямо в окне (вместо редиректа)
                        quizContainer.innerHTML = `
                            <div class="text-center py-5">
                                <div style="width: 80px; height: 80px; background: #d1e7dd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#198754" stroke-width="2">
                                        <path d="M20 6L9 17l-5-5"/>
                                    </svg>
                                </div>
                                <h3 class="mb-3" style="font-family: 'Playfair Display', serif;">Спасибо!</h3>
                                <p class="lead mb-4">Ваша заявка успешно принята.</p>
                                <p class="text-muted">Я свяжусь с вами в ближайшее время по указанному номеру, чтобы обсудить детали вашей ситуации.</p>
                            </div>
                        `;
                    } else {
                        alert("Произошла ошибка. Попробуйте ещё раз или позвоните нам.");
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Получить результат анализа →";
                    }
                })
                .catch(err => {
                    alert("Произошла ошибка. Попробуйте ещё раз или позвоните нам.");
                    console.error(err);
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Получить результат анализа →";
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

    // Анимация шагов (если остались старые элементы с классом process-step)
    document.querySelectorAll('.process-step').forEach(step => {
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
