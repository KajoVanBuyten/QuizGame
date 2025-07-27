import { Server } from 'socket.io'
import { readFileSync, existsSync, watchFile } from 'fs'

const PORT = 4000

let questions = loadQuestions()
const categories = Object.keys(questions)

const boardState = categories.map(cat =>
    questions[cat].map(q => ({
        points: q.points,
        status: 'blue'
    }))
)

const players = new Map()
let currentQuestion = null
let currentBuzzer = null
let buzzState = 'inactive'
let showLosButton = true

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

// 📁 Live-Dateiüberwachung auf /data/questions.json
watchFile('./data/questions.json', { interval: 1000 }, () => {
    console.log('🌀 questions.json geändert – reloading...')
    questions = loadQuestions()

    categories.forEach((cat, catIndex) => {
        const newRows = questions[cat].map(q => {
            const existing = boardState[catIndex]?.find(r => r.points === q.points)
            return {
                points: q.points,
                status: existing ? existing.status : 'blue'
            }
        })
        boardState[catIndex] = newRows
    })

    server.emit('boardUpdate', boardState)
    server.emit('questionsReloaded') // 🟢 Notify Moderator UI (für Blink z. B.)
})

server.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.emit('boardUpdate', boardState)
    sendPlayers()

    socket.on('join', (name) => {
        players.set(socket.id, { name, points: 0 })
        sendPlayers()
    })

    socket.on('selectQuestion', ({ category, points }) => {
        const catIndex = categories.indexOf(category)
        if (catIndex === -1) return

        const row = boardState[catIndex].find(q => q.points === points)
        if (!row || row.status !== 'blue') return
        row.status = 'green'

        const questionData = questions[category].find(q => q.points === points)
        if (!questionData) return

        currentQuestion = {
            category,
            points,
            text: questionData.text,
            choices: questionData.choices
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
            const name = players.get(socket.id)?.name ?? 'Unbekannt'
            server.emit('buzzer', name)
        }
    })

    socket.on('evaluate', ({ correct }) => {
        if (correct && currentBuzzer && currentQuestion) {
            const p = players.get(currentBuzzer)
            if (p) p.points += currentQuestion.points
            sendPlayers()
            currentQuestion = null
        }
        buzzState = 'inactive'
        currentBuzzer = null
        showLosButton = !correct

        server.emit('buzzState', buzzState)
        server.emit('buzzer', null)
        server.emit('showLosButton', showLosButton)
        if (!correct) {
            server.emit('question', currentQuestion)
        }
    })

    socket.on('disconnect', () => {
        players.delete(socket.id)
        sendPlayers()
    })
})

function loadQuestions() {
    const path = './data/questions.json'
    if (!existsSync(path)) {
        throw new Error('❌ questions.json not found in /data/')
    }
    return JSON.parse(readFileSync(path, 'utf-8'))
}

function sendPlayers() {
    server.emit(
        'players',
        Array.from(players.entries()).map(([id, p]) => ({ id, ...p }))
    )
}
