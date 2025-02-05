import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { TILE_CONFIG } from '../config';
import TileImage from './TileImage';

const StackContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const TileContainer = styled.div`
    width: 100px;
    height: 100px;
    cursor: pointer;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    &:hover {
        transform: scale(1.05);
    }
`;

const TileCount = styled.div`
    font-size: 1.2em;
    color: #2c3e50;
    margin-top: 10px;
`;

const Button = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: ${props => props.$variant === 'primary' ? '#3498db' : '#e74c3c'};
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin: 5px;

    &:hover {
        background-color: ${props => props.$variant === 'primary' ? '#2980b9' : '#c0392b'};
    }

    &:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
`;

const TileStack = ({ onTileSelect, onSkip, onUseJoker, disabled, needNewTile, customDeck, forceNewGame }) => {
    const [deck, setDeck] = useState([]);
    const [currentTile, setCurrentTile] = useState(null);
    const [rotation, setRotation] = useState(0);
    const configRef = useRef(null);
    const isInitializedRef = useRef(false);

    const drawNextTile = useCallback(() => {
        if (!deck.length) {
            console.log('TileStack: No more tiles in deck');
            return;
        }

        const newDeck = [...deck];
        const drawnTile = newDeck.pop();
        
        console.log('TileStack: Drawing new tile:', {
            tile: drawnTile,
            remainingTiles: newDeck.length
        });
        
        setDeck(newDeck);
        setRotation(0);
        setCurrentTile(drawnTile);
        onTileSelect({ code: drawnTile, rotation: 0, isNew: true });
    }, [deck, onTileSelect]);

    const createNewDeck = useCallback((config) => {
        const newDeck = [];
        Object.entries(config).forEach(([code, count]) => {
            for (let i = 0; i < count; i++) {
                newDeck.push(code);
            }
        });
        return newDeck.sort(() => Math.random() - 0.5);
    }, []);

    const initializeDeck = useCallback((config) => {
        const configStr = JSON.stringify(config);
        
        // Пропускаємо ініціалізацію тільки якщо конфігурація не змінилася і це не нова гра
        if (configRef.current === configStr && !forceNewGame) {
            console.log('TileStack: Skipping initialization - same config and not a new game');
            return;
        }
        
        console.log('=== ІНІЦІАЛІЗАЦІЯ КОЛОДИ ===');
        console.log('TileStack: Using deck configuration:', {
            totalConfigured: Object.values(config).reduce((sum, count) => sum + count, 0),
            configuration: config
        });
        
        const shuffledDeck = createNewDeck(config);
        const firstTile = shuffledDeck.pop();
        
        console.log('TileStack: Initialized new deck:', {
            totalTiles: shuffledDeck.length + 1,
            firstTile,
            remainingTiles: shuffledDeck.length
        });
        
        setDeck(shuffledDeck);
        setCurrentTile(firstTile);
        setRotation(0);
        configRef.current = configStr;
        isInitializedRef.current = true;
        onTileSelect({ code: firstTile, rotation: 0, isNew: true });
    }, [createNewDeck, onTileSelect, forceNewGame]);

    // Єдиний ефект для керування колодою
    useEffect(() => {
        const config = customDeck || TILE_CONFIG;
        initializeDeck(config);
    }, [customDeck, initializeDeck, forceNewGame]);

    // Ефект для витягування нового тайлу
    useEffect(() => {
        if (needNewTile && deck.length > 0) {
            console.log('=== ВИТЯГУВАННЯ НОВОГО ТАЙЛУ ===');
            console.log('TileStack: Need new tile is true, current deck size:', deck.length);
            drawNextTile();
        }
    }, [needNewTile, deck.length, drawNextTile]);

    const handleRotate = () => {
        if (!currentTile || disabled) return;
        
        const newRotation = (rotation + 90) % 360;
        setRotation(newRotation);
        onTileSelect({ code: currentTile, rotation: newRotation, isNew: false });
    };

    const handleSkip = () => {
        if (!currentTile || disabled) return;
        
        const newDeck = [...deck, currentTile];
        const shuffledDeck = [...newDeck].sort(() => Math.random() - 0.5);
        const nextTile = shuffledDeck.pop();
        
        setDeck(shuffledDeck);
        setRotation(0);
        setCurrentTile(nextTile);
        onTileSelect({ code: nextTile, rotation: 0, isNew: true });
        
        onSkip();
    };

    return (
        <StackContainer>
            <TileCount>Залишилось плиток: {deck.length}</TileCount>
            
            {currentTile && (
                <TileContainer onClick={handleRotate}>
                    <TileImage 
                        code={currentTile}
                        rotation={rotation}
                        size={100}
                    />
                </TileContainer>
            )}
            
            <ButtonContainer>
                <Button 
                    onClick={handleSkip} 
                    disabled={!currentTile || disabled}
                >
                    Пропустити хід
                </Button>
                <Button 
                    $variant="primary" 
                    onClick={onUseJoker} 
                    disabled={!currentTile || disabled}
                >
                    Використати джокер
                </Button>
            </ButtonContainer>
        </StackContainer>
    );
};

export default TileStack; 