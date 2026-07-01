document.addEventListener('DOMContentLoaded', () => {
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';
  const startBtn = document.getElementById('show-form-btn');
  const quizOverlay = document.getElementById('quiz-overlay');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  if (!quizOverlay || !quizContainer) return;

  const steps = [
    { key: 'total_debt', text: 'Укажите общую сумму долга', type: 'slider' },
    { key: 'debt_structure', text: 'Кому вы должны? (можно выбрать несколько)', type: 'multiple', 
      choices: ['Только банки', 'Много микрозаймов (МФО)', 'Налоги и ЖКХ', 'Физические лица (расписки)'] },
    { key: 'property_deals', text: 'Были ли сделки с имуществом за последние 3 года?', type: 'options', 
      choices: ['Да, продавал/дарил', 'Нет, ничего не продавал'] },
    { key: 'current_stage', text: 'На какой стадии сейчас ситуация?', type: 'options', 
      choices: ['Плачу из последних сил', 'Начались просрочки', 'Звонят коллекторы', 'Дело у приставов (ФССП)'] },
  ];

  let currentStep = 0;
  const answers = {};

  const formatRub = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  
  function sliderToDebtKey(v) {
    if (v < 200000) return 'under200k';
    if (v < 500000) return '200k-500k';
    if (v < 1000000) return '500k-1m';
    return 'over1m';
  }

  function openQuiz() {
    document.body.classList.add('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'false');
    currentStep = 0;
    renderStep();
  }

  function closeQuiz() {
    document.body.classList.remove('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'true');
    quizContainer.innerHTML = '';
    currentStep = 0;
    Object.keys(answers).forEach(k => delete answers[k]);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  quizOverlay.addEventListener('click', (e) => { if (e.target === quizOverlay) closeQuiz(); });
  if (startBtn) startBtn.addEventListener('click', openQuiz);

  function progressPercent() {
    return Math.round(((currentStep + 1) / (steps.length + 1)) * 100);
  }

  function renderStep() {
    const step = steps[currentStep];

    quizContainer.innerHTML = `
      <div style="height: 6px; background: #333; border-radius: 4px; overflow: hidden; margin-bottom: 20px;">
        <div style="height: 100%; width:${progressPercent()}%; background-color: var(--accent-color); transition: width 0.3s ease;"></div>
      </div>

      <div class="quiz-header-with-back">
        ${currentStep > 0 ? `<button class="quiz-back-btn" data-action="back">← Назад</button>` : '<div></div>'}
      </div>
      <h4 class="text-center mb-4" style="font-size: 1.1rem; color: var(--primary-color); font-weight: 800;">${step.text}</h4>

      <div style="flex:1; display:flex; flex-direction:column;">
        ${step.type === 'slider' ? renderSlider() : (step.type === 'multiple' ? renderMultiple(step.choices) : renderOptions(step.choices))}
      </div>
    `;

    const backBtn = quizContainer.querySelector('[data-action="back"]');
    if (backBtn) backBtn.addEventListener('click', () => { currentStep -= 1; renderStep(); });

    if (step.type === 'slider') {
      const range = quizContainer.querySelector('#debtRange');
      const label = quizContainer.querySelector('#range-value-display');
      const nextBtn = quizContainer.querySelector('[data-action="next"]');

      label.textContent = formatRub(Number(range.value));
      range.addEventListener('input', () => label.textContent = formatRub(Number(range.value)));
      nextBtn.addEventListener('click', () => {
        answers.total_debt = sliderToDebtKey(Number(range.value));
        next();
      });
    } else if (step.type === 'multiple') {
      answers[step.key] = answers[step.key] || [];
      quizContainer.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-value');
          btn.classList.toggle('selected');
          if (btn.classList.contains('selected')) {
            if (!answers[step.key].includes(val)) answers[step.key].push(val);
          } else {
            answers[step.key] = answers[step.key].filter(v => v !== val);
          }
        });
      });
      quizContainer.querySelector('[data-action="next-multi"]').addEventListener('click', () => {
        if (!answers[step.key] || answers[step.key].length === 0) answers[step.key] = ['Не указано'];
        next();
      });
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
    const defaultValue = 500000;
    return `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div class="text-center mt-4">
          <span id="range-value-display" class="range-value-label">${formatRub(defaultValue)}</span>
          <input type="range" id="debtRange" min="200000" max="5000000" step="50000" value="${defaultValue}">
          <div class="d-flex justify-content-between mt-2">
            <small class="text-muted">200 000 ₽</small>
            <small class="text-muted">&gt; 5 млн ₽</small>
          </div>
        </div>
        <div style="margin-top:auto;">
          <button type="button" class="quiz-submit-btn" data-action="next">Далее</button>
        </div>
      </div>
    `;
  }

  function renderOptions(choices) {
    let html = `<div class="quiz-grid-options">`;
    choices.forEach(choice => {
      html += `<button type="button" class="btn-quiz-option" data-action="pick" data-value="${choice}">${choice}</button>`;
    });
    html += `</div>`;
    return html;
  }

  function renderMultiple(choices) {
    let html = `<div class="quiz-grid-options">`;
    choices.forEach(choice => {
      html += `<button type="button" class="btn-quiz-option" data-action="toggle" data-value="${choice}">${choice}</button>`;
    });
    html += `</div>`;
    html += `
      <div style="margin-top:auto; padding-top: 20px; display: flex; justify-content: flex-end;">
        <button type="button" class="quiz-submit-btn" style="width: auto; padding: 12px 32px; border-radius: var(--radius-btn);" data-action="next-multi">Далее →</button>
      </div>
    `;
    return html;
  }

  function next() {
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      renderStep();
    } else {
      renderForm();
    }
  }

  const PREFIX = '+7 (9';
  function applyPhoneMask(input) {
    let digits = (input.value.match(/\d/g) || []).join('');
    if (!digits.startsWith('7')) digits = '7' + digits;
    if (digits.length === 1) digits = '79';
    if (digits[1] !== '9') digits = '79' + digits.slice(2);
    digits = digits.slice(0, 11);

    const a = digits.slice(1, 4), b = digits.slice(4, 7), c = digits.slice(7, 9), e = digits.slice(9, 11);
    let s = '+7 (';
    s += a; if (a.length === 3) s += ') ';
    if (b.length) s += b; if (b.length === 3 && (c.length || e.length)) s += ' ';
    if (c.length) s += c; if (c.length === 2 && e.length) s += ' ';
    if (e.length) s += e;
    input.value = s.length < PREFIX.length ? PREFIX : s;
  }

  function renderForm() {
    quizContainer.innerHTML = `
      <div style="height: 6px; background: #333; border-radius: 4px; overflow: hidden; margin-bottom: 20px;">
        <div style="height: 100%; width:100%; background-color: var(--accent-color);"></div>
      </div>

      <div class="quiz-header-with-back">
        <button class="quiz-back-btn" data-action="back">← Назад</button>
      </div>
      
      <div class="text-center mb-4">
        <h4 style="font-size: 1.2rem; color: var(--primary-color); font-weight: 800;">Ваша ситуация проанализирована!</h4>
        <p class="text-muted small">Оставьте номер, чтобы получить бесплатный план списания ваших долгов и памятку «Как законно отвечать коллекторам».</p>
      </div>

      <form id="leadForm" class="mt-2" novalidate style="display:flex; flex-direction:column; flex:1;">
        <div class="mb-3">
          <input class="form-control" type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name" />
        </div>
        <div class="mb-3">
          <input id="phoneInput" class="form-control" type="tel" name="phone" placeholder="+7 (900) 000 00 00" required />
        </div>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" id="agree" name="agree" required />
          <label class="form-check-label small text-muted" for="agree">
            Принимаю условия <a href="/offer" target="_blank" style="color: var(--accent-color); font-weight: 600; text-decoration: none;">оферты</a>
          </label>
        </div>
        <div id="formMsg" class="mt-2 small"></div>

        <div style="margin-top:auto;">
          <button type="submit" class="quiz-submit-btn" id="submitBtn">Получить план и памятку</button>
        </div>
      </form>
    `;

    quizContainer.querySelector('[data-action="back"]').addEventListener('click', () => {
      currentStep = steps.length - 1; renderStep();
    });

    const form = quizContainer.querySelector('#leadForm');
    const submitBtn = quizContainer.querySelector('#submitBtn');
    const msg = quizContainer.querySelector('#formMsg');
    const phoneInput = quizContainer.querySelector('#phoneInput');

    phoneInput.addEventListener('focus', () => { if(!phoneInput.value) phoneInput.value = PREFIX; applyPhoneMask(phoneInput); });
    phoneInput.addEventListener('input', () => applyPhoneMask(phoneInput));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      
      const phone = form.phone.value;
      if (phone.replace(/\D/g, '').length !== 11) {
        msg.textContent = 'Введите телефон полностью.'; msg.style.color = 'var(--accent-color)'; return;
      }
      if (!form.agree.checked) {
        msg.textContent = 'Нужно принять условия.'; msg.style.color = 'var(--accent-color)'; return;
      }

      submitBtn.disabled = true; submitBtn.textContent = 'Отправляю...';

      try {
        const token = await new Promise((res, rej) => {
          if (!window.grecaptcha) rej('reCAPTCHA error');
          window.grecaptcha.execute(SITE_KEY, { action: 'consult' }).then(res).catch(rej);
        });

        const debtStructStr = Array.isArray(answers.debt_structure) ? answers.debt_structure.join(', ') : answers.debt_structure;

        const payload = {
          name: form.name.value || '—',
          phone: phone,
          total_debt: answers.total_debt,
          debt_structure: debtStructStr,
          property_deals: answers.property_deals,
          current_stage: answers.current_stage,
          'g-recaptcha-response': token
        };

        const res = await fetch('/consult', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error();
        window.location.href = '/thanks';
      } catch (err) {
        msg.textContent = 'Ошибка отправки. Позвоните нам.'; msg.style.color = 'var(--accent-color)';
        submitBtn.disabled = false; submitBtn.textContent = 'Получить план и памятку';
      }
    });
  }
});
