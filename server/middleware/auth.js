import { getCookie, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
    const path = event.path
    const modPages = ['/moderator', '/questions']
    const playerPages = ['/player', '/player/buzzer']

    const role = getCookie(event, 'role')

    if (modPages.includes(path) && role !== 'moderator') {
        return sendRedirect(event, '/')
    }

    if (playerPages.includes(path) && role !== 'player' && role !== 'moderator') {
        return sendRedirect(event, '/')
    }
})