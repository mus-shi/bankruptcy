document.addEventListener('DOMContentLoaded', function() {

  // === reCAPTCHA v3 ===
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';
  
  // === ЛОГИКА "ВЫПАДАЮЩЕГО" ОПРОСА ===
  const startBtn = document.getElementById('show-form-btn');
  const quizWrapper = document.getElementById('quiz-wrapper');
  const introBlock = document.getElementById('intro-text-block');
  
  if (startBtn && quizWrapper) {
    startBtn.addEventListener('click', () => {
      introBlock.style.display = 'none';
      quizWrapper.style.display = 'flex'; // Используем flex для min-height выравнивания
      setTimeout(() => {
        quizWrapper.classList.add('active');
      }, 10);
      showStep(1);
    });
  }
  
  // === КВИЗ ===
  const quizContainer = document.getElementById('quiz-container');
  
  // (Пункт 7) Добавлены иконки для ВСЕХ шагов
  const questions = {
    1: {
      text: "Общая сумма долга?",
      type: "slider",
      icon: "https://img.icons8.com/color/64/coins.png"
    },
    2: {
      text: "Есть аресты на картах?",
      type: "boolean",
      icon: "https://img.icons8.com/color/64/calendar.png"
    },
    3: {
      text: "Есть ипотека или авто?",
      type: "boolean",
      icon: "https://img.icons8.com/color/64/real-estate.png"
    },
    4: {
      text: "Куда прислать результат?",
      type: "final",
      icon: "https://img.icons8.com/color/64/ok.png" // Добавлена иконка
    }
  };
  
  let currentStep = 1;
  let userAnswers = {};
  
  function showStep(step) {
    currentStep = step;
    const progress = (step / 4) * 100;
    const q = questions[step];
  
    // Шапка квиза с кнопкой "Назад" и ИКОНКОЙ
    let html = `
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated"
             role="progressbar" style="width: ${progress}%; background-color: #1e3a5f;"></div>
      </div>
      
      <div class="text-center mb-3">
         <img src="${q.icon}" alt="Icon" class="quiz-step-icon">
      </div>
  
      <div class="quiz-header-with-back">
        ${step > 1 ? `<button class="quiz-back-btn" onclick="goBack()">← Назад</button>` : '<div></div>'}
        <div class="text-center flex-grow-1">
          <h5 class="fw-bold mb-0">${q.text}</h5>
        </div>
        <div></div> </div>
    `;
  
    // ТЕЛО ВОПРОСА
    html += `<div style="flex-grow: 1;">`; // Растягиваем контент
  
    if (q.type === "slider") {
      html += `
        <div class="text-center px-2 mt-4">
          <span id="range-value-display" class="range-value-label">500 000 ₽</span>
          <input type="range" class="form-range" id="debt-range" min="200000" max="5050000" step="50000" value="500000">
          <div class="d-flex justify-content-between text-muted small mt-1 mb-4" style="font-size: 0.7rem;">
            <span>200к</span>
            <span>> 5 млн</span>
          </div>
          <button class="btn btn-start-online w-100 py-2" onclick="saveSliderAndNext()">Далее</button>
        </div>
      `;
    } else if (q.type === "boolean") {
      html += `
        <div class="quiz-grid-options mt-3">
          <button class="btn-quiz-option" onclick="nextQuizStep('Да')">Да</button>
          <button class="btn-quiz-option" onclick="nextQuizStep('Нет')">Нет</button>
        </div>
      `;
    } else {
      // ФОРМА КОНТАКТОВ
      html += `
        <div class="px-2 mt-3">
          <div class="mb-3">
            <input type="text" id="user-name" class="form-control" placeholder="Ваше имя">
          </div>
          <div class="mb-3">
            <input type="tel" id="user-phone" class="form-control" value="+7 ">
          </div>
          <div class="form-check mb-4">
            <input class="form-check-input" type="checkbox" id="agreeCheckbox" required>
            <label class="form-check-label small text-muted" for="agreeCheckbox" style="font-size: 0.8rem; line-height: 1.2;">
              Согласен с <a href="/privacy" target="_blank">политикой конфиденциальности</a>
            </label>
          </div>
          <button id="submit-btn" class="btn btn-success w-100 py-2 fw-bold shadow-sm" onclick="submitQuiz()">Получить разбор</button>
        </div>
      `;
    }
  
    html += `</div>`; // Закрываем flex-grow блок
    quizContainer.innerHTML = html;
  
    // Логика слайдера
    if (q.type === "slider") {
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
              <div class="text-center py-5 d-flex flex-column justify-content-center h-100">
                <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
                <h4 class="fw-bold">Принято!</h4>
                <p class="text-muted">Я скоро позвоню вам.</p>
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
