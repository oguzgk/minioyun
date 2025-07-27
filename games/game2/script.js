function startDraw() {
    // İsimleri ve takımları al
    const namesText = document.getElementById('names').value;
    const teamsText = document.getElementById('teams').value;
    
    // Dizilere çevir ve boş satırları temizle
    const names = namesText.split('\n').filter(name => name.trim() !== '');
    const teams = teamsText.split('\n').filter(team => team.trim() !== '');
    
    // Hata kontrolü
    if (names.length === 0 || teams.length === 0) {
        alert('Lütfen her iki torbaya da değer ekleyin!');
        return;
    }
    
    if (names.length !== teams.length) {
        alert('İsimler ve takımlar eşit sayıda olmalıdır!');
        return;
    }
    
    // Eşleştirmeleri yap
    const matches = createMatches(names, teams);
    
    // Sonuçları göster
    displayMatches(matches);
}

function createMatches(names, teams) {
    // İsimleri ve takımları karıştır
    const shuffledNames = shuffle([...names]);
    const shuffledTeams = shuffle([...teams]);
    
    // Eşleştirmeleri oluştur
    const matches = shuffledNames.map((name, index) => ({
        name: name,
        team: shuffledTeams[index]
    }));
    
    return matches;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayMatches(matches) {
    const matchesDiv = document.getElementById('matches');
    matchesDiv.innerHTML = matches.map((match, index) => 
        `<div class="match-item">
            ${index + 1}. ${match.name} ➡️ ${match.team}
        </div>`
    ).join('');
} 