// Carregar emails de emails.json
let EMAILS = [];
const EMAILS_PER_GAME = 2;

function loadEmailsAndStart() {
  fetch('emails.json')
    .then(response => response.json())
    .then(data => {
      EMAILS = data;
      startGame();
    })
    .catch(err => {
      showAlert('Erro ao carregar emails.json', 'error');
      console.error(err);
    });
}

let gameState = {
  emails: [],
  current: 0,
  analyzed: 0,
  skipped: 0,
  score: 0,
  answers: []
};

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startGame() {
  gameState.emails = shuffle([...EMAILS]).slice(0, EMAILS_PER_GAME);
  gameState.current = 0;
  gameState.analyzed = 0;
  gameState.skipped = 0;
  gameState.score = 0;
  gameState.answers = [];
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  document.getElementById('total-count').textContent = EMAILS_PER_GAME;
  updateStats();
  renderEmail();
  updateActionButtonsState();
}

function updateStats() {
  document.getElementById('analyzed-count').textContent = gameState.analyzed;
}

function renderEmail() {
  const email = gameState.emails[gameState.current];
  if (!email) return;
  const container = document.getElementById('email-container');
  container.innerHTML = `
    <div class="email-header">
      <div class="email-from" data-part="from">${email.from.text}</div>
      <div class="email-subject" data-part="subject">${email.subject.text}</div>
      <div class="email-date">${email.date}</div>
    </div>
    <div class="email-body">
      ${email.body.map((p, i) => `<p data-part="body" data-index="${i}">${p.text}</p>`).join('')}
    </div>
  `;
  // Adiciona listeners para marcar elementos
  container.querySelectorAll('[data-part]').forEach(el => {
    el.addEventListener('click', function() {
      el.classList.toggle('selected');
    });
  });
}

// Função para animar transição de email
function animateEmailTransition(nextEmailCallback) {
  const container = document.getElementById('email-container');
  container.classList.add('email-exit');
  container.addEventListener('animationend', function handler() {
    container.classList.remove('email-exit');
    container.removeEventListener('animationend', handler);
    nextEmailCallback();
  });
}

function getSelectedParts() {
  const container = document.getElementById('email-container');
  const selected = [];
  if (container.querySelector('.email-from.selected')) selected.push('from');
  if (container.querySelector('.email-subject.selected')) selected.push('subject');
  container.querySelectorAll('.email-body p.selected').forEach(p => {
    selected.push('body:' + p.getAttribute('data-index'));
  });
  return selected;
}

function handleLegitimate() {
  saveAnswer('legit', []);
}

function handlePhishing() {
  const selected = getSelectedParts();
  if (selected.length === 0) {
    showAlert('Selecione ao menos um elemento suspeito!', 'warning');
    return;
  }
  saveAnswer('phishing', selected);
}

function handleSkip() {
  saveAnswer('skip', []);
}

function updateActionButtonsState() {
  const disabled = gameState.analyzed === EMAILS_PER_GAME;
  document.getElementById('legitimate-btn').disabled = disabled;
  document.getElementById('phishing-btn').disabled = disabled;
  document.getElementById('skip-btn').disabled = disabled;
}

function saveAnswer(choice, selectedParts) {
  const email = gameState.emails[gameState.current];
  let correct = false;
  let phishingParts = [];
  if (email.type === 'phishing') {
    if (choice === 'phishing') {
      phishingParts = [];
      if (email.from.isPhishing && selectedParts.includes('from')) phishingParts.push('from');
      if (email.subject.isPhishing && selectedParts.includes('subject')) phishingParts.push('subject');
      email.body.forEach((p, i) => {
        if (p.isPhishing && selectedParts.includes('body:' + i)) phishingParts.push('body:' + i);
      });
      const allPhishing = [];
      if (email.from.isPhishing) allPhishing.push('from');
      if (email.subject.isPhishing) allPhishing.push('subject');
      email.body.forEach((p, i) => { if (p.isPhishing) allPhishing.push('body:' + i); });
      correct = phishingParts.length === allPhishing.length && allPhishing.every(p => selectedParts.includes(p));
    }
  } else if (email.type === 'legit') {
    correct = choice === 'legit';
  }
  if (choice === 'skip') gameState.skipped++;
  if (correct) gameState.score++;
  gameState.analyzed++;
  gameState.answers.push({
    email,
    choice,
    selectedParts,
    correct
  });
  updateActionButtonsState();
  if (gameState.current < EMAILS_PER_GAME - 1) {
    gameState.current++;
    updateStats();
    animateEmailTransition(renderEmail);
  } else {
    updateStats();
    handleFinish(); // Finaliza automaticamente ao responder o último email
  }
}

