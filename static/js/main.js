document.addEventListener('DOMContentLoaded', function() {
    
    // Форматирование чисел (например, 1 000 000 ₽)
    function formatCurrency(number) {
        return new Intl.NumberFormat('ru-RU').format(number) + ' ₽';
    }

    // --- ЛОГИКА КАЛЬКУЛЯТОРА НА ВТОРОМ ЭКРАНЕ ---
    const calcSlider = document.getElementById('calcDebtSlider');
    const calcDebtValue = document.getElementById('calcDebtValue');
    const calcSavedValue = document.getElementById('calcSavedValue');
    
    // Стоимость процедуры условно зафиксируем для расчета экономии (можно менять логику)
    const PROCEDURE_COST = 120000; 

    calcSlider.addEventListener('input', function() {
        let debt = parseInt(this.value);
        calcDebtValue.textContent = formatCurrency(debt);
        
        let saved = debt - PROCEDURE_COST;
        if (saved < 0) saved = 0;
        calcSavedValue.textContent = formatCurrency(saved);
    });

    // --- ЛОГИКА КВИЗА (МОДАЛЬНОЕ ОКНО) ---
    const quizOverlay = document.getElementById('quizOverlay');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const calcToQuizBtn = document.getElementById('calcToQuizBtn');
    const quizClose = document.getElementById('quizClose');
    
    const quizSlider = document.getElementById('quizDebtSlider');
    const quizDebtValue = document.getElementById('quizDebtValue');
    const hiddenDebt = document.getElementById('hiddenDebt');

    // Функция открытия квиза
    function openQuiz() {
        quizOverlay.classList.add('show');
    }

    // Открытие квиза с главного экрана
    startQuizBtn.addEventListener('click', openQuiz);

    // Открытие квиза из калькулятора (проброс суммы в квиз)
    calcToQuizBtn.addEventListener('click', function() {
        let selectedDebt = calcSlider.value;
        quizSlider.value = selectedDebt;
        quizDebtValue.textContent = formatCurrency(selectedDebt);
        hiddenDebt.value = selectedDebt;
        openQuiz();
    });

    // Закрытие квиза
    quizClose.addEventListener('click', function() {
        quizOverlay.classList.remove('show');
    });

    // Обновление суммы внутри самого квиза
    quizSlider.addEventListener('input', function() {
        quizDebtValue.textContent = formatCurrency(this.value);
        hiddenDebt.value = this.value;
    });

    // --- НАВИГАЦИЯ ВНУТРИ КВИЗА ---
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const quizCityInput = document.getElementById('quizCity');
    const hiddenCity = document.getElementById('hiddenCity');

    nextButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Проверка поля город на втором шаге перед переходом к шагу 3
            if (this.getAttribute('data-next') === 'step3') {
                if (quizCityInput.value.trim() === '') {
                    quizCityInput.classList.add('is-invalid');
                    return; // Не пускаем дальше, если город не введен
                } else {
                    quizCityInput.classList.remove('is-invalid');
                    hiddenCity.value = quizCityInput.value.trim(); // Сохраняем для отправки
                }
            }

            const currentStep = this.closest('.quiz-step');
            const nextStepId = this.getAttribute('data-next');
            const nextStep = document.getElementById(nextStepId);
            
            currentStep.classList.add('d-none');
            currentStep.classList.remove('active');
            
            nextStep.classList.remove('d-none');
            nextStep.classList.add('active');
        });
    });

    prevButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.quiz-step');
            const prevStepId = this.getAttribute('data-prev');
            const prevStep = document.getElementById(prevStepId);
            
            currentStep.classList.add('d-none');
            currentStep.classList.remove('active');
            
            prevStep.classList.remove('d-none');
            prevStep.classList.add('active');
        });
    });
    
    // Снимаем красную обводку ошибки при вводе города
    quizCityInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.classList.remove('is-invalid');
        }
    });

});
