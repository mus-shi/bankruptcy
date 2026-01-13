document.addEventListener('DOMContentLoaded', function() {

    // === reCAPTCHA v3 ===
    const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';
    
    // === ЛОГИКА "ВЫПАДАЮЩЕГО" ОПРОСА ===
    const startBtn = document.getElementById('show-form-btn');
    const quizWrapper = document.getElementById('quiz-wrapper');
    const introBlock = document.getElementById('intro-text-block');
    
    if (startBtn && quizWrapper) {
      startBtn.addEventListener('click', () => {
        // 1. Скрываем кнопку и текст
        introBlock.style.display = 'none';
    
        // 2. Показываем блок опроса
        quizWrapper.style.display = 'block';
    
        // 3. Запускаем анимацию
        setTimeout(() => {
          quizWrapper.classList.add('active');
        }, 10);
    
        // 4. Инициализируем 1 шаг
        showStep(1);
      });
    }
    
    // === КВИЗ ===
    const quizContainer = document.getElementById('quiz-container');
    
    // Данные вопросов (иконки убрали из JS, так как они теперь не используются в шагах квиза в этом виде, но структура сохранена)
    const questions = {
      1: {
        text: "Общая сумма долга?",
        type: "slider"
      },
      2: {
        text: "Есть аресты на картах?",
        type: "boolean"
      },
      3: {
        text: "Есть ипотека или авто?",
        type: "boolean"
      },
      4: {
        text: "Куда прислать результат?",
        type: "final"
      }
    };
    
    let currentStep = 1;
    let userAnswers = {};
    
    function showStep(step) {
      currentStep = step;
      const progress = (step / 4) * 100;
    
      // Шапка квиза: Шкала + Кнопка Назад + Вопрос
      // Кнопку "Закрыть" (X) мы вынесли в HTML выше контейнера, чтобы она не прыгала
      let html = `
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated"
               role="progressbar" style="width: ${progress}%;"></div>
        </div>
        
        <div class="d-flex justify-content-between align-items-center mb-3">
          ${step > 1 ? `<button class="quiz-back-btn" onclick="goBack()">← Назад</button>` : '<div></div>'}
        </div>
        
        <div class="text-center mb-4">
          <h5 class="fw-bold mb-0" style="font-family: 'Playfair Display', serif;">${questions[step].text}</h5>
        </div>
      `;
    
      if (questions[step].type === "slider") {
        // ПОЛЗУНОК
        html += `
          <div class="text-center px-2">
            <span id="range-value-display" class="range-value-label">500 000 ₽</span>
            <input type="range" class="form-range" id="debt-range" min="200000" max="5050000" step="50000" value="500000">
            <div class="d-flex justify-content-between text-muted small mt-1 mb-4" style="font-size: 0.75rem;">
              <span>200к</span>
              <span>> 5 млн</span>
            </div>
            <button class="btn btn-start-online w-100 py-2" onclick="saveSliderAndNext()">Далее</button>
          </div>
        `;
      } else if (questions[step].type === "boolean") {
        // КНОПКИ ДА/НЕТ
        html += `
          <div class="quiz-grid-options">
            <button class="btn-quiz-option" onclick="nextQuizStep('Да')">Да</button>
            <button class="btn-quiz-option" onclick="nextQuizStep('Нет')">Нет</button>
          </div>
        `;
      } else {
        // ФОРМА КОНТАКТОВ
        html += `
          <div class="px-2">
            <div class="mb-3">
              <input type="text" id="user-name" class="form-control" placeholder="Ваше имя">
            </div>
            <div class="mb-3">
              <input type="tel" id="user-phone" class="form-control" value="+7 ">
            </div>
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="agreeCheckbox" required>
              <label class="form-check-label small text-muted" for="agreeCheckbox" style="font-size: 0.75rem; line-height: 1.3;">
                Согласен с <a href="/privacy" target="_blank">политикой конфиденциальности</a>
              </label>
            </div>
            <button id="submit-btn" class="btn btn-success w-100 py-2 fw-bold shadow-sm" onclick="submitQuiz()">Получить разбор</button>
          </div>
        `;
      }
    
      quizContainer.innerHTML = html;
    
      // Логика слайдера
      if (questions[step].type === "slider") {
        const rangeInput = document.getElementById('debt-range');
        const rangeDisplay = document.getElementById('range-value-display');
        rangeInput.addEventListener('input', function() {
          const val = parseInt(this.value);
          if (val >= 5050000) rangeDisplay.textContent = "> 5 000 000 ₽";
          else rangeDisplay.textContent = val.toLocaleString('ru-RU') + " ₽";
        });
      }
    
      // Маска телефона на последнем шаге
      if (step === 4) applyPhoneMask();
    }
    
    // Глобальные функции для кнопок внутри HTML-строк
    window.goBack = () => {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
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
                  <p class="small text-muted">Я скоро позвоню вам.</p>
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
      if(!input) return;
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
