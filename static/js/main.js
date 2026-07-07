document.addEventListener('DOMContentLoaded', () => {
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';

  // =========================
  // НАВИГАЦИОННАЯ ШКАЛА SCROLL-SNAP
  // =========================
  const navDots = document.querySelectorAll('.snap-nav-dot');
  const slideContainer = document.querySelector('.snap-container');
  const slides = document.querySelectorAll('.snap-slide');
  
  function updateNav() {
    let index = slides.length - 1;
    while(index >= 0 && slides[index].offsetTop > slideContainer.scrollTop + (slideContainer.clientHeight / 2)) {
      index--;
    }
    navDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
  
  if (slideContainer && navDots.length > 0) {
    slideContainer.addEventListener('scroll', () => requestAnimationFrame(updateNav));
    navDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetId = dot.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        if(targetElement) {
          slideContainer.scrollTo({ top: targetElement.offsetTop, behavior: 'smooth' });
        }
      });
    });
  }

  // =========================
  // КАСТОМНЫЙ JS СЛАЙДЕР СУДЕБНОЙ ПРАКТИКИ
  // =========================
  const track = document.getElementById('practiceSlider');
  if (track) {
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const pagination = document.getElementById('sliderPagination');
    const customSlides = document.querySelectorAll('.custom-slide');
    
    let currentIndex = 0;
    const totalSlides = customSlides.length;

    // Генерация точек
    customSlides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `page-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      pagination.appendChild(dot);
    });
    const dots = pagination.querySelectorAll('.page-dot');

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    if(prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    if(nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Свайп для мобильных
    let startX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      // Легкий параллакс при свайпе
      track.style.transform = `translateX(calc(-${currentIndex * 100}% - ${diff / 5}px))`;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      isDragging = false;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goToSlide(currentIndex + 1) : goToSlide(currentIndex - 1);
      } else {
        goToSlide(currentIndex); // Возврат на место
      }
    }, { passive: true });
  }

  // =========================
  // ШАГИ РАБОТЫ (ИНТЕРАКТИВ ИЗ ПЕРВОГО ЭКРАНА)
  // =========================
  const stepTriggers = document.querySelectorAll('.step-item-trigger');
  const stepDescText = document.getElementById('step-desc-text');
  const stepTexts = {
    '1': 'Детальный правовой аудит вашей ситуации. Мы анализируем структуру задолженности, оцениваем риски по ранее совершенным сделкам и выстраиваем жесткую стратегию защиты.',
    '2': 'Формирование непробиваемой доказательной базы. Мы берем на себя всю бюрократию: запрашиваем справки, выписки и готовим заявление в арбитражный суд.',
    '3': 'Активация полного правового щита. С момента введения процедуры кредиторы и коллекторы теряют право взаимодействовать с вами напрямую.',
    '4': 'Финальное определение суда. Все долги, пени и штрафы списываются безвозвратно. Вы получаете на руки официальный судебный акт.'
  };

  stepTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      stepTriggers.forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');
      const stepKey = trigger.getAttribute('data-step');
      if (stepDescText && stepTexts[stepKey]) {
        stepDescText.style.opacity = '0';
        setTimeout(() => {
          stepDescText.textContent = stepTexts[stepKey];
          stepDescText.style.opacity = '1';
        }, 200);
      }
    });
  });

  // =========================
  // КВИЗ (ЛОГИКА ОСТАВЛЕНА БЕЗ ИЗМЕНЕНИЙ)
  // =========================
  const startBtn = document.getElementById('show-form-btn');
  const quizButtons = document.querySelectorAll('.call-quiz-btn');
  const quizOverlay = document.getElementById('quiz-overlay');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  if (!quizOverlay || !quizContainer) return;

  const steps = [
    { key: 'total_debt', text: 'Укажите общую сумму долга', type: 'slider' },
    { key: 'debt_structure', text: 'Кому вы должны? (можно несколько)', type: 'multiple', choices: ['Только банки', 'Микрозаймы (МФО)', 'Налоги и ЖКХ', 'Физ. лица'] },
    { key: 'property_deals', text: 'Сделки с имуществом за 3 года?', type: 'options', choices: ['Да, продавал/дарил', 'Нет, не было'] },
    { key: 'current_stage', text: 'Текущая стадия ситуации?', type: 'options', choices: ['Плачу из последних сил', 'Просрочки', 'Коллекторы', 'Суд/Приставы'] },
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
    Object.keys(answers).forEach(k => delete answers[k]);
    renderStep();
  }

  function closeQuiz() {
    document.body.classList.remove('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'true');
    quizContainer.innerHTML = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  quizOverlay.addEventListener('click', (e) => { if (e.target === quizOverlay) closeQuiz(); });
  if (startBtn) startBtn.addEventListener('click', openQuiz);
  quizButtons.forEach(btn => btn.addEventListener('click', openQuiz));

  function progressPercent() { return Math.round(((currentStep + 1) / (steps.length + 1)) * 100); }

  function renderStep() {
    const step = steps[currentStep];
    quizContainer.innerHTML = `
      <div style="height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-bottom: 20px;">
        <div style="height: 100%; width:${progressPercent()}%; background: var(--accent-color); transition: width 0.3s;"></div>
      </div>
      ${currentStep > 0 ? `<button class="quiz-back-btn mb-3" data-action="back">← Назад</button>` : ''}
      <h4 class="text-center mb-4">${step.text}</h4>
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
      range.addEventListener('input', () => label.textContent = formatRub(Number(range.value)));
      nextBtn.addEventListener('click', () => { answers.total_debt = sliderToDebtKey(Number(range.value)); next(); });
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
      nextBtnSingle.addEventListener('click', () => { if (answers[step.key]) next(); });
    }
  }

  function renderSlider() {
    return `
      <div class="text-center mt-4 mb-auto">
        <span id="range-value-display" style="font-size: 2rem; font-weight: 900; color: var(--primary-color); display:block; margin-bottom: 20px;">500 000 ₽</span>
        <input type="range" id="debtRange" min="200000" max="5000000" step="50000" value="500000">
        <div class="d-flex justify-content-between mt-2"><small>200 тыс.</small><small>5 млн. +</small></div>
      </div>
      <button class="quiz-submit-btn mt-4" data-action="next">Далее</button>
    `;
  }
  function renderOptions(choices) {
    let html = `<div class="quiz-grid-options mb-auto">`;
    choices.forEach(c => html += `<button class="btn-quiz-option" data-action="pick" data-value="${c}">${c}</button>`);
    return html + `</div><button class="quiz-submit-btn mt-4" data-action="next-single" disabled>Далее</button>`;
  }
  function renderMultiple(choices) {
    let html = `<div class="quiz-grid-options mb-auto">`;
    choices.forEach(c => html += `<button class="btn-quiz-option" data-action="toggle" data-value="${c}">${c}</button>`);
    return html + `</div><button class="quiz-submit-btn mt-4" data-action="next-multi" disabled>Далее</button>`;
  }

  function next() { currentStep < steps.length - 1 ? (currentStep++, renderStep()) : renderForm(); }

  function renderForm() {
    quizContainer.innerHTML = `
      <h4 class="text-center mb-2">Финальный шаг</h4>
      <p class="text-muted text-center small mb-4">Оставьте номер, чтобы получить план списания.</p>
      <form id="leadForm" class="d-flex flex-column flex-grow-1">
        <input class="form-control mb-3" type="text" name="name" placeholder="Как к вам обращаться" />
        <input class="form-control mb-3" type="text" name="city" placeholder="Ваш город" required />
        <input id="phoneInput" class="form-control mb-3" type="tel" name="phone" placeholder="+7 (900) 000 00 00" required />
        <div class="form-check mb-auto">
          <input class="form-check-input" type="checkbox" id="agree" required checked>
          <label class="form-check-label small" for="agree">Согласен на обработку данных</label>
        </div>
        <div id="formMsg" class="text-center small text-danger mt-2 mb-2"></div>
        <button type="submit" class="quiz-submit-btn mt-3" id="submitBtn">Получить план</button>
      </form>
    `;
    
    const form = quizContainer.querySelector('#leadForm');
    const msg = quizContainer.querySelector('#formMsg');
    const phoneInput = quizContainer.querySelector('#phoneInput');
    const submitBtn = quizContainer.querySelector('#submitBtn');

    let phoneMask;
    if (typeof IMask !== 'undefined') {
      phoneMask = IMask(phoneInput, { mask: '+{7} (000) 000-00-00' });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      if (phoneMask && phoneMask.unmaskedValue.length !== 11) return msg.textContent = 'Введите телефон полностью';
      
      submitBtn.disabled = true; submitBtn.textContent = 'ОТПРАВЛЯЮ...';
      try {
        const token = await new Promise((res, rej) => {
          if (!window.grecaptcha) rej();
          window.grecaptcha.execute(SITE_KEY, { action: 'consult' }).then(res).catch(rej);
        });
        const payload = {
          name: form.name.value, city: form.city.value, phone: phoneMask.value,
          total_debt: answers.total_debt, debt_structure: Array.isArray(answers.debt_structure) ? answers.debt_structure.join(', ') : answers.debt_structure,
          property_deals: answers.property_deals, current_stage: answers.current_stage,
          'g-recaptcha-response': token
        };
        const res = await fetch('/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        window.location.href = '/thanks';
      } catch (err) {
        msg.textContent = 'Ошибка отправки. Позвоните нам.';
        submitBtn.disabled = false; submitBtn.textContent = 'ПОЛУЧИТЬ ПЛАН';
      }
    });
  }
});document.addEventListener('DOMContentLoaded', () => {
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';

  // =========================
  // НАВИГАЦИОННАЯ ШКАЛА SCROLL-SNAP
  // =========================
  const navDots = document.querySelectorAll('.snap-nav-dot');
  const slideContainer = document.querySelector('.snap-container');
  const slides = document.querySelectorAll('.snap-slide');
  
  function updateNav() {
    let index = slides.length - 1;
    while(index >= 0 && slides[index].offsetTop > slideContainer.scrollTop + (slideContainer.clientHeight / 2)) {
      index--;
    }
    navDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
  
  if (slideContainer && navDots.length > 0) {
    slideContainer.addEventListener('scroll', () => requestAnimationFrame(updateNav));
    navDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetId = dot.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        if(targetElement) {
          slideContainer.scrollTo({ top: targetElement.offsetTop, behavior: 'smooth' });
        }
      });
    });
  }

  // =========================
  // КАСТОМНЫЙ JS СЛАЙДЕР СУДЕБНОЙ ПРАКТИКИ
  // =========================
  const track = document.getElementById('practiceSlider');
  if (track) {
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const pagination = document.getElementById('sliderPagination');
    const customSlides = document.querySelectorAll('.custom-slide');
    
    let currentIndex = 0;
    const totalSlides = customSlides.length;

    // Генерация точек
    customSlides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `page-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      pagination.appendChild(dot);
    });
    const dots = pagination.querySelectorAll('.page-dot');

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    if(prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    if(nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Свайп для мобильных
    let startX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      // Легкий параллакс при свайпе
      track.style.transform = `translateX(calc(-${currentIndex * 100}% - ${diff / 5}px))`;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      isDragging = false;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goToSlide(currentIndex + 1) : goToSlide(currentIndex - 1);
      } else {
        goToSlide(currentIndex); // Возврат на место
      }
    }, { passive: true });
  }

  // =========================
  // ШАГИ РАБОТЫ (ИНТЕРАКТИВ ИЗ ПЕРВОГО ЭКРАНА)
  // =========================
  const stepTriggers = document.querySelectorAll('.step-item-trigger');
  const stepDescText = document.getElementById('step-desc-text');
  const stepTexts = {
    '1': 'Детальный правовой аудит вашей ситуации. Мы анализируем структуру задолженности, оцениваем риски по ранее совершенным сделкам и выстраиваем жесткую стратегию защиты.',
    '2': 'Формирование непробиваемой доказательной базы. Мы берем на себя всю бюрократию: запрашиваем справки, выписки и готовим заявление в арбитражный суд.',
    '3': 'Активация полного правового щита. С момента введения процедуры кредиторы и коллекторы теряют право взаимодействовать с вами напрямую.',
    '4': 'Финальное определение суда. Все долги, пени и штрафы списываются безвозвратно. Вы получаете на руки официальный судебный акт.'
  };

  stepTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      stepTriggers.forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');
      const stepKey = trigger.getAttribute('data-step');
      if (stepDescText && stepTexts[stepKey]) {
        stepDescText.style.opacity = '0';
        setTimeout(() => {
          stepDescText.textContent = stepTexts[stepKey];
          stepDescText.style.opacity = '1';
        }, 200);
      }
    });
  });

  // =========================
  // КВИЗ (ЛОГИКА ОСТАВЛЕНА БЕЗ ИЗМЕНЕНИЙ)
  // =========================
  const startBtn = document.getElementById('show-form-btn');
  const quizButtons = document.querySelectorAll('.call-quiz-btn');
  const quizOverlay = document.getElementById('quiz-overlay');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  if (!quizOverlay || !quizContainer) return;

  const steps = [
    { key: 'total_debt', text: 'Укажите общую сумму долга', type: 'slider' },
    { key: 'debt_structure', text: 'Кому вы должны? (можно несколько)', type: 'multiple', choices: ['Только банки', 'Микрозаймы (МФО)', 'Налоги и ЖКХ', 'Физ. лица'] },
    { key: 'property_deals', text: 'Сделки с имуществом за 3 года?', type: 'options', choices: ['Да, продавал/дарил', 'Нет, не было'] },
    { key: 'current_stage', text: 'Текущая стадия ситуации?', type: 'options', choices: ['Плачу из последних сил', 'Просрочки', 'Коллекторы', 'Суд/Приставы'] },
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
    Object.keys(answers).forEach(k => delete answers[k]);
    renderStep();
  }

  function closeQuiz() {
    document.body.classList.remove('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'true');
    quizContainer.innerHTML = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  quizOverlay.addEventListener('click', (e) => { if (e.target === quizOverlay) closeQuiz(); });
  if (startBtn) startBtn.addEventListener('click', openQuiz);
  quizButtons.forEach(btn => btn.addEventListener('click', openQuiz));

  function progressPercent() { return Math.round(((currentStep + 1) / (steps.length + 1)) * 100); }

  function renderStep() {
    const step = steps[currentStep];
    quizContainer.innerHTML = `
      <div style="height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-bottom: 20px;">
        <div style="height: 100%; width:${progressPercent()}%; background: var(--accent-color); transition: width 0.3s;"></div>
      </div>
      ${currentStep > 0 ? `<button class="quiz-back-btn mb-3" data-action="back">← Назад</button>` : ''}
      <h4 class="text-center mb-4">${step.text}</h4>
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
      range.addEventListener('input', () => label.textContent = formatRub(Number(range.value)));
      nextBtn.addEventListener('click', () => { answers.total_debt = sliderToDebtKey(Number(range.value)); next(); });
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
      nextBtnSingle.addEventListener('click', () => { if (answers[step.key]) next(); });
    }
  }

  function renderSlider() {
    return `
      <div class="text-center mt-4 mb-auto">
        <span id="range-value-display" style="font-size: 2rem; font-weight: 900; color: var(--primary-color); display:block; margin-bottom: 20px;">500 000 ₽</span>
        <input type="range" id="debtRange" min="200000" max="5000000" step="50000" value="500000">
        <div class="d-flex justify-content-between mt-2"><small>200 тыс.</small><small>5 млн. +</small></div>
      </div>
      <button class="quiz-submit-btn mt-4" data-action="next">Далее</button>
    `;
  }
  function renderOptions(choices) {
    let html = `<div class="quiz-grid-options mb-auto">`;
    choices.forEach(c => html += `<button class="btn-quiz-option" data-action="pick" data-value="${c}">${c}</button>`);
    return html + `</div><button class="quiz-submit-btn mt-4" data-action="next-single" disabled>Далее</button>`;
  }
  function renderMultiple(choices) {
    let html = `<div class="quiz-grid-options mb-auto">`;
    choices.forEach(c => html += `<button class="btn-quiz-option" data-action="toggle" data-value="${c}">${c}</button>`);
    return html + `</div><button class="quiz-submit-btn mt-4" data-action="next-multi" disabled>Далее</button>`;
  }

  function next() { currentStep < steps.length - 1 ? (currentStep++, renderStep()) : renderForm(); }

  function renderForm() {
    quizContainer.innerHTML = `
      <h4 class="text-center mb-2">Финальный шаг</h4>
      <p class="text-muted text-center small mb-4">Оставьте номер, чтобы получить план списания.</p>
      <form id="leadForm" class="d-flex flex-column flex-grow-1">
        <input class="form-control mb-3" type="text" name="name" placeholder="Как к вам обращаться" />
        <input class="form-control mb-3" type="text" name="city" placeholder="Ваш город" required />
        <input id="phoneInput" class="form-control mb-3" type="tel" name="phone" placeholder="+7 (900) 000 00 00" required />
        <div class="form-check mb-auto">
          <input class="form-check-input" type="checkbox" id="agree" required checked>
          <label class="form-check-label small" for="agree">Согласен на обработку данных</label>
        </div>
        <div id="formMsg" class="text-center small text-danger mt-2 mb-2"></div>
        <button type="submit" class="quiz-submit-btn mt-3" id="submitBtn">Получить план</button>
      </form>
    `;
    
    const form = quizContainer.querySelector('#leadForm');
    const msg = quizContainer.querySelector('#formMsg');
    const phoneInput = quizContainer.querySelector('#phoneInput');
    const submitBtn = quizContainer.querySelector('#submitBtn');

    let phoneMask;
    if (typeof IMask !== 'undefined') {
      phoneMask = IMask(phoneInput, { mask: '+{7} (000) 000-00-00' });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      if (phoneMask && phoneMask.unmaskedValue.length !== 11) return msg.textContent = 'Введите телефон полностью';
      
      submitBtn.disabled = true; submitBtn.textContent = 'ОТПРАВЛЯЮ...';
      try {
        const token = await new Promise((res, rej) => {
          if (!window.grecaptcha) rej();
          window.grecaptcha.execute(SITE_KEY, { action: 'consult' }).then(res).catch(rej);
        });
        const payload = {
          name: form.name.value, city: form.city.value, phone: phoneMask.value,
          total_debt: answers.total_debt, debt_structure: Array.isArray(answers.debt_structure) ? answers.debt_structure.join(', ') : answers.debt_structure,
          property_deals: answers.property_deals, current_stage: answers.current_stage,
          'g-recaptcha-response': token
        };
        const res = await fetch('/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        window.location.href = '/thanks';
      } catch (err) {
        msg.textContent = 'Ошибка отправки. Позвоните нам.';
        submitBtn.disabled = false; submitBtn.textContent = 'ПОЛУЧИТЬ ПЛАН';
      }
    });
  }
});
