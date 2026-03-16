<template>
    <div v-if="log.user_input && !log.expandRow">
        <span class="text-muted-foreground text-sm italic"> Expand to Display </span>
    </div>
    <div v-if="log.expandRow" class="scrollable-content w-full overflow-x-hidden overflow-y-auto">
        <table class="key-value-table w-full border-collapse">
            <tbody v-if="log.user_input">
                <tr v-for="(input, inputKey) in log.user_input" :key="inputKey">
                    <td class="border-border border p-2 align-top">
                        <strong>{{ inputKey }}</strong>
                    </td>
                    <td class="border-border border p-2">
                        <table class="w-full">
                            <tbody>
                                <tr v-for="(field, fieldKey) in input" :key="fieldKey">
                                    <td class="pr-2 align-top font-bold">
                                        {{ fieldKey }}
                                    </td>
                                    <td>
                                        <div v-if="typeof field == 'object'">
                                            <ul class="ml-3 list-none">
                                                <li v-for="(fieldItem, itemIndex) in field" :key="itemIndex">
                                                    {{ fieldItem.title }}
                                                </li>
                                            </ul>
                                        </div>
                                        <div v-else>
                                            {{ field }}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        log: any
    }>()
    const { log } = props
</script>
