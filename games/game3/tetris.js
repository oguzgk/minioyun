const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');

context.scale(20, 20);

// Tetris parçaları
const pieces = [
    [[1, 1, 1, 1]],  // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]]  // J
];

// Oyun değişkenleri
let score = 0;
let arena = createMatrix(20, 20);
let player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
};

let highScore = localStorage.getItem('tetrisHighScore') || 0;
highScoreElement.textContent = highScore;

// Renk paleti tanımlama
const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00'];

// Matris oluşturma fonksiyonu
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Yeni parça oluşturma
function playerReset() {
    player.matrix = pieces[Math.floor(Math.random() * pieces.length)];
    // Her yeni parça için rastgele bir renk seç
    player.color = colors[Math.floor(Math.random() * colors.length)];
    player.pos.y = 0;
    player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
    
    // Oyun sonu kontrolü
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        score = 0;
        scoreElement.textContent = score;
        // Oyun bittiğinde rekor skoru kaydet
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('tetrisHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
    }
}

// Çarpışma kontrolü
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Matrisi birleştirme
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Renk bilgisini de sakla
                arena[y + player.pos.y][x + player.pos.x] = {
                    value: value,
                    color: player.color
                };
            }
        });
    });
}

// Çizim fonksiyonu
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Arena çizimi
    arena.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell && cell.value !== 0) {
                context.fillStyle = cell.color;
                context.fillRect(x, y, 1, 1);
            }
        });
    });
    
    // Aktif parça çizimi
    drawMatrix(player.matrix, player.pos, player.color);
}

// Matris çizimi
function drawMatrix(matrix, offset, color) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Satır temizleme
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        // Satır silinirken animasyon efekti
        const row = arena.splice(y, 1)[0];
        
        // Parlama efekti
        context.fillStyle = 'white';
        context.fillRect(0, y, arena[0].length, 1);
        
        // Skor animasyonu
        const scoreAdd = rowCount * 10;
        const scoreText = `+${scoreAdd}`;
        context.font = '1px Arial';
        context.fillStyle = '#FFD700';
        context.fillText(scoreText, arena[0].length / 2, y);

        // Yeni satır ekleme
        arena.unshift(new Array(arena[0].length).fill(0));
        ++y;
        
        score += rowCount * 10;
        rowCount *= 2;
        scoreElement.textContent = score;

        // Rekor skoru güncelle
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('tetrisHighScore', highScore);
            highScoreElement.textContent = highScore;
        }

        // Satır temizleme efekti
        for (let i = 0; i < arena[0].length; i++) {
            setTimeout(() => {
                context.fillStyle = '#FFFFFF';
                context.fillRect(i, y, 1, 1);
            }, i * 30);
        }
    }
}

// Oyuncu hareketi
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// Oyuncu düşüşü
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
}

// Oyuncu döndürme
function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    const matrix = player.matrix;
    const newMatrix = matrix[0].map((col, i) => 
        matrix.map(row => row[i]).reverse()
    );
    player.matrix = newMatrix;
    
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > matrix[0].length) {
            player.matrix = matrix;
            player.pos.x = pos;
            return;
        }
    }
}

// Oyun döngüsü
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
        dropCounter = 0;
    }
    
    draw();
    requestAnimationFrame(update);
}

// Klavye kontrolleri
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {        // Sol ok
        playerMove(-1);
    } else if (event.keyCode === 39) { // Sağ ok
        playerMove(1);
    } else if (event.keyCode === 40) { // Aşağı ok
        playerDrop();
    } else if (event.keyCode === 38) { // Yukarı ok
        playerRotate();
    }
});

playerReset();
update(); 