// 遊戲狀態
let gameState = {
    isPlaying: false,
    score: 0,
    timeLeft: 60,
    gameOver: false,
    lastCatTime: 0,
    catSpeed: 3,
    speedIncreaseTimer: 0,
    animationId: null,
    timeId: null
};

// DOM 元素
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    score: document.getElementById('score'),
    time: document.getElementById('time'),
    finalScore: document.getElementById('final-score'),
    gameArea: document.getElementById('game-area'),
    plate: document.getElementById('plate'),
    leftBtn: document.getElementById('left-btn'),
    rightBtn: document.getElementById('right-btn')
};

// 貓咪種類
const catTypes = [
    { size: 'big', points: 2, color: 'big-cat' },
    { size: 'medium', points: 5, color: 'mid-cat' },
    { size: 'small', points: 10, color: 'small-cat' }
];

// 初始化遊戲
function initGame() {
    // 重置遊戲狀態
    gameState = {
        isPlaying: false,
        score: 0,
        timeLeft: 60,
        gameOver: false,
        lastCatTime: 0,
        catSpeed: 3,
        speedIncreaseTimer: 0,
        animationId: null,
        timeId: null
    };

    // 更新 UI
    elements.score.textContent = '0';
    elements.time.textContent = '60';
    elements.finalScore.textContent = '0';

    // 初始化盤子置中
    const gameAreaWidth = elements.gameArea.offsetWidth;
    const plateWidth = elements.plate.offsetWidth;
    elements.plate.style.left = `${(gameAreaWidth - plateWidth) / 2}px`;

    // 顯示開始畫面
    showScreen('start');
}

// 顯示指定畫面
function showScreen(screenName) {
    // 隱藏所有畫面
    elements.startScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.gameOverScreen.classList.remove('active');

    // 顯示指定畫面
    switch (screenName) {
        case 'start':
            elements.startScreen.classList.add('active');
            break;
        case 'playing':
            elements.gameScreen.classList.add('active');
            break;
        case 'gameOver':
            elements.gameOverScreen.classList.add('active');
            break;
    }
}

// 開始遊戲
function startGame() {
    if (gameState.gameOver) {
        initGame();
    }

    gameState.isPlaying = true;
    gameState.lastCatTime = Date.now();
    gameState.speedIncreaseTimer = Date.now();

    showScreen('playing');

    // 開始動畫循環
    gameLoop();
    updateTimer();
}

// 遊戲主循環
function gameLoop() {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const currentTime = Date.now();

    // 生成貓咪
    if (currentTime - gameState.lastCatTime > 1500) {
        createCat();
        gameState.lastCatTime = currentTime;
    }

    // 增加掉落速度
    if (currentTime - gameState.speedIncreaseTimer > 10000) {
        increaseCatSpeed();
        gameState.speedIncreaseTimer = currentTime;
    }

    // 檢查所有正在掉落的貓咪
    checkAllCats();

    gameState.animationId = requestAnimationFrame(gameLoop);
}

// 更新計時器
function updateTimer() {
    if (gameState.gameOver) {
        if (gameState.timeId) {
            clearInterval(gameState.timeId);
            gameState.timeId = null;
        }
        return;
    }

    gameState.timeId = setInterval(() => {
        if (!gameState.isPlaying || gameState.gameOver) {
            if (gameState.timeId) {
                clearInterval(gameState.timeId);
                gameState.timeId = null;
            }
            return;
        }

        gameState.timeLeft--;
        elements.time.textContent = gameState.timeLeft;

        if (gameState.timeLeft <= 0) {
            gameOver();
        }
    }, 1000);
}

// 生成貓咪
function createCat() {
    const catType = catTypes[Math.floor(Math.random() * catTypes.length)];
    const catElement = document.createElement('div');
    catElement.className = `cat-falling ${catType.color}`;

    const img = document.createElement('img');
    img.src = `images/${catType.color}.png`;
    img.alt = `${catType.size} cat`;
    img.className = 'cat-img';
    catElement.appendChild(img);

    // 隨機水平位置
    const gameAreaWidth = elements.gameArea.offsetWidth;
    const plateWidth = elements.plate.offsetWidth;
    const minLeft = 20;
    const maxLeft = gameAreaWidth - plateWidth - 20;
    const randomLeft = Math.random() * (maxLeft - minLeft) + minLeft;

    catElement.style.left = `${randomLeft}px`;

    // 隨機掉落速度
    const speed = gameState.catSpeed * (0.8 + Math.random() * 0.4);
    catElement.style.setProperty('--speed', `${speed}s`);
    catElement.style.animationDuration = `${speed}s`;

    elements.gameArea.appendChild(catElement);

    // 自動移除
    setTimeout(() => {
        catElement.remove();
    }, speed * 1000);
}

// 檢查碰撞
function checkCollision(catElement, catType) {
    const catRect = catElement.getBoundingClientRect();
    const plateRect = elements.plate.getBoundingClientRect();

    if (catRect.bottom >= plateRect.top &&
        catRect.left >= plateRect.left &&
        catRect.right <= plateRect.right) {

        // 接住貓咪
        gameState.score += catType.points;
        elements.score.textContent = gameState.score;

        // 板子脈衝效果
        elements.plate.classList.add('plate-pulse');
        setTimeout(() => {
            elements.plate.classList.remove('plate-pulse');
        }, 300);

        // 移除貓咪
        catElement.remove();
    }
}

