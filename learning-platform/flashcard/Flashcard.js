// plan
//1. user will choose to create a new deck of quistions or add to existing one
//2. user will write question and answer of the card, and i will make the question the key and the answer the value
//3. after he finishis the user will click on a button which he will ask the user the quistions randomaly only once, no question will be answered twice
// note: there will be an option to make a certein question reappear more than once using the star icon
//4. existing decks will have 5 buttons, one to add a new card to the deck and one to start the quiz, one to delete the deck or its elements and one to preview the deck name, and lastly one to update the deck elements
//Optional enhancement: Drag flashcards left/right to star, skip, or answer — similar to swiping behavior.

// ----------------------------------

// const decks = [
//   {
//     name: "JavaScript Basics",
//     description: "Core JS concepts",
//     cards: [
//       { question: "What is a closure?", answer: "A function with preserved scope." },
//       { question: "What is hoisting?", answer: "Variable/function declaration moved to top." }
//     ]
//   },
//   {
//     name: "Python",
//     cards: [
//       { question: "What is a list?", answer: "Ordered, mutable collection." }
//     ]
//   }
// ];
let decks = JSON.parse(localStorage.getItem('flashcardDecks')) || {};
let currentDeck = null;
let currentCards = [];
let currentCardIndex = 0;
let quizCards = [];
let starredCards = JSON.parse(localStorage.getItem('starredCards')) || {};
let tempCards = [];

function showHomeScreen() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('homeScreen').classList.add('active');
    renderDecks();
}

function showCreateScreen(deckName = null) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('createScreen').classList.add('active');

    const deckNameInput = document.getElementById('deckName');
    if (deckName) {
        deckNameInput.value = deckName;
        deckNameInput.disabled = false;
        deckNameInput.dataset.original = deckName;
        tempCards = [...Object.entries(decks[deckName]).map(([q, a]) => ({question: q, answer: a}))];
    } else {
        deckNameInput.value = '';
        deckNameInput.removeAttribute('data-original');
        tempCards = [];
    }

    document.getElementById('questionInput').value = '';
    document.getElementById('answerInput').value = '';
    renderTempCards();
}

function showQuizScreen(deckName) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('quizScreen').classList.add('active');
    
    currentDeck = deckName;
    let deckCards = Object.entries(decks[deckName]);
    quizCards = [...deckCards];
    
    deckCards.forEach(([q, a]) => {
        if (starredCards[q]) {
            const times = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < times; i++) {
                quizCards.push([q, a]);
            }
        }
    });

    shuffleArray(quizCards);
    currentCardIndex = 0;
    
    createDots();
    showCard();
}

function renderDecks() {
    const deckGrid = document.getElementById('deckGrid');
    deckGrid.innerHTML = '';
    
    Object.keys(decks).forEach(deckName => {
        const cardCount = Object.keys(decks[deckName]).length;
        const deckCard = document.createElement('div');
        deckCard.className = 'deck-card';
        deckCard.innerHTML = `
            <div class="deck-name">${deckName}</div>
            <div class="deck-count">${cardCount} cards</div>
            <div class="deck-actions">
                <button class="btn btn-success" onclick="showQuizScreen('${deckName}')">Study</button>
                <button class="btn" onclick="showCreateScreen('${deckName}')">Edit</button>
                <button class="btn btn-warning" onclick="previewDeck('${deckName}')">Preview</button>
                <button class="btn btn-danger" onclick="deleteDeck('${deckName}')">Delete</button>
            </div>
        `;
        deckGrid.appendChild(deckCard);
    });
}

function addCard() {
    const question = document.getElementById('questionInput').value.trim();
    const answer = document.getElementById('answerInput').value.trim();
    
    if (question && answer) {
        tempCards.push({question, answer});
        document.getElementById('questionInput').value = '';
        document.getElementById('answerInput').value = '';
        renderTempCards();
    }
}

function renderTempCards() {
    const cardsList = document.getElementById('cardsList');
    cardsList.innerHTML = '';
    
    tempCards.forEach((card, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = 'card-item';
        cardItem.innerHTML = `
            <div class="card-question">${card.question}</div>
            <div class="card-answer">${card.answer}</div>
            <button class="btn btn-danger" onclick="removeCard(${index})" style="margin-top: 10px;">Remove</button>
        `;
        cardsList.appendChild(cardItem);
    });
}

