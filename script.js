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

// Chatbot functions
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
    addMessage("I'm here to help! Ask about components or army.", 'bot');
}
function addMessage(text, sender) {
    let msgs = document.getElementById('chatMessages');
    let div = document.createElement('div');
    div.className = `message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    div.innerText = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

// Initialize
window.onload = function() {
    renderComponentGrid();
    setLanguage('en');
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullScreen);
    document.getElementById('chatToggle').addEventListener('click', toggleChat);
    document.getElementById('componentModal').addEventListener('click', (e) => { if (e.target === document.getElementById('componentModal')) closeModal(); });
};