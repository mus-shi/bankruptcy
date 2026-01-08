document.addEventListener('DOMContentLoaded', function() {
    // === 1. ЛОГИКА ТЕМНОЙ ТЕМЫ ===
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Проверка сохраненной темы
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
    }

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // === 2. ИНТЕРАКТИВНЫЙ КОЛОКОЛЬЧИК ===
    const stopCallsCard = document.getElementById('stop-calls-card');
    const bellImg = document.getElementById('bell-img');
    
    const iconNormal = "https://img.icons8.com/color/48/appointment-reminders.png";
    const iconMuted = "https://img.icons8.com/color/48/silent.png";

    if (stopCallsCard && bellImg) {
        stopCallsCard.addEventListener('click', function() {
            // Переключаем картинку
            bellImg.src = (bellImg.src === iconNormal) ? iconMuted : iconNormal;
            // Добавляем класс для доп. эффектов если нужно
            this.classList.toggle('muted-active');
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

        if (name.length < 2) {
            alert("Пожалуйста, введите ваше имя");
            return;
        }
        if (phone.length < 16) {
            alert("Пожалуйста, введите корректный номер телефона");
            return;
        }

        // Финальный экран
        quizContainer.innerHTML = `
            <div class="text-center py-5">
                <img src="https://img.icons8.com/color/96/ok--v1.png" class="mb-4">
                <h2 class="fw-bold">Заявка принята!</h2>
                <p class="text-muted">Спасибо, ${name}. Я изучу ваши ответы и перезвоню вам в течение 15 минут для консультации.</p>
                <button class="btn btn-link mt-3" onclick="location.reload()">Вернуться на главную</button>
            </div>
        `;
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
