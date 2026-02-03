document.addEventListener('DOMContentLoaded', () => {
  // === reCAPTCHA v3 ===
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';

  // === ЭЛЕМЕНТЫ ===
  const startBtn = document.getElementById('show-form-btn');
  const introBlock = document.getElementById('intro-text-block');

  const quizOverlay = document.getElementById('quiz-overlay');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  if (!quizOverlay || !quizContainer) return;

  // === ШАГИ (под backend /consult) ===
  const steps = [
    { key: 'total_debt', text: 'Общая сумма долга?', type: 'slider' },
    { key: 'arrests', text: 'Есть аресты на картах/счетах?', type: 'boolean' },
    { key: 'extra_property', text: 'Есть недвижимость (кроме единственного жилья)?', type: 'boolean' },
    { key: 'extra_car', text: 'Есть автомобиль?', type: 'boolean' },
  ];

  let currentStep = 0;
  const answers = {
    total_debt: null,
    arrests: null,
    extra_property: null,
    extra_car: null,
  };

  // ======= helpers =======
  const formatRub = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

  const sliderToDebtKey = (v) => {
    if (v < 200000) return 'under200k';
    if (v < 500000) return '200k-500k';
    if (v < 1000000) return '500k-1m';
    return 'over1m';
  };

  const safeText = (s) => (s ?? '').toString().trim();

  function setIntroVisible(isVisible) {
    if (!introBlock) return;
    introBlock.style.display = isVisible ? 'block' : 'none';
  }

  // ======= open / close =======
  function openQuiz() {
    setIntroVisible(false);
    document.body.classList.add('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'false');

    currentStep = 0;
    renderStep();
  }

  function resetAnswers() {
    answers.total_debt = null;
    answers.arrests = null;
    answers.extra_property = null;
    answers.extra_car = null;
  }

  function closeQuiz() {
    document.body.classList.remove('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'true');
    setIntroVisible(true);

    currentStep = 0;
    resetAnswers();
    quizContainer.innerHTML = '';
  }

  // клик по фону оверлея закрывает
  quizOverlay.addEventListener('click', (e) => {
    if (e.target === quizOverlay) closeQuiz();
  });

  // ESC закрывает
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('quiz-open')) {
      closeQuiz();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  if (startBtn) startBtn.addEventListener('click', openQuiz);

  // ======= rendering =======
  function progressPercent() {
    // steps + финальная форма
    return Math.round(((currentStep + 1) / (steps.length + 1)) * 100);
  }

  function renderStep() {
    const step = steps[currentStep];

    quizContainer.innerHTML = `
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated"
             role="progressbar"
             style="width:${progressPercent()}%; background-color: var(--quiz-theme-color);"></div>
      </div>

      <div class="quiz-header-with-back">
        ${currentStep > 0 ? `<button class="quiz-back-btn" type="button" data-action="back">← Назад</button>` : '<div style="width:96px;"></div>'}
        <div class="text-center flex-grow-1">
          <h5 class="fw-bold mb-0">${step.text}</h5>
        </div>
        <div style="width:96px;"></div>
      </div>

      <div style="flex:1; display:flex; flex-direction:column;">
        ${step.type === 'slider' ? renderSlider() : renderBoolean()}
      </div>
    `;

    const backBtn = quizContainer.querySelector('[data-action="back"]');
    if (backBtn) backBtn.addEventListener('click', goBack);

    if (step.type === 'slider') {
      const range = quizContainer.querySelector('#debtRange');
      const label = quizContainer.querySelector('#range-value-display');
      const nextBtn = quizContainer.querySelector('[data-action="next"]');

      if (range && label) {
        range.addEventListener('input', () => {
          label.textContent = formatRub(Number(range.value));
        });
      }

      if (nextBtn && range) {
        nextBtn.addEventListener('click', () => {
          const raw = Number(range.value);
          answers.total_debt = sliderToDebtKey(raw);
          next();
        });
      }
    } else {
      quizContainer.querySelectorAll('[data-action="pick"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-value');
          answers[step.key] = val;
          next();
        });
      });
    }
  }

  function renderSlider() {
    const rawDefault = 500000;
    const labelValue = formatRub(rawDefault);

    return `
      <div class="text-center px-2 mt-4">
        <span id="range-value-display" class="range-value-label">${labelValue}</span>
        <input type="range" id="debtRange" min="200000" max="5000000" step="50000" value="${rawDefault}">
        <div class="d-flex justify-content-between mt-2">
          <small class="text-muted">200 000 ₽</small>
          <small class="text-muted">&gt; 5 млн ₽</small>
        </div>
      </div>

      <div class="mt-auto pt-4">
        <button type="button" class="quiz-submit-btn" data-action="next">Далее</button>
        <p class="text-muted small mt-2 mb-0" style="font-size:.8rem;">
          Можно примерно — важно понять диапазон.
        </p>
      </div>
    `;
  }

  function renderBoolean() {
    return `
      <div class="quiz-grid-options mt-4">
        <button type="button" class="btn-quiz-option" data-action="pick" data-value="Да">Да</button>
        <button type="button" class="btn-quiz-option" data-action="pick" data-value="Нет">Нет</button>
      </div>
      <div class="mt-auto"></div>
    `;
  }

  function goBack() {
    if (currentStep <= 0) return;
    currentStep -= 1;
    renderStep();
  }

  function next() {
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      renderStep();
      return;
    }
    renderForm();
  }

  // ======= phone prefix logic =======
  function initPhoneInput(input) {
    if (!input) return;

    const PREFIX = '+7 (9';
    if (!input.value || input.value.trim() === '') {
      input.value = PREFIX;
    } else if (!input.value.startsWith(PREFIX)) {
      // если вдруг браузер автозаполнил что-то странное — приводим к префиксу
      input.value = PREFIX;
    }

    const setCaretEnd = () => {
      const len = input.value.length;
      try { input.setSelectionRange(len, len); } catch (_) {}
    };

    // при фокусе ставим курсор в конец
    input.addEventListener('focus', () => {
      if (!input.value.startsWith(PREFIX)) input.value = PREFIX;
      setCaretEnd();
    });

    // защищаем префикс от удаления/замены
    input.addEventListener('keydown', (e) => {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;

      // запрещаем backspace/delete внутри префикса
      if ((e.key === 'Backspace' && start <= PREFIX.length) ||
          (e.key === 'Delete' && start < PREFIX.length) ||
          (e.key === 'ArrowLeft' && start <= PREFIX.length)) {
        e.preventDefault();
        input.setSelectionRange(PREFIX.length, PREFIX.length);
      }

      // если выделение захватывает префикс — не даём стереть
      if ((e.key === 'Backspace' || e.key === 'Delete') && start < PREFIX.length) {
        e.preventDefault();
        input.setSelectionRange(PREFIX.length, PREFIX.length);
      }

      // Home — ставим в конец префикса
      if (e.key === 'Home') {
        e.preventDefault();
        input.setSelectionRange(PREFIX.length, PREFIX.length);
      }
    });

    // при любом вводе гарантируем префикс
    input.addEventListener('input', () => {
      if (!input.value.startsWith(PREFIX)) {
        const tail = input.value.replace(/^\+?7?\s*\(?9?/, '');
        input.value = PREFIX + tail;
        setCaretEnd();
      }
    });

    setCaretEnd();
  }

  // ======= form =======
  function renderForm() {
    quizContainer.innerHTML = `
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated"
             role="progressbar"
             style="width:100%; background-color: var(--quiz-theme-color);"></div>
      </div>

      <div class="quiz-header-with-back">
        <button class="quiz-back-btn" type="button" data-action="back">← Назад</button>
        <div class="text-center flex-grow-1">
          <h5 class="fw-bold mb-0">Оставьте контакты</h5>
          <div class="text-muted small">Я подскажу, какой путь банкротства вам подходит.</div>
        </div>
        <div style="width:96px;"></div>
      </div>

      <form id="leadForm" class="mt-4" novalidate style="display:flex; flex-direction:column; min-height: 100%;">
        <div>
          <div class="mb-3">
            <label class="form-label small">Имя</label>
            <input class="form-control" type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name" />
          </div>

          <div class="mb-3">
            <label class="form-label small">Телефон *</label>
            <input id="phoneInput" class="form-control" type="tel" name="phone" autocomplete="tel" required />
            <div class="text-muted small mt-1" style="font-size:.78rem;">Нужен только для связи — спамом не занимаемся.</div>
          </div>

          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="agree" name="agree" required />
            <label class="form-check-label small" for="agree">
              Принимаю условия <a href="/offer" target="_blank">публичной оферты</a>
            </label>
          </div>

          <div id="formMsg" class="mt-2 small"></div>
          <p class="text-muted small mt-3 mb-0" style="font-size:.75rem;">
            Нажимая «Отправить», вы соглашаетесь с <a href="/privacy" target="_blank">политикой конфиденциальности</a>.
          </p>
        </div>

        <div class="mt-auto pt-4">
          <button type="submit" class="quiz-submit-btn" id="submitBtn">Отправить</button>
        </div>
      </form>
    `;

    const backBtn = quizContainer.querySelector('[data-action="back"]');
    if (backBtn) backBtn.addEventListener('click', () => {
      currentStep = steps.length - 1;
      renderStep();
    });

    const form = quizContainer.querySelector('#leadForm');
    const submitBtn = quizContainer.querySelector('#submitBtn');
    const msg = quizContainer.querySelector('#formMsg');
    const phoneInput = quizContainer.querySelector('#phoneInput');

    initPhoneInput(phoneInput);

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      msg.className = 'mt-2 small';

      const formData = new FormData(form);
      const name = safeText(formData.get('name')) || '—';
      const phone = safeText(formData.get('phone'));
      const agree = formData.get('agree') ? 'Да' : 'Нет';

      if (!phone || phone.length < 5) {
        msg.textContent = 'Укажите телефон.';
        msg.classList.add('text-danger');
        return;
      }
      if (agree !== 'Да') {
        msg.textContent = 'Нужно принять условия публичной оферты.';
        msg.classList.add('text-danger');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляю…';

      try {
        const token = await executeRecaptcha(SITE_KEY);

        const payload = {
          name,
          phone,
          agree,
          total_debt: answers.total_debt || 'under200k',
          arrests: answers.arrests || 'Не указано',
          extra_property: answers.extra_property || 'Не указано',
          extra_car: answers.extra_car || 'Не указано',
          'g-recaptcha-response': token,
        };

        const res = await fetch('/consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Ошибка отправки');
        }

        window.location.href = '/thanks';
      } catch (err) {
        console.error(err);
        msg.textContent = 'Не удалось отправить. Попробуйте ещё раз или позвоните.';
        msg.classList.add('text-danger');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
      }
    });
  }

  function executeRecaptcha(siteKey) {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha || !window.grecaptcha.execute) {
        const startedAt = Date.now();
        const t = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.execute) {
            clearInterval(t);
            window.grecaptcha.execute(siteKey, { action: 'consult' }).then(resolve).catch(reject);
          } else if (Date.now() - startedAt > 6000) {
            clearInterval(t);
            reject(new Error('reCAPTCHA not available'));
          }
        }, 120);
        return;
      }

      window.grecaptcha.execute(siteKey, { action: 'consult' }).then(resolve).catch(reject);
    });
  }
});
