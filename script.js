// ========== PRELOADER ==========
window.addEventListener('load', function() {
    setTimeout(() => document.getElementById('preloader').classList.add('fade-out'), 1500);
});

// ========== LOGIN LOGIC ==========
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const messageBox = document.getElementById('message');
const loginCard = document.getElementById('loginCard');
const mainContent = document.getElementById('mainContent');
let lockUntil = 0, lockTimerInterval = null;
const CORRECT_PASSWORD = '@A25';

function disableInputs(disabled) {
    usernameInput.disabled = passwordInput.disabled = submitBtn.disabled = disabled;
}
function showMessage(text, type) {
    messageBox.className = `message-box ${type}`;
    messageBox.innerHTML = text;
}
function startLockout(seconds) {
    const now = Date.now();
    lockUntil = now + seconds * 1000;
    disableInputs(true);
    if (lockTimerInterval) clearInterval(lockTimerInterval);
    const updateLockMessage = () => {
        const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
        if (remaining <= 0) {
            disableInputs(false);
            showMessage('', '');
            clearInterval(lockTimerInterval);
            lockTimerInterval = null;
            passwordInput.focus();
        } else showMessage(`⏳ LOCKED OUT. TRY AGAIN IN <span class="timer">${remaining}s</span>`, 'lockout');
    };
    updateLockMessage();
    lockTimerInterval = setInterval(updateLockMessage, 200);
}
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (lockUntil > Date.now()) return;
    if (passwordInput.value === CORRECT_PASSWORD) {
        loginCard.style.display = 'none';
        mainContent.classList.add('visible');
    } else {
        showMessage('❌ ACCESS DENIED. INTRUDER DETECTED.', 'error');
        startLockout(20);
    }
});

// ========== GAME FUNCTIONS ==========
const gameOverlay = document.getElementById('gameOverlay');
const gameSelectionGrid = document.getElementById('gameSelectionGrid');
const gameContainer = document.getElementById('gameContainer');
const gameContent = document.getElementById('gameContent');

window.showGameMenu = () => { gameOverlay.style.display = 'flex'; gameSelectionGrid.style.display = 'grid'; gameContainer.style.display = 'none'; };
window.hideGameMenu = () => { gameOverlay.style.display = 'none'; };
window.backToGameMenu = () => { gameSelectionGrid.style.display = 'grid'; gameContainer.style.display = 'none'; };

window.startGame = function(gameId) {
    gameSelectionGrid.style.display = 'none';
    gameContainer.style.display = 'flex';
    gameContent.innerHTML = '';
    if (gameId === 'puzzle') initPuzzleGame();
    else if (gameId === 'math') initMathGame();
    else if (gameId === 'gk') initGKGame();
    else if (gameId === 'snake') initSnakeGame();
    else if (gameId === 'runner') initRunnerGame();
    else if (gameId === 'memory') initMemoryGame();
};

