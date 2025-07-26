import { Server } from 'socket.io';
import { readFileSync } from 'fs';

const server = new Server(4000, {
    path: '/socket/',
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const questions = JSON.parse(readFileSync('./data/questions.json', 'utf-8'));

const players = new Map();
const boardState = Array(6).fill(null).map(() => Array(6).fill('blue'));
let buzzState = 'inactive';
let currentQuestion = null;
let currentBuzzer = null;
let showLosButton = true;

server.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (name) => {
        console.log('Spieler verbunden:', name);
        players.set(socket.id, { name, points: 0 });
        server.emit('players', Array.from(players.entries()).map(([id, p]) => ({ id, ...p })));
    });

    socket.on('selectQuestion', ({ category, points }) => {
        console.log('Frage gewählt:', category, points);
        const catIndex = ['Sport', 'Geschichte', 'Wissenschaft', 'Film', 'Geographie', 'Literatur'].indexOf(category);
        const pointIndex = [100, 200, 300, 400, 500, 600].indexOf(points);

        console.log('Fragen state:', boardState[catIndex][pointIndex]);

        if (catIndex >= 0 && pointIndex >= 0 && boardState[catIndex][pointIndex] === 'blue') {
            boardState[catIndex][pointIndex] = 'green';
            currentQuestion = {
                category,
                points,
                text: questions[category][points]?.text,
                choices: questions[category][points]?.choices,
            };
            showLosButton = true;
            server.emit('boardUpdate', boardState);
            server.emit('question', currentQuestion);
            server.emit('showLosButton', showLosButton);
        }

        console.log('📤 Sende Frage:', JSON.stringify(currentQuestion, null, 2));
    });

    socket.on('startRound', () => {
        buzzState = 'active';
        currentBuzzer = null;
        server.emit('buzzState', buzzState);
        showLosButton = false;
        server.emit('showLosButton', showLosButton);
    });

    socket.on('buzz', () => {
        if (buzzState === 'active' && !currentBuzzer) {
            currentBuzzer = socket.id;
            server.emit('buzzer', players.get(socket.id)?.name ?? 'Unknown');
        }
    });

    socket.on('evaluate', ({ correct }) => {
        if (correct && currentBuzzer && currentQuestion) {
            players.get(currentBuzzer).points += currentQuestion.points;
            server.emit('players', Array.from(players.entries()).map(([id, p]) => ({ id, ...p })));
            showLosButton = false;
        } else {
            showLosButton = true;
        }
        buzzState = 'inactive';
        currentBuzzer = null;
        server.emit('buzzState', buzzState);
        server.emit('buzzer', null);
        server.emit('showLosButton', showLosButton);
    });

    socket.on('disconnect', () => {
        players.delete(socket.id);
        server.emit('players', Array.from(players.entries()).map(([id, p]) => ({ id, ...p })));
    });

    socket.on('error', (err) => {
        console.error(err);
    });
});

console.log('✅ Socket.IO Server läuft auf Port 4000');
