<script setup lang="ts">
import { computed } from 'vue'

type TargetRect = {
  top: number
  left: number
  width: number
  height: number
}

const props = defineProps<{
  rect: TargetRect | null
}>()

const style = computed(() => {
  if (!props.rect) return {}

  return {
    top: props.rect.top + 'px',
    left: props.rect.left + 'px',
    width: props.rect.width + 'px',
    height: props.rect.height + 'px',
  }
})
</script>

<template>
  <!-- Dark overlay -->
  <div class="fixed inset-0 z-40 pointer-events-none">
    <!-- background dim -->
    <div class="absolute inset-0 bg-black/60"></div>

    <!-- highlight box -->
    <div
      class="absolute border-2 border-blue-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-300"
      :style="style"
    />
  </div>
</template>