function removeCard(index) {
    tempCards.splice(index, 1);
    renderTempCards();
}

function saveDeck() {
    const deckNameInput = document.getElementById('deckName');
    const deckName = deckNameInput.value.trim();
    const originalName = deckNameInput.dataset.original;

    if (deckName && tempCards.length > 0) {
        if (originalName && originalName !== deckName) {
            delete decks[originalName];
        }

        decks[deckName] = {};
        tempCards.forEach(card => {
            decks[deckName][card.question] = card.answer;
        });

        localStorage.setItem('flashcardDecks', JSON.stringify(decks));
        showHomeScreen();
    }
}

function deleteDeck(deckName) {
    if (confirm(`Are you sure you want to delete "${deckName}"?`)) {
        delete decks[deckName];
        localStorage.setItem('flashcardDecks', JSON.stringify(decks));
        renderDecks();
    }
}

function previewDeck(deckName) {
    const cards = Object.entries(decks[deckName]);
    let preview = `${deckName}:\n\n`;
    cards.forEach(([question, answer], index) => {
        preview += `${index + 1}. Q: ${question}\n   A: ${answer}\n\n`;
    });
    alert(preview);
}

function createDots() {
    const dotsContainer = document.getElementById('dots');
    dotsContainer.innerHTML = '';
    
    quizCards.forEach((_, index) => {
        const dot = document.createElement('input');
        dot.type = 'radio';
        dot.classList.add('dot');
        dot.addEventListener('click', () => changeCard(index));
        dotsContainer.appendChild(dot);
    });
    
    updateActiveDot();
}

function updateActiveDot() {
    const allDots = document.querySelectorAll('.dot');
    allDots.forEach(dot => dot.checked = false);
    if (allDots[currentCardIndex]) {
        allDots[currentCardIndex].checked = true;
    }
}

function showCard() {
    if (quizCards.length === 0) return;

    const [question, answer] = quizCards[currentCardIndex];
    document.getElementById('cardFront').textContent = question;
    document.getElementById('cardBack').textContent = answer;
    document.getElementById('quizProgress').textContent = `Card ${currentCardIndex + 1} of ${quizCards.length}`;

    document.getElementById('flashcard').classList.remove('flipped');
    document.getElementById('prevBtn').disabled = currentCardIndex === 0;
    document.getElementById('nextBtn').disabled = currentCardIndex === quizCards.length - 1;

    updateActiveDot();

    const starBtn = document.getElementById('starBtn');
    const dot = document.querySelectorAll('.dot')[currentCardIndex];

    if (starredCards[question]) {
        starBtn.classList.add('starred');
        starBtn.textContent = '⭐ Starred';
        if (dot) dot.classList.add('starred');
    } else {
        starBtn.classList.remove('starred');
        starBtn.textContent = '⭐ Star';
        if (dot) dot.classList.remove('starred');
    }
}

function changeCard(index) {
    currentCardIndex = index;
    showCard();
}

function nextCard() {
    if (currentCardIndex < quizCards.length - 1) {
        currentCardIndex++;
        showCard();
    }
}

function previousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        showCard();
    }
}

function toggleStar() {
    const [question, answer] = quizCards[currentCardIndex];
    const starBtn = document.getElementById('starBtn');

    if (starredCards[question]) {
        // — Unstar: remove only the extra copies, keep original slot — 
        delete starredCards[question];

        // Find the original index
        const original = quizCards.findIndex(c => c[0] === question);
        // Filter out all other instances
        quizCards = quizCards.filter((c, i) => c[0] !== question || i === original);
        currentCardIndex = original;

    } else {
        // — Star: mark and insert duplicates immediately —
        starredCards[question] = true;

        // 2 if few cards left, 3 if many
        const dupCount = quizCards.length > 10 ? 3 : 2;
        for (let i = 0; i < dupCount; i++) {
            const pos = Math.floor(Math.random() * (quizCards.length + 1));
            quizCards.splice(pos, 0, [question, answer]);
        }
        // jump back to the original
        currentCardIndex = quizCards.findIndex(c => c[0] === question);
    }

    // persist star state
    localStorage.setItem('starredCards', JSON.stringify(starredCards));

    // rebuild UI
    createDots();
    showCard();
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

document.getElementById('flashcard').addEventListener('click', function() {
    this.classList.toggle('flipped');
});

showHomeScreen();
