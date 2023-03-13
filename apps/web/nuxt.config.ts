// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            TRPC_HTTP_BATCH_LINK: process.env.NUXT_TRPC_HTTP_BATCH_LINK,
        },
    },
    modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@pinia/nuxt'],
    colorMode: {
        preference: 'system', // default theme
        dataValue: 'theme', // activate data-theme in <html> tag
        classSuffix: '',
    },
    tailwindcss: {},
    build: {
        transpile: ['trpc-nuxt'],
    },
})
