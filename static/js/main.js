document.addEventListener('DOMContentLoaded', function() {

  // === reCAPTCHA v3 ===
  const SITE_KEY = '6Lc_4kIsAAAAAIosVgEXXSdjvdSRmVJEzPhD5YhK';

  // === ЭЛЕМЕНТЫ ===
  const startBtn = document.getElementById('show-form-btn');
  const introBlock = document.getElementById('intro-text-block');

  const quizOverlay = document.getElementById('quiz-overlay');
  const quizCard = document.querySelector('.quiz-card');
  const quizContainer = document.getElementById('quiz-container');
  const closeBtn = document.getElementById('quiz-close-btn');

  // === ОПРОС ===
  const questions = {
    1: { text: "Общая сумма долга?", type: "slider" },
    2: { text: "Есть аресты на картах?", type: "boolean" },
    3: { text: "Есть ипотека или авто?", type: "boolean" },
    4: { text: "Готовы начать процедуру в ближайшее время?", type: "boolean" }
  };

  let currentStep = 1;
  let userAnswers = {};

  // ======= ОТКРЫТЬ / ЗАКРЫТЬ КВИЗ (фикс сползания) =======
  function openQuiz() {
    if (introBlock) introBlock.style.display = 'none';
    document.body.classList.add('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'false');
    showStep(1);
  }

  function closeQuiz() {
    document.body.classList.remove('quiz-open');
    quizOverlay.setAttribute('aria-hidden', 'true');
    if (introBlock) introBlock.style.display = 'block';
    currentStep = 1;
    userAnswers = {};
    if (quizContainer) quizContainer.innerHTML = '';
  }

  // клик по фону оверлея закрывает
  if (quizOverlay) {
    quizOverlay.addEventListener('click', (e) => {
      if (e.target === quizOverlay) closeQuiz();
    });
  }

  // ESC закрывает
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('quiz-open')) {
      closeQuiz();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);

  if (startBtn) {
    startBtn.addEventListener('click', openQuiz);
  }

  // ======= РЕНДЕР ШАГА =======
  function formatRub(n) {
    return new Intl.NumberFormat('ru-RU').format(n) + " ₽";
  }

  function sliderToDebtValue(v) {
    // v: 200k..5m
    if (v < 200000) return "under200k";
    if (v < 500000) return "200k-500k";
    if (v < 1000000) return "500k-1m";
    return "over1m";
  }

  function showStep(step) {
    currentStep = step;
    const q = questions[step];
    const progress = Math.round((step / 4) * 100);

    let html = `
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated"
             role="progressbar"
             style="width:${progress}%; background-color: var(--quiz-theme-color);"></div>
      </div>

      <div class="quiz-header-with-back">
        ${step > 1 ? `<button class="quiz-back-btn" type="button" onclick="goBack()">← Назад</button>` : '<div style="width:96px;"></div>'}
        <div class="text-center flex-grow-1">
          <h5 class="fw-bold mb-0">${q.text}</h5>
        </div>
        <div style="width:96px;"></div>
      </div>

      <div style="flex-grow:1; display:flex; flex-direction:column;">
    `;

    if (q.type === "slider") {
      // Старт: 500к
      const startValue = userAnswers[1]?.raw ?? 500000;

      html += `
        <div class="text-center px-2 mt-4">
          <span id="range-value-display" class="range-value-label">${formatRub(startValue)}</span>
          <input type="range" id="debtRange" min="200000" max="5000000" step="50000" value="${startValue}">
          <div class="d-flex justify-content-between mt-2">
            <small class="text-muted">200k</small>
            <small class="text-muted">&gt; 5 млн</small>
          </div>
        </div>

        <
