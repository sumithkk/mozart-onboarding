<template>
    <div class="bg-sideBarBackgroundColor text-textColor absolute z-[100000] flex h-full w-full flex-col items-center justify-center">
        <!-- Close Icon Row -->
        <div class="flex w-full justify-end">
            <div class="materialSymbolsOutlined w-fit cursor-pointer px-6" @click="onCloseButtonClicked()">close</div>
        </div>

        <!-- Content Wrapper -->
        <div v-if="isSelectingPlan" class="flex h-[90%] w-auto flex-col items-center justify-center gap-[50px] sm:h-[90%] sm:w-[70%] md:h-[90%] md:w-[50%]">
            <!-- Header / Title -->
            <div class="flex flex-col items-center justify-center">
                <div class="text-[32px] font-bold">
                    {{ isTrialPossible ? "Start Your 14 Days Trial " : "Upgrade your plan" }}
                </div>
                <div class="text-midGray text-center font-light">
                    Choose a plan that works the best for you
                    <br />
                    and your team.
                </div>
            </div>

            <!-- Plan Container -->
            <div class="flex h-[40%] w-full sm:h-full sm:flex-col sm:overflow-hidden">
                <!-- Plan Card One -->
                <div class="border-strokeColor flex flex-col gap-[5px] rounded-[10px] border p-[20px]">
                    <!-- Plan Name -->
                    <div class="flex items-center gap-[10px]">
                        <div class="materialSymbolsOutlined px-[28px]">kid_star</div>
                        <div class="font-bold">Premium</div>
                    </div>

                    <!-- Plan Price -->
                    <div class="text-[#b4b4b4]">USD $20/month</div>

                    <!-- Upgrade Button -->
                    <div :class="currentPlan == 'premium' ? 'border-strokeColor2 text-strokeColor2 mt-[10px] cursor-pointer rounded-[20px] border bg-none p-[10px] text-center text-[15px] select-none' : 'bg-logoColor text-foreground mt-[10px] cursor-pointer rounded-[20px] p-[10px] text-center text-[15px] select-none'" @click="onPlanSelection('mozart_individual')">
                        {{ isTrialPossible ? "Start Trial" : currentPlan == "premium" ? "Your current plan" : "Upgrade to Premium" }}
                    </div>

                    <!-- Features -->
                    <div class="mt-[10px] flex flex-col gap-[10px]">
                        <div class="flex items-center gap-[5px]">
                            <div class="materialSymbolsOutlined">check</div>
                            <div>Early access to new features and updates</div>
                        </div>
                        <div class="flex items-center gap-[5px]">
                            <div class="materialSymbolsOutlined">check</div>
                            <div>10 GB files storage</div>
                        </div>
                        <div class="flex items-center gap-[5px]">
                            <div class="materialSymbolsOutlined">check</div>
                            <div>Easy Interaction with documents</div>
                        </div>
                        <div class="flex items-center gap-[5px]">
                            <div class="materialSymbolsOutlined">check</div>
                            <div>Access to ChatGPT and Cohere</div>
                        </div>
                    </div>
                </div>

                <!-- 
            The second plan-card is commented out in your original code.
            If you need it, simply re-add and style with Tailwind similarly.
          -->
                <!-- <div class="...">...</div> -->
            </div>
        </div>

        <!-- Team Widget (shown when isSelectingPlan === false) -->
        <div v-else class="flex h-[90%] w-auto flex-col items-center justify-center gap-[50px] sm:h-[90%] sm:w-[70%] md:h-[90%] md:w-[50%]">
            <div class="border-strokeColor w-[80%] rounded-[10px] border">
                <div class="p-[20px] font-bold">
                    <div class="text-[20px]">Create team</div>
                </div>
                <div class="border-strokeColor m-0 border-b"></div>
                <div class="flex flex-col gap-[5px] p-[20px]">
                    <div class="text-[18px] font-bold">Team name</div>
                    <div class="text-[15px]">Choose a name for your team within the organization. You can update this name whenever you like.</div>
                    <div class="h-[5px]"></div>
                    <div>
                        <input type="text" id="lastName" class="border-strokeColor bg-card text-foreground box-border w-full rounded border p-2" placeholder="Something Inc." v-model="teamName" />
                    </div>
                    <div class="h-[5px]"></div>
                    <div class="text-[18px] font-bold">Seats</div>
                    <div class="flex items-center gap-2">
                        <!-- Number input -->
                        <div class="flex">
                            <input class="border-strokeColor box-border w-[60px] rounded border p-2 text-center" id="quantity" type="number" v-model="numberOfSeats" />
                        </div>
                        <!-- Buttons -->
                        <div class="flex flex-col">
                            <button type="button" class="materialSymbolsOutlined cursor-pointer px-[18px]" @click="changeNumberOfSeats('add')">add</button>
                            <button type="button" class="materialSymbolsOutlined cursor-pointer px-[18px]" @click="changeNumberOfSeats('sub')">remove</button>
                        </div>
                    </div>
                    <div class="h-[5px]"></div>
                    <div class="text-[18px] font-bold">Summary</div>
                    <ul class="mb-3 ml-5 list-disc">
                        <li>Price billed monthly, starting from {{ getFormattedDate() }}</li>
                        <li class="font-bold">USD $ {{ 20 * numberOfSeats }} per month</li>
                    </ul>
                    <div class="bg-logoColor text-foreground cursor-pointer rounded px-4 py-2 text-center transition duration-200 hover:opacity-90" @click="onPlanSelection('mozart_team')">Continue to billing</div>
                </div>
            </div>
        </div>

        <!-- Manage Subscription Button -->
        <div class="bg-logoColor text-foreground mt-6 cursor-pointer rounded px-4 py-2 transition duration-200 hover:opacity-90" @click="createPortalSession">Manage subscription</div>
    </div>
</template>

<script setup lang="ts">
    import { ref, defineProps, defineEmits } from "vue"
    import { getFormattedDate } from "~/util"

    // -----------------------------| PROPS |------------------------------
    const props = defineProps({
        isTrialPossible: Boolean,
        currentPlan: String,
    })

    // -----------------------------| EMITS |------------------------------
    const emit = defineEmits(["close", "plan-selection"])

    // -----------------------------| REFS & STATE |------------------------------
    const isSelectingPlan = ref<boolean>(true)
    const numberOfSeats = ref<number>(2)
    const teamName = ref<string>("")

    // Payments composable (adjust if needed)
    const payments = usePayments()

    // -----------------------------| FUNCTIONS |------------------------------
    function onCloseButtonClicked() {
        if (!isSelectingPlan.value) {
            isSelectingPlan.value = true
            return
        }
        emit("close")
    }

    async function createPortalSession() {
        const response = await payments.createPortalSession()
        window.location.href = response.data.sessionUrl
    }

    function onPlanSelection(selectedPlan: "mozart_individual" | "mozart_team") {
        const quantity = selectedPlan === "mozart_individual" ? 1 : numberOfSeats.value
        emit("plan-selection", {
            teamName: teamName.value,
            numberOfSeats: quantity,
            selectedPlan,
        })
    }

    function changeNumberOfSeats(action: "add" | "sub") {
        if (action === "sub" && numberOfSeats.value - 1 < 2) return
        numberOfSeats.value = action === "add" ? numberOfSeats.value + 1 : numberOfSeats.value - 1
    }

    function teamPlanSelected() {
        isSelectingPlan.value = false
    }
</script>
