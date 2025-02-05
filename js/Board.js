import { BOARD_SIZE, INITIAL_BOARD, LANDSCAPE, BORDER_TILES, BORDER_RULES, CORNERS } from './config.js';
import { getTileSide, canPlaceTileNextTo } from './TileUtils.js';
import { TileManager } from './TileManager.js';

export class Board {
    constructor(scoreBoard) {
        console.log('Initializing Board...');
        if (!scoreBoard) {
            throw new Error('ScoreBoard is required for Board initialization');
        }
        this.scoreBoard = scoreBoard;
        this.cells = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.tileManager = new TileManager();
        
        try {
            this.initialize();
        } catch (error) {
            console.error('Error creating board:', error);
            throw error;
        }
    }

    async initialize() {
        console.log('Починаю ініціалізацію дошки...');
        
        // Спочатку створюємо елементи дошки
        this.createBoardElements();
        console.log('Елементи дошки створено');
        
        // Потім завантажуємо всі тайли
        try {
            await this.tileManager.preloadTiles();
            console.log('Тайли завантажено успішно');
            
            // Тільки після завантаження тайлів ініціалізуємо границі
            this.initializeBorders();
            console.log('Границі дошки ініціалізовано');
        } catch (error) {
            console.error('Помилка при завантаженні тайлів:', error);
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
                const cellContainer = document.createElement('div');
                cellContainer.className = 'cell-container';
                cellContainer.style.position = 'relative';
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const tileContainer = document.createElement('div');
                tileContainer.className = 'tile-container';
                
                cellContainer.appendChild(cell);
                cellContainer.appendChild(tileContainer);
                gameBoard.appendChild(cellContainer);
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

        // Розміщуємо міста
        console.log('Placing city tiles...');
        const placeCities = () => {
            // Для кожної сторони вибираємо одну випадкову позицію для міста
            const topCity = getRandomPositions(topPositions, 1)[0];
            const rightCity = getRandomPositions(rightPositions, 1)[0];
            const bottomCity = getRandomPositions(bottomPositions, 1)[0];
            const leftCity = getRandomPositions(leftPositions, 1)[0];

            // Розміщуємо міста з правильними поворотами
            // Верхня сторона: місто дивиться вниз
            this.cells[topCity[0]][topCity[1]] = {
                type: 'CFRF',
                rotation: 180,  // Повертаємо на 180°, щоб місто дивилось вниз
                owner: null
            };

            // Права сторона: місто дивиться вліво
            this.cells[rightCity[0]][rightCity[1]] = {
                type: 'CFRF',
                rotation: 270,  // Повертаємо на 270°, щоб місто дивилось вліво
                owner: null
            };

            // Нижня сторона: місто дивиться вгору
            this.cells[bottomCity[0]][bottomCity[1]] = {
                type: 'CFRF',
                rotation: 0,    // Без повороту, місто дивиться вгору
                owner: null
            };

            // Ліва сторона: місто дивиться вправо
            this.cells[leftCity[0]][leftCity[1]] = {
                type: 'CFRF',
                rotation: 90,   // Повертаємо на 90°, щоб місто дивилось вправо
                owner: null
            };

            // Оновлюємо відображення міст
            this.updateCell(topCity[0], topCity[1]);
            this.updateCell(rightCity[0], rightCity[1]);
            this.updateCell(bottomCity[0], bottomCity[1]);
            this.updateCell(leftCity[0], leftCity[1]);

            // Видаляємо використані позиції
            [topCity, rightCity, bottomCity, leftCity].forEach(pos => {
                const arrays = [topPositions, rightPositions, bottomPositions, leftPositions];
                arrays.forEach(arr => {
                    const index = arr.findIndex(p => p[0] === pos[0] && p[1] === pos[1]);
                    if (index !== -1) arr.splice(index, 1);
                });
            });
        };

        // Розміщуємо дороги
        console.log('Placing road tiles...');
        const placeRoads = () => {
            // Для кожної сторони вибираємо дві випадкові позиції для доріг
            const topRoads = getRandomPositions(topPositions, 2);
            const rightRoads = getRandomPositions(rightPositions, 2);
            const bottomRoads = getRandomPositions(bottomPositions, 2);
            const leftRoads = getRandomPositions(leftPositions, 2);

            // Верхня сторона: дороги дивляться вниз
            topRoads.forEach(pos => {
                this.cells[pos[0]][pos[1]] = {
                    type: 'FRRF',
                    rotation: 180,  // Повертаємо на 180°, щоб дорога йшла вниз
                    owner: null
                };
                this.updateCell(pos[0], pos[1]);
            });

            // Права сторона: дороги дивляться вліво
            rightRoads.forEach(pos => {
                this.cells[pos[0]][pos[1]] = {
                    type: 'FRRF',
                    rotation: 270,  // Повертаємо на 270°, щоб дорога йшла вліво
                    owner: null
                };
                this.updateCell(pos[0], pos[1]);
            });

            // Нижня сторона: дороги дивляться вгору
            bottomRoads.forEach(pos => {
                this.cells[pos[0]][pos[1]] = {
                    type: 'FRRF',
                    rotation: 0,    // Без повороту, дорога йде вгору
                    owner: null
                };
                this.updateCell(pos[0], pos[1]);
            });

            // Ліва сторона: дороги дивляться вправо
            leftRoads.forEach(pos => {
                this.cells[pos[0]][pos[1]] = {
                    type: 'FRRF',
                    rotation: 90,   // Повертаємо на 90°, щоб дорога йшла вправо
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
        console.log(`Placing tile ${type} at (${row}, ${col}) with rotation ${rotation}°`);
        
        if (this.isValidPlacement(row, col, type, rotation)) {
            this.cells[row][col] = {
                type: type,
                rotation: rotation,
                owner: this.scoreBoard.currentPlayer
            };
            
            console.log('Tile placed:', this.cells[row][col]);
            
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
        console.log(`Оновлюю клітинку [${row}, ${col}]`);
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const tile = this.cells[row][col];
        
        if (!cell) {
            console.error('Клітинку не знайдено');
            return;
        }
        
        // Знаходимо або створюємо контейнер для тайлу
        let tileContainer = cell.querySelector('.tile-container');
        if (!tileContainer) {
            tileContainer = document.createElement('div');
            tileContainer.className = 'tile-container';
            cell.appendChild(tileContainer);
        }
        
        // Очищаємо контейнер
        tileContainer.innerHTML = '';
        
        if (!tile || !tile.type) {
            console.log('Клітинка порожня');
            cell.classList.remove('player1', 'player2');
            return;
        }
        
        // Створюємо новий елемент зображення
        const img = document.createElement('img');
        img.src = `assets/tiles/${tile.type}.svg`;
        img.alt = tile.type;
        img.style.transform = `rotate(${tile.rotation || 0}deg)`;
        
        // Додаємо обробники подій
        img.onload = () => {
            console.log(`Зображення тайлу ${tile.type} завантажено`);
        };
        
        img.onerror = () => {
            console.error(`Помилка завантаження зображення тайлу ${tile.type}`);
        };
        
        // Додаємо зображення в контейнер
        tileContainer.appendChild(img);
        
        // Оновлюємо класи власника
        if (tile.owner !== null) {
            cell.classList.remove('player1', 'player2');
            cell.classList.add(`player${tile.owner + 1}`);
        }
        
        console.log('Клітинку оновлено успішно');
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
        console.log(`Checking if placement is valid for tile ${tileType} at (${row}, ${col}) with rotation ${rotation}°`);
        
        if (!this.isEmptyCell(row, col)) {
            console.log('Cell is not empty');
            return false;
        }
        
        const adjacentCells = [
            { row: row - 1, col: col, direction: 'top' },
            { row: row, col: col + 1, direction: 'right' },
            { row: row + 1, col: col, direction: 'bottom' },
            { row: row, col: col - 1, direction: 'left' }
        ];
        
        for (let cell of adjacentCells) {
            if (this.isValidCell(cell.row, cell.col)) {
                const adjacentTile = this.cells[cell.row][cell.col];
                if (adjacentTile !== null) {
                    console.log(`Adjacent tile at (${cell.row}, ${cell.col}):`, adjacentTile);
                    if (!canPlaceTileNextTo(tileType, rotation, adjacentTile.type, adjacentTile.rotation, cell.direction)) {
                        console.log('Cannot place tile next to adjacent tile');
                        return false;
                    }
                }
            }
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