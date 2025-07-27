const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const addNameButton = document.getElementById('addNameButton');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const nameInput = document.getElementById('nameInput');
const nameList = document.getElementById('nameList');
const result = document.getElementById('result');

let names = [];
let angle = 0;
let isSpinning = false;
let spinInterval = null;
let slowDownFactor = 0.97; // Yavaşlama oranı
let spinningSpeed = 0.1;   // Başlangıç hızı

addNameButton.addEventListener('click', addName);
startButton.addEventListener('click', startSpin);
stopButton.addEventListener('click', stopSpin);

function addName() {
    const name = nameInput.value.trim();
    if (name && !names.includes(name)) {
        names.push(name);
        updateNameList();
        nameInput.value = '';
        drawWheel(); // Yeni isim eklendiğinde çarkı yeniden çizer
    }
}

// Enter tuşuna basılınca ismi ekle
nameInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {  // Enter tuşuna basıldığında
        addName();  // İsim ekleme fonksiyonunu çağır
    }
});

function updateNameList() {
    nameList.innerHTML = '';
    names.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        nameList.appendChild(li);
    });
}

function drawWheel() {
    const numOfSegments = names.length;
    const segmentAngle = 2 * Math.PI / numOfSegments;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Tekerleği temizler
    for (let i = 0; i < numOfSegments; i++) {
        const startAngle = i * segmentAngle + angle;
        const endAngle = (i + 1) * segmentAngle + angle;

        // Çark dilimlerini çiz
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
      
      const sayi = i % 4
      if(sayi == 0){
        ctx.fillStyle = '#EA4335'
      }
      else if(sayi == 1){
        ctx.fillStyle = '#4285F4'
      }
      else if(sayi == 2){
        ctx.fillStyle = '#34A853'
      }
      else if(sayi == 3){
        ctx.fillStyle = '#F9AB00'
      }
        ctx.fill();
        ctx.stroke();

        // İsimleri çark üzerine ekle
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(names[i], canvas.width / 4, 10);
        ctx.restore();
    }

    // Kazananı gösterecek çizgi (ince mavi yarıçap çizgisi)
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);  // Çarkın merkezi
    ctx.lineTo(canvas.width / 2, 10); // Yukarı doğru bir çizgi
    ctx.lineWidth = 2; // Çizginin kalınlığı
    ctx.strokeStyle = 'white'; // Çizginin rengi
    ctx.stroke();
}

function startSpin() {
    if (names.length === 0 || isSpinning) return;

    isSpinning = true;
    spinningSpeed = 0.1; // Başlangıç hızını ayarla
    startButton.disabled = true;
    stopButton.disabled = false;

    spinInterval = requestAnimationFrame(animateWheel);
}

function animateWheel() {
    angle += spinningSpeed;
    drawWheel();

    if (isSpinning) {
        spinInterval = requestAnimationFrame(animateWheel);
    }
}

function stopSpin() {
    stopButton.disabled = true;

    function slowDown() {
        if (spinningSpeed > 0.002) {
            spinningSpeed *= slowDownFactor;
            angle += spinningSpeed;
            drawWheel();
            requestAnimationFrame(slowDown);
        } else {
            isSpinning = false;
            spinningSpeed = 0;
            determineWinner();
            startButton.disabled = false;
        }
    }

    slowDown();
}

function determineWinner() {
    const numOfSegments = names.length;
    const segmentAngle = 2 * Math.PI / numOfSegments;

    // Çarkın durduğu açıyı normalize et (0 - 2π aralığına çekiyoruz)
    const normalizedAngle = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    
    // Çizginin (kuzey noktası) gösterdiği dilimi buluyoruz
    const winningSegmentIndex = Math.floor(((Math.PI * 1.5 - normalizedAngle) % (2 * Math.PI)) / segmentAngle);
    
    const winner = names[(winningSegmentIndex + numOfSegments) % numOfSegments]; // Mod operatörüyle emin oluyoruz
    result.textContent = `Kazanan: ${winner}`;
}

drawWheel();


// Diğer JavaScript Kodlarınız...

function determineWinner() {
    const numOfSegments = names.length;
    const segmentAngle = 2 * Math.PI / numOfSegments;

    // Çarkın durduğu açıyı normalize et (0 - 2π aralığına çekiyoruz)
    const normalizedAngle = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    
    // Çizginin (kuzey noktası) gösterdiği dilimi buluyoruz
    const winningSegmentIndex = Math.floor(((Math.PI * 1.5 - normalizedAngle) % (2 * Math.PI)) / segmentAngle);
    
    const winner = names[(winningSegmentIndex + numOfSegments) % numOfSegments]; // Mod operatörüyle emin oluyoruz

    // Kazananı pop-up ile göstermek için modal'ı açacağız
    showWinnerModal(winner);
}

// Modalı açan fonksiyon
function showWinnerModal(winner) {
    const modal = document.getElementById('winnerModal');
    const winnerText = document.getElementById('winnerText');
    const closeButton = document.querySelector('.close-button');

    // Kazanan ismini modal içindeki yazıya ekle
    winnerText.textContent = `Kazanan: ${winner}`;

    // Modal'ı görünür yap
    modal.style.display = 'flex';

    // Kapatma butonuna tıklanıldığında modalı kapat
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Modal dışına tıklanıldığında da kapatmak için
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
