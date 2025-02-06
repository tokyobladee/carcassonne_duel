import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Board from './Board';
import TileStack from './TileStack';
import Controls from './Controls';
import DeckBuilder from './DeckBuilder';
import { BOARD_SIZE, TILE_CONFIG, JOKERS_PER_PLAYER } from '../config';

const GameContainer = styled.div`
    display: grid;
    grid-template-columns: 250px 1fr 250px;
    gap: 20px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`;

// Функція для отримання сторін тайлу з урахуванням повороту
const getRotatedSides = (code, rotation) => {
    const sides = code.split('');
    const rotations = ((rotation % 360) + 360) % 360 / 90;
    
    for (let i = 0; i < rotations; i++) {
        sides.unshift(sides.pop());
    }
    
    return sides;
};

// Функція для перевірки сумісності двох сторін
const areSidesCompatible = (side1, side2) => {
    if (!side1 || !side2) return false;
    return side1 === side2;
};

// Функція для генерації випадкового тайлу
const getRandomTile = () => {
    const tiles = ['CFRF', 'CRCR', 'CCRF', 'CFCF'];
    return tiles[Math.floor(Math.random() * tiles.length)];
};

// Функція для генерації випадкового повороту
const getRandomRotation = () => {
    return Math.floor(Math.random() * 4) * 90;
};

// Функція для розміщення стартових тайлів
const placeInitialTiles = () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    // Функція для отримання випадкової позиції на стороні
    const getRandomPosition = (side) => {
        const positions = [];
        const max = BOARD_SIZE - 2;
        
        switch(side) {
            case 'top':
                for(let i = 1; i < max; i++) positions.push([0, i]);
                break;
            case 'right':
                for(let i = 1; i < max; i++) positions.push([i, BOARD_SIZE - 1]);
                break;
            case 'bottom':
                for(let i = 1; i < max; i++) positions.push([BOARD_SIZE - 1, i]);
                break;
            case 'left':
                for(let i = 1; i < max; i++) positions.push([i, 0]);
                break;
        }
        
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        return positions.slice(0, 3);
    };
    
    ['top', 'right', 'bottom', 'left'].forEach(side => {
        const positions = getRandomPosition(side);
        positions.forEach(([row, col]) => {
            board[row][col] = {
                code: getRandomTile(),
                rotation: getRandomRotation(),
                player: 0
            };
        });
    });
    
    return board;
};

