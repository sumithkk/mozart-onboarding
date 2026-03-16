<template>
    <!-- 
      modalOverlay:
      - position: fixed            -> fixed
      - top: 0, left: 0            -> top-0 left-0
      - width: 100vw               -> w-[100vw]
      - height: 100vh              -> h-[100vh]
      - background-color: rgba(0, 0, 0, 0.5) -> bg-black/50
      - display: flex              -> flex
      - align-items: center        -> items-center
      - justify-content: center    -> justify-center
      - z-index: 11000             -> z-[11000]
      - backdrop-filter: blur(2px) -> backdrop-blur-[2px]
    -->
    <div v-if="show" class="modalOverlay fixed top-0 left-0 z-[11000] flex h-[100vh] w-[100vw] items-center justify-center bg-black/50 backdrop-blur-[2px]">
        <!-- 
        modal:
        - background: var(--backgroundColor)   -> bg-backgroundColor
        - border-radius: 6px                  -> rounded-[6px]
        - padding: 20px                       -> p-[20px]
        - box-shadow: 0 4px 10px rgba(0,0,0,.3)-> shadow-[0_4px_10px_rgba(0,0,0,0.3)]
        - width: fit-content                  -> w-fit
        - color: var(--textColor)             -> text-textColor
        - margin: 15px                        -> m-[15px]
      -->
        <div class="modal bg-backgroundColor text-textColor m-[15px] w-fit rounded-[6px] p-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]" @click.stop>
            <!-- 
          header:
          - display: flex               -> flex
          - justify-content: space-between -> justify-between
          - align-items: center         -> items-center
          - margin-bottom: 2rem         -> mb-8
        -->
            <div class="header mb-8 flex items-center justify-between">
                <!-- 
            modalShortName:
            - font-size: 1rem -> text-base
          -->
                <div class="modalShortName text-base">
                    {{ shortName }}
                </div>

                <!-- 
            modalClose:
            - font-size: 24px -> text-[24px]
            - cursor: pointer -> cursor-pointer
          -->
                <div v-if="closeOnTopRight" class="modalClose cursor-pointer text-[24px]" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- 
          modalHeader:
          - font-size: 1.25rem -> text-xl
          - margin-bottom: 0.5rem -> mb-2
        -->
            <div class="modalHeader mb-2 text-xl">
                {{ title }}
            </div>

            <!-- 
          modalSubtitle:
          - font-size: 1rem    -> text-base
          - margin-bottom: 2rem -> mb-8
          - font-weight: 300   -> font-light
        -->
            <div class="modalSubtitle mb-8 text-base font-light">
                {{ subtitle }}
            </div>

            <!-- 
          modalFooter:
          - display: flex             -> flex
          - justify-content: center   -> justify-center
          - align-items: center       -> items-center
          - width: 100%               -> w-full
          - gap: 0.5rem               -> gap-2
        -->
            <div class="modalFooter flex w-full items-center justify-center gap-2">
                <!-- 
            modalButton:
            - border: none            -> border-none
            - padding: 0.5rem 1rem    -> px-4 py-2
            - cursor: pointer         -> cursor-pointer
            - border-radius: 7px      -> rounded-[7px]
            - color: white            -> text-white
            - background-color: var(--itemColor) -> bg-itemColor
            - width: 100%             -> w-full
          -->
                <button class="modalButton bg-itemColor w-full cursor-pointer rounded-[7px] border-none px-4 py-2 text-white" @click="emitClose">Cancel</button>
                <button class="modalButton w-full cursor-pointer rounded-[7px] border-none px-4 py-2 text-white" :style="{ backgroundColor: confirmButtonColor }" @click="buttonClick('confirm')">
                    {{ confirmButtonText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: Boolean,
        shortName: String,
        title: String,
        subtitle: String,
        closeOnTopRight: Boolean,
        confirmButtonText: String,
        confirmButtonColor: String,
    })

    const emit = defineEmits(["update:show", "buttonClick"])

    function emitClose() {
        emit("update:show", false)
    }

    function buttonClick(button: string) {
        emit("buttonClick", button)
    }
</script>
