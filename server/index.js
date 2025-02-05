import express from 'express';
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { GameManager } from './GameManager.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const gameManager = new GameManager();

// Middleware
app.use(cors());
app.use(express.json());

// REST API endpoints
app.post('/api/games', (req, res) => {
    const gameId = gameManager.createGame();
    console.log(`Created new game: ${gameId}`);
    res.json({ gameId });
});

app.get('/api/games/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const gameState = gameManager.getGameState(gameId);
    
    if (!gameState) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(gameState);
});

// WebSocket handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(ws, data);
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });
    
    ws.on('close', () => {
        const gameId = gameManager.disconnectPlayer(ws);
        if (gameId) {
            gameManager.broadcastGameState(gameId);
        }
    });
});

function handleWebSocketMessage(ws, data) {
    switch (data.type) {
        case 'join_game':
            handleJoinGame(ws, data);
            break;
        case 'make_move':
            handleMove(ws, data);
            break;
        case 'rotate_tile':
            handleRotateTile(ws, data);
            break;
        case 'skip_turn':
            handleSkipTurn(ws, data);
            break;
        default:
            console.warn('Unknown message type:', data.type);
    }
}

function handleJoinGame(ws, data) {
    const { gameId, playerId } = data;
    const result = gameManager.joinGame(gameId, playerId, ws);
    
    if (!result.success) {
        ws.send(JSON.stringify({
            type: 'error',
            message: result.error
        }));
        return;
    }
    
    gameManager.broadcastGameState(gameId);
}

function handleMove(ws, data) {
    const { gameId, playerId, move } = data;
    const result = gameManager.makeMove(gameId, playerId, move);
    
    if (!result.success) {
        ws.send(JSON.stringify({
            type: 'error',
            message: result.error
        }));
        return;
    }
    
    gameManager.broadcastGameState(gameId);
}

function handleRotateTile(ws, data) {
    const { gameId, playerId } = data;
    const result = gameManager.rotateTile(gameId, playerId);
    
    if (!result.success) {
        ws.send(JSON.stringify({
            type: 'error',
            message: result.error
        }));
        return;
    }
    
    gameManager.broadcastGameState(gameId);
}

function handleSkipTurn(ws, data) {
    const { gameId, playerId } = data;
    const result = gameManager.skipTurn(gameId, playerId);
    
    if (!result.success) {
        ws.send(JSON.stringify({
            type: 'error',
            message: result.error
        }));
        return;
    }
    
    gameManager.broadcastGameState(gameId);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 