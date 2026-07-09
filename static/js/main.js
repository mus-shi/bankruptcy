document.addEventListener('DOMContentLoaded', () => {
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';
  
  // Кнопки открытия квиза
  const startBtn = document.getElementById('show-form-btn');
  const quizButtons = document.querySelectorAll('.call-quiz-btn');
  
  const quizOverlay = document.getElementById('quiz-overlay');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  // Логика интерактивного переключения шагов порядка работы
  const stepTriggers = document.querySelectorAll('.step-item-trigger');
  const stepDescText = document.getElementById('step-desc-text');
  
  const stepTexts = {
    '1': 'Детальный правовой аудит вашей ситуации. Мы анализируем структуру задолженности, оцениваем риски по ранее совершенным сделкам и выстраиваем стратегию защиты. Никаких пустых обещаний — только объективный правовой прогноз.',
    '2': 'Формирование доказательной базы. Мы берем на себя бюрократию: запрашиваем справки, выписки из реестров и готовим заявление, которое арбитражный суд примет к производству. Ваше участие минимально.',
    '3': 'Представительство в суде. С момента введения процедуры мы представляем ваши интересы на заседаниях, выстраивая правовую защиту ваших интересов и имущества в рамках 127-ФЗ.',
    '4': 'Финальное определение суда. Суд выносит определение о завершении процедуры реализации имущества гражданина (127-ФЗ). Вы получаете на руки официальный судебный акт.'
  };

  stepTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      if (trigger.classList.contains('active')) return;
      
      stepTriggers.forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');
      
      const stepKey = trigger.getAttribute('data-step');
      if (stepDescText && stepTexts[stepKey]) {
        stepDescText.style.opacity = '0';
        setTimeout(() => {
          stepDescText.textContent = stepTexts[stepKey];
          stepDescText.style.opacity = '1';
        }, 150);
      }
    });
  });

  // ЛОГИКА КАРАУСЕЛИ СУДЕБНОЙ ПРАКТИКИ (ЭКРАН 2)
  const prevCaseBtn = document.getElementById('prev-case-btn');
  const nextCaseBtn = document.getElementById('next-case-btn');
  const caseSlides = document.querySelectorAll('.practice-slide-item');
  let currentCaseIndex = 0;

  function updateCaseSlide(index) {
    caseSlides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.remove('d-none');
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
        slide.classList.add('d-none');
      }
    });
  }

  if (prevCaseBtn && nextCaseBtn && caseSlides.length > 0) {
    prevCaseBtn.addEventListener('click', () => {
      currentCaseIndex = (currentCaseIndex === 0) ? caseSlides.length - 1 : currentCaseIndex - 1;
      updateCaseSlide(currentCaseIndex);
    });

    nextCaseBtn.addEventListener('click', () => {
      currentCaseIndex = (currentCaseIndex === caseSlides.length - 1) ? 0 : currentCaseIndex + 1;
      updateCaseSlide(currentCaseIndex);
    });
  }

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
  quizButtons.forEach(btn => btn.addEventListener('click', openQuiz));

  function progressPercent() {
    return Math.round(((currentStep + 1) / (steps.length + 1)) * 100);
  }

  function renderStep() {
    const step = steps[currentStep];

    quizContainer.innerHTML = `
      <div style="height: 4px; background: #e9ecef; overflow: hidden; margin-top: 12px; margin-bottom: 20px;">
        <div style="height: 100%; width:${progressPercent()}%; background-color: var(--accent-color); transition: width 0.3s ease;"></div>
      </div>

      <div class="d-flex align-items-center mb-3">
        ${currentStep > 0 ? `<button class="quiz-back-btn" data-action="back">← Назад</button>` : '<div></div>'}
      </div>
      <h4 class="text-center mb-4" style="font-size: 1.1rem; color: var(--primary-color); font-weight: 900;">${step.text}</h4>

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
        const val = Number(range.value);
        answers.total_debt_value = val; // Сохраняем для финальной проверки
        answers.total_debt = sliderToDebtKey(val);
        next();
      });
    } else if (step.type === 'multiple') {
      answers[step.key] = answers[step.key] || [];
      const nextBtnMulti = quizContainer.querySelector('[data-action="next-multi"]');
      
      quizContainer.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-value');
          btn.classList.toggle('selected');
          if (btn.classList.contains('selected')) {
            if (!answers[step.key].includes(val)) answers[step.key].push(val);
          } else {
            answers[step.key] = answers[step.key].filter(v => v !== val);
          }
          nextBtnMulti.disabled = answers[step.key].length === 0;
        });
      });
      nextBtnMulti.addEventListener('click', () => {
        if (!answers[step.key] || answers[step.key].length === 0) answers[step.key] = ['Не указано'];
        next();
      });
    } else {
      const nextBtnSingle = quizContainer.querySelector('[data-action="next-single"]');
      quizContainer.querySelectorAll('[data-action="pick"]').forEach(btn => {
        btn.addEventListener('click', () => {
          quizContainer.querySelectorAll('[data-action="pick"]').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          answers[step.key] = btn.getAttribute('data-value');
          nextBtnSingle.disabled = false;
        });
      });
      nextBtnSingle.addEventListener('click', () => {
        if (answers[step.key]) next();
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
          <div class="d-flex justify-content-between mt-2 px-2">
            <small class="text-muted fw-bold">200 000 ₽</small>
            <small class="text-muted fw-bold">&gt; 5 млн ₽</small>
          </div>
        </div>
        <div class="quiz-action-area">
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
    html += `
      <div class="quiz-action-area">
        <button type="button" class="quiz-submit-btn" data-action="next-single" disabled>Далее</button>
      </div>
    `;
    return html;
  }

  function renderMultiple(choices) {
    let html = `<div class="quiz-grid-options">`;
    choices.forEach(choice => {
      html += `<button type="button" class="btn-quiz-option" data-action="toggle" data-value="${choice}">${choice}</button>`;
    });
    html += `</div>`;
    html += `
      <div class="quiz-action-area">
        <button type="button" class="quiz-submit-btn" data-action="next-multi" disabled>Далее</button>
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

  function renderForm() {
    // Определяем ветку на основе всех ответов:
    // До 500 тыс И стадия НЕ "Дело у приставов (ФССП)"
    const isDebtUnder500k = answers.total_debt_value < 500000;
    const hasBailiffs = answers.current_stage === 'Дело у приставов (ФССП)';
    
    answers.is_mfc = (isDebtUnder500k && !hasBailiffs);

    // Выбор заголовка в зависимости от ветки
    const formHeader = answers.is_mfc
      ? `<h4 style="font-size: 1.2rem; color: #198754; font-weight: 900; text-transform: uppercase;">Вам подходит списание через МФЦ</h4>
         <p class="text-muted small">Мы предлагаем пакет «МФЦ под ключ» за 20 000 ₽: соберем все справки и безошибочно заполним заявление. Оставьте номер для получения детального плана.</p>`
      : `<h4 style="font-size: 1.2rem; color: var(--primary-color); font-weight: 900; text-transform: uppercase;">Вам подходит судебное банкротство</h4>
         <p class="text-muted small">Оставьте номер, чтобы получить пошаговый план процедуры и консультацию.</p>`;

    quizContainer.innerHTML = `
      <div style="height: 4px; background: #e9ecef; overflow: hidden; margin-top: 12px; margin-bottom: 20px;">
        <div style="height: 100%; width:100%; background-color: var(--accent-color);"></div>
      </div>

      <div class="d-flex align-items-center mb-2">
        <button class="quiz-back-btn" data-action="back">← Назад</button>
      </div>
      
      <div class="text-center mb-4">
        ${formHeader}
      </div>

      <form id="leadForm" class="mt-2" novalidate style="display:flex; flex-direction:column; flex:1;">
        <div class="mb-3">
          <input class="form-control" type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name" />
        </div>
        <div class="mb-3">
          <input class="form-control" type="text" name="city" placeholder="Откуда вы? (Ваш город/регион)" required />
        </div>
        <div class="mb-3">
          <input id="phoneInput" class="form-control" type="tel" name="phone" placeholder="+7 (900) 000 00 00" required />
        </div>
        
        <div class="form-check mb-2" style="background: #f8faff; padding: 12px 16px; border-radius: 4px; border-left: 3px solid var(--primary-color);">
          <input class="form-check-input" type="checkbox" id="agree" name="agree" required style="margin-top: 2px;" />
          <label class="form-check-label small" for="agree" style="color: #1a1a1a; line-height: 1.5;">
            <span style="font-weight: 600;">Я даю согласие на бесплатный анализ моей ситуации</span>
            <span style="display: block; margin-top: 4px; font-size: 0.7rem; color: #6c757d;">
              Подробнее — 
              <a href="/offer" target="_blank" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">Пользовательское соглашение</a> 
              и 
              <a href="/privacy" target="_blank" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">Политика конфиденциальности</a>
            </span>
          </label>
        </div>
        
        <div id="formMsg" class="mt-2 small text-center fw-bold"></div>

        <div class="quiz-action-area">
          <button type="submit" class="quiz-submit-btn" id="submitBtn">Получить план</button>
        </div>
      </form>
    `;

    quizContainer.querySelector('[data-action="back"]').addEventListener('click', () => {
      currentStep = steps.length - 1; // Возвращаемся на последний вопрос квиза
      renderStep();
    });

    const form = quizContainer.querySelector('#leadForm');
    const submitBtn = quizContainer.querySelector('#submitBtn');
    const msg = quizContainer.querySelector('#formMsg');
    const phoneInput = quizContainer.querySelector('#phoneInput');

    const phoneMask = IMask(phoneInput, {
      mask: '+{7} (000) 000-00-00',
      prepare: function (appended, masked) {
        if (appended === '8' && masked.value === '') return '';
        return appended;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      
      const unmaskedPhone = phoneMask.unmaskedValue;
      if (unmaskedPhone.length !== 11) {
        msg.textContent = 'Введите телефон полностью.'; 
        msg.style.color = 'var(--cta-a)'; 
        return;
      }
      
      if (!form.city.value.trim()) {
        msg.textContent = 'Укажите, пожалуйста, ваш город.'; 
        msg.style.color = 'var(--cta-a)'; 
        return;
      }

      if (!form.agree.checked) {
        msg.textContent = 'Пожалуйста, дайте согласие на обработку данных для получения плана.'; 
        msg.style.color = 'var(--cta-a)'; 
        return;
      }

      submitBtn.disabled = true; 
      submitBtn.textContent = 'ОТПРАВЛЯЮ...';

      try {
        const token = await new Promise((res, rej) => {
          if (!window.grecaptcha) rej('reCAPTCHA error');
          window.grecaptcha.execute(SITE_KEY, { action: 'consult' }).then(res).catch(rej);
        });

        const debtStructStr = Array.isArray(answers.debt_structure) ? answers.debt_structure.join(', ') : (answers.debt_structure || 'Не указано');
        const urlParams = new URLSearchParams(window.location.search);

        const payload = {
          name: form.name.value || '—',
          city: form.city.value.trim(),
          phone: phoneMask.value, 
          total_debt: answers.total_debt,
          debt_structure: debtStructStr,
          property_deals: answers.property_deals || 'Не указано',
          current_stage: answers.current_stage || 'Не указано',
          is_mfc: answers.is_mfc || false, // Флаг для бэкенда
          'g-recaptcha-response': token,
          utm_source: urlParams.get('utm_source') || 'Прямой заход / Неизвестно',
          utm_medium: urlParams.get('utm_medium') || '—',
          utm_campaign: urlParams.get('utm_campaign') || '—'
        };

        const res = await fetch('/consult', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error();
        window.location.href = '/thanks';
      } catch (err) {
        msg.textContent = 'Ошибка отправки. Позвоните нам.'; 
        msg.style.color = 'var(--cta-a)';
        submitBtn.disabled = false; 
        submitBtn.textContent = 'ПОЛУЧИТЬ ПЛАН';
      }
    });
  }
});