function handleFinish() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('results-container').style.display = 'block';
  document.getElementById('final-score').textContent = gameState.score;
  document.getElementById('correct-count').textContent = gameState.answers.filter(a => a.correct).length;
  document.getElementById('wrong-count').textContent = gameState.answers.filter(a => !a.correct && a.choice !== 'skip').length;
  document.getElementById('skipped-count').textContent = gameState.skipped;  
  document.getElementById('total-count').textContent = EMAILS_PER_GAME;
 
  renderReview();
}

function renderReview() {
  const reviewList = document.getElementById('review-list');
  reviewList.innerHTML = '';
  gameState.answers.forEach((ans, idx) => {
    const div = document.createElement('div');
    div.className = 'review-item ' + (ans.choice === 'skip' ? 'skipped' : (ans.correct ? 'correct' : 'incorrect'));
    // Montar corpo do email formatado, destacando partes phishing
    const corpoEmail = `
      <div class="review-email-content">
        <div><strong>De:</strong> ${ans.email.from.text} ${(ans.email.from.isPhishing ? '<span class=\'phishing-highlight\'>[phishing]</span>' : '')}</div>
        <div><strong>Assunto:</strong> ${ans.email.subject.text} ${(ans.email.subject.isPhishing ? '<span class=\'phishing-highlight\'>[phishing]</span>' : '')}</div>
        <div><strong>Data:</strong> ${ans.email.date}</div>
        <div><strong>Corpo:</strong><br>${ans.email.body.map((p, i) => `<div class="${p.isPhishing ? 'phishing-highlight' : ''}">${p.text}${p.isPhishing ? ' [phishing]' : ''}</div>`).join('')}</div>
      </div>
    `;
    div.innerHTML = `
      <div class="review-header">
        <span>Email #${idx + 1} - ${ans.email.type === 'phishing' ? 'Phishing' : 'Legítimo'}</span>
        <span class="review-status ${ans.correct ? 'correct' : (ans.choice === 'skip' ? 'skipped' : 'incorrect')}">
          ${ans.correct ? 'Acertou' : (ans.choice === 'skip' ? 'Pulou' : 'Errou')}
        </span>
      </div>
      ${corpoEmail}
      <div class="review-answer">
        <strong>Sua resposta:</strong> ${ans.choice === 'phishing' ? 'Phishing' : (ans.choice === 'legit' ? 'Legítimo' : 'Pulou')}
        ${ans.choice === 'phishing' ? `<br><strong>Elementos marcados:</strong> ${ans.selectedParts.join(', ')}` : ''}
      </div>
      ${ans.email.type === 'phishing' ? `<div class="review-technique"><strong>Técnica:</strong> ${ans.email.technique}</div>` : ''}
    `;
    reviewList.appendChild(div);
  });
}

function showAlert(msg, type = 'warning') {
  const alert = document.createElement('div');
  alert.className = 'alert alert-' + type;
  alert.textContent = msg;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 2500);
}

// Função para reiniciar com animação
function restartWithAnimation() {
  const container = document.getElementById('email-container');
  // Se estiver na tela de resultados, reinicia direto
  if (document.getElementById('results-container').style.display !== 'none') {
    startGame();
    return;
  }
  // Adiciona overlay de reinício se não existir
  let overlay = container.querySelector('.restart-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'restart-overlay';
    overlay.textContent = 'Reiniciando...';
    container.appendChild(overlay);
  }
  if (!container || !container.firstChild) {
    startGame();
    return;
  }
  // Ativa overlay e animação especial
  overlay.classList.add('active');
  container.classList.add('email-restart-exit');
  container.addEventListener('animationend', function handler() {
    container.classList.remove('email-restart-exit');
    overlay.classList.remove('active');
    container.removeEventListener('animationend', handler);
    startGame();
  });
}

// Botões
window.onload = () => {
  document.getElementById('legitimate-btn').onclick = handleLegitimate;
  document.getElementById('phishing-btn').onclick = handlePhishing;
  document.getElementById('skip-btn').onclick = handleSkip;
  document.getElementById('restart-btn').onclick = restartWithAnimation;
  document.getElementById('restart-results-btn').onclick = restartWithAnimation;
  loadEmailsAndStart();
};

// Adicionar CSS para .phishing-highlight
(function(){
  const style = document.createElement('style');
  style.innerHTML = `.phishing-highlight { background: #f8d7da; color: #721c24; border-radius: 4px; padding: 2px 4px; font-weight: bold; }`;
  document.head.appendChild(style);
})(); 