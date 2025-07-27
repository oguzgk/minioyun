const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun ayarları
const gridSize = 20; // Kare boyutu
const tileCount = canvas.width / gridSize; // Kare sayısı

// Yılan ve yem
let snake = [{ x: 10, y: 10 }]; // Yılanın başlangıç pozisyonu
let food = { x: 5, y: 5 }; // Yem pozisyonu
let direction = { x: 0, y: 0 }; // Yılanın hareket yönü
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Rekor skor
let gameOver = false;
let gameStarted = false; // Oyunun başlayıp başlamadığını kontrol etmek için

// HTML elementleri
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// Rekor skoru güncelle
highScoreElement.textContent = highScore;

// Yılanı çiz
function drawSnake() {
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

// Yemi çiz
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// Yemi rastgele yerleştir
function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    // Yem yılanın üzerine gelirse yeniden yerleştir
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
        }
    });
}

// Oyunu güncelle
function update() {
    if (gameOver || !gameStarted) return;

    // Yılanın yeni pozisyonunu hesapla
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Duvar çarpması kontrolü
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }

    // Kendine çarpması kontrolü
    snake.forEach(segment => {
        if (segment.x === head.x && segment.y === head.y) {
            endGame();
            return;
        }
    });

    // Yılanın başına yeni pozisyonu ekle
    snake.unshift(head);

    // Yem yendi mi?
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        placeFood();
    } else {
        // Yem yenmediyse yılanın kuyruğunu kısalt
        snake.pop();
    }
}

// Oyunu bitir
function endGame() {
    gameOver = true;
    gameOverElement.style.display = 'block';
    finalScoreElement.textContent = score;

    // Rekor skoru güncelle
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

// Oyunu sıfırla
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameStarted = false; // Oyunu yeniden başlatmak için başlangıç durumuna getir
    gameOverElement.style.display = 'none';
    placeFood();
    startGameLoop(); // Oyun döngüsünü yeniden başlat
}

// Oyunu çiz
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
}

// Oyun döngüsünü başlat
function startGameLoop() {
    if (!gameOver) {
        update();
        draw();
        setTimeout(startGameLoop, 100);
    }
}

// Yön tuşları ile kontrol
document.addEventListener('keydown', (e) => {
    if (!gameStarted && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        gameStarted = true; // Oyunu başlat
    }

    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
        case 'Enter':
            if (gameOver) resetGame();
            break;
    }
});

// Yeniden başlat butonu
restartButton.addEventListener('click', resetGame);

// Oyunu başlat
placeFood();
startGameLoop();