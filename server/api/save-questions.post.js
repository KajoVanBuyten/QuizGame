import { writeFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body || typeof body !== 'object') {
        return { success: false, error: 'Ungültige Daten' }
    }

    const filePath = join(process.cwd(), 'data', 'questions.json')
    try {
        writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8')
        return { success: true }
    } catch (err) {
        return { success: false, error: err.message }
    }
})