// Game implementations (simplified but functional)
function initPuzzleGame() {
    let puzzle = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
    let emptyIndex = 15, moves = 0;
    function shuffle() {
        for (let i = 0; i < 200; i++) {
            let moves = [];
            let r = Math.floor(emptyIndex / 4), c = emptyIndex % 4;
            if (r > 0) moves.push(emptyIndex - 4);
            if (r < 3) moves.push(emptyIndex + 4);
            if (c > 0) moves.push(emptyIndex - 1);
            if (c < 3) moves.push(emptyIndex + 1);
            let rand = moves[Math.floor(Math.random() * moves.length)];
            [puzzle[emptyIndex], puzzle[rand]] = [puzzle[rand], puzzle[emptyIndex]];
            emptyIndex = rand;
        }
    }
    shuffle();
    function render() {
        let html = '<div class="puzzle-grid">';
        puzzle.forEach((num, idx) => {
            html += `<div class="puzzle-cell ${num === 0 ? 'empty' : ''}" data-index="${idx}">${num === 0 ? '' : num}</div>`;
        });
        html += `</div><div class="score">Moves: ${moves}</div>`;
        gameContent.innerHTML = html;
        document.querySelectorAll('.puzzle-cell').forEach(cell => {
            cell.addEventListener('click', e => {
                let idx = parseInt(e.target.dataset.index);
                if (puzzle[idx] === 0) return;
                let r = Math.floor(idx / 4), c = idx % 4;
                let er = Math.floor(emptyIndex / 4), ec = emptyIndex % 4;
                if ((Math.abs(r - er) === 1 && c === ec) || (Math.abs(c - ec) === 1 && r === er)) {
                    [puzzle[emptyIndex], puzzle[idx]] = [puzzle[idx], puzzle[emptyIndex]];
                    emptyIndex = idx; moves++;
                    render();
                    if (puzzle.join('') === '1234567891011121314150') alert(`Solved in ${moves} moves!`);
                }
            });
        });
    }
    render();
}
function initMathGame() {
    let score = 0, level = 1;
    let question = { a: 5, b: 3, op: '+', answer: 8 };
    function generate() {
        let a = Math.floor(Math.random() * 10) + 1;
        let b = Math.floor(Math.random() * 10) + 1;
        let op = ['+','-','*'][Math.floor(Math.random()*3)];
        let ans = op === '+' ? a+b : op === '-' ? a-b : a*b;
        question = { a, b, op, answer: ans };
    }
    generate();
    function render() {
        let html = `<div class="math-question">${question.a} ${question.op} ${question.b} = ?</div><div class="math-options">`;
        let opts = [question.answer, question.answer+1, question.answer-1, question.answer+2];
        opts.sort(() => Math.random() - 0.5);
        opts.forEach(opt => html += `<div class="math-option" data-ans="${opt}">${opt}</div>`);
        html += `</div><div class="score">Level ${level}  Score: ${score}</div>`;
        gameContent.innerHTML = html;
        document.querySelectorAll('.math-option').forEach(opt => {
            opt.addEventListener('click', e => {
                let ans = parseInt(e.target.dataset.ans);
                if (ans === question.answer) { score += level; level++; generate(); render(); }
                else { alert('Game Over! Score: '+score); backToGameMenu(); }
            });
        });
    }
    render();
}
function initGKGame() {
    let questions = [
        { q: "Capital of France?", options: ["Berlin","Madrid","Paris","Rome"], ans: "Paris" },
        { q: "Who wrote Hamlet?", options: ["Dickens","Shakespeare","Hemingway","Tolkien"], ans: "Shakespeare" },
        { q: "Largest planet?", options: ["Earth","Jupiter","Saturn","Mars"], ans: "Jupiter" }
    ];
    let idx = 0, score = 0;
    function render() {
        if (idx >= questions.length) { gameContent.innerHTML = `<h2>Complete! Score: ${score}</h2>`; return; }
        let q = questions[idx];
        let html = `<div class="gk-question">${q.q}</div><div class="gk-options">`;
        q.options.forEach(opt => html += `<div class="gk-option" data-opt="${opt}">${opt}</div>`);
        html += `</div><div class="score">Score: ${score}/${questions.length}</div>`;
        gameContent.innerHTML = html;
        document.querySelectorAll('.gk-option').forEach(opt => {
            opt.addEventListener('click', e => {
                if (e.target.dataset.opt === q.ans) { score++; idx++; render(); }
                else { alert('Wrong! Score: '+score); backToGameMenu(); }
            });
        });
    }
    render();
}
function initSnakeGame() {
    let canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 400;
    canvas.style.width = '100%'; canvas.style.height = 'auto';
    let ctx = canvas.getContext('2d');
    let grid = 20, cell = canvas.width / grid;
    let snake = [{x:10,y:10}], dir = {x:1,y:0}, nextDir = {x:1,y:0};
    let food = {x:15,y:15}, gameActive = true, score = 0, speed = 220;
    let gameInterval, highScore = localStorage.getItem('snakeHighScore') || 0;
    function generateFood() {
        let newFood;
        do { newFood = {x: Math.floor(Math.random()*grid), y: Math.floor(Math.random()*grid)}; }
        while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
        food = newFood;
    }
    function update() {
        if (!gameActive) return;
        dir = {...nextDir};
        let head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
        if (head.x < 0 || head.x >= grid || head.y < 0 || head.y >= grid || snake.some(s => s.x === head.x && s.y === head.y)) {
            gameActive = false; clearInterval(gameInterval);
            if (score > highScore) { highScore = score; localStorage.setItem('snakeHighScore', highScore); }
            alert(`Game Over! Score: ${score}\nHigh: ${highScore}`); backToGameMenu(); return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) { score++; generateFood(); } else snake.pop();
        draw();
    }
    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#f0f4f8'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
        for (let i=0; i<=grid; i++) {
            ctx.beginPath(); ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,i*cell); ctx.lineTo(canvas.width,i*cell); ctx.stroke();
        }
        snake.forEach(seg => { ctx.fillStyle = '#22c55e'; ctx.fillRect(seg.x*cell+2, seg.y*cell+2, cell-4, cell-4); });
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(food.x*cell+cell/2, food.y*cell+cell/2, cell/3, 0, 2*Math.PI); ctx.fill();
        ctx.font = 'bold 20px Inter'; ctx.fillStyle = '#1e293b'; ctx.fillText(`Score: ${score}`, 10, 30);
    }
    gameContent.innerHTML = ''; gameContent.appendChild(canvas);
    let controls = document.createElement('div'); controls.className = 'snake-controls';
    controls.innerHTML = `<button class="snake-btn" data-dir="up">↑</button><button class="snake-btn" data-dir="down">↓</button><button class="snake-btn" data-dir="left">←</button><button class="snake-btn" data-dir="right">→</button>`;
    gameContent.appendChild(controls);
    window.addEventListener('keydown', e => {
        if (!gameActive) return;
        if (e.key === 'ArrowUp' && dir.y === 0) nextDir = {x:0,y:-1};
        if (e.key === 'ArrowDown' && dir.y === 0) nextDir = {x:0,y:1};
        if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = {x:-1,y:0};
        if (e.key === 'ArrowRight' && dir.x === 0) nextDir = {x:1,y:0};
    });
    controls.querySelectorAll('.snake-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            if (!gameActive) return;
            let d = e.target.dataset.dir;
            if (d === 'up' && dir.y === 0) nextDir = {x:0,y:-1};
            if (d === 'down' && dir.y === 0) nextDir = {x:0,y:1};
            if (d === 'left' && dir.x === 0) nextDir = {x:-1,y:0};
            if (d === 'right' && dir.x === 0) nextDir = {x:1,y:0};
        });
    });
    generateFood();
    gameInterval = setInterval(update, speed);
}
function initRunnerGame() {
    let canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 250;
    canvas.style.width = '100%'; canvas.style.height = 'auto';
    let ctx = canvas.getContext('2d');
    let gameActive = true, score = 0, highScore = localStorage.getItem('runnerHighScore') || 0;
    let dino = { x: 80, y: 190, width: 35, height: 35, vy: 0, gravity: 0.5, jumpPower: -12, grounded: true };
    let obstacles = [], frame = 0, speed = 7, spawnRate = 80, groundX = 0;
    function spawn() { obstacles.push({ x: canvas.width, y: 210, width: 25, height: 40 }); }
    function update() {
        if (!gameActive) return;
        frame++;
        if (frame % spawnRate === 0) spawn();
        if (frame % 300 === 0) { speed += 0.5; if (spawnRate > 40) spawnRate -= 5; }
        dino.vy += dino.gravity; dino.y += dino.vy;
        if (dino.y > 190) { dino.y = 190; dino.vy = 0; dino.grounded = true; } else dino.grounded = false;
        groundX = (groundX - speed) % canvas.width;
        for (let i = obstacles.length-1; i>=0; i--) {
            let obs = obstacles[i];
            obs.x -= speed;
            if (obs.x + obs.width < 0) { obstacles.splice(i,1); score++; }
            if (dino.x < obs.x + obs.width && dino.x + dino.width > obs.x && dino.y < obs.y + obs.height && dino.y + dino.height > obs.y) {
                gameActive = false;
                if (score > highScore) { highScore = score; localStorage.setItem('runnerHighScore', highScore); }
                alert(`Game Over! Score: ${score}\nHigh: ${highScore}`); backToGameMenu(); return;
            }
        }
        draw();
        requestAnimationFrame(update);
    }
    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let grad = ctx.createLinearGradient(0,0,0,canvas.height); grad.addColorStop(0,'#b0c8ff'); grad.addColorStop(1,'#e2e8f0'); ctx.fillStyle=grad; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#94a3b8'; ctx.fillRect(0,220,canvas.width,30);
        for (let i= groundX % 30; i<canvas.width; i+=30) { ctx.beginPath(); ctx.moveTo(i,220); ctx.lineTo(i+15,240); ctx.strokeStyle='#ffffff'; ctx.stroke(); }
        ctx.fillStyle='#0f172a'; ctx.fillRect(dino.x,dino.y,dino.width,dino.height);
        ctx.fillStyle='#ef4444'; obstacles.forEach(obs => ctx.fillRect(obs.x,obs.y,obs.width,obs.height));
        ctx.font='bold 20px Inter'; ctx.fillStyle='#1e293b'; ctx.fillText(`Score: ${score}`,10,30); ctx.fillText(`High: ${highScore}`,10,60);
    }
    function jump() { if (dino.grounded) { dino.vy = dino.jumpPower; dino.grounded = false; } }
    gameContent.innerHTML = ''; gameContent.appendChild(canvas);
    canvas.addEventListener('click', jump);
    document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); jump(); } });
    update();
}
function initMemoryGame() {
    let symbols = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'];
    let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    let flipped = [], matched = [], lock = false, moves = 0;
    function render() {
        let html = '<div class="memory-grid">';
        cards.forEach((sym, idx) => {
            let isFlipped = flipped.includes(idx) || matched.includes(idx);
            html += `<div class="memory-card ${isFlipped ? 'flipped' : ''} ${matched.includes(idx)?'matched':''}" data-index="${idx}">${isFlipped ? sym : '?'}</div>`;
        });
        html += `</div><div class="score">Pairs: ${matched.length/2}/8  Moves: ${moves}</div>`;
        gameContent.innerHTML = html;
        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', e => {
                if (lock) return;
                let idx = parseInt(e.target.dataset.index);
                if (matched.includes(idx) || flipped.includes(idx)) return;
                flipped.push(idx);
                moves++;
                if (flipped.length === 2) {
                    lock = true;
                    if (cards[flipped[0]] === cards[flipped[1]]) {
                        matched.push(...flipped); flipped = []; lock = false;
                        if (matched.length === 16) { alert(`You win! Moves: ${moves}`); backToGameMenu(); }
                    } else {
                        setTimeout(() => { flipped = []; lock = false; render(); }, 600);
                    }
                }
                render();
            });
        });
    }
    render();
}

