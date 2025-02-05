import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ScoreBoardContainer = styled.div`
    width: 250px;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const PlayerInfo = styled.div`
    margin: 10px 0;
    padding: 12px;
    border-radius: 4px;
    background-color: ${props => props.isActive ? 'rgba(46, 204, 113, 0.2)' : 'rgba(44, 62, 80, 0.1)'};
    border-left: ${props => props.isActive ? '4px solid #2ecc71' : 'none'};
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
    opacity: ${props => props.active ? 1 : 0.3};
`;

const ScoreBoard = ({ currentPlayer, scores }) => {
    return (
        <ScoreBoardContainer>
            <h3>Рахунок</h3>
            
            <PlayerInfo isActive={currentPlayer === 1}>
                <h4>Гравець 1</h4>
                <p>Очки: {scores.player1}</p>
                <p>Джокери:</p>
                <JokersContainer>
                    <Joker active={true} />
                    <Joker active={true} />
                </JokersContainer>
            </PlayerInfo>

            <PlayerInfo isActive={currentPlayer === 2}>
                <h4>Гравець 2</h4>
                <p>Очки: {scores.player2}</p>
                <p>Джокери:</p>
                <JokersContainer>
                    <Joker active={true} />
                    <Joker active={true} />
                </JokersContainer>
            </PlayerInfo>
        </ScoreBoardContainer>
    );
};

ScoreBoard.propTypes = {
    currentPlayer: PropTypes.number.isRequired,
    scores: PropTypes.shape({
        player1: PropTypes.number.isRequired,
        player2: PropTypes.number.isRequired
    }).isRequired
};

export default ScoreBoard; 