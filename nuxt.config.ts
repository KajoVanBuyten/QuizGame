export default defineNuxtConfig({
    compatibilityDate: '2025-07-26',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss'],
    nitro: {
        preset: 'node-server',
        experimental: {
            websocket: true
        },
        routeRules: {
            '/socket/**': { cors: true, headers: { 'access-control-allow-methods': '*' } },
        },
        plugins: []
    },
    router: {
        options: {
            strict: false
        }
    }
});