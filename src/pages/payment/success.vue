<template>
    <!-- Outer container -->
    <div class="text-textColor absolute flex h-full w-full items-center justify-center">
        <!-- Payment success card -->
        <div class="bg-sideBarBackgroundColor flex max-w-[500px] min-w-[400px] flex-col items-center justify-center rounded-[10px] px-[40px] py-[40px] [font-family:Arial,sans-serif] shadow-md">
            <!-- Icon SVG -->
            <svg width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="47.2802" cy="46.9125" r="46.631" fill="#23A26D" fill-opacity="0.12" />
                <path
                    d="M46.4474 24.7073C34.2124 24.7073 24.2422 34.6774 24.2422 46.9125C24.2422 59.1476 34.2124 69.1177 46.4474 69.1177C58.6825 69.1177 68.6527 59.1476 68.6527 46.9125C68.6527 34.6774 58.6825 24.7073 46.4474 24.7073ZM57.0616 41.8053L44.4712 54.3957C44.1603 54.7065 43.7384 54.8842 43.2943 54.8842C42.8502 54.8842 42.4283 54.7065 42.1174 54.3957L35.8333 48.1116C35.1894 47.4676 35.1894 46.4018 35.8333 45.7578C36.4773 45.1139 37.5432 45.1139 38.1871 45.7578L43.2943 50.865L54.7078 39.4515C55.3517 38.8076 56.4176 38.8076 57.0616 39.4515C57.7055 40.0955 57.7055 41.1391 57.0616 41.8053Z"
                    fill="#23A26D"
                />
            </svg>

            <!-- Spacer -->
            <div class="h-4"></div>

            <!-- Payment success text -->
            <div class="flex flex-col items-center justify-center gap-2">
                <div class="text-[28px] font-bold">Payment Success</div>
                <div class="text-[20px]">Your payment has been successfully done</div>
            </div>

            <!-- Divider space -->
            <div class="h-5"></div>

            <!-- Horizontal divider -->
            <div class="bg-card h-px w-full"></div>

            <!-- Divider space -->
            <div class="h-5"></div>

            <!-- Payment info text -->
            <div class="box-border flex flex-col items-center justify-center gap-2">
                <div class="text-[20px]">Welcome to Mozart</div>
                <div>Hey! Your subscription is now active.</div>
                <div class="h-5"></div>
                <!-- Continue button -->
                <div class="bg-accent text-foreground cursor-pointer rounded px-4 py-2" @click="handleProfileNavigate">Continue</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const route = useRoute()
    const router = useRouter()
    const sessionId = route.query.session_id || null

    // Navigate to billing page directly
    const handleProfileNavigate = () => {
        router.push("/profile/billing")
    }

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
    }

    const triggerConfetti = () => {
        const duration = 10 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        const interval: NodeJS.Timeout = setInterval(function () {
            const timeLeft = animationEnd - Date.now()
            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            // since particles fall down, start a bit higher than random
            useConfetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
            useConfetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
        }, 250)
    }

    onMounted(() => {
        triggerConfetti()
    })
</script>
