import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ControlsContainer = styled.div`
    width: 250px;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const ScoreSection = styled.div`
    margin-bottom: 20px;
`;

const PlayerScore = styled.div`
    margin: 10px 0;
    padding: 10px;
    background-color: ${props => props.$isActive ? 'rgba(46, 204, 113, 0.2)' : 'rgba(44, 62, 80, 0.1)'};
    border-radius: 4px;
    border-left: ${props => props.$isActive ? '4px solid #2ecc71' : 'none'};
`;

const JokersContainer = styled.div`
    display: flex;
    gap: 5px;
    margin-top: 5px;
`;

const Joker = styled.div`
    width: 20px;
    height: 20px;
    background-color: #e74c3c;
    border-radius: 50%;
    opacity: ${props => props.$active ? 1 : 0.3};
`;

const Button = styled.button`
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: none;
    border-radius: 4px;
    background-color: #3498db;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #2980b9;
    }

    &:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }
`;

const Controls = ({ 
    score1, 
    score2, 
    currentPlayer, 
    jokers1, 
    jokers2, 
    onNewGame,
    onOpenDeckBuilder 
}) => {
    return (
        <ControlsContainer>
            <ScoreSection>
                <h3>Рахунок</h3>
                
                <PlayerScore $isActive={currentPlayer === 1}>
                    <h4>Гравець 1</h4>
                    <p>Очки: {score1}</p>
                    <p>Джокери:</p>
                    <JokersContainer>
                        {[...Array(2)].map((_, i) => (
                            <Joker key={i} $active={i < jokers1} />
                        ))}
                    </JokersContainer>
                </PlayerScore>

                <PlayerScore $isActive={currentPlayer === 2}>
                    <h4>Гравець 2</h4>
                    <p>Очки: {score2}</p>
                    <p>Джокери:</p>
                    <JokersContainer>
                        {[...Array(2)].map((_, i) => (
                            <Joker key={i} $active={i < jokers2} />
                        ))}
                    </JokersContainer>
                </PlayerScore>
            </ScoreSection>

            <Button onClick={onNewGame}>
                Нова гра
            </Button>
            
            <Button onClick={onOpenDeckBuilder} style={{ marginTop: '10px' }}>
                Конструктор колоди
            </Button>
        </ControlsContainer>
    );
};

Controls.propTypes = {
    score1: PropTypes.number.isRequired,
    score2: PropTypes.number.isRequired,
    currentPlayer: PropTypes.number.isRequired,
    jokers1: PropTypes.number.isRequired,
    jokers2: PropTypes.number.isRequired,
    onNewGame: PropTypes.func.isRequired,
    onOpenDeckBuilder: PropTypes.func.isRequired
};

export default Controls; 