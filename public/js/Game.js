import { Board } from './Board.js';
import { TileStack } from './TileStack.js';
import { ScoreBoard } from './ScoreBoard.js';

export class Game {
    constructor() {
        console.log('Creating game components...');
        
        try {
            this.scoreBoard = new ScoreBoard();
            console.log('ScoreBoard created');
            
            this.board = new Board(this.scoreBoard);
            console.log('Board created');
            
            this.tileStack = new TileStack();
            console.log('TileStack created');
            
            this.initializeGame();
            this.bindEvents();
            
            console.log('Game initialization complete');
        } catch (error) {
            console.error('Error in Game constructor:', error);
            throw error;
        }
    }

    initializeGame() {
        console.log('Initializing game...');
        this.tileStack.drawNextTile();
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Спочатку видаляємо старі обробники
        this.removeEventListeners();
        
        // Обробник для клітинок
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const clickHandler = (e) => {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                console.log(`Cell clicked: ${row}, ${col}`);
                this.handleCellClick(row, col);
            };
            cell.addEventListener('click', clickHandler);
            cell._clickHandler = clickHandler; // Зберігаємо посилання на обробник
        });

        // Обробник для обертання плитки
        const currentTile = document.getElementById('currentTile');
        if (currentTile) {
            const rotateHandler = () => {
                console.log('Rotating tile');
                this.handleCurrentTileClick();
            };
            currentTile.addEventListener('click', rotateHandler);
            currentTile._rotateHandler = rotateHandler; // Зберігаємо посилання на обробник
        } else {
            console.error('currentTile element not found');
        }

        // Обробник для кнопок
        const skipButton = document.getElementById('skipButton');
        const jokerButton = document.getElementById('jokerButton');
        const newGameButton = document.getElementById('newGameButton');

        if (skipButton) {
            const skipHandler = () => this.skipTurn();
            skipButton.addEventListener('click', skipHandler);
            skipButton._skipHandler = skipHandler;
        }
        
        if (jokerButton) {
            const jokerHandler = () => this.toggleJokerMode();
            jokerButton.addEventListener('click', jokerHandler);
            jokerButton._jokerHandler = jokerHandler;
        }
        
        if (newGameButton) {
            const newGameHandler = () => this.restartGame();
            newGameButton.addEventListener('click', newGameHandler);
            newGameButton._newGameHandler = newGameHandler;
        }
    }

    removeEventListeners() {
        console.log('Removing old event listeners...');
        
        // Видаляємо обробники з клітинок
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (cell._clickHandler) {
                cell.removeEventListener('click', cell._clickHandler);
                delete cell._clickHandler;
            }
        });

        // Видаляємо обробник з поточного тайлу
        const currentTile = document.getElementById('currentTile');
        if (currentTile && currentTile._rotateHandler) {
            currentTile.removeEventListener('click', currentTile._rotateHandler);
            delete currentTile._rotateHandler;
        }

        // Видаляємо обробники з кнопок
        const skipButton = document.getElementById('skipButton');
        const jokerButton = document.getElementById('jokerButton');
        const newGameButton = document.getElementById('newGameButton');

        if (skipButton && skipButton._skipHandler) {
            skipButton.removeEventListener('click', skipButton._skipHandler);
            delete skipButton._skipHandler;
        }

        if (jokerButton && jokerButton._jokerHandler) {
            jokerButton.removeEventListener('click', jokerButton._jokerHandler);
            delete jokerButton._jokerHandler;
        }

        if (newGameButton && newGameButton._newGameHandler) {
            newGameButton.removeEventListener('click', newGameButton._newGameHandler);
            delete newGameButton._newGameHandler;
        }
    }

    handleCellClick(row, col) {
        console.log('Cell click handled at', row, col);
        
        if (this.tileStack.currentTile) {
            const currentTile = this.tileStack.currentTile;
            console.log('Current tile:', currentTile);
            
            // Отримуємо тип тайлу як рядок
            const tileType = currentTile.type;
            const rotation = currentTile.rotation || 0;
            
            if (this.board.isValidPlacement(row, col, tileType, rotation)) {
                // Розміщуємо тайл
                const success = this.board.placeTile(row, col, tileType, rotation);
                
                if (success) {
                    // Оновлюємо стан гри
                    this.scoreBoard.switchPlayer();
                    this.tileStack.drawNextTile();
                    
                    // Перевіряємо чи гра закінчилась
                    if (this.isGameOver()) {
                        this.handleGameOver();
                    }
                }
                return success;
            }
        }
        return false;
    }

    handleCurrentTileClick() {
        console.log('Current tile clicked');
        if (this.tileStack.currentTile) {
            this.tileStack.rotateCurrentTile();
            console.log('Rotated tile to:', this.tileStack.currentTile.rotation);
        } else {
            console.warn('No current tile to rotate');
        }
    }

    skipTurn() {
        console.log('Skipping turn');
        this.tileStack.skipTile();
        this.scoreBoard.switchPlayer();
    }

    toggleJokerMode() {
        console.log('Toggling joker mode');
        // Базова логіка для тестування
    }

    restartGame() {
        console.log('Restarting game');
        
        // Спочатку скидаємо всі компоненти
        this.scoreBoard.reset();
        this.tileStack.reset();
        
        try {
            // Створюємо нову дошку з існуючим scoreBoard
            this.board = new Board(this.scoreBoard);
            
            // Ініціалізуємо гру
            this.initializeGame();
            
            // Оновлюємо обробники подій
            this.bindEvents();
            
            console.log('Game restarted successfully');
        } catch (error) {
            console.error('Error restarting game:', error);
            throw error;
        }
    }

    isGameOver() {
        // Перевіряємо чи закінчились тайли
        return this.tileStack.isEmpty();
    }

    handleGameOver() {
        console.log('Game Over!');
        const player1Score = this.scoreBoard.getPlayer1Score();
        const player2Score = this.scoreBoard.getPlayer2Score();
        
        let winner;
        if (player1Score > player2Score) {
            winner = 'Гравець 1';
        } else if (player2Score > player1Score) {
            winner = 'Гравець 2';
        } else {
            winner = 'Нічия';
        }

        // Показуємо модальне вікно з результатами
        const message = `Гра закінчена!\n\nРахунок:\nГравець 1: ${player1Score}\nГравець 2: ${player2Score}\n\nПереможець: ${winner}`;
        setTimeout(() => {
            alert(message);
        }, 100);
    }
}