console.log('Game initialization started');

import { MultiplayerGame } from './MultiplayerGame.js';

let game = null;

// Function to create a new game
async function createNewGame() {
    try {
        game = new MultiplayerGame();
        const gameId = await game.createGame();
        
        // Show join link
        showGameLink(gameId);
        
        // Update interface
        updateUI('waiting');
    } catch (error) {
        console.error('Error creating game:', error);
        showError('Error creating game');
    }
}

// Function to join existing game
async function joinGame(gameId) {
    try {
        game = new MultiplayerGame();
        await game.joinGame(gameId);
        
        // Update interface
        updateUI('joined');
    } catch (error) {
        console.error('Error joining game:', error);
        showError('Error joining game');
    }
}

// Functions to update interface
function updateUI(state) {
    const waitingMessage = document.getElementById('waitingMessage');
    const gameBoard = document.getElementById('gameBoard');
    const createGameBtn = document.getElementById('createGameBtn');
    const joinGameBtn = document.getElementById('joinGameBtn');
    
    switch (state) {
        case 'waiting':
            waitingMessage.style.display = 'block';
            waitingMessage.textContent = 'Waiting for second player...';
            gameBoard.style.display = 'none';
            createGameBtn.style.display = 'none';
            joinGameBtn.style.display = 'none';
            break;
            
        case 'joined':
            waitingMessage.style.display = 'none';
            gameBoard.style.display = 'grid';
            createGameBtn.style.display = 'none';
            joinGameBtn.style.display = 'none';
            break;
            
        default:
            waitingMessage.style.display = 'none';
            gameBoard.style.display = 'none';
            createGameBtn.style.display = 'block';
            joinGameBtn.style.display = 'block';
    }
}

function showGameLink(gameId) {
    const gameLink = `${window.location.origin}?game=${gameId}`;
    const gameLinkContainer = document.getElementById('gameLinkContainer');
    const gameLinkInput = document.getElementById('gameLinkInput');
    const gameIdText = document.getElementById('gameIdText');
    
    gameLinkInput.value = gameLink;
    gameIdText.textContent = gameId;
    gameLinkContainer.style.display = 'block';
    
    const waitingMessage = document.getElementById('waitingMessage');
    waitingMessage.textContent = 'Waiting for second player...';
}

function showError(message) {
    alert(message);
}

// Handle URL parameters on page load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');
    
    if (gameId) {
        // If gameId is in URL, join the game
        joinGame(gameId);
    } else {
        // Otherwise show create/join buttons
        updateUI('initial');
    }
});

// Add event handlers for buttons
document.getElementById('createGameBtn').addEventListener('click', createNewGame);
document.getElementById('joinGameBtn').addEventListener('click', () => {
    const gameId = prompt('Enter game ID:');
    if (gameId) {
        joinGame(gameId);
    }
});