document.addEventListener('DOMContentLoaded', function() {
    // === 1. ЛОГИКА ТЕМНОЙ ТЕМЫ ===
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Проверка сохраненной темы
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode'); // Убедимся, что светлая тема по умолчанию
    }

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // === 2. ИНТЕРАКТИВНЫЙ КОЛОКОЛЬЧИК ===
    const stopCallsCard = document.getElementById('stop-calls-card');
    const bellImg = document.getElementById('bell-img');

    if (stopCallsCard && bellImg) {
        const iconNormal = "https://img.icons8.com/color/48/appointment-reminders.png";
        const iconMuted = "https://img.icons8.com/color/48/silent.png";

        stopCallsCard.addEventListener('click', function() {
            if (bellImg.src.includes('appointment-reminders')) {
                bellImg.src = iconMuted;
                this.querySelector('strong').textContent = 'Звонки отключены';
                this.querySelector('.text-muted').textContent = 'Тишина гарантирована';
            } else {
                bellImg.src = iconNormal;
                this.querySelector('strong').textContent = 'Стоп звонки коллекторов';
                this.querySelector('.text-muted').textContent = 'С первого дня — тишина';
            }
            // Анимация подсветки
            this.classList.add('muted-active');
            setTimeout(() => this.classList.remove('muted-active'), 300);
        });
    }

    // === 3. ПОЛНАЯ ЛОГИКА КВИЗА ===
    const startBtn = document.getElementById('show-form-btn');
    const quizSection = document.getElementById('quiz-section');
    const quizContainer = document.getElementById('quiz-container');

    const questions = {
        1: { 
            text: "Какова общая сумма ваших задолженностей?", 
            type: "boolean", 
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

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            quizSection.style.display = 'block';
            quizSection.scrollIntoView({ behavior: 'smooth' });
            showStep(1);
        });
    }

    function showStep(step) {
        currentStep = step;
        const progress = (step / 4) * 100;
        
        let html = `
            <div class="progress mb-4" style="height: 10px; border-radius: 10px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style="width: ${progress}%; background-color: #1e3a5f;"></div>
            </div>
            <div class="text-center mb-4">
                ${questions[step].icon ? `<img src="${questions[step].icon}" class="quiz-icon-small mb-3" style="width:40px;">` : ''}
                <h4 class="fw-bold">${questions[step].text}</h4>
            </div>
        `;

        if (questions[step].type === "boolean") {
            html += `
                <div class="d-grid gap-3 col-md-10 mx-auto">
                    <button class="btn btn-outline-dark py-3 fw-medium" onclick="nextQuizStep('Да')">Да, подходит</button>
                    <button class="btn btn-outline-dark py-3 fw-medium" onclick="nextQuizStep('Нет / Не знаю')">Нет / Не знаю</button>
                </div>
            `;
        } else {
            html += `
                <div class="col-md-10 mx-auto">
                    <div class="mb-3">
                        <label class="form-label small text-muted">Ваше имя</label>
                        <input type="text" id="user-name" class="form-control form-control-lg" placeholder="Напр: Иван">
                    </div>
                    <div class="mb-4">
                        <label class="form-label small text-muted">Номер телефона</label>
                        <input type="tel" id="user-phone" class="form-control form-control-lg" value="+7 ">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="agreeCheckbox" required>
                        <label class="form-check-label small" for="agreeCheckbox">
                            Я ознакомился с <a href="/offer" target="_blank">публичной офертой</a> и <a href="/privacy" target="_blank">политикой конфиденциальности</a>
                        </label>
                    </div>
                    <button class="btn btn-success w-100 py-3 fw-bold shadow-sm" onclick="submitQuiz()">Получить результат анализа →</button>
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

        // Отправка данных на сервер
        fetch('/consult', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                agree: "Да",
                total_debt: "under200k", // можно сделать динамичным
                arrests: "Не указано",
                extra_property: "Не указано",
                extra_car: "Не указано",
                'g-recaptcha-response': '' // если нужен reCAPTCHA — добавьте его
            })
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
                throw new Error('Ошибка отправки');
            }
        })
        .catch(err => {
            alert("Произошла ошибка. Попробуйте ещё раз или позвоните нам.");
            console.error(err);
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
