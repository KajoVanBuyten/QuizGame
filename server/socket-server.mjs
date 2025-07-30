import { Server } from 'socket.io'
import fs, { readFileSync, writeFileSync, existsSync, watchFile } from 'fs'

const PORT = 4000

let questions = loadQuestions()
let categories = Object.keys(questions)

let boardState = {}

const playersByToken = new Map()
const sockets = new Map()

let currentQuestion = null
let currentBuzzer = null
let buzzState = 'inactive'
let showLosButton = true

loadState()

// Nur initialisieren, wenn boardState leer
if (Object.keys(boardState).length === 0) {
    for (const category of categories) {
        boardState[category] = questions[category].map(q => ({
            points: q.points,
            status: 'blue'
        }))
    }
}

const server = new Server(PORT, {
    host: '0.0.0.0',
    path: '/socket/',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
})

console.log(`✅ Socket.IO Server läuft auf Port ${PORT}`)

watchFile('./data/questions.json', { interval: 1000 }, () => {
    console.log('🔀 questions.json geändert – reloading...')
    questions = loadQuestions()

    const newCats = Object.keys(questions)
    const oldCats = [...categories]
    categories = newCats

    for (const cat of categories) {
        const oldEntries = boardState[cat] ?? []

        boardState[cat] = questions[cat].map(q => {
            const existing = oldEntries.find(e => e.points === q.points)
            return {
                points: q.points,
                status: existing?.status ?? 'blue'
            }
        })
    }

    for (const oldCat of oldCats) {
        if (!categories.includes(oldCat)) {
            delete boardState[oldCat]
        }
    }

    server.emit('boardUpdate', boardState)
    server.emit('questionsReloaded')
})

server.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    socket.emit('boardUpdate', boardState)
    sendPlayers()

    socket.on('join', ({ name, token }) => {
        if (!name || !token) return
        const existing = playersByToken.get(token)
        if (existing && existing.name !== name) {
            socket.emit('joinError', 'Name bereits vergeben.')
            return
        }
        playersByToken.set(token, {
            name,
            points: existing?.points ?? 0,
            token
        })
        sockets.set(socket.id, token)
        persistState()
        sendPlayers()
    })

    socket.on('reconnectWithToken', (token) => {
        const player = playersByToken.get(token)
        if (!player) return
        sockets.set(socket.id, token)
        persistState()
        sendPlayers()
        socket.emit('autoJoinSuccess', player.name)
    })

    socket.on('selectQuestion', ({ category, points }) => {
        const row = boardState[category]?.find(q => q.points === points)
        if (!row || row.status !== 'blue') return

        const questionData = questions[category].find(q => q.points === points)
        if (!questionData) return

        row.status = 'green'
        currentQuestion = {
            category,
            points,
            text: questionData.text,
            choices: questionData.choices,
            correctIndex: questionData.correctIndex
        }

        buzzState = 'inactive'
        currentBuzzer = null
        showLosButton = true

        server.emit('boardUpdate', boardState)
        server.emit('question', currentQuestion)
        server.emit('showLosButton', showLosButton)
    })

    socket.on('startRound', () => {
        buzzState = 'active'
        currentBuzzer = null
        showLosButton = false
        server.emit('buzzState', buzzState)
        server.emit('showLosButton', showLosButton)
    })

    socket.on('buzz', () => {
        if (buzzState === 'active' && !currentBuzzer) {
            currentBuzzer = socket.id
            const token = sockets.get(socket.id)
            const name = playersByToken.get(token)?.name ?? 'Unbekannt'
            server.emit('buzzer', name)
        }
    })

    socket.on('evaluate', ({ correct }) => {
        if (correct && currentBuzzer && currentQuestion) {
            const token = sockets.get(currentBuzzer)
            const p = playersByToken.get(token)
            if (p) p.points += currentQuestion.points

            const field = boardState[currentQuestion.category]?.find(q => q.points === currentQuestion.points)
            if (field) field.status = 'green'

            sendPlayers()
            persistState()
            currentQuestion = null
            server.emit('resetUI')
        }

        buzzState = 'inactive'
        currentBuzzer = null
        showLosButton = !correct

        server.emit('buzzState', buzzState)
        server.emit('buzzer', null)
        server.emit('showLosButton', showLosButton)
        if (!correct) server.emit('question', currentQuestion)
    })

    socket.on('resetGame', () => {
        for (const [socketId, token] of sockets.entries()) {
            const client = server.sockets.sockets.get(socketId)
            if (client) {
                client.emit('forceReconnect')
                client.disconnect(true)
            }
        }

        playersByToken.clear()
        sockets.clear()
        currentQuestion = null
        buzzState = 'inactive'
        currentBuzzer = null
        for (const cat of categories) {
            boardState[cat].forEach(cell => (cell.status = 'blue'))
        }
        if (existsSync('./data/game-state.json')) fs.unlinkSync('./data/game-state.json')
        sendPlayers()
        persistState()
        server.emit('boardUpdate', boardState)
        server.emit('resetUI')
    })

    socket.on('kick', (socketId) => {
        const client = server.sockets.sockets.get(socketId)
        const token = sockets.get(socketId)
        if (client) {
            console.log('⛔ Verbindung wird getrennt:', socketId)
            if (token) {
                playersByToken.delete(token)
                sockets.delete(socketId)
                persistState()
            }
            client.disconnect(true)
            sendPlayers()
        }
    })

    socket.on('disconnect', () => {
        sockets.delete(socket.id)
        sendPlayers()
    })
})

function loadQuestions() {
    const path = './data/questions.json'
    if (!existsSync(path)) throw new Error('❌ questions.json not found in /data/')
    return JSON.parse(readFileSync(path, 'utf-8'))
}

function sendPlayers() {
    const players = Array.from(sockets.entries()).map(([socketId, token]) => {
        const p = playersByToken.get(token)
        return p ? { id: socketId, ...p } : null
    }).filter(Boolean)
    server.emit('players', players)
}

function persistState() {
    const cleanBoardState = {}
    for (const [category, entries] of Object.entries(boardState)) {
        cleanBoardState[category] = entries.map(({ points, status }) => ({ points, status }))
    }

    const saveData = {
        boardState: cleanBoardState,
        currentQuestion,
        players: Object.fromEntries(playersByToken.entries()),
        categories
    }

    writeFileSync('./data/game-state.json', JSON.stringify(saveData, null, 2))
}

function persistPlayersOnly() {
    const path = './data/game-state.json'

    let data = {}
    if (existsSync(path)) {
        try {
            data = JSON.parse(readFileSync(path, 'utf-8'))
        } catch (e) {
            console.warn('⚠️ Konnte game-state.json nicht lesen:', e)
        }
    }

    // Update nur den Player-Teil, Rest unverändert
    data.players = Object.fromEntries(playersByToken.entries())

    writeFileSync(path, JSON.stringify(data, null, 2))
}

function loadState() {
    const path = './data/game-state.json'
    if (!existsSync(path)) return

    try {
        const state = JSON.parse(readFileSync(path, 'utf-8'))

        if (state.categories) categories = state.categories
        if (state.boardState) boardState = state.boardState
        if (state.players) {
            for (const [token, player] of Object.entries(state.players)) {
                playersByToken.set(token, player)
            }
        }

        // Frage ggf. wieder anzeigen (falls gewünscht)
        currentQuestion = state.currentQuestion ?? null
    } catch (e) {
        console.warn('⚠️ Fehler beim Laden des Spielstands:', e)
    }
}
