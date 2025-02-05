import { BOARD_SIZE, INITIAL_BOARD, LANDSCAPE, BORDER_TILES, BORDER_RULES, CORNERS } from './config.js';
import { getTileSide, canPlaceTileNextTo } from './TileUtils.js';

export class Board {
    constructor(scoreBoard) {
        console.log('Initializing Board...');
        if (!scoreBoard) {
            throw new Error('ScoreBoard is required for Board initialization');
        }
        this.scoreBoard = scoreBoard;
        this.cells = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        
        try {
            this.createBoardElements();
            console.log('Board created successfully');
        } catch (error) {
            console.error('Error creating board:', error);
            throw error;
        }
    }

    createBoardElements() {
        console.log('Creating board elements...');
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) {
            throw new Error('Game board element not found');
        }

        // Очищаємо попередню дошку
        gameBoard.innerHTML = '';

        gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 70px)`;
        gameBoard.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 70px)`;

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Створюємо контейнер для тайлу
                const tileContainer = document.createElement('div');
                tileContainer.className = 'tile-container';
                cell.appendChild(tileContainer);
                
                gameBoard.appendChild(cell);
            }
        }
        console.log('Board elements created');
    }

    isEmptyCell(row, col) {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && this.cells[row][col] === null;
    }

    placeTile(row, col, type, rotation) {
        console.log(`Placing tile at (${row}, ${col}) with type ${type} and rotation ${rotation}`);
        
        if (this.isValidPlacement(row, col, type, rotation)) {
            this.cells[row][col] = {
                type: type,
                rotation: rotation,
                owner: this.scoreBoard.currentPlayer
            };
            
            console.log(`Tile placed in this.cells:`, this.cells[row][col]);
            console.log('Current board state:', JSON.stringify(this.cells));
            
            // Перевіряємо сусідні клітинки після розміщення
            const adjacentCells = [
                { row: row - 1, col: col, direction: 'top' },
                { row: row, col: col + 1, direction: 'right' },
                { row: row + 1, col: col, direction: 'bottom' },
                { row: row, col: col - 1, direction: 'left' }
            ];
            
            console.log('Checking adjacent cells after placement:');
            for (let cell of adjacentCells) {
                if (this.isValidCell(cell.row, cell.col)) {
                    console.log(`Adjacent cell at (${cell.row}, ${cell.col}):`, this.cells[cell.row][cell.col]);
                }
            }
            
            this.updateCell(row, col);
            
            const points = this.calculatePoints(row, col);
            this.scoreBoard.addPoints(points);
            
            console.log('Tile placed successfully');
            return true;
        } else {
            console.error('Invalid tile placement');
            return false;
        }
    }

    updateCell(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell) {
            console.warn(`Cell not found at ${row}, ${col}`);
            return;
        }

        const tile = this.cells[row][col];
        const tileContainer = cell.querySelector('.tile-container');
        
        if (tile) {
            console.log('Setting background for tile:', tile);
            
            const tileType = tile.type;
            const tileRotation = tile.rotation;
            
            const tileUrl = `assets/tiles/${tileType}.svg`;
            
            // Перевіряємо доступність файлу тайлу
            fetch(tileUrl)
                .then(response => {
                    if (response.ok) {
                        tileContainer.style.backgroundImage = `url('${tileUrl}')`;
                        tileContainer.style.transform = `rotate(${tileRotation || 0}deg)`;
                    } else {
                        console.error(`Tile file not found: ${tileUrl}`);
                        // Встановлюємо сірий фон замість білого
                        tileContainer.style.backgroundColor = '#ccc';
                    }
                })
                .catch(error => {
                    console.error(`Error loading tile file: ${tileUrl}`, error);
                    // Встановлюємо сірий фон замість білого
                    tileContainer.style.backgroundColor = '#ccc';
                });
            
            // Додаємо класи для стилізації
            cell.classList.add('has-tile');
            if (tile.owner !== null) {
                cell.classList.remove('player1', 'player2');
                cell.classList.add(`player${tile.owner + 1}`);
            }
        } else {
            // Очищаємо клітинку
            tileContainer.style.backgroundImage = '';
            tileContainer.style.transform = '';
            cell.classList.remove('has-tile', 'player1', 'player2');
        }
    }

    getValidPlacements(tile) {
        const validPlacements = [];
        
        for (let row = 1; row < BOARD_SIZE - 1; row++) {
            for (let col = 1; col < BOARD_SIZE - 1; col++) {
                if (this.isEmptyCell(row, col)) {
                    // Перевіряємо всі можливі повороти
                    for (let rotation = 0; rotation < 360; rotation += 90) {
                        if (this.isValidPlacement(row, col, tile.type, rotation)) {
                            validPlacements.push({
                                row: row,
                                col: col,
                                rotation: rotation
                            });
                        }
                    }
                }
            }
        }
        
        return validPlacements;
    }

    isValidPlacement(row, col, tileType, rotation) {
        console.log(`Checking placement at (${row}, ${col}) for tile ${tileType} with rotation ${rotation}`);
        
        // Перевірка чи клітинка порожня
        if (!this.isEmptyCell(row, col)) {
            console.log('Cell is not empty');
            return false;
        }

        // Перевірка сусідніх клітинок
        const adjacentCells = [
            { row: row - 1, col: col, direction: 'top' },    // Верхня
            { row: row, col: col + 1, direction: 'right' },  // Права
            { row: row + 1, col: col, direction: 'bottom' }, // Нижня
            { row: row, col: col - 1, direction: 'left' }    // Ліва
        ];

        let hasAdjacentTile = false;

        for (let cell of adjacentCells) {
            console.log(`Checking adjacent cell at (${cell.row}, ${cell.col})`);
            if (this.isValidCell(cell.row, cell.col)) {
                const adjacentTile = this.cells[cell.row][cell.col];
                console.log(`Adjacent tile:`, adjacentTile);
                if (adjacentTile) {
                    hasAdjacentTile = true;
                    const isCompatible = canPlaceTileNextTo(tileType, rotation, adjacentTile.type, adjacentTile.rotation, cell.direction);
                    console.log(`Checking compatibility with ${cell.direction} tile: ${isCompatible}`);
                    console.log(`New tile: ${tileType} (rotation: ${rotation})`);
                    console.log(`Adjacent tile: ${adjacentTile.type} (rotation: ${adjacentTile.rotation})`);
                    if (!isCompatible) {
                        console.log('Adjacent tile is not compatible');
                        return false;
                    }
                }
            }
        }

        if (!hasAdjacentTile) {
            console.log('No adjacent tiles found');
            return false;
        }

        console.log('Placement is valid');
        return true;
    }

    calculatePoints(row, col) {
        // Спрощена версія підрахунку очок - повертаємо 1 очко за кожну плитку
        return 1;
    }

    isEmpty() {
        console.log('Checking if board is empty (excluding borders)...');
        // Перевіряємо тільки внутрішні клітинки (без границь)
        for (let row = 1; row < BOARD_SIZE - 1; row++) {
            for (let col = 1; col < BOARD_SIZE - 1; col++) {
                if (this.cells[row][col] !== null) {
                    console.log(`Found tile at (${row}, ${col})`);
                    return false;
                }
            }
        }
        console.log('Board is empty (excluding borders)');
        return true;
    }

    isValidCell(row, col) {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    updateAllCells() {
        console.log('Updating all cells on the board');
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (this.cells[row][col] !== null) {
                    this.updateCell(row, col);
                }
            }
        }
    }
}