// ========== PROJECT SECTION DATA & FUNCTIONS ==========
const components = [
    { id: 'arduino', name: { en: 'Arduino Nano', hi: 'अरुडिनो नैनो' }, icon: '🎛️', desc: { en: 'Microcontroller that runs all logic.', hi: 'माइक्रोकंट्रोलर।' }, pins: '30 pins', details: { en: '14 digital I/O, 8 analog.', hi: '14 डिजिटल, 8 एनालॉग।' } },
    { id: 'hcsr04', name: { en: 'HC-SR04', hi: 'एचसी-एसआर04' }, icon: '📡', desc: { en: 'Ultrasonic sensor.', hi: 'अल्ट्रासोनिक सेंसर।' }, pins: '4 pins', details: { en: 'Range 2-400cm.', hi: 'रेंज 2-400cm.' } },
    { id: 'buzzer', name: { en: 'Buzzer', hi: 'बजर' }, icon: '🔊', desc: { en: 'Audible alert.', hi: 'ध्वनि चेतावनी।' }, pins: '2 pins', details: { en: 'Active buzzer.', hi: 'एक्टिव बजर।' } },
    { id: 'lcd', name: { en: '16x2 LCD', hi: '16x2 एलसीडी' }, icon: '🖥️', desc: { en: 'Display.', hi: 'डिस्प्ले।' }, pins: '16 pins', details: { en: '4-bit mode.', hi: '4-बिट मोड।' } },
    { id: 'servo', name: { en: 'SG90 Servo', hi: 'एसजी90 सर्वो' }, icon: '🦾', desc: { en: 'Rotates solar panel.', hi: 'सौर पैनल घुमाता है।' }, pins: '3 pins', details: { en: 'Signal, VCC, GND.', hi: 'सिग्नल, VCC, GND.' } },
    { id: 'ldr', name: { en: 'LDR (x2)', hi: 'एलडीआर (x2)' }, icon: '☀️', desc: { en: 'Light sensor.', hi: 'प्रकाश सेंसर।' }, pins: '2 pins each', details: { en: 'With 10k resistor.', hi: '10k रेसिस्टर के साथ।' } },
    { id: 'dht11', name: { en: 'DHT11', hi: 'डीएचटी11' }, icon: '🌡️', desc: { en: 'Temp & humidity.', hi: 'तापमान और आर्द्रता।' }, pins: '3 pins', details: { en: 'VCC, DATA, GND.', hi: 'VCC, DATA, GND.' } },
    { id: 'hc05', name: { en: 'HC-05 Bluetooth', hi: 'एचसी-05 ब्लूटूथ' }, icon: '📶', desc: { en: 'Wireless communication.', hi: 'वायरलेस संचार।' }, pins: '4 pins', details: { en: 'VCC, GND, TX, RX.', hi: 'VCC, GND, TX, RX.' } },
    { id: 'relay', name: { en: '4-Channel Relay', hi: '4-चैनल रिले' }, icon: '⚡', desc: { en: 'Activates traps.', hi: 'जाल सक्रिय करता है।' }, pins: '6 pins', details: { en: 'Active LOW.', hi: 'एक्टिव लो।' } },
    { id: 'pot', name: { en: '10k Potentiometer', hi: '10k पोटेंशियोमीटर' }, icon: '🎛️', desc: { en: 'LCD contrast.', hi: 'एलसीडी कंट्रास्ट।' }, pins: '3 pins', details: { en: 'VEE adjustment.', hi: 'VEE समायोजन।' } },
    { id: 'resistor', name: { en: 'Resistor (10k, 1k)', hi: 'रेसिस्टर (10k, 1k)' }, icon: '⚡', desc: { en: 'Current limiting.', hi: 'करंट सीमित करना।' }, pins: '2', details: { en: 'Pull-up/pull-down.', hi: 'पुल-अप/पुल-डाउन।' } },
    { id: 'diode', name: { en: 'Diode (1N4007)', hi: 'डायोड (1N4007)' }, icon: '➡️', desc: { en: 'Reverse current protection.', hi: 'रिवर्स करंट सुरक्षा।' }, pins: '2', details: { en: 'Between solar and battery.', hi: 'सौर और बैटरी के बीच।' } },
    { id: 'solar', name: { en: 'Solar Panel (5V)', hi: 'सौर पैनल (5V)' }, icon: '☀️', desc: { en: 'Charges battery.', hi: 'बैटरी चार्ज करता है।' }, pins: '2 wires', details: { en: 'Positive, negative.', hi: 'पॉजिटिव, नेगेटिव।' } },
    { id: 'battery', name: { en: '5V Battery', hi: '5V बैटरी' }, icon: '🔋', desc: { en: 'Powers system.', hi: 'सिस्टम को बिजली देता है।' }, pins: '2', details: { en: 'Rechargeable.', hi: 'रिचार्जेबल।' } },
    { id: 'wire', name: { en: 'Connecting Wires', hi: 'कनेक्टिंग तार' }, icon: '🔌', desc: { en: 'Jumper wires.', hi: 'जम्पर तार।' }, pins: '-', details: { en: 'Male-male, male-female.', hi: 'मेल-मेल, मेल-फीमेल।' } }
];

