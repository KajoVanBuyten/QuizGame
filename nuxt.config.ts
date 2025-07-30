export default defineNuxtConfig({
    compatibilityDate: '2025-07-26',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss'],
    css: ['vuetify/styles'], // ✅ Vuetify CSS einbinden
    build: {
        transpile: ['vuetify'] // ✅ Vuetify transpilen
    },
    nitro: {
        preset: 'node-server',
        experimental: {
            websocket: true
        },
        plugins: []
    },
    router: {
        options: {
            strict: false
        }
    },
    routeRules: {
        '/socket/**': { cors: true, headers: { 'access-control-allow-methods': '*' } },
        '/moderator': { middleware: 'auth' },
        '/questions': { middleware: 'auth' },
        '/player': { middleware: 'auth' },
        '/player/buzzer': { middleware: 'auth' }
    }
})
