import React from 'react';
import styled from 'styled-components';
import TileImage from './TileImage';

const BoardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(10, 60px);
    grid-template-rows: repeat(10, 60px);
    gap: 1px;
    background-color: #2c3e50;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
`;

const Cell = styled.div`
    background-color: ${props => props.$isValidPlacement ? 'rgba(46, 204, 113, 0.2)' : 'rgba(52, 73, 94, 0.8)'};
    border: ${props => props.$isValidPlacement ? '2px dashed #2ecc71' : 'none'};
    border-radius: 4px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: ${props => props.$isValidPlacement ? 'pointer' : 'default'};

    &:hover {
        transform: ${props => props.$isValidPlacement ? 'scale(1.05)' : 'none'};
    }
`;

const TileContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: ${props => `rotate(${props.$rotation}deg)`};
    transition: transform 0.3s ease;
`;

const Board = ({ board, currentTile, onTilePlacement, canPlaceTile }) => {
    return (
        <BoardGrid>
            {board.map((row, rowIndex) => 
                row.map((cell, colIndex) => {
                    const isValidPlacement = currentTile && canPlaceTile(rowIndex, colIndex, currentTile.code, currentTile.rotation);
                    
                    return (
                        <Cell 
                            key={`${rowIndex}-${colIndex}`}
                            $isValidPlacement={isValidPlacement}
                            onClick={() => {
                                if (isValidPlacement) {
                                    onTilePlacement(rowIndex, colIndex);
                                }
                            }}
                        >
                            {cell && (
                                <TileContainer $rotation={cell.rotation}>
                                    <TileImage 
                                        code={cell.code}
                                        size={60}
                                        player={cell.player}
                                    />
                                </TileContainer>
                            )}
                        </Cell>
                    );
                })
            )}
        </BoardGrid>
    );
};

export default Board; 