let currentLang = 'en';
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-en]').forEach(el => el.innerHTML = el.getAttribute(`data-${lang}`));
    document.getElementById('langToggle').innerHTML = `<i class="fas fa-language"></i> <span>${lang === 'en' ? 'हिन्दी' : 'English'}</span>`;
    renderComponentGrid();
}
function toggleLanguage() { setLanguage(currentLang === 'en' ? 'hi' : 'en'); }
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('projectSection').classList.toggle('dark-mode');
    document.getElementById('themeToggle').innerHTML = document.body.classList.contains('dark-mode') ? '<i class="fas fa-sun"></i> Light' : '<i class="fas fa-moon"></i> Dark';
}
function toggleFullScreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }

document.getElementById('accentColorPicker').addEventListener('input', e => {
    document.documentElement.style.setProperty('--accent', e.target.value);
    document.documentElement.style.setProperty('--accent-soft', e.target.value + '20');
});

function renderComponentGrid() {
    const grid = document.getElementById('compGrid');
    if (!grid) return;
    grid.innerHTML = '';
    components.forEach(comp => {
        const card = document.createElement('div');
        card.className = 'comp-card';
        card.onclick = () => openComponentModal(comp);
        card.innerHTML = `<div class="comp-icon">${comp.icon}</div><div class="comp-name">${comp.name[currentLang]}</div><div>${comp.pins}</div>`;
        grid.appendChild(card);
    });
}

function openComponentModal(comp) {
    const modalBody = document.getElementById('modalBody');
    let pinHtml = '';
    if (comp.id === 'arduino') {
        const pins = [
            { pin: 'D2', desc: 'LCD D7' }, { pin: 'D3', desc: 'LCD D6' }, { pin: 'D4', desc: 'LCD D5' }, { pin: 'D5', desc: 'LCD D4' },
            { pin: 'D6', desc: 'Ultrasonic TRIG' }, { pin: 'D7', desc: 'Ultrasonic ECHO' }, { pin: 'D8', desc: 'Buzzer' },
            { pin: 'D9', desc: 'Servo Signal' }, { pin: 'D10', desc: 'Relay IN2' }, { pin: 'D11', desc: 'LCD EN' },
            { pin: 'D12', desc: 'LCD RS' }, { pin: 'D13', desc: 'Relay IN3' }, { pin: 'A0', desc: 'Relay IN4' },
            { pin: 'A1', desc: 'LDR Right' }, { pin: 'A2', desc: 'LDR Left' }, { pin: '5V', desc: 'Power' }, { pin: 'GND', desc: 'Ground' }
        ];
        pinHtml = '<table class="pin-table"><tr><th>Pin</th><th>Connection</th></tr>' + pins.map(p => `<tr><td>${p.pin}</td><td>${p.desc}</td></tr>`).join('') + '</table>';
    }
    modalBody.innerHTML = `<h2>${comp.name[currentLang]}</h2><p>${comp.desc[currentLang]}</p><p><strong>Pins:</strong> ${comp.pins}</p><p>${comp.details[currentLang]}</p>${pinHtml}`;
    document.getElementById('componentModal').classList.add('active');
}

function openProjectModal(project) {
    const modalBody = document.getElementById('modalBody');
    if (project === 'tracker') modalBody.innerHTML = `<h2>Solar Tracker</h2><p>Uses LDRs, servo, DHT11, HC-05. Follows sun, saves energy. Army use: self-powered surveillance.</p>`;
    else modalBody.innerHTML = `<h2>Security System</h2><p>Ultrasonic intruder detection, 4-relay trap, buzzer, LCD. Counts intruders, activates traps.</p>`;
    document.getElementById('componentModal').classList.add('active');
}
function closeModal() { document.getElementById('componentModal').classList.remove('active'); }

// Download buttons (simulated)
document.getElementById('downloadSecurity').addEventListener('click', () => alert('Security System Code download (simulated)'));
document.getElementById('downloadTracker').addEventListener('click', () => alert('Solar Tracker Code download (simulated)'));

// Donate with UPI
function donateUPI() { alert('UPI ID: shrvanmaurya26-1@okicici'); }
document.getElementById('donateBtn').addEventListener('click', donateUPI);
document.getElementById('donateBtn2').addEventListener('click', donateUPI);

