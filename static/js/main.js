document.addEventListener('DOMContentLoaded', () => {
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';

  const startBtn = document.getElementById('show-form-btn');
  const introBlock = document.getElementById('intro-text-block');

  const quizOverlay = document.getElementById('quiz-overlay');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  // Индикатор "офис и контакты"
  const scrollIndicator = document.querySelector('.scroll-indicator');

  if (!quizOverlay || !quizContainer) return;

  // --- Скрытие индикатора по клику + плавная прокрутка ---
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', (e) => {
      // делаем исчезновение сразу
      scrollIndicator.classList.add('is-hidden');

      // плавно скроллим (на всякий случай — если браузер не поддерживает smooth в CSS)
      const href = scrollIndicator.getAttribute('href') || '';
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

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

  function resetAnswers() {
    answers.total_debt = null;
    answers.arrests = null;
    answers.extra_property = null;
    answers.extra_car = null;
  }

  function openQuiz() {
    setIntroVisible(false);
    document.body.classList.add('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'false');

    currentStep = 0;
    renderStep();
  }

  function closeQuiz() {
    document.body.classList.remove('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'true');
    setIntroVisible(true);

    currentStep = 0;
    resetAnswers();
    quizContainer.innerHTML = '';
  }

  quizOverlay.addEventListener('click', (e) => {
    if (e.target === quizOverlay) closeQuiz();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('quiz-open')) {
      closeQuiz();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  if (startBtn) startBtn.addEventListener('click', openQuiz);

  function progressPercent() {
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

      <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
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

      // ВАЖНО: кнопка “Далее” видна сразу, без скролла/движения ползунка
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

    return `
      <div style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
        <div class="text-center px-2" style="padding-top:16px;">
          <span id="range-value-display" class="range-value-label">${formatRub(rawDefault)}</span>
          <input type="range" id="debtRange" min="200000" max="5000000" step="50000" value="${rawDefault}">
          <div class="d-flex justify-content-between mt-2">
            <small class="text-muted">200 000 ₽</small>
            <small class="text-muted">&gt; 5 млн ₽</small>
          </div>
        </div>

        <div style="margin-top:auto; padding-top:14px;">
          <button type="button" class="quiz-submit-btn" data-action="next">Далее</button>
          <p class="text-muted small mt-2 mb-0" style="font-size:.8rem;">
            Можно примерно — важно понять диапазон.
          </p>
        </div>
      </div>
    `;
  }

  function renderBoolean() {
    return `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div class="quiz-grid-options">
          <button type="button" class="btn-quiz-option" data-action="pick" data-value="Да">Да</button>
          <button type="button" class="btn-quiz-option" data-action="pick" data-value="Нет">Нет</button>
        </div>
        <div style="margin-top:auto;"></div>
      </div>
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

  // ======= PHONE MASK: +7 (999) 999 99 99, 11 цифр, префикс +7 (9 защищён =======
  function formatRuPhoneFromDigits(digits) {
    // digits: только цифры, начинаются с 79..., длина <= 11
    const d = digits.slice(0, 11);

    // +7 (XXX) XXX XX XX
    // d[0]=7, d[1]=9
    const a = d.slice(1, 4);   // 3 цифры после 7
    const b = d.slice(4, 7);   // 3 цифры
    const c = d.slice(7, 9);   // 2 цифры
    const e = d.slice(9, 11);  // 2 цифры

    let s = '+7 (';
    if (a.length) s += a;
    if (a.length === 3) s += ') ';
    if (b.length) s += b;
    if (b.length === 3 && (c.length || e.length)) s += ' ';
    if (c.length) s += c;
    if (c.length === 2 && e.length) s += ' ';
    if (e.length) s += e;

    return s;
  }

  function initPhoneMask(input) {
    if (!input) return;

    // стартовый префикс
    input.value = '+7 (9';

    const setCaretEnd = () => {
      const len = input.value.length;
      try { input.setSelectionRange(len, len); } catch (_) {}
    };

    const normalize = () => {
      // берём только цифры
      let digits = (input.value.match(/\d/g) || []).join('');

      // принудительно делаем начало 79
      if (!digits.startsWith('7')) digits = '7' + digits;
      if (digits.length === 1) digits = '79';
      if (digits[1] !== '9') digits = '79' + digits.slice(2);

      // ограничение 11 цифр
      digits = digits.slice(0, 11);

      input.value = formatRuPhoneFromDigits(digits);
      setCaretEnd();
    };

    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+7 (9';
      normalize();
    });

    input.addEventListener('input', () => {
      normalize();
    });

    input.addEventListener('keydown', (e) => {
      // блокируем попытки “убить” префикс
      const minPos = 5; // '+7 (9' длина 5
      const start = input.selectionStart ?? 0;

      if ((e.key === 'Backspace' && start <= minPos) ||
          (e.key === 'Delete' && start < minPos) ||
          (e.key === 'ArrowLeft' && start <= minPos) ||
          (e.key === 'Home')) {
        e.preventDefault();
        try { input.setSelectionRange(minPos, minPos); } catch (_) {}
      }
    });

    normalize();
  }

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

      <form id="leadForm" class="mt-3" novalidate style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
        <div style="overflow:hidden;">
          <div class="mb-2">
            <label class="form-label small mb-1">Имя</label>
            <input class="form-control" type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name" />
          </div>

          <div class="mb-2">
            <label class="form-label small mb-1">Телефон *</label>
            <input id="phoneInput" class="form-control" type="tel" name="phone" autocomplete="tel" required />
            <div class="text-muted small mt-1" style="font-size:.78rem;">Нужен только для связи — спамом не занимаемся.</div>
          </div>

          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="agree" name="agree" required />
            <label class="form-check-label small" for="agree">
              Принимаю условия <a href="/offer" target="_blank">публичной оферты</a>
            </label>
          </div>

          <div id="formMsg" class="mt-2 small"></div>
          <p class="text-muted small mt-2 mb-0" style="font-size:.75rem;">
            Нажимая «Отправить», вы соглашаетесь с <a href="/privacy" target="_blank">политикой конфиденциальности</a>.
          </p>
        </div>

        <div style="margin-top:auto; padding-top:12px;">
          <button type="submit" class="quiz-submit-btn" id="submitBtn">Продолжить</button>
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

    initPhoneMask(phoneInput);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      msg.className = 'mt-2 small';

      const formData = new FormData(form);
      const name = safeText(formData.get('name')) || '—';
      const phone = safeText(formData.get('phone'));
      const agree = formData.get('agree') ? 'Да' : 'Нет';

      // проверяем, что реально введено 11 цифр
      const digits = (phone.match(/\d/g) || []).join('');
      if (digits.length !== 11) {
        msg.textContent = 'Введите телефон полностью (пример: +7 (999) 999 99 99).';
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
        submitBtn.textContent = 'Продолжить';
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
