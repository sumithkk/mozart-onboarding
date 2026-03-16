// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false,
    telemetry: false,
    nitro: {
        preset: "firebase",
        firebase: {
            gen: 2,
            serverFunctionName: "frontendFunction",
        },
    },
    devtools: {
        enabled: true,

        timeline: {
            enabled: true,
        },
    },

    srcDir: "src/",
    css: ["@/assets/css/main.css"],
    modules: ["@nuxt/ui", "@pinia/nuxt", "floating-vue/nuxt", "vue-sonner/nuxt", "@nuxt/image"],
    colorMode: {
        preference: "light",
        fallback: "light",
        classSuffix: "",
        storageKey: "hs_theme",
    },
    plugins: ["~/plugins/runtimeConfig.ts", "~/plugins/heap.client.ts", "~/plugins/preline.client.ts", "~/plugins/google.client.ts", "~/plugins/pinia-persist.client.ts", "~/plugins/scrollbarFade.client.ts", "~/plugins/debugAuth.client.ts"],

    imports: {
        dirs: ["composables", "composables/*/index.{ts,js,mjs,mts}", "composables/**", "store"],
    },

    components: [
        {
            path: "~/components",
            pathPrefix: false,
        },
        {
            path: "~/layouts",
            pathPrefix: false,
        },
    ],

    runtimeConfig: {
        public: {
            apiUrl: process.env.SERVER_API_URL,
            apiKey: process.env.SERVER_API_KEY,
            ragUrl: process.env.RAG_API_URL,
            ragLocalUrl: process.env.RAG_LOCAL_API_URL,
            clientURL: process.env.CLIENT_URL,
            ragEnv: process.env.RAG_ENV,
            ragServiceUrl: process.env.RAG_SERVICE_URL,
            googleAuthClientId: process.env.GOOGLE_AUTH_CLIENT_ID,
            platform: process.env.PLATFORM,
            environment: process.env.ENVIRONMENT,
            google_developer_key: process.env.GOOGLE_DEVELOPER_KEY,
        },
    },

    devServer: {
        host: process.env.HOST_URL,
        port: 3000,
    },

    app: {
        head: {
            link: [
                {
                    rel: "stylesheet",
                    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
                },
                { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
                { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
                { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
                { rel: "mask-icon", href: "/safari-pinned-tab.png", color: "#111111" },
            ],
            meta: [
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
                },
                { name: "theme-color", content: "#111111" },

                // Open Graph defaults (used by iMessage)
                { property: "og:type", content: "website" },
                { property: "og:title", content: "Mozart" },
                { property: "og:description", content: "Mozart is a platform for AI-powered conversations." },
                { property: "og:image", content: "/og-default.png?v=1" },
                { property: "og:image:width", content: "1200" },
                { property: "og:image:height", content: "630" },

                // Twitter card fallback
                { name: "twitter:card", content: "summary_large_image" },
                { name: "twitter:title", content: "Mozart" },
                { name: "twitter:description", content: "Mozart is a platform for AI-powered conversations." },
                { name: "twitter:image", content: "/og-default.png?v=1" },
            ],
            script: [
                {
                    hid: "theme-script",
                    type: "text/javascript",
                    innerHTML: `
        (function() {
          var theme = localStorage.getItem('hs_theme') || 'light';
          document.documentElement.setAttribute('data-theme', theme);
        })();
      `,
                },
                {
                    hid: "prevent-glitches",
                    type: "text/javascript",
                    innerHTML: `
            const html = document.querySelector('html');
            const pref = localStorage.getItem('hs_theme') || 'light';
            const isLightOrAuto = pref === 'light' || (pref === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
            const isDarkOrAuto = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

            if (isLightOrAuto && html.classList.contains('dark')) html.classList.remove('dark');
            else if (isDarkOrAuto && html.classList.contains('light')) html.classList.remove('light');
            else if (isDarkOrAuto && !html.classList.contains('dark')) html.classList.add('dark');
            else if (isLightOrAuto && !html.classList.contains('light')) html.classList.add('light');
            else if (!html.classList.contains('light') && !html.classList.contains('dark')) html.classList.add('light');
          `,
                },
                {
                    src: "https://accounts.google.com/gsi/client",
                    async: true,
                    defer: true,
                },
            ],
        },
    },

    compatibilityDate: "2024-09-17",
})
