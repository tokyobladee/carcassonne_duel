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

    const createNewDeck = useCallback((config) => {
        console.log('TileStack: Creating new deck with config:', config);
        const newDeck = [];
        Object.entries(config).forEach(([code, count]) => {
            for (let i = 0; i < count; i++) {
                newDeck.push(code);
            }
        });
        return newDeck.sort(() => Math.random() - 0.5);
    }, []);

    const initializeNewDeck = useCallback((config) => {
        console.log('=== ІНІЦІАЛІЗАЦІЯ НОВОЇ КОЛОДИ ===');
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
        configRef.current = JSON.stringify(config);
        onTileSelect({ code: firstTile, rotation: 0, isNew: true });
    }, [createNewDeck, onTileSelect]);

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

    // Ефект для нової гри
    useEffect(() => {
        if (forceNewGame) {
            console.log('TileStack: Force new game detected, creating new deck');
            const config = customDeck || TILE_CONFIG;
            setDeck([]); // Очищуємо стан колоди
            initializeNewDeck(config);
        }
    }, [forceNewGame, customDeck, initializeNewDeck]);

    // Ефект для зміни колоди
    useEffect(() => {
        if (!forceNewGame && customDeck) {
            console.log('TileStack: Custom deck changed, initializing new deck');
            initializeNewDeck(customDeck);
        }
    }, [customDeck, initializeNewDeck, forceNewGame]);

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