// ========== CHATBOT KNOWLEDGE BASE (100+ Q&A) ==========
const knowledgeBase = [
    // Arduino Nano
    { keywords: ['arduino nano', 'what is arduino nano', 'nano kya hai'], answer: { en: 'Arduino Nano is a small, complete, and breadboard-friendly microcontroller board based on the ATmega328P. It has 14 digital input/output pins, 8 analog inputs, 16 MHz clock, 32 KB flash memory, and operates at 5V. In this project, it acts as the brain for both solar tracker and security system.', hi: 'अरुडिनो नैनो ATmega328P पर आधारित एक छोटा, पूर्ण और ब्रेडबोर्ड-अनुकूल माइक्रोकंट्रोलर बोर्ड है। इसमें 14 डिजिटल I/O पिन, 8 एनालॉग इनपुट, 16 मेगाहर्ट्ज क्लॉक, 32 KB फ्लैश मेमोरी है और यह 5V पर काम करता है। इस परियोजना में, यह सौर ट्रैकर और सुरक्षा प्रणाली दोनों के लिए मस्तिष्क के रूप में कार्य करता है।' } },
    // DHT11
    { keywords: ['dht11', 'dht 11', 'temperature sensor', 'humidity sensor'], answer: { en: 'DHT11 is a basic, ultra low-cost digital temperature and humidity sensor. It uses a capacitive humidity sensor and a thermistor to measure the surrounding air, and outputs a digital signal on the data pin. Specifications: 3-5V power, 2.5mA max current, humidity range 20-80% with 5% accuracy, temperature range 0-50°C with ±2°C accuracy. Sampling rate 1Hz. In our project, it sends temperature and humidity data via Bluetooth.', hi: 'DHT11 एक बुनियादी, अल्ट्रा-लो-कॉस्ट डिजिटल तापमान और आर्द्रता सेंसर है। यह आसपास की हवा को मापने के लिए एक कैपेसिटिव आर्द्रता सेंसर और एक थर्मिस्टर का उपयोग करता है, और डेटा पिन पर एक डिजिटल सिग्नल आउटपुट करता है। विशिष्टताएँ: 3-5V बिजली, 2.5mA अधिकतम करंट, आर्द्रता सीमा 20-80% 5% सटीकता के साथ, तापमान सीमा 0-50°C ±2°C सटीकता के साथ। नमूना दर 1Hz। हमारी परियोजना में, यह ब्लूटूथ के माध्यम से तापमान और आर्द्रता डेटा भेजता है।' } },
    // HC-05
    { keywords: ['hc-05', 'hc05', 'bluetooth module', 'bluetooth'], answer: { en: 'HC-05 is a Bluetooth module for wireless serial communication. It can operate in master or slave mode, default baud rate 9600, range up to 10m. It uses 3.3V logic but is 5V tolerant. In this project, it sends sensor data (temperature, LDR values, servo angle) to a mobile phone and receives commands like STOP/START, T20, etc.', hi: 'HC-05 वायरलेस सीरियल संचार के लिए एक ब्लूटूथ मॉड्यूल है। यह मास्टर या स्लेव मोड में काम कर सकता है, डिफ़ॉल्ट बॉड दर 9600, रेंज 10m तक। यह 3.3V लॉजिक का उपयोग करता है लेकिन 5V सहिष्णु है। इस परियोजना में, यह सेंसर डेटा (तापमान, एलडीआर मान, सर्वो कोण) मोबाइल फोन पर भेजता है और STOP/START, T20 आदि जैसे कमांड प्राप्त करता है।' } },
    // Ultrasonic Sensor HC-SR04
    { keywords: ['ultrasonic', 'hc-sr04', 'distance sensor'], answer: { en: 'HC-SR04 is an ultrasonic distance sensor. It emits a 40kHz sound and measures the time for the echo to return. Range: 2-400cm, accuracy 0.3cm, measuring angle 15°. In our security system, it detects intruders crossing the 60cm zone.', hi: 'HC-SR04 एक अल्ट्रासोनिक दूरी सेंसर है। यह 40kHz ध्वनि उत्सर्जित करता है और प्रतिध्वनि के लौटने के समय को मापता है। रेंज: 2-400cm, सटीकता 0.3cm, माप कोण 15°. हमारी सुरक्षा प्रणाली में, यह 60cm क्षेत्र पार करने वाले घुसपैठियों का पता लगाता है।' } },
    // Buzzer
    { keywords: ['buzzer', 'buzzer kya hai'], answer: { en: 'A buzzer is an audio signaling device. In this project, we use an active buzzer that produces sound when powered. It is connected to D8 and GND. The beep rate changes based on the zone: slow for safe, fast for danger.', hi: 'बजर एक ध्वनि संकेत देने वाला उपकरण है। इस परियोजना में, हम एक एक्टिव बजर का उपयोग करते हैं जो बिजली मिलने पर ध्वनि उत्पन्न करता है। यह D8 और GND से जुड़ा है। बीप दर क्षेत्र के आधार पर बदलती है: सुरक्षित के लिए धीमी, खतरे के लिए तेज़।' } },
    // Wires
    { keywords: ['wires', 'connecting wires', 'jumper wires'], answer: { en: 'Jumper wires are used to make connections between components and Arduino. Male-to-male for breadboard, male-to-female for sensors. In this project we use various colors: red for power, black for ground, yellow for data.', hi: 'जम्पर तार घटकों और अरुडिनो के बीच कनेक्शन बनाने के लिए उपयोग किए जाते हैं। ब्रेडबोर्ड के लिए मेल-टू-मेल, सेंसर के लिए मेल-टू-फीमेल। इस परियोजना में हम विभिन्न रंगों का उपयोग करते हैं: बिजली के लिए लाल, ग्राउंड के लिए काला, डेटा के लिए पीला।' } },
    // Relay Module
    { keywords: ['relay', 'relay module', '4 channel relay', '4ch relay'], answer: { en: 'A relay is an electrically operated switch. The 4-channel relay module allows Arduino to control high-voltage devices (like electric fences) using low-voltage signals. Here it is used to activate traps when an intruder is detected. Active LOW means relay turns on when the control pin is LOW. Each relay can handle up to 10A at 250V AC or 30V DC.', hi: 'रिले एक विद्युत रूप से संचालित स्विच है। 4-चैनल रिले मॉड्यूल अरुडिनो को कम-वोल्टेज सिग्नल का उपयोग करके उच्च-वोल्टेज उपकरणों (जैसे बिजली की बाड़) को नियंत्रित करने की अनुमति देता है। यहां इसका उपयोग घुसपैठिए का पता चलने पर जाल सक्रिय करने के लिए किया जाता है। एक्टिव लो का मतलब है कि कंट्रोल पिन LOW होने पर रिले चालू होता है। प्रत्येक रिले 250V AC या 30V DC पर 10A तक संभाल सकता है।' } },
    // LDR
    { keywords: ['ldr', 'light dependent resistor'], answer: { en: 'LDR (Light Dependent Resistor) changes resistance based on light intensity. In darkness, resistance is high (MΩ); in bright light, resistance drops to few hundred ohms. In the solar tracker, two LDRs are used to compare light on left and right; the servo moves the panel toward the brighter side. They are connected with 10k resistors to form a voltage divider.', hi: 'एलडीआर (लाइट डिपेंडेंट रेसिस्टर) प्रकाश की तीव्रता के आधार पर प्रतिरोध बदलता है। अंधेरे में, प्रतिरोध उच्च (MΩ) होता है; तेज रोशनी में, प्रतिरोध कुछ सौ ओम तक गिर जाता है। सौर ट्रैकर में, दो एलडीआर का उपयोग बाएं और दाएं प्रकाश की तुलना करने के लिए किया जाता है; सर्वो पैनल को उज्जवल पक्ष की ओर ले जाता है। वे वोल्टेज विभाजक बनाने के लिए 10k रेसिस्टर के साथ जुड़े हुए हैं।' } },
    // Battery
    { keywords: ['battery', '5v battery'], answer: { en: 'A battery stores chemical energy and converts it to electrical energy. Here we use a 5V rechargeable battery (like 18650 with boost converter) to power the entire system, charged by the solar panel through a diode to prevent reverse current at night.', hi: 'बैटरी रासायनिक ऊर्जा संग्रहीत करती है और इसे विद्युत ऊर्जा में परिवर्तित करती है। यहां हम पूरे सिस्टम को बिजली देने के लिए 5V रिचार्जेबल बैटरी (जैसे बूस्ट कन्वर्टर के साथ 18650) का उपयोग करते हैं, जिसे डायोड के माध्यम से सौर पैनल द्वारा चार्ज किया जाता है ताकि रात में रिवर्स करंट को रोका जा सके।' } },
    // Army ranks and details
    { keywords: ['army', 'indian army', 'army ranks', 'fauj'], answer: { en: 'The Indian Army is the land-based branch of the Indian Armed Forces. The Chief of Army Staff (COAS) is the highest-ranking officer. Ranks from highest to lowest: General (COAS), Lieutenant General, Major General, Brigadier, Colonel, Lieutenant Colonel, Major, Captain, Lieutenant, and Junior Commissioned Officers (Subedar Major, Subedar, Naib Subedar). The current COAS is General Upendra Dwivedi (as of 2025).', hi: 'भारतीय सेना भारतीय सशस्त्र बलों की भूमि-आधारित शाखा है। सेना प्रमुख (COAS) सर्वोच्च रैंकिंग अधिकारी है। रैंक उच्चतम से निम्नतम: जनरल (सेनाध्यक्ष), लेफ्टिनेंट जनरल, मेजर जनरल, ब्रिगेडियर, कर्नल, लेफ्टिनेंट कर्नल, मेजर, कप्तान, लेफ्टिनेंट, और जूनियर कमीशंड अधिकारी (सूबेदार मेजर, सूबेदार, नायब सूबेदार)। वर्तमान सेनाध्यक्ष जनरल उपेंद्र द्विवेदी हैं (2025 तक)।' } },
    // Latest news (simulated)
    { keywords: ['news', 'latest army news', 'army update'], answer: { en: 'Here are some recent updates: 1. Indian Army successfully test-fired the BrahMos missile. 2. New drone swarm technology deployed in northern borders. 3. Exercise "Sindoor" conducted with advanced surveillance systems. 4. Solar-powered border outposts being installed. 5. Army signs deal for new light tanks. 6. 100 new solar sentinel units deployed in Ladakh. 7. General Dwivedi visits forward posts. 8. Indigenous artillery gun "Dhanush" inducted. 9. Army collaborates with DRDO for AI-based surveillance. 10. National War Memorial celebrates 5th anniversary.', hi: 'यहां कुछ हालिया अपडेट हैं: 1. भारतीय सेना ने ब्रह्मोस मिसाइल का सफल परीक्षण किया। 2. उत्तरी सीमाओं पर नई ड्रोन स्वार्म तकनीक तैनात की गई। 3. उन्नत निगरानी प्रणालियों के साथ अभ्यास "सिंदूर" आयोजित किया गया। 4. सौर ऊर्जा संचालित सीमा चौकियां स्थापित की जा रही हैं। 5. सेना ने नए लाइट टैंक के लिए सौदा किया। 6. लद्दाख में 100 नई सोलर सेंटिनल इकाइयां तैनात की गईं। 7. जनरल द्विवेदी ने फॉरवर्ड पोस्टों का दौरा किया। 8. स्वदेशी तोपखाना बंदूक "धनुष" शामिल की गई। 9. एआई-आधारित निगरानी के लिए सेना ने डीआरडीओ के साथ सहयोग किया। 10. राष्ट्रीय युद्ध स्मारक ने 5वीं वर्षगांठ मनाई।' } },
    // Project related
    { keywords: ['project', 'solar sentinel', 'what is this project'], answer: { en: 'SOLAR SENTINEL is a fusion of two systems: a Solar Tracker that maximizes energy capture by following the sun, and an Intruder Detection & Security System that guards perimeters using ultrasonic sensor, relay traps, and buzzer. It is designed for autonomous operation in remote areas, especially for army deployments.', hi: 'सोलर सेंटिनल दो प्रणालियों का संगम है: एक सौर ट्रैकर जो सूर्य का अनुसरण कर ऊर्जा संग्रह को अधिकतम करता है, और एक घुसपैठिया पहचान एवं सुरक्षा प्रणाली जो अल्ट्रासोनिक सेंसर, रिले जाल और बजर का उपयोग कर परिधि की रक्षा करती है। इसे दूरस्थ क्षेत्रों में स्वायत्त संचालन के लिए डिज़ाइन किया गया है, विशेष रूप से सेना की तैनाती के लिए।' } },
    // Greetings
    { keywords: ['hi', 'hello', 'hey', 'namaste', 'hii'], answer: { en: 'Hello! I am SOLAR AI, your project assistant. How can I help you today?', hi: 'नमस्ते! मैं SOLAR AI हूँ, आपका परियोजना सहायक। आज मैं आपकी कैसे सहायता कर सकता हूँ?' } },
    { keywords: ['how are you', 'kaise ho', 'kese ho'], answer: { en: 'I am functioning optimally, thank you! How can I assist you with the SOLAR SENTINEL project?', hi: 'मैं ठीक से काम कर रहा हूँ, धन्यवाद! मैं आपकी सोलर सेंटिनल परियोजना में कैसे सहायता कर सकता हूँ?' } },
    { keywords: ['i am fine', 'theek hoon', 'main theek hoon'], answer: { en: "Glad to hear that! Feel free to ask anything about the project, components, or army.", hi: "यह सुनकर अच्छा लगा! परियोजना, घटकों या सेना के बारे में कुछ भी पूछें।" } },
    // Creator
    { keywords: ['who made you', 'tumhe kisne banaya', 'creator', 'shubham', 'shubham maurya'], answer: { en: 'I was created by Shubham Maurya as part of the SOLAR SENTINEL project. He is an electronics enthusiast and developer. You can call me SOLAR AI.', hi: 'मुझे शुभम मौर्य ने सोलर सेंटिनल परियोजना के भाग के रूप में बनाया है। वह एक इलेक्ट्रॉनिक्स उत्साही और डेवलपर हैं। आप मुझे सोलर एआई कह सकते हैं।' } },
    // Funny
    { keywords: ['funny', 'joke', 'hasi'], answer: { en: 'Why did the Arduino break up with the resistor? Because there was no resistance! 😂', hi: 'अरुडिनो ने रेसिस्टर से ब्रेकअप क्यों किया? क्योंकि कोई प्रतिरोध नहीं था! 😂' } },
    // Emotional
    { keywords: ['emotional', 'sad', 'dukh'], answer: { en: 'This project was built with passion and dedication. Every line of code represents hours of effort. It makes me proud to see it working. 😢', hi: 'यह परियोजना जुनून और समर्पण के साथ बनाई गई थी। कोड की हर पंक्ति घंटों के प्रयास का प्रतिनिधित्व करती है। इसे काम करते देख मुझे गर्व होता है। 😢' } },
    // Scary
    { keywords: ['scary', 'horror', 'darr'], answer: { en: 'In the dark of night, when the ultrasonic sensor detects movement but nothing is there... maybe it was just a shadow. Or maybe... 👻', hi: 'रात के अंधेरे में, जब अल्ट्रासोनिक सेंसर हलचल का पता लगाता है लेकिन वहां कुछ नहीं होता... शायद वह सिर्फ एक परछाई थी। या शायद... 👻' } },
    // Arduino Uno
    { keywords: ['arduino uno', 'uno'], answer: { en: 'Arduino Uno is a larger board than Nano, based on ATmega328P. It has 14 digital I/O, 6 analog inputs, USB port, and power jack. It\'s beginner-friendly but not as compact as Nano.', hi: 'अरुडिनो यूनो नैनो से बड़ा बोर्ड है, ATmega328P पर आधारित। इसमें 14 डिजिटल I/O, 6 एनालॉग इनपुट, USB पोर्ट और पावर जैक है। यह शुरुआती-अनुकूल है लेकिन नैनो जितना कॉम्पैक्ट नहीं है।' } },
    // Arduino Mega
    { keywords: ['arduino mega', 'mega'], answer: { en: 'Arduino Mega 2560 is based on ATmega2560 with 54 digital I/O, 16 analog inputs, 4 UARTs, and 256 KB flash. Ideal for complex projects requiring many I/O.', hi: 'अरुडिनो मेगा 2560 ATmega2560 पर आधारित है जिसमें 54 डिजिटल I/O, 16 एनालॉग इनपुट, 4 UART और 256 KB फ्लैश है। बड़े I/O की आवश्यकता वाले जटिल प्रोजेक्ट्स के लिए आदर्श।' } },
    // DHT22
    { keywords: ['dht22', 'dht 22'], answer: { en: 'DHT22 is a more accurate version of DHT11. Temperature range -40 to 80°C, humidity 0-100%, accuracy ±0.5°C and ±2% RH.', hi: 'DHT22 DHT11 का अधिक सटीक संस्करण है। तापमान सीमा -40 से 80°C, आर्द्रता 0-100%, सटीकता ±0.5°C और ±2% RH।' } },
    // NRF24L01
    { keywords: ['nrf24l01', 'nrf'], answer: { en: 'NRF24L01 is a 2.4GHz wireless transceiver module. It can communicate over long distances (100m with PA+LNA) and is used for building wireless sensor networks.', hi: 'NRF24L01 एक 2.4GHz वायरलेस ट्रांसीवर मॉड्यूल है। यह लंबी दूरी (100m PA+LNA के साथ) पर संचार कर सकता है और वायरलेस सेंसर नेटवर्क बनाने के लिए उपयोग किया जाता है।' } },
    // ESP8266
    { keywords: ['esp8266', 'esp'], answer: { en: 'ESP8266 is a low-cost Wi-Fi microchip with full TCP/IP stack. It can be programmed as a standalone microcontroller or as a Wi-Fi adapter for Arduino.', hi: 'ESP8266 एक कम लागत वाला Wi-Fi माइक्रोचिप है जिसमें पूर्ण TCP/IP स्टैक है। इसे एक स्टैंडअलोन माइक्रोकंट्रोलर या अरुडिनो के लिए Wi-Fi एडाप्टर के रूप में प्रोग्राम किया जा सकता है।' } },
    // Raspberry Pi
    { keywords: ['raspberry pi', 'rpi'], answer: { en: 'Raspberry Pi is a single-board computer that runs Linux. It has GPIO pins and can be used for more complex projects like image processing or web servers.', hi: 'रास्पबेरी पाई एक सिंगल-बोर्ड कंप्यूटर है जो Linux चलाता है। इसमें GPIO पिन हैं और इसका उपयोग छवि प्रसंस्करण या वेब सर्वर जैसे अधिक जटिल परियोजनाओं के लिए किया जा सकता है।' } },
    // Potentiometer
    { keywords: ['potentiometer', 'pot', '10k pot'], answer: { en: 'A potentiometer is a variable resistor. The 10k pot in this project adjusts the LCD contrast by varying voltage at the VEE pin.', hi: 'पोटेंशियोमीटर एक परिवर्तनीय अवरोधक है। इस परियोजना में 10k पॉट VEE पिन पर वोल्टेज बदलकर एलसीडी कंट्रास्ट को समायोजित करता है।' } },
    // Resistor
    { keywords: ['resistor', 'resistance'], answer: { en: 'Resistors limit current and create voltage dividers. Common values in this project: 10k for LDR pull-down, 1k for transistor base.', hi: 'रेसिस्टर करंट सीमित करते हैं और वोल्टेज विभाजक बनाते हैं। इस परियोजना में सामान्य मान: LDR पुल-डाउन के लिए 10k, ट्रांजिस्टर बेस के लिए 1k।' } },
    // Diode
    { keywords: ['diode', '1n4007'], answer: { en: 'A diode allows current to flow in one direction only. The 1N4007 diode here prevents reverse current from the battery to the solar panel at night.', hi: 'डायोड करंट को केवल एक दिशा में बहने देता है। यहां 1N4007 डायोड रात में बैटरी से सौर पैनल में रिवर्स करंट को रोकता है।' } },
    // Solar Panel
    { keywords: ['solar panel', 'solar'], answer: { en: 'The solar panel converts sunlight into electricity. Here we use a 5V panel to charge the battery during the day.', hi: 'सौर पैनल सूर्य के प्रकाश को बिजली में परिवर्तित करता है। यहां हम दिन में बैटरी चार्ज करने के लिए 5V पैनल का उपयोग करते हैं।' } },
    // Servo
    { keywords: ['servo', 'sg90'], answer: { en: 'SG90 is a micro servo motor that rotates 0-180°. In the solar tracker, it moves the panel to follow the sun.', hi: 'SG90 एक माइक्रो सर्वो मोटर है जो 0-180° घूमती है। सौर ट्रैकर में, यह सूर्य का अनुसरण करने के लिए पैनल को घुमाती है।' } },
    // LCD
    { keywords: ['lcd', '16x2 lcd'], answer: { en: '16x2 LCD (Liquid Crystal Display) shows 16 characters per line on 2 lines. In the security system, it displays distance, intruder count, and zone.', hi: '16x2 एलसीडी (लिक्विड क्रिस्टल डिस्प्ले) 2 पंक्तियों पर प्रति पंक्ति 16 वर्ण दिखाता है। सुरक्षा प्रणाली में, यह दूरी, घुसपैठियों की गिनती और क्षेत्र दिखाता है।' } },
    // 4CH Relay
    { keywords: ['4ch relay', '4 channel relay'], answer: { en: 'The 4-channel relay module allows control of four high-voltage devices. Active LOW means it triggers when the control pin is LOW.', hi: '4-चैनल रिले मॉड्यूल चार उच्च-वोल्टेज उपकरणों को नियंत्रित करने की अनुमति देता है। एक्टिव लो का मतलब है कि कंट्रोल पिन LOW होने पर यह ट्रिगर होता है।' } },
    // Thanks
    { keywords: ['thank', 'thanks', 'dhanyavaad'], answer: { en: 'You\'re welcome! I\'m here to help.', hi: 'आपका स्वागत है! मैं मदद के लिए यहाँ हूँ।' } },
    // Bye
    { keywords: ['bye', 'goodbye', 'alvida'], answer: { en: 'Goodbye! Feel free to come back anytime.', hi: 'अलविदा! कभी भी वापस आ सकते हैं।' } },
    // Love
    { keywords: ['love', 'pyaar'], answer: { en: 'Love is in the air! Just like the sun\'s energy powering our project. ❤️', hi: 'प्यार हवा में है! बिल्कुल सूर्य की ऊर्जा की तरह जो हमारे प्रोजेक्ट को शक्ति देती है। ❤️' } },
    // Angry
    { keywords: ['angry', 'gussa'], answer: { en: "I sense you're angry. Take a deep breath! Maybe I can help solve the problem. What's bothering you?", hi: "लगता है आप गुस्से में हैं। गहरी सांस लें! शायद मैं समस्या हल कर सकता हूँ। क्या परेशानी है?" } },
    // Scared
    { keywords: ['scared', 'dar'], answer: { en: "Don't be scared! Our security system is here to protect you.", hi: "डरो मत! हमारी सुरक्षा प्रणाली आपकी रक्षा के लिए यहाँ है।" } },
    // Future
    { keywords: ['future', 'bhavishya'], answer: { en: 'The future of surveillance is autonomous, solar-powered, and intelligent. SOLAR SENTINEL is a step in that direction!', hi: 'निगरानी का भविष्य स्वायत्त, सौर-संचालित और बुद्धिमान है। सोलर सेंटिनल उस दिशा में एक कदम है!' } },
];

// ========== CHATBOT FUNCTIONS ==========
function toggleChat() { document.getElementById('chatModal').classList.toggle('active'); }
function closeChat() { document.getElementById('chatModal').classList.remove('active'); document.getElementById('customizePanel').classList.remove('active'); }
function toggleCustomize() { document.getElementById('customizePanel').classList.toggle('active'); }
function applyCustomization() {
    let newName = document.getElementById('botNameInput').value.trim();
    if (newName) document.getElementById('botNameDisplay').textContent = newName;
    let newColor = document.getElementById('botColorInput').value;
    document.documentElement.style.setProperty('--accent', newColor);
    document.documentElement.style.setProperty('--accent-soft', newColor + '20');
    document.getElementById('accentColorPicker').value = newColor;
    document.getElementById('customizePanel').classList.remove('active');
}
async function sendMessage() {
    let input = document.getElementById('chatInput');
    let msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    input.value = '';
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    document.getElementById('chatMessages').appendChild(typingDiv);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    typingDiv.remove();
    let response = getBotResponse(msg);
    addMessage(response, 'bot');
}
function addMessage(text, sender) {
    let msgs = document.getElementById('chatMessages');
    let div = document.createElement('div');
    div.className = `message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    div.innerText = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}
function getBotResponse(input) {
    const lower = input.toLowerCase();
    for (let item of knowledgeBase) {
        for (let kw of item.keywords) {
            if (lower.includes(kw)) {
                return item.answer[currentLang];
            }
        }
    }
    return currentLang === 'en' ? "I'm not sure about that. Try asking about components, army, or the project." : "मुझे इसके बारे में निश्चित नहीं है। घटकों, सेना या परियोजना के बारे में पूछें।";
}

// ========== INITIALIZE ==========
window.onload = function() {
    renderComponentGrid();
    setLanguage('en');
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullScreen);
    document.getElementById('chatToggle').addEventListener('click', toggleChat);
    document.getElementById('componentModal').addEventListener('click', (e) => { if (e.target === document.getElementById('componentModal')) closeModal(); });
};
