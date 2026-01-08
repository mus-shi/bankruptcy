document.addEventListener('DOMContentLoaded', function() {
    const showQuizBtn = document.getElementById('show-form-btn');
    const quizSection = document.getElementById('quiz-section');
    const quizContainer = document.getElementById('quiz-container');

    if (showQuizBtn) {
        showQuizBtn.addEventListener('click', () => {
            quizSection.style.display = 'block';
            quizSection.scrollIntoView({ behavior: 'smooth' });
            showStep(1);
        });
    }

    const questions = {
        1: { text: "Есть ли у вас долги от 200 000 ₽?", type: "boolean", icon: "https://img.icons8.com/color/48/coins.png" },
        2: { text: "Есть ли у вас аресты на счетах или картах?", type: "boolean", icon: "https://img.icons8.com/color/48/bank-card-backside.png" },
        3: { text: "Есть ли у вас недвижимость?", type: "boolean", icon: "https://img.icons8.com/color/48/real-estate.png" },
        4: { text: "Есть ли у вас автомобиль?", type: "boolean", icon: "https://img.icons8.com/color/48/car.png" },
        5: { text: "Последний шаг: Ваши контакты", type: "final" }
    };

    let currentStep = 1;
    let answers = {};

    function showStep(step) {
        currentStep = step;
        const progress = (step / 5) * 100;
        let html = `<div class="progress"><div class="progress-bar" style="width: ${progress}%"></div></div>`;
        
        if (questions[step].icon) {
            html += `<div class="text-center"><img src="${questions[step].icon}" class="quiz-icon-small"></div>`;
        }
        
        html += `<h4 class="text-center mb-4">${questions[step].text}</h4>`;

        if (questions[step].type === "boolean") {
            html += `
                <div class="d-grid gap-2 col-md-8 mx-auto">
                    <button class="btn btn-outline-dark py-3" onclick="next(${step}, 'Да')">Да</button>
                    <button class="btn btn-outline-dark py-3" onclick="next(${step}, 'Нет')">Нет</button>
                </div>
            `;
        } else {
            html += `
                <div class="mb-3 text-start"><label class="small fw-bold">Ваше имя</label>
                <input type="text" id="final-name" class="form-control" placeholder="Введите имя"></div>
                <div class="mb-3 text-start"><label class="small fw-bold">Телефон или WhatsApp</label>
                <input type="tel" id="final-phone" class="form-control" value="+7 "></div>
                <div class="form-check text-start mb-4">
                    <input class="form-check-input" type="checkbox" id="agree" checked>
                    <label class="form-check-label small" for="agree">
                        Я принимаю условия <a href="/offer" target="_blank">публичной оферты</a>
                    </label>
                </div>
                <button class="btn btn-success w-100 py-3" onclick="finish()">Получить консультацию</button>
                <div class="text-center mt-3"><a href="#" class="text-muted small" onclick="closeQuiz()">← Вернуться позже</a></div>
            `;
        }
        quizContainer.innerHTML = html;
        if(step === 5) initMask();
    }

    window.next = (s, v) => { answers[s] = v; showStep(s+1); };
    window.closeQuiz = () => { quizSection.style.display = 'none'; };

    function initMask() {
        const input = document.getElementById('final-phone');
        input.addEventListener('input', () => {
            let value = input.value.replace(/\D/g, '');
            if (value.startsWith('7')) value = value.slice(1);
            if (value.startsWith('8')) value = value.slice(1);
            input.value = '+7 ' + value.substring(0, 10);
        });
    }

    window.finish = function() {
        const name = document.getElementById('final-name').value;
        const phone = document.getElementById('final-phone').value;
        const agree = document.getElementById('agree').checked;
        if(!name || phone.length < 13 || !agree) return alert('Заполните данные и примите условия');
        
        fetch('/consult', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, phone, ...answers })
        }).then(() => window.location.href = '/thanks');
    };
});
// Логика переключения темы
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

// Проверяем, сохранена ли тема в браузере
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Сохраняем выбор
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});
