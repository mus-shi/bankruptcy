document.addEventListener('DOMContentLoaded', () => {

    const startBtn = document.getElementById('show-form-btn');
    const quizSection = document.getElementById('quiz-section');
    const quizContainer = document.getElementById('quiz-container');

    let step = 1;

    startBtn.addEventListener('click', () => {
        quizSection.style.display = 'block';
        quizSection.scrollIntoView({behavior: 'smooth'});
        renderStep();
    });

    function renderStep() {
        if (step < 3) {
            quizContainer.innerHTML = `
                <h4 class="mb-4">Вопрос ${step}</h4>
                <button class="btn btn-outline-dark m-2" onclick="nextStep()">Да</button>
                <button class="btn btn-outline-dark m-2" onclick="nextStep()">Нет</button>
            `;
        } else {
            quizContainer.innerHTML = `
                <input id="name" class="form-control mb-3" placeholder="Ваше имя">
                <input id="phone" class="form-control mb-4" placeholder="+7 (___) ___-__-__">
                <button class="btn btn-success w-100" onclick="submitQuiz()">Отправить</button>
            `;
        }
    }

    window.nextStep = () => {
        step++;
        renderStep();
    };

    window.submitQuiz = () => {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (name.length < 2 || phone.length < 10) {
            alert('Заполните имя и телефон');
            return;
        }

        grecaptcha.ready(() => {
            grecaptcha.execute('6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK', {action: 'submit'})
                .then(token => {
                    fetch('/consult', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            name,
                            phone,
                            total_debt: 'Менее 200 тыс ₽',
                            'g-recaptcha-response': token
                        })
                    }).then(res => {
                        if (res.ok) {
                            window.location.href = '/thanks';
                        } else {
                            alert('Ошибка отправки');
                        }
                    });
                });
        });
    };
});
