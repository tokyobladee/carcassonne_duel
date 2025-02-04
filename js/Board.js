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
            this.initializeBorders();
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
                
                const tileContainer = document.createElement('div');
                tileContainer.className = 'tile-container';
                cell.appendChild(tileContainer);
                
                gameBoard.appendChild(cell);
            }
        }
        console.log('Board elements created');
    }

    // Рандомне розміщення тайлів на границі
    initializeBorders() {
        console.log('Initializing board borders...');
        
        // Створюємо масиви доступних позицій для кожної сторони
        const topPositions = Array.from({length: BOARD_SIZE}, (_, i) => [0, i]);
        const rightPositions = Array.from({length: BOARD_SIZE}, (_, i) => [i, BOARD_SIZE-1]);
        const bottomPositions = Array.from({length: BOARD_SIZE}, (_, i) => [BOARD_SIZE-1, i]);
        const leftPositions = Array.from({length: BOARD_SIZE}, (_, i) => [i, 0]);

        // Функція для випадкового вибору позицій
        const getRandomPositions = (positions, count) => {
            const shuffled = [...positions].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count);
        };

        // Розміщуємо міста (по одному на кожній стороні)
        console.log('Placing city tiles...');
        const placeCities = () => {
            // Для кожної сторони вибираємо одну випадкову позицію для міста
            const topCity = getRandomPositions(topPositions, 1)[0];
            const rightCity = getRandomPositions(rightPositions, 1)[0];
            const bottomCity = getRandomPositions(bottomPositions, 1)[0];
            const leftCity = getRandomPositions(leftPositions, 1)[0];

            // Розміщуємо міста з правильними поворотами
            // Верхня сторона: місто
            this.cells[topCity[0]][topCity[1]] = {
                type: 'CFRF',  // Місто-Поле-Дорога-Поле
                rotation: 0,
                owner: null
            };
            this.updateCell(topCity[0], topCity[1]);

            // Права сторона: місто
            this.cells[rightCity[0]][rightCity[1]] = {
                type: 'FFCR',  // Поле-Поле-Місто-Дорога
                rotation: 0,
                owner: null
            };
            this.updateCell(rightCity[0], rightCity[1]);

            // Нижня сторона: місто
            this.cells[bottomCity[0]][bottomCity[1]] = {
                type: 'FFCR',  // Поле-Поле-Місто-Дорога
                rotation: 0,
                owner: null
            };
            this.updateCell(bottomCity[0], bottomCity[1]);

            // Ліва сторона: місто
            this.cells[leftCity[0]][leftCity[1]] = {
                type: 'FFCR',  // Поле-Поле-Місто-Дорога
                rotation: 0,
                owner: null
            };
            this.updateCell(leftCity[0], leftCity[1]);

            // Видаляємо використані позиції з масивів
            [topCity, rightCity, bottomCity, leftCity].forEach(pos => {
                const arrays = [topPositions, rightPositions, bottomPositions, leftPositions];
                arrays.forEach(arr => {
                    const index = arr.findIndex(p => p[0] === pos[0] && p[1] === pos[1]);
                    if (index !== -1) arr.splice(index, 1);
                });
            });
        };

        // Розміщуємо дороги (по дві на кожній стороні)
        console.log('Placing road tiles...');
        const placeRoads = () => {
            // Для кожної сторони вибираємо дві випадкові позиції для доріг
            const topRoads = getRandomPositions(topPositions, 2);
            const rightRoads = getRandomPositions(rightPositions, 2);
            const bottomRoads = getRandomPositions(bottomPositions, 2);
            const leftRoads = getRandomPositions(leftPositions, 2);

            // Розміщуємо дороги
            // Верхня сторона: дороги
            topRoads.forEach(pos => {
                console.log(`Placing road tile at (${pos[0]}, ${pos[1]})`);
                this.cells[pos[0]][pos[1]] = {
                    type: 'FRRF',  // Поле-Дорога-Дорога-Поле
                    rotation: 0,
                    owner: null
                };
                this.updateCell(pos[0], pos[1]);
            });

            // Права сторона: дороги
            rightRoads.forEach(pos => {
                console.log(`Placing road tile at (${pos[0]}, ${pos[1]})`);
                this.cells[pos[0]][pos[1]] = {
                    type: 'FRRF',  // Поле-Дорога-Дорога-Поле
                    rotation: 0,
                    owner: null
                };
                this.updateCell(pos[0], pos[1]);
            });

            // Нижня сторона: дороги
            bottomRoads.forEach(pos => {
                console.log(`Placing road tile at (${pos[0]}, ${pos[1]})`);
                this.cells[pos[0]][pos[1]] = {
                    type: 'FRRF',  // Поле-Дорога-Дорога-Поле
                    rotation: 0,
                    owner: null
                };
                this.updateCell(pos[0], pos[1]);
            });

            // Ліва сторона: дороги
            leftRoads.forEach(pos => {
                console.log(`Placing road tile at (${pos[0]}, ${pos[1]})`);
                this.cells[pos[0]][pos[1]] = {
                    type: 'FRRF',  // Поле-Дорога-Дорога-Поле
                    rotation: 0,
                    owner: null
                };
                this.updateCell(pos[0], pos[1]);
            });
        };

        // Виконуємо розміщення в правильному порядку
        placeCities();  // Спочатку розміщуємо міста
        placeRoads();   // Потім розміщуємо дороги
        console.log('Board borders initialized');
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
        console.log('=== Starting updateCell ===');
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        console.log('Found cell:', cell);
        
        const tile = this.cells[row][col];
        console.log('Tile data:', tile);
        
        if (cell && tile && tile.type) {
            let tileContainer = cell.querySelector('.tile-container');
            
            if (!tileContainer) {
                console.warn('Tile container not found, creating a new one');
                tileContainer = document.createElement('div');
                tileContainer.classList.add('tile-container');
                cell.appendChild(tileContainer);
            }

            console.log('Tile container:', tileContainer);

            // Очищаємо попередні інлайнові стилі
            tileContainer.style.cssText = '';
            
            // Застосовуємо інлайнові стилі
            tileContainer.style.backgroundImage = `url('assets/tiles/${tile.type}.svg')`;
            tileContainer.style.backgroundSize = '100% 100%';
            tileContainer.style.backgroundPosition = 'center';
            tileContainer.style.backgroundRepeat = 'no-repeat';
            tileContainer.style.width = '100%';
            tileContainer.style.height = '100%';
            tileContainer.style.transform = `rotate(${tile.rotation || 0}deg)`;
            tileContainer.style.opacity = '1';
            tileContainer.style.visibility = 'visible';

            console.log('Inline styles applied:', tileContainer.style.cssText);

            cell.classList.add('has-tile');

            if (tile.owner) {
                cell.classList.add(tile.owner === 1 ? 'player1' : 'player2');
            }
        } else {
            console.error('Invalid cell or tile:', { cell, tile });
        }
        console.log('=== Finished updateCell ===');
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
        console.log(`Checking if cell (${row}, ${col}) is valid`);
        const isValid = row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
        console.log(`Cell (${row}, ${col}) is ${isValid ? 'valid' : 'invalid'}`);
        return isValid;
    }
}