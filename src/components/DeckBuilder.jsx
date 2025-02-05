import React, { useState } from 'react';
import styled from 'styled-components';
import TileImage from './TileImage';
import { TILE_CONFIG } from '../config';

const DeckBuilderContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const BuilderContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 1000px;
    max-height: 80vh;
    overflow-y: auto;
`;

const TilesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    margin: 20px 0;
`;

const TileCard = styled.div`
    background: ${props => props.$selected ? '#e3f2fd' : 'white'};
    border: 2px solid ${props => props.$selected ? '#2196f3' : '#ddd'};
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
`;

const Counter = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
`;

const Button = styled.button`
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    background: ${props => props.$variant === 'primary' ? '#2196f3' : '#f44336'};
    color: white;
    cursor: pointer;

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const TotalCount = styled.div`
    font-size: 1.2em;
    color: ${props => props.$isValid ? '#4caf50' : '#f44336'};
`;

const DeckBuilder = ({ onClose, onSave, initialDeck = {} }) => {
    const [deck, setDeck] = useState(() => {
        // Перевіряємо та нормалізуємо початкові дані
        if (!initialDeck || typeof initialDeck !== 'object') {
            return {};
        }
        // Переконуємося, що всі значення є цілими числами
        return Object.fromEntries(
            Object.entries(initialDeck)
                .map(([code, count]) => [code, Math.floor(Number(count)) || 0])
        );
    });

    const totalTiles = Object.values(deck).reduce((sum, count) => {
        // Переконуємося, що додаємо тільки цілі числа
        const safeCount = Math.floor(Number(count)) || 0;
        return sum + safeCount;
    }, 0);

    const handleTileCount = (tileCode, delta) => {
        if (!tileCode || typeof delta !== 'number') return;

        setDeck(prev => {
            const currentCount = Math.floor(Number(prev[tileCode])) || 0;
            const newCount = Math.max(0, currentCount + delta);
            
            return {
                ...prev,
                [tileCode]: newCount
            };
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (totalTiles > 0) {
            const normalizedDeck = Object.fromEntries(
                Object.entries(deck)
                    .filter(([_, count]) => count > 0)
                    .map(([code, count]) => [code, Math.floor(Number(count))])
            );
            onSave(normalizedDeck);
            onClose();
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        onClose();
    };

    return (
        <DeckBuilderContainer onClick={handleClose}>
            <BuilderContent onClick={e => e.stopPropagation()}>
                <Header>
                    <h2>Конструктор колоди</h2>
                    <TotalCount $isValid={totalTiles > 0}>
                        Всього тайлів: {totalTiles}
                    </TotalCount>
                    <div>
                        <Button 
                            onClick={handleClose}
                            $variant="secondary"
                            type="button"
                        >
                            Скасувати
                        </Button>
                        <Button 
                            onClick={handleSave}
                            $variant="primary"
                            disabled={totalTiles === 0}
                            style={{ marginLeft: '10px' }}
                            type="button"
                        >
                            Зберегти
                        </Button>
                    </div>
                </Header>

                <TilesGrid>
                    {Object.keys(TILE_CONFIG).map(tileCode => (
                        <TileCard 
                            key={tileCode}
                            $selected={(deck[tileCode] || 0) > 0}
                        >
                            <TileImage code={tileCode} size={100} />
                            <Counter>
                                <Button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTileCount(tileCode, -1);
                                    }}
                                    disabled={(deck[tileCode] || 0) === 0}
                                    type="button"
                                >
                                    -
                                </Button>
                                <span>{deck[tileCode] || 0}</span>
                                <Button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTileCount(tileCode, 1);
                                    }}
                                    type="button"
                                >
                                    +
                                </Button>
                            </Counter>
                        </TileCard>
                    ))}
                </TilesGrid>
            </BuilderContent>
        </DeckBuilderContainer>
    );
};

export default DeckBuilder; 