<template>
    <div class="absolute flex h-full w-full flex-col overflow-hidden">
        <!-- Impersonation Banner -->
        <ImpersonationBanner />

        <!-- HEADER -->
        <header class="h-header text-textColor z-[1000] flex w-full items-center justify-between border-b border-neutral-500 bg-white px-4 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8">
            <!-- Left Side - Logo -->
            <div class="flex items-center">
                <div class="text-logoColor cursor-pointer text-xl font-bold transition-all duration-300 sm:text-2xl lg:text-3xl">Mozart</div>
            </div>

            <!-- Right Side - Navigation -->
            <nav class="flex items-center p-2">
                <div class="flex items-center gap-2 sm:gap-3">
                    <button @click="goToLogin" class="group text-logoColor border-logoColor relative inline-flex items-center justify-center rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-all duration-300 sm:px-4 sm:py-2 sm:text-sm">
                        <span class="relative z-10">Login</span>
                    </button>
                    <button @click="goToRegister" class="group bg-logoColor relative inline-flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:shadow-md sm:px-4 sm:py-2 sm:text-sm">
                        <span class="relative z-10">Register</span>
                        <!-- <div class="from-logoColor bg-foreground absolute inset-0 rounded-lg to-[#1f3a8a] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div> -->
                    </button>
                </div>
            </nav>
        </header>

        <!-- BODY -->
        <div class="flex h-[calc(100%-var(--headerHeight))] flex-row overflow-y-scroll">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
    const router = useRouter()

    function goToLogin() {
        router.push("/auth/login")
    }

    function goToRegister() {
        router.push("/auth/signUp")
    }
</script>