const Game = () => {
    const [board, setBoard] = useState(() => placeInitialTiles());
    const [currentTile, setCurrentTile] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [jokers1, setJokers1] = useState(JOKERS_PER_PLAYER);
    const [jokers2, setJokers2] = useState(JOKERS_PER_PLAYER);
    const [gameOver, setGameOver] = useState(false);
    const [needNewTile, setNeedNewTile] = useState(true);
    const [showDeckBuilder, setShowDeckBuilder] = useState(false);
    const [customDeck, setCustomDeck] = useState(null);
    const [forceNewGame, setForceNewGame] = useState(0);

    const handleTileSelect = useCallback((tile) => {
        if (!tile) {
            console.log('Game: Received null tile');
            return;
        }

        console.log('Game: Received new tile:', tile);
        setCurrentTile(tile);
        setNeedNewTile(false);
    }, []);

    const canPlaceTile = (row, col, tileCode, rotation) => {
        if (!tileCode || board[row][col]) return false;

        const currentSides = getRotatedSides(tileCode, rotation);
        const adjacentCells = [
            { pos: [row - 1, col], side: 2, currentSide: 0 }, // верхня клітинка
            { pos: [row, col + 1], side: 3, currentSide: 1 }, // права клітинка
            { pos: [row + 1, col], side: 0, currentSide: 2 }, // нижня клітинка
            { pos: [row, col - 1], side: 1, currentSide: 3 }  // ліва клітинка
        ];

        let hasAdjacentTile = false;
        let isValid = true;

        for (const { pos: [r, c], side, currentSide } of adjacentCells) {
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                const adjacentTile = board[r][c];
                if (adjacentTile) {
                    hasAdjacentTile = true;
                    const adjacentSides = getRotatedSides(adjacentTile.code, adjacentTile.rotation);
                    if (!areSidesCompatible(currentSides[currentSide], adjacentSides[side])) {
                        isValid = false;
                        break;
                    }
                }
            }
        }

        return hasAdjacentTile && isValid;
    };

    const handleTilePlacement = (row, col) => {
        if (!currentTile || gameOver) return;

        console.log('Game: Placing tile at:', row, col);
        
        // Оновлюємо дошку
        setBoard(prevBoard => {
            const newBoard = prevBoard.map(row => [...row]);
            newBoard[row][col] = {
                code: currentTile.code,
                rotation: currentTile.rotation,
                player: currentPlayer
            };
            return newBoard;
        });

        // Оновлюємо очки
        if (currentPlayer === 1) {
            setScore1(prev => prev + 1);
        } else {
            setScore2(prev => prev + 1);
        }
        
        // Змінюємо гравця
        setCurrentPlayer(prev => prev === 1 ? 2 : 1);
        
        // Позначаємо що потрібен новий тайл
        console.log('Game: Setting need new tile to true');
        setCurrentTile(null);
        setNeedNewTile(true);
    };

    const handleSkip = () => {
        if (gameOver) return;
        console.log('Skipping turn');
        setCurrentPlayer(prev => prev === 1 ? 2 : 1);
    };

    const handleUseJoker = () => {
        if (gameOver) return;
        
        if (currentPlayer === 1 && jokers1 > 0) {
            setJokers1(jokers1 - 1);
        } else if (currentPlayer === 2 && jokers2 > 0) {
            setJokers2(jokers2 - 1);
        }
    };

    const handleNewGame = (deckConfig = null) => {
        console.log('=== ПОЧАТОК НОВОЇ ГРИ ===');
        console.log('Game: Starting new game, received config:', deckConfig);
        
        if (deckConfig && deckConfig.preventDefault) {
            console.log('Game: Received event instead of deck config, using current custom deck');
            deckConfig = customDeck || TILE_CONFIG;
        }
        
        console.log('Game: Setting new deck configuration:', {
            totalTiles: Object.values(deckConfig).reduce((sum, count) => sum + count, 0),
            configuration: deckConfig
        });
        setCustomDeck(deckConfig);
        
        console.log('Game: Resetting game state');
        setBoard(placeInitialTiles());
        setCurrentTile(null);
        setCurrentPlayer(1);
        setScore1(0);
        setScore2(0);
        setJokers1(JOKERS_PER_PLAYER);
        setJokers2(JOKERS_PER_PLAYER);
        setGameOver(false);
        setNeedNewTile(false);
        setForceNewGame(prev => prev + 1);
        console.log('=== КІНЕЦЬ ІНІЦІАЛІЗАЦІЇ НОВОЇ ГРИ ===');
    };

    // Функція для збереження користувацької колоди
    const handleSaveDeck = (deck) => {
        console.log('=== ЗБЕРЕЖЕННЯ НОВОЇ КОЛОДИ ===');
        console.log('Game: Saving custom deck:', {
            totalTiles: Object.values(deck).reduce((sum, count) => sum + count, 0),
            configuration: deck
        });
        setCustomDeck(deck);
        console.log('Game: Starting new game with saved deck');
        handleNewGame(deck);
    };

    // Додаємо новий useEffect для відстеження зміни currentTile
    useEffect(() => {
        if (currentTile) {
            console.log('Current tile updated:', {
                code: currentTile.code,
                rotation: currentTile.rotation,
                isNew: currentTile.isNew
            });
        } else {
            console.log('Current tile cleared');
        }
    }, [currentTile]);

    // Додаємо ефект для відстеження зміни customDeck
    useEffect(() => {
        if (customDeck) {
            console.log('=== ОНОВЛЕННЯ КОЛОДИ ===');
            console.log('Game: Custom deck updated:', {
                totalTiles: Object.values(customDeck).reduce((sum, count) => sum + count, 0),
                configuration: customDeck
            });
        }
    }, [customDeck]);

    // Додаємо ефект для відстеження needNewTile
    useEffect(() => {
        console.log('=== СТАН ТАЙЛУ ===');
        console.log('Game: Need new tile:', needNewTile);
    }, [needNewTile]);

    return (
        <GameContainer>
            <TileStack 
                onTileSelect={handleTileSelect}
                onSkip={handleSkip}
                onUseJoker={handleUseJoker}
                disabled={gameOver}
                needNewTile={needNewTile}
                customDeck={customDeck}
                forceNewGame={forceNewGame}
            />
            <Board 
                board={board}
                currentTile={currentTile}
                onTilePlacement={handleTilePlacement}
                canPlaceTile={canPlaceTile}
            />
            <Controls 
                score1={score1}
                score2={score2}
                currentPlayer={currentPlayer}
                jokers1={jokers1}
                jokers2={jokers2}
                onNewGame={handleNewGame}
                onOpenDeckBuilder={() => setShowDeckBuilder(true)}
            />

            {showDeckBuilder && (
                <DeckBuilder 
                    onClose={() => setShowDeckBuilder(false)}
                    onSave={handleSaveDeck}
                    initialDeck={customDeck || TILE_CONFIG}
                />
            )}
        </GameContainer>
    );
};

export default Game; 