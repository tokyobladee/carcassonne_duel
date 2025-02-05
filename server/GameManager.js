import { v4 as uuidv4 } from 'uuid';
import { TILE_CONFIG } from '../js/config.js';
import { canPlaceTileNextTo } from '../js/TileUtils.js';

export class GameManager {
    constructor() {
        this.games = new Map();
        this.connections = new Map();
    }

    createGame() {
        const gameId = uuidv4();
        const game = {
            id: gameId,
            players: [],
            status: 'waiting',
            board: null,
            currentPlayer: null,
            currentTile: null,
            scores: { player1: 0, player2: 0 }
        };
        
        this.initializeBoard(game);
        
        this.games.set(gameId, game);
        return gameId;
    }

    createEmptyBoard() {
        const BOARD_SIZE = 10;
        const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        
        // Додаємо початкові граничні тайли
        const borderTiles = [
            { row: 0, col: 0, type: 'CRRF', rotation: 0 },
            { row: 0, col: 9, type: 'CFRF', rotation: 270 },
            { row: 9, col: 0, type: 'FRRF', rotation: 90 },
            { row: 9, col: 9, type: 'FFCR', rotation: 180 }
        ];
        
        // Встановлюємо граничні тайли
        for (const tile of borderTiles) {
            board[tile.row][tile.col] = {
                type: tile.type,
                rotation: tile.rotation,
                owner: 0 // 0 означає, що тайл є граничним і не належить жодному гравцю
            };
        }
        
        return board;
    }

    createTileStack() {
        console.log('Creating tile stack...');
        const tiles = [];
        
        // Додаємо тайли відповідно до конфігурації
        for (const [tileType, count] of Object.entries(TILE_CONFIG)) {
            for (let i = 0; i < count; i++) {
                tiles.push(tileType);
            }
        }
        
        // Перемішуємо тайли
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        console.log('Generated tiles:', tiles);
        console.log('Tile stack created');
        
        return tiles;
    }

    joinGame(gameId, playerId, ws) {
        const game = this.games.get(gameId);
        if (!game) {
            console.log(`Game ${gameId} not found`);
            return { success: false, error: 'Game not found' };
        }

        if (game.players.length >= 2) {
            console.log(`Game ${gameId} is full`);
            return { success: false, error: 'Game is full' };
        }

        game.players.push(playerId);
        console.log(`Player ${playerId} joined game ${gameId}. Players: ${game.players.length}`);
        
        if (!this.connections.has(gameId)) {
            this.connections.set(gameId, new Map());
        }
        this.connections.get(gameId).set(playerId, ws);

        if (game.players.length === 2) {
            console.log(`Initializing game ${gameId} with 2 players`);
            this.initializeGame(game);
        } else {
            console.log(`Waiting for more players in game ${gameId}`);
            this.broadcastGameState(gameId);
        }

        return { success: true, game };
    }

    makeMove(gameId, playerId, move) {
        console.log(`Player ${playerId} making move:`, move);
        const game = this.games.get(gameId);
        
        if (!game) {
            console.error(`Game not found: ${gameId}`);
            return { success: false, error: 'Game not found' };
        }
        
        const playerIndex = game.players.findIndex(player => player.id === playerId);
        
        if (playerIndex === -1) {
            console.error(`Player not found: ${playerId}`);
            return { success: false, error: 'Player not found' };
        }
        
        if (game.currentPlayer !== playerIndex) {
            console.error(`Not player ${playerId}'s turn`);
            return { success: false, error: 'Not your turn' };
        }
        
        const { row, col, tileType, rotation } = move;
        
        // Перевіряємо валідність розміщення тайлу
        if (!this.isValidPlacement(game, row, col)) {
            console.error('Invalid tile placement');
            return { success: false, error: 'Invalid tile placement' };
        }
        
        // Розміщуємо тайл на дошці
        game.board[row][col] = {
            type: tileType,
            rotation: rotation,
            owner: playerIndex
        };
        
        // Підраховуємо очки і додаємо гравцю
        const points = this.calculatePoints(game, row, col);
        game.scores[playerIndex] += points;
        
        // Змінюємо поточного гравця
        game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
        
        // Беремо новий тайл
        game.currentTile = this.drawTile(game);
        
        // Перевіряємо, чи є доступні тайли
        if (!game.currentTile) {
            console.warn('No more tiles available');
            // TODO: Обробити випадок, коли тайли закінчилися
            // Наприклад, завершити гру або перемішати відкинуті тайли в нову колоду
        }
        
        console.log('Move successful');
        return { success: true, game };
    }

    isValidPlacement(game, row, col) {
        console.log(`Checking placement at (${row}, ${col})`);
        
        // Перевірка чи клітинка порожня
        if (game.board[row][col] !== null) {
            console.log('Cell is not empty');
            return false;
        }

        // Перевірка сусідніх клітинок
        const adjacentCells = this.getAdjacentCells(row, col);
        
        let hasAdjacentTile = false;
        
        for (let cell of adjacentCells) {
            if (this.isValidCell(cell.row, cell.col)) {
                const adjacentTile = game.board[cell.row][cell.col];
                if (adjacentTile) {
                    hasAdjacentTile = true;
                    
                    const isCompatible = canPlaceTileNextTo(
                        game.currentTile.type, 
                        game.currentTile.rotation, 
                        adjacentTile.type, 
                        adjacentTile.rotation, 
                        cell.direction
                    );
                    
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

    getAdjacentCells(row, col) {
        return [
            { row: row - 1, col: col },    // Верхня
            { row: row, col: col + 1 },    // Права
            { row: row + 1, col: col },    // Нижня
            { row: row, col: col - 1 }     // Ліва
        ];
    }

    isValidCell(row, col) {
        return row >= 0 && row < 10 && col >= 0 && col < 10;
    }

    calculatePoints(game, row, col) {
        // Тут буде логіка підрахунку очок
        return 1; // Тимчасово повертаємо 1 очко
    }

    disconnectPlayer(ws) {
        for (const [gameId, gameConnections] of this.connections.entries()) {
            for (const [playerId, playerWs] of gameConnections.entries()) {
                if (playerWs === ws) {
                    gameConnections.delete(playerId);
                    const game = this.games.get(gameId);
                    if (game) {
                        game.status = 'disconnected';
                        
                        if (game.currentPlayer === game.players.indexOf(playerId)) {
                            console.log(`Active player ${playerId} disconnected. Passing turn to next player.`);
                            game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
                            this.broadcastGameState(gameId);
                        }
                    }
                    return gameId;
                }
            }
        }
        return null;
    }

    getGameState(gameId) {
        const game = this.games.get(gameId);
        if (!game) return null;

        return {
            id: game.id,
            players: game.players,
            currentPlayer: game.currentPlayer,
            status: game.status,
            board: game.board,
            currentTile: game.currentTile,
            scores: game.scores
        };
    }

    broadcastGameState(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            console.error(`Game ${gameId} not found`);
            return;
        }
        
        const gameState = {
            board: game.board,
            currentPlayer: game.currentPlayer,
            currentTile: game.currentTile,
            scores: game.scores,
            status: game.status,
            players: game.players.length
        };
        
        console.log(`Broadcasting game state for ${gameId}:`, gameState);
        
        const connections = this.connections.get(gameId);
        if (connections) {
            for (const [playerId, ws] of connections) {
                ws.send(JSON.stringify({
                    type: 'game_state',
                    game: gameState
                }));
            }
        }
    }

    initializeGame(game) {
        console.log(`Initializing game ${game.id} with 2 players`);
        this.initializeBoard(game);
        game.currentPlayer = 0;
        game.currentTile = this.drawTile(game);
        game.status = 'active';
        
        this.broadcastGameState(game.id);
    }

    drawTile(game) {
        if (!game.tileStack || game.tileStack.length === 0) return null;
        const tile = game.tileStack.pop();
        return {
            type: tile,
            rotation: 0
        };
    }

    rotateTile(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game || game.status !== 'active') {
            return { success: false, error: 'Invalid game state' };
        }

        if (game.players[game.currentPlayer - 1] !== playerId) {
            return { success: false, error: 'Not your turn' };
        }

        if (!game.currentTile) {
            console.warn(`No tile to rotate for game ${gameId}`);
            return { success: false, error: 'No tile to rotate' };
        }

        // Обертаємо тайл на 90 градусів
        game.currentTile.rotation = ((game.currentTile.rotation || 0) + 90) % 360;

        return { success: true, game };
    }

    skipTurn(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game || game.status !== 'active') {
            return { success: false, error: 'Invalid game state' };
        }

        if (game.players[game.currentPlayer - 1] !== playerId) {
            return { success: false, error: 'Not your turn' };
        }

        // Повертаємо поточний тайл назад у колоду
        if (game.currentTile) {
            game.tileStack.unshift(game.currentTile.type);
        }

        // Беремо новий тайл
        game.currentTile = this.drawTile(game);

        // Змінюємо гравця
        game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;

        return { success: true, game };
    }

    initializeBoard(game) {
        console.log('Initializing board on server...');
        
        // Створюємо порожню дошку
        game.board = this.createEmptyBoard();
        
        // Розміщуємо стартові тайли
        this.placeStartingTiles(game.board);
        
        console.log('Board initialized on server');
    }
    
    placeStartingTiles(board) {
        console.log('Placing starting tiles...');
        
        // Розміщуємо міста по кутах
        const cornerTiles = [
            { row: 0, col: 0, type: 'CRRF', rotation: 0 },
            { row: 0, col: 9, type: 'CFRF', rotation: 270 },
            { row: 9, col: 0, type: 'FRRF', rotation: 90 },
            { row: 9, col: 9, type: 'FFCR', rotation: 180 }
        ];
        
        for (const tile of cornerTiles) {
            board[tile.row][tile.col] = {
                type: tile.type,
                rotation: tile.rotation,
                owner: 0
            };
        }
        
        // Розміщуємо дороги на сторонах
        const roadTiles = [
            { row: 0, col: 2, type: 'RRFF', rotation: 0 },
            { row: 0, col: 7, type: 'RRFF', rotation: 0 },
            { row: 2, col: 0, type: 'RRFF', rotation: 90 },
            { row: 7, col: 0, type: 'RRFF', rotation: 90 },
            { row: 9, col: 2, type: 'RRFF', rotation: 180 },
            { row: 9, col: 7, type: 'RRFF', rotation: 180 },
            { row: 2, col: 9, type: 'RRFF', rotation: 270 },
            { row: 7, col: 9, type: 'RRFF', rotation: 270 }
        ];
        
        for (const tile of roadTiles) {
            board[tile.row][tile.col] = {
                type: tile.type,
                rotation: tile.rotation,
                owner: 0
            };
        }
        
        console.log('Starting tiles placed');
    }
} 