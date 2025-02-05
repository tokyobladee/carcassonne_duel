import { Game } from './Game.js';

export class MultiplayerGame extends Game {
    constructor() {
        super();
        this.ws = null;
        this.gameId = null;
        this.playerId = null;
        this.serverUrl = 'http://localhost:3000'; // Our server URL
    }

    async createGame() {
        try {
            const response = await fetch(`${this.serverUrl}/api/games`, {
                method: 'POST'
            });
            const data = await response.json();
            this.gameId = data.gameId;
            this.playerId = `player${Math.random().toString(36).substr(2, 9)}`;
            
            // Connect via WebSocket
            this.connectWebSocket();
            
            return this.gameId;
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    }

    async joinGame(gameId) {
        try {
            const response = await fetch(`${this.serverUrl}/api/games/${gameId}`);
            const game = await response.json();
            
            if (game.players.length >= 2) {
                throw new Error('Game is full');
            }
            
            this.gameId = gameId;
            this.playerId = `player${Math.random().toString(36).substr(2, 9)}`;
            
            // Connect via WebSocket
            this.connectWebSocket();
        } catch (error) {
            console.error('Error joining game:', error);
            throw error;
        }
    }

    connectWebSocket() {
        this.ws = new WebSocket(`ws://localhost:3000`);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            // Send join game request
            this.ws.send(JSON.stringify({
                type: 'join_game',
                gameId: this.gameId,
                playerId: this.playerId
            }));
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleServerMessage(message);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
        };
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'game_state':
                console.log('Received game state:', {
                    status: message.game.status,
                    players: message.game.players.length,
                    currentPlayer: message.game.currentPlayer,
                    currentTile: message.game.currentTile,
                    board: message.game.board ? 'present' : 'missing'
                });
                
                // Оновлюємо інтерфейс на основі статусу гри
                const waitingMessage = document.getElementById('waitingMessage');
                const gameLinkContainer = document.getElementById('gameLinkContainer');
                const gameContainer = document.querySelector('.game-container');
                const gameBoard = document.getElementById('gameBoard');
                
                if (message.game.status === 'active') {
                    // Гра активна
                    if (waitingMessage) waitingMessage.style.display = 'none';
                    if (gameLinkContainer) gameLinkContainer.style.display = 'none';
                    if (gameContainer) gameContainer.style.display = 'flex';
                    if (gameBoard) gameBoard.style.display = 'grid';
                    
                    // Оновлюємо стан гри
                    this.updateGameState(message.game);
                } else if (message.game.status === 'waiting') {
                    // Очікуємо другого гравця
                    if (waitingMessage) {
                        waitingMessage.style.display = 'block';
                        waitingMessage.textContent = 'Очікуємо другого гравця...';
                    }
                    if (gameContainer) gameContainer.style.display = 'none';
                    if (gameBoard) gameBoard.style.display = 'none';
                }
                break;
                
            case 'error':
                console.error('Server error:', message.message);
                alert(message.message);
                break;
                
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    updateGameState(gameState) {
        console.log('Updating game state:', {
            board: gameState.board ? 'present' : 'missing',
            currentTile: gameState.currentTile,
            scores: gameState.scores,
            currentPlayer: gameState.currentPlayer
        });
        
        // Створюємо елементи дошки, якщо вони ще не створені
        if (!this.board.cells.flat().some(cell => cell !== null)) {
            console.log('Creating board elements');
            this.board.createBoardElements();
        }
        
        // Оновлюємо стан дошки з даних сервера
        if (gameState.board) {
            console.log('Updating board state from server');
            this.board.cells = gameState.board;
            this.board.updateAllCells();
        }
        
        if (gameState.currentTile) {
            console.log('Updating current tile from server');
            this.tileStack.currentTile = gameState.currentTile;
            this.updateCurrentTileDisplay();
        }
        
        if (gameState.scores) {
            console.log('Updating scores from server');
            this.scoreBoard.scores = gameState.scores;
            this.scoreBoard.currentPlayer = gameState.currentPlayer;
            this.scoreBoard.updateDisplay();
        }
    }

    // Override base class methods to send actions to server
    handleCellClick(row, col) {
        // Перевіряємо чи є поточний тайл
        if (!this.tileStack.currentTile) {
            console.warn('No current tile to place');
            return;
        }
        
        this.ws.send(JSON.stringify({
            type: 'make_move',
            gameId: this.gameId,
            playerId: this.playerId,
            move: {
                row,
                col,
                tileType: this.tileStack.currentTile.type,
                rotation: this.tileStack.currentTile.rotation || 0
            }
        }));
    }

    handleCurrentTileClick() {
        // Перевіряємо чи є поточний тайл
        if (!this.tileStack.currentTile) {
            console.warn('No current tile to rotate');
            return;
        }
        
        this.ws.send(JSON.stringify({
            type: 'rotate_tile',
            gameId: this.gameId,
            playerId: this.playerId
        }));
    }

    skipTurn() {
        this.ws.send(JSON.stringify({
            type: 'skip_turn',
            gameId: this.gameId,
            playerId: this.playerId
        }));
    }

    updateCurrentTileDisplay() {
        const currentTileElement = document.getElementById('currentTile');
        
        if (currentTileElement) {
            if (this.tileStack.currentTile) {
                const tileType = this.tileStack.currentTile.type;
                const tileUrl = `assets/tiles/${tileType}.svg`;
                
                // Перевіряємо доступність файлу тайлу
                fetch(tileUrl)
                    .then(response => {
                        if (response.ok) {
                            currentTileElement.style.backgroundImage = `url('${tileUrl}')`;
                            currentTileElement.style.transform = `rotate(${this.tileStack.currentTile.rotation || 0}deg)`;
                        } else {
                            console.error(`Tile file not found: ${tileUrl}`);
                            currentTileElement.style.backgroundImage = '';
                        }
                    })
                    .catch(error => {
                        console.error(`Error loading tile file: ${tileUrl}`, error);
                        currentTileElement.style.backgroundImage = '';
                    });
            } else {
                // Очищаємо фон, якщо поточного тайлу немає
                currentTileElement.style.backgroundImage = '';
            }
        }
    }
} 