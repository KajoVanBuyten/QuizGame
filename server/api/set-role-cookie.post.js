// 📁 /server/api/set-role-cookie.post.ts
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const role = body?.role
    if (role !== 'moderator' && role !== 'player') {
        return { success: false }
    }

    setCookie(event, 'role', role, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 1 Tag
    })

    return { success: true }
})
