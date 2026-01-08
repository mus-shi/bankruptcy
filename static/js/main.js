document.addEventListener('DOMContentLoaded', function() {
    // === 1. ТЕМНАЯ ТЕМА ===
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
    }

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // === 2. ИНТЕРАКТИВНЫЙ КОЛОКОЛЬЧИК ===
    const stopCallsCard = document.getElementById('stop-calls-card');
    if (stopCallsCard) {
        stopCallsCard.addEventListener('click', function() {
            this.classList.toggle('muted-bell');
        });
    }

    // === 3. ЛОГИКА КВИЗА ===
    const showQuizBtn = document.getElementById('show-form-btn');
    const quizSection = document.getElementById('quiz-section');
    const quizContainer = document.getElementById('quiz-container');

    const questions = {
        1: { text: "Сумма ваших долгов более 200 000 ₽?", type: "boolean", icon: "https://img.icons8.com/color/48/coins.png" },
        2: { text: "Есть ли у вас просрочки по платежам?", type: "boolean", icon: "https://img.icons8.com/color/48/calendar.png" },
        3: { text: "Есть ли у вас имущество (кроме единственного жилья)?", type: "boolean", icon: "https://img.icons8.com/color/48/real-estate.png" },
        4: { text: "Введите данные для связи", type: "final" }
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
        const progress = (step / 4) * 100;
        let html = `<div class="progress mb-4"><div class="progress-bar" style="width: ${progress}%"></div></div>`;
        
        if (questions[step].icon) {
            html += `<div class="text-center"><img src="${questions[step].icon}" class="quiz-icon-small"></div>`;
        }
        
        html += `<h4 class="text-center mb-4">${questions[step].text}</h4>`;

        if (questions[step].type === "boolean") {
            html += `
                <div class="d-grid gap-2 col-md-8 mx-auto">
                    <button class="btn btn-outline-dark py-3" onclick="nextStep('Да')">Да</button>
                    <button class="btn btn-outline-dark py-3" onclick="nextStep('Нет')">Нет</button>
                </div>`;
        } else {
            html += `
                <div class="mb-3"><input type="text" id="user-name" class="form-control py-3" placeholder="Введите имя"></div>
                <div class="mb-3"><input type="tel" id="user-phone" class="form-control py-3" value="+7 "></div>
                <button class="btn btn-success w-100 py-3 fw-bold" onclick="finishQuiz()">Получить результат бесплатно</button>`;
        }
        quizContainer.innerHTML = html;
        if (step === 4) initPhoneMask();
    }

    window.nextStep = (val) => {
        answers[currentStep] = val;
        showStep(currentStep + 1);
    };

    function initPhoneMask() {
        const phoneInput = document.getElementById('user-phone');
        phoneInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
            e.target.value = !x[2] ? x[1] === '7' ? '+7 ' : '+7 ' : '+7 (' + x[2] + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
        });
    }

    window.finishQuiz = () => {
        const name = document.getElementById('user-name').value;
        const phone = document.getElementById('user-phone').value;
        if (name.length < 2 || phone.length < 16) return alert("Пожалуйста, заполните данные корректно");
        
        // Здесь имитация отправки
        quizContainer.innerHTML = "<div class='text-center'><h3>Спасибо!</h3><p>Я свяжусь с вами в течение 15 минут.</p></div>";
    };
});
