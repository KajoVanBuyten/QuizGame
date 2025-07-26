# 🧠 QuizGame – For the greatest homie of all time: **Crow**

A small quiz game built with **Nuxt 3** and **Vue 3**, designed for multiplayer sessions with a moderator and buzzing players.

---

## 🎮 Roles

### 👑 Moderator
- Selects questions from the board
- Sees the full board, player list, and scores
- Controls the round (LOS, evaluate answers)
- Reveals questions and multiple-choice options

### 🙋 Players
- Join with a nickname
- See only their name and a big red buzzer
- Buzz in during active rounds
- Don't see the question or answers until it's shown

---

## 🧩 Game Logic

- The board has 6 categories × 6 difficulties (100–600 points)
- Once a question is selected:
  - It becomes inactive
  - Moderator can reveal the question and/or answers
- Players can buzz after “LOS”
- First to buzz is locked in
- Moderator evaluates (Right/Wrong)
- If wrong, “LOS” resets and others can buzz
- If no one knows: reveal 4 multiple-choice answers
- Game ends when all fields are answered

---

## 💻 Tech Stack

- [Nuxt 3](https://nuxt.com/)
- [Vue 3 (Composition API)](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO](https://socket.io/)

---

## 🚀 Run Locally

```bash
# Install dependencies
npm install

# Start frontend + socket server
npm run dev:all
```

- Frontend on: http://localhost:3000
- Socket server on: http://localhost:4000 (used internally)

---

## 📁 Structure

```
/components
  Board.vue          // Category grid
  PlayerList.vue     // List of current players
  QuestionDisplay.vue// Moderator question controls
  Buzzer.vue         // Big red button for players

/pages
  /moderator.vue     // Main game control
  /player.vue        // Minimal player interface

/socket-server.mjs   // Socket.IO server logic
/questions.json      // Pool of 36 questions
```

---

## 🧠 Designed for:
A chill session, chaos with friends, or absolute buzzer madness  
> Dedicated to the best homie of all: **Jigsaw** 🧩❤️