// 檢查所有貓咪
function checkAllCats() {
    const fallingCats = document.querySelectorAll('.cat-falling');
    
    fallingCats.forEach(cat => {
        const catRect = cat.getBoundingClientRect();
        const plateRect = elements.plate.getBoundingClientRect();
        
        // 找到對應的貓咪類型
        let catType = null;
        if (cat.classList.contains('big-cat')) {
            catType = { points: 2 };
        } else if (cat.classList.contains('mid-cat')) {
            catType = { points: 5 };
        } else if (cat.classList.contains('small-cat')) {
            catType = { points: 10 };
        }
        
        if (catRect.bottom >= plateRect.top &&
            catRect.left >= plateRect.left &&
            catRect.right <= plateRect.right &&
            catType) {

            // 接住貓咪
            gameState.score += catType.points;
            elements.score.textContent = gameState.score;

            // 板子脈衝效果
            elements.plate.classList.add('plate-pulse');
            setTimeout(() => {
                elements.plate.classList.remove('plate-pulse');
            }, 300);

            // 移除貓咪
            cat.remove();
        }
        
        // 檢查貓咪是否掉出遊戲區域底部
        const gameAreaRect = elements.gameArea.getBoundingClientRect();
        if (catRect.top > gameAreaRect.bottom) {
            cat.remove();
        }
    });
}

// 增加掉落速度
function increaseCatSpeed() {
    gameState.catSpeed = Math.max(1.5, gameState.catSpeed - 0.3);

    // 所有正在掉落的貓咪加速
    const fallingCats = document.querySelectorAll('.cat-falling');
    fallingCats.forEach(cat => {
        cat.classList.add('speed-up');
        setTimeout(() => {
            cat.classList.remove('speed-up');
        }, 500);
        
        // 更新現有貓咪的動畫時長
        const currentSpeed = gameState.catSpeed * (0.8 + Math.random() * 0.4);
        cat.style.animationDuration = `${currentSpeed}s`;
    });
}

// 遊戲結束
function gameOver() {
    gameState.isPlaying = false;
    gameState.gameOver = true;

    elements.finalScore.textContent = gameState.score;
    showScreen('gameOver');
}

// 移動盤子
function movePlate(direction) {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const currentLeft = elements.plate.offsetLeft;
    const gameAreaWidth = elements.gameArea.offsetWidth;
    const plateWidth = elements.plate.offsetWidth;
    const maxMove = gameAreaWidth - plateWidth - 20;

    let newLeft = currentLeft;

    if (direction === 'left') {
        newLeft = Math.max(20, currentLeft - 50);
    } else if (direction === 'right') {
        newLeft = Math.min(maxMove, currentLeft + 50);
    }

    elements.plate.style.left = `${newLeft}px`;
}

// 鍵盤事件
function handleKeyDown(e) {
    if (!gameState.isPlaying || gameState.gameOver) return;

    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlate('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlate('right');
            break;
    }
}

// 觸控按鈕事件
function handleTouchButtonClick(buttonId, direction) {
    buttonId.addEventListener('click', () => {
        movePlate(direction);
    });

    // 按住不放
    buttonId.addEventListener('mousedown', () => {
        movePlate(direction);
    });

    buttonId.addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePlate(direction);
    });
}

// 初始化事件監聽器
function initEventListeners() {
    // 開始/重新開始按鈕
    elements.startBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('click', startGame);

    // 鍵盤事件
    document.addEventListener('keydown', handleKeyDown);

    // 觸控按鈕事件
    handleTouchButtonClick(elements.leftBtn, 'left');
    handleTouchButtonClick(elements.rightBtn, 'right');

    // 滑鼠按住移動盤子
    let isMouseDown = false;
    let mouseDirection = null;

    elements.gameArea.addEventListener('mousedown', (e) => {
        if (e.target === elements.gameArea || e.target === elements.plate) {
            isMouseDown = true;
        }
    });

    elements.gameArea.addEventListener('mouseup', () => {
        isMouseDown = false;
        mouseDirection = null;
    });

    elements.gameArea.addEventListener('mousemove', (e) => {
        if (!isMouseDown || !gameState.isPlaying || gameState.gameOver) return;

        const rect = elements.gameArea.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const plateX = elements.plate.offsetLeft;
        const plateWidth = elements.plate.offsetWidth;

        if (mouseX < plateX + plateWidth / 3) {
            if (mouseDirection !== 'left') {
                movePlate('left');
                mouseDirection = 'left';
            }
        } else if (mouseX > plateX + 2 * plateWidth / 3) {
            if (mouseDirection !== 'right') {
                movePlate('right');
                mouseDirection = 'right';
            }
        }
    });

    // 觸控事件
    elements.gameArea.addEventListener('touchstart', (e) => {
        if (e.target === elements.gameArea || e.target === elements.plate) {
            e.preventDefault();
        }
    });

    elements.gameArea.addEventListener('touchmove', (e) => {
        if (!gameState.isPlaying || gameState.gameOver) return;

        const touch = e.touches[0];
        const rect = elements.gameArea.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const plateX = elements.plate.offsetLeft;
        const plateWidth = elements.plate.offsetWidth;

        if (touchX < plateX + plateWidth / 3) {
            movePlate('left');
        } else if (touchX > plateX + 2 * plateWidth / 3) {
            movePlate('right');
        }
    });
}

// 初始化
function main() {
    initEventListeners();
    initGame();

    console.log('遊戲已初始化');
}

// 開始遊戲
main();