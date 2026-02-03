document.addEventListener('DOMContentLoaded', () => {
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';

  const startBtn = document.getElementById('show-form-btn');
  const introBlock = document.getElementById('intro-text-block');

  const quizOverlay = document.getElementById('quiz-overlay');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  const scrollIndicator = document.querySelector('.scroll-indicator');

  if (!quizOverlay || !quizContainer) return;

  // --- Индикатор "офис и контакты": по клику скрывается ---
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', (e) => {
      scrollIndicator.classList.add('is-hidden');

      const href = scrollIndicator.getAttribute('href') || '';
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    // Если вернуться наверх (перезагрузка/скролл вверх) — снова показать
    window.addEventListener('scroll', () => {
      if (window.scrollY < 40) scrollIndicator.classList.remove('is-hidden');
    }, { passive: true });
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
    if (e.key === 'Escape' && document.body.classList.contains('quiz-open')) closeQuiz();
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
          answers[step.key] = btn.getAttribute('data-value');
          next();
        });
      });
    }
  }

  function renderSlider() {
    const rawDefault = 500000;
    return `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div class="text-center px-2" style="padding-top:14px;">
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

  // ===== PHONE MASK (нормальная): +7 (999) 999 99 99, 11 цифр, префикс +7 (9 защищён
  const PREFIX = '+7 (9';
  const PREFIX_LEN = PREFIX.length;

  function digitsOnly(str) {
    return (str.match(/\d/g) || []).join('');
  }

  function normalizeDigits(d) {
    // хотим 79XXXXXXXXX (11 цифр)
    let digits = d;

    if (!digits.startsWith('7')) digits = '7' + digits;
    if (digits.length === 1) digits = '79';
    if (digits[1] !== '9') digits = '79' + digits.slice(2);

    return digits.slice(0, 11);
  }

  function formatRuPhone(digits11) {
    const d = digits11.slice(0, 11);
    const a = d.slice(1, 4);
    const b = d.slice(4, 7);
    const c = d.slice(7, 9);
    const e = d.slice(9, 11);

    let s = '+7 (';
    s += a;
    if (a.length === 3) s += ') ';
    if (b.length) s += b;
    if (b.length === 3 && (c.length || e.length)) s += ' ';
    if (c.length) s += c;
    if (c.length === 2 && e.length) s += ' ';
    if (e.length) s += e;

    // если пользователь удалил всё кроме префикса — оставим красивый минимальный вид
    if (s.length < PREFIX_LEN) s = PREFIX;

    return s;
  }

  function digitCountBeforeCaret(value, caretPos) {
    return digitsOnly(value.slice(0, caretPos)).length;
  }

  function caretPosForDigitCount(formatted, wantedDigits) {
    // ставим курсор так, чтобы слева было wantedDigits цифр
    if (wantedDigits <= 0) return PREFIX_LEN;

    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        count++;
        if (count >= wantedDigits) {
          // курсор после этой цифры
          return i + 1;
        }
      }
    }
    return formatted.length;
  }

  function applyPhoneMask(input, forceToEnd = false) {
    const oldVal = input.value || '';
    const oldCaret = input.selectionStart ?? oldVal.length;

    const beforeDigits = digitCountBeforeCaret(oldVal, oldCaret);

    let digits = normalizeDigits(digitsOnly(oldVal));
    const formatted = formatRuPhone(digits);

    input.value = formatted;

    // курсор: либо в конец (если надо), либо сохраняем позицию по количеству цифр
    const newPos = forceToEnd
      ? formatted.length
      : caretPosForDigitCount(formatted, beforeDigits);

    try {
      input.setSelectionRange(newPos, newPos);
    } catch (_) {}
  }

  function initPhoneMask(input) {
    if (!input) return;

    input.value = PREFIX;
    // на старте — курсор в конец
    applyPhoneMask(input, true);

    input.addEventListener('focus', () => {
      if (!input.value) input.value = PREFIX;
      applyPhoneMask(input, true);
    });

    input.addEventListener('input', () => {
      // обычный ввод/удаление — сохраняем позицию
      applyPhoneMask(input, false);
    });

    input.addEventListener('keydown', (e) => {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;

      // запрещаем удалять префикс +7 (9
      if ((e.key === 'Backspace' && start <= PREFIX_LEN && end <= PREFIX_LEN) ||
          (e.key === 'Delete' && start < PREFIX_LEN && end <= PREFIX_LEN) ||
          (e.key === 'Home')) {
        e.preventDefault();
        try { input.setSelectionRange(PREFIX_LEN, PREFIX_LEN); } catch (_) {}
      }

      // если выделение зацепило префикс — не даём стереть его
      if ((e.key === 'Backspace' || e.key === 'Delete') && start < PREFIX_LEN) {
        e.preventDefault();
        try { input.setSelectionRange(PREFIX_LEN, PREFIX_LEN); } catch (_) {}
      }
    });

    input.addEventListener('paste', () => {
      // после вставки — нормализуем
      setTimeout(() => applyPhoneMask(input, true), 0);
    });
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

      <form id="leadForm" class="mt-3" novalidate style="display:flex; flex-direction:column; height:100%;">
        <div>
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
            Нажимая «Продолжить», вы соглашаетесь с <a href="/privacy" target="_blank">политикой конфиденциальности</a>.
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

      const digits = digitsOnly(phone);
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
