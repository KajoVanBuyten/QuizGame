// server/api/check-password.post.js
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const input = body?.password?.trim()

    if (!input) {
        return { success: false, error: 'Kein Passwort angegeben.' }
    }

    try {
        const path = join(process.cwd(), 'data', 'passwords.json')

        if (!existsSync(path)) {
            return { success: false, error: 'Passwortdatei fehlt.' }
        }

        const raw = readFileSync(path, 'utf-8')
        const { player, moderator } = JSON.parse(raw)

        if (input === moderator) {
            return { success: true, role: 'moderator' }
        } else if (input === player) {
            return { success: true, role: 'player' }
        } else {
            return { success: false, error: 'Falsches Passwort.' }
        }
    } catch (e) {
        return { success: false, error: 'Fehler beim Laden der Passwortdatei.' }
    }
})