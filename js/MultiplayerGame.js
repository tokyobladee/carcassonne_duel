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
            // Чекаємо завершення ініціалізації гри
            await this.initializeGame();
            
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
            // Чекаємо завершення ініціалізації гри
            await this.initializeGame();
            
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
                this.updateGameState(message.game);
                break;
            case 'error':
                console.error('Server error:', message.message);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    updateGameState(gameState) {
        // Update game state from server data
        this.board.cells = gameState.board;
        this.tileStack.currentTile = gameState.currentTile;
        this.scoreBoard.scores = gameState.scores;
        
        // Update display
        this.board.updateAllCells();
        this.updateCurrentTileDisplay();
        this.scoreBoard.updateDisplay();
    }

    // Override base class methods to send actions to server
    handleCellClick(row, col) {
        if (!this.tileStack.currentTile) return false;
        
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
        if (!this.tileStack.currentTile) return;
        
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
        if (currentTileElement && this.tileStack.currentTile) {
            currentTileElement.style.backgroundImage = `url('assets/tiles/${this.tileStack.currentTile.type}.svg')`;
            currentTileElement.style.transform = `rotate(${this.tileStack.currentTile.rotation || 0}deg)`;
        }
    }
} 