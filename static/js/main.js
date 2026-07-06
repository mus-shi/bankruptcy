document.addEventListener('DOMContentLoaded', () => {
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';
  
  // ==========================================
  // ЛОГИКА СЛАЙДЕРА СУДЕБНОЙ ПРАКТИКИ
  // ==========================================
  const track = document.getElementById('practice-track');
  const nextBtn = document.getElementById('slider-next');
  const prevBtn = document.getElementById('slider-prev');
  
  if (track && nextBtn && prevBtn) {
    const slides = track.querySelectorAll('.slide-item');
    let currentIndex = 0;

    const updateSlider = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    });

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    });
  }

  // ==========================================
  // ЛОГИКА ШАГОВ (Экран 1)
  // ==========================================
  const stepTriggers = document.querySelectorAll('.step-item-trigger');
  const stepDescText = document.getElementById('step-desc-text');
  
  const stepTexts = {
    '1': 'Детальный правовой аудит вашей ситуации. Мы анализируем структуру задолженности, оцениваем риски и выстраиваем жесткую стратегию защиты. Никаких пустых обещаний — только сухой расчет шансов на списание.',
    '2': 'Формирование непробиваемой доказательной базы. Мы берем на себя всю бюрократию: запрашиваем необходимые справки и готовим заявление, которое арбитражный суд примет с первого раза. Ваше участие минимально.',
    '3': 'Активация полного правового щита. С момента введения процедуры кредиторы теряют право взаимодействовать с вами напрямую. Блокируем попытки оспорить сделки или изъять защищенное имущество.',
    '4': 'Финальное определение суда. Все задолженности, пени и штрафы списываются безвозвратно. Вы получаете на руки официальный судебный акт, подтверждающий вашу полную финансовую независимость.'
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

  // ==========================================
  // ЛОГИКА КВИЗА
  // ==========================================
  const startBtn = document.getElementById('show-form-btn');
  const quizButtons = document.querySelectorAll('.call-quiz-btn');
  const quizOverlay = document.getElementById('quiz-overlay');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  if (!quizOverlay || !quizContainer) return;

  const steps = [
    { key: 'total_debt', text: 'Укажите общую сумму долга', type: 'slider' },
    { key: 'debt_structure', text: 'Кому вы должны? (можно несколько)', type: 'multiple', choices: ['Только банки', 'Микрозаймы (МФО)', 'Налоги и ЖКХ', 'Физ. лица (расписки)'] },
    { key: 'property_deals', text: 'Были ли сделки с имуществом за последние 3 года?', type: 'options', choices: ['Да, продавал/дарил', 'Нет, ничего не продавал'] },
    { key: 'current_stage', text: 'На какой стадии сейчас ситуация?', type: 'options', choices: ['Плачу из последних сил', 'Начались просрочки', 'Звонят коллекторы', 'Дело у приставов (ФССП)'] },
  ];

  let currentStep = 0;
  const answers = {};

  const formatRub = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const sliderToDebtKey = (v) => { if (v < 200000) return 'under200k'; if (v < 500000) return '200k-500k'; if (v < 1000000) return '500k-1m'; return 'over1m'; };

  function openQuiz() { document.body.classList.add('quiz-open'); quizOverlay.setAttribute('aria-hidden', 'false'); currentStep = 0; renderStep(); }
  function closeQuiz() { document.body.classList.remove('quiz-open'); quizOverlay.setAttribute('aria-hidden', 'true'); quizContainer.innerHTML = ''; Object.keys(answers).forEach(k => delete answers[k]); }

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  quizOverlay.addEventListener('click', (e) => { if (e.target === quizOverlay) closeQuiz(); });
  if (startBtn) startBtn.addEventListener('click', openQuiz);
  quizButtons.forEach(btn => btn.addEventListener('click', openQuiz));

  function renderStep() {
    const step = steps[currentStep];
    const pct = Math.round(((currentStep + 1) / (steps.length + 1)) * 100);

    quizContainer.innerHTML = `
      <div style="height: 4px; background: #e9ecef; margin-top: 12px; margin-bottom: 20px;"><div style="height: 100%; width:${pct}%; background-color: var(--accent-color); transition: width 0.3s ease;"></div></div>
      <div class="d-flex align-items-center mb-3">${currentStep > 0 ? `<button class="quiz-back-btn" data-action="back">← Назад</button>` : '<div></div>'}</div>
      <h4 class="text-center mb-4" style="font-size: 1.1rem; color: var(--primary-color);">${step.text}</h4>
      <div style="flex:1; display:flex; flex-direction:column;">
        ${step.type === 'slider' ? renderSlider() : (step.type === 'multiple' ? renderMultiple(step.choices) : renderOptions(step.choices))}
      </div>
    `;

    const backBtn = quizContainer.querySelector('[data-action="back"]');
    if (backBtn) backBtn.addEventListener('click', () => { currentStep -= 1; renderStep(); });

    if (step.type === 'slider') {
      const range = quizContainer.querySelector('#debtRange');
      const label = quizContainer.querySelector('#range-value-display');
      label.textContent = formatRub(Number(range.value));
      range.addEventListener('input', () => label.textContent = formatRub(Number(range.value)));
      quizContainer.querySelector('[data-action="next"]').addEventListener('click', () => { answers.total_debt = sliderToDebtKey(Number(range.value)); next(); });
    } else if (step.type === 'multiple') {
      answers[step.key] = answers[step.key] || [];
      const nextBtnMulti = quizContainer.querySelector('[data-action="next-multi"]');
      quizContainer.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-value');
          btn.classList.toggle('selected');
          if (btn.classList.contains('selected')) { if (!answers[step.key].includes(val)) answers[step.key].push(val); } 
          else answers[step.key] = answers[step.key].filter(v => v !== val);
          nextBtnMulti.disabled = answers[step.key].length === 0;
        });
      });
      nextBtnMulti.addEventListener('click', () => { if (answers[step.key].length === 0) answers[step.key] = ['Не указано']; next(); });
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
    return `<div style="display:flex; flex-direction:column; height:100%;"><div class="text-center mt-4"><span id="range-value-display" style="font-size: 1.5rem; font-weight: 900; color: var(--primary-color); display: inline-block; margin-bottom: 15px;">500 000 ₽</span><input type="range" id="debtRange" style="width: 100%; accent-color: var(--accent-color);" min="200000" max="5000000" step="50000" value="500000"><div class="d-flex justify-content-between mt-2 px-2"><small class="text-muted fw-bold">200 000 ₽</small><small class="text-muted fw-bold">&gt; 5 млн ₽</small></div></div><div style="margin-top: auto; padding-top: 24px; text-align: center;"><button type="button" data-action="next" style="padding: 12px 24px; font-weight: 800; text-transform: uppercase; color: #fff; background: var(--cta-a); border: 0; cursor: pointer; transition: background 0.2s;">Далее</button></div></div>`;
  }
  function renderOptions(c) { return `<div style="display: grid; gap: 8px;">${c.map(ch => `<button type="button" data-action="pick" data-value="${ch}" style="border: 2px solid rgba(0,0,0,0.1); background: #fff; padding: 12px 16px; font-weight: 600; cursor: pointer; text-align: left; transition: all .2s;">${ch}</button>`).join('')}</div><div style="margin-top: auto; padding-top: 24px; text-align: center;"><button type="button" data-action="next-single" disabled style="padding: 12px 24px; font-weight: 800; color: #fff; background: var(--cta-a); border: 0; cursor: pointer;">Далее</button></div>`; }
  function renderMultiple(c) { return `<div style="display: grid; gap: 8px;">${c.map(ch => `<button type="button" data-action="toggle" data-value="${ch}" style="border: 2px solid rgba(0,0,0,0.1); background: #fff; padding: 12px 16px; font-weight: 600; cursor: pointer; text-align: left; transition: all .2s;">${ch}</button>`).join('')}</div><div style="margin-top: auto; padding-top: 24px; text-align: center;"><button type="button" data-action="next-multi" disabled style="padding: 12px 24px; font-weight: 800; color: #fff; background: var(--cta-a); border: 0; cursor: pointer;">Далее</button></div>`; }
  function next() { if (currentStep < steps.length - 1) { currentStep += 1; renderStep(); } else renderForm(); }

  function renderForm() {
    quizContainer.innerHTML = `
      <div style="height: 4px; background: #e9ecef; margin-top: 12px; margin-bottom: 20px;"><div style="height: 100%; width:100%; background-color: var(--accent-color);"></div></div>
      <div class="d-flex align-items-center mb-2"><button class="quiz-back-btn" data-action="back" style="border: none; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">← Назад</button></div>
      <div class="text-center mb-4"><h4 style="font-size: 1.2rem; color: var(--primary-color); font-weight: 900; text-transform: uppercase;">Ситуация проанализирована</h4><p class="text-muted small">Оставьте номер, чтобы получить план списания долгов.</p></div>
      <form id="leadForm" class="mt-2" novalidate style="display:flex; flex-direction:column; flex:1;">
        <div class="mb-3"><input class="form-control" type="text" name="name" placeholder="Как к вам обращаться" style="border: 2px solid rgba(0,0,0,0.1); padding: 12px;"/></div>
        <div class="mb-3"><input class="form-control" type="text" name="city" placeholder="Откуда вы? (Ваш город)" required style="border: 2px solid rgba(0,0,0,0.1); padding: 12px;"/></div>
        <div class="mb-3"><input id="phoneInput" class="form-control" type="tel" name="phone" placeholder="+7 (900) 000 00 00" required style="border: 2px solid rgba(0,0,0,0.1); padding: 12px;"/></div>
        <div class="form-check mb-2" style="background: #f8faff; padding: 12px 16px; border-radius: 4px; border-left: 3px solid var(--primary-color);">
          <input class="form-check-input" type="checkbox" id="agree" name="agree" required />
          <label class="form-check-label small" for="agree">Я даю согласие на обработку данных</label>
        </div>
        <div id="formMsg" class="mt-2 small text-center fw-bold"></div>
        <div style="margin-top: auto; padding-top: 24px; text-align: center;"><button type="submit" id="submitBtn" style="padding: 12px 24px; font-weight: 800; color: #fff; background: var(--cta-a); border: 0; cursor: pointer; text-transform: uppercase;">Получить план</button></div>
      </form>
    `;
    quizContainer.querySelector('[data-action="back"]').addEventListener('click', () => { currentStep = steps.length - 1; renderStep(); });

    const form = quizContainer.querySelector('#leadForm');
    const msg = quizContainer.querySelector('#formMsg');
    const phoneMask = IMask(quizContainer.querySelector('#phoneInput'), { mask: '+{7} (000) 000-00-00', prepare: (a, m) => a === '8' && m.value === '' ? '' : a });

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); msg.textContent = '';
      if (phoneMask.unmaskedValue.length !== 11) { msg.textContent = 'Введите телефон полностью.'; msg.style.color = 'var(--cta-a)'; return; }
      if (!form.city.value.trim()) { msg.textContent = 'Укажите ваш город.'; msg.style.color = 'var(--cta-a)'; return; }
      if (!form.agree.checked) { msg.textContent = 'Нужно согласие на обработку.'; msg.style.color = 'var(--cta-a)'; return; }

      const submitBtn = quizContainer.querySelector('#submitBtn');
      submitBtn.disabled = true; submitBtn.textContent = 'ОТПРАВЛЯЮ...';

      try {
        const token = await new Promise((res, rej) => {
          if (!window.grecaptcha) rej('reCAPTCHA err');
          window.grecaptcha.execute(SITE_KEY, { action: 'consult' }).then(res).catch(rej);
        });

        const payload = {
          name: form.name.value || '—', city: form.city.value.trim(), phone: phoneMask.value,
          total_debt: answers.total_debt, debt_structure: Array.isArray(answers.debt_structure) ? answers.debt_structure.join(', ') : answers.debt_structure,
          property_deals: answers.property_deals, current_stage: answers.current_stage, 'g-recaptcha-response': token,
          utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'Прямой заход',
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || '—',
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '—'
        };

        const res = await fetch('/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(); window.location.href = '/thanks';
      } catch (err) {
        msg.textContent = 'Ошибка отправки. Позвоните нам.'; msg.style.color = 'var(--cta-a)';
        submitBtn.disabled = false; submitBtn.textContent = 'ПОЛУЧИТЬ ПЛАН';
      }
    });
  }
});
