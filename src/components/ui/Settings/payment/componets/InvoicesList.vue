<template>
    <div class="rounded-lg border" style="background-color: var(--sideBarBackgroundColor); border-color: var(--strokeColor)">
        <!-- Header -->
        <div class="border-b p-6" style="border-color: var(--strokeColor)">
            <div class="flex items-center justify-between">
                <h3 class="px20 bold" style="color: var(--textColor)">Invoices</h3>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-6">
            <div class="animate-pulse">
                <!-- Desktop Loading Skeleton -->
                <div class="hidden md:block">
                    <div class="space-y-3">
                        <div v-for="i in 3" :key="i" class="flex space-x-4">
                            <div class="skeleton-loader h-5 w-32 rounded"></div>
                            <div class="skeleton-loader h-5 w-24 rounded"></div>
                            <div class="skeleton-loader h-5 w-20 rounded"></div>
                            <div class="skeleton-loader h-5 w-16 rounded"></div>
                        </div>
                    </div>
                </div>
                <!-- Mobile Loading Skeleton -->
                <div class="space-y-4 md:hidden">
                    <div v-for="i in 3" :key="i" class="skeleton-loader h-32 w-full rounded-lg"></div>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div v-else>
            <!-- Desktop Table -->
            <div class="hidden md:block">
                <div class="flex w-full justify-center overflow-x-auto">
                    <UTable
                        v-if="invoices.length > 0"
                        :data="invoices"
                        :columns="tableColumns"
                        class="h-full min-w-full"
                        :ui="{
                            table: 'min-w-full',
                            thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader', // tbody: '[&_tr]:hover:bg-neutral-100 &_tr]:dark:hover:bg-neutral-700/95',
                            th: 'text-center',
                            td: 'text-center text-foreground',
                            tr: 'cursor-pointer ',
                        }"
                    >
                        <template #expanded="{ row }">
                            <pre class="rounded bg-gray-100 p-2 text-xs">{{ JSON.stringify(row.original, null, 2) }}</pre>
                        </template>
                    </UTable>
                </div>
            </div>

            <!-- Mobile Cards -->
            <div class="md:hidden">
                <div class="space-y-4 p-4">
                    <div v-for="invoice in invoices" :key="invoice.invoiceId" class="rounded-lg border p-4" style="background-color: var(--backgroundColor); border-color: var(--strokeColor)">
                        <div class="mb-3 flex items-start justify-between">
                            <div>
                                <p class="px15" style="color: var(--textColorSecondary)">{{ formatDate(invoice.date) }}</p>
                            </div>
                            <span class="text-muted-foreground rounded-full px-2 py-1 text-sm font-medium capitalize" :style="getStatusStyle(invoice.status)">
                                {{ invoice.status }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="px18 font-bold" style="color: var(--textColor)">{{ invoice.total.formatted }}</span>
                            <div class="flex gap-2">
                                <button class="rounded-lg p-2 transition-colors" style="color: var(--textColor); background-color: var(--strokeColor)" @click="viewInvoice(invoice)">
                                    <span class="material-icons" style="font-size: 18px">download</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="invoices.length === 0" class="p-12 text-center">
                <span class="material-icons mb-4" style="font-size: 48px; color: var(--textColorSecondary)">receipt_long</span>
                <h3 class="px20 mb-2 font-medium" style="color: var(--textColor)">No invoices yet</h3>
                <p class="px15" style="color: var(--textColorSecondary)">Your billing history will appear here once you have invoices.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, h, resolveComponent } from "vue"
    import useStripePayment from "~/composables/useStripePayment"
    import type { TableColumn } from "@nuxt/ui"
    const UBadge = resolveComponent("UBadge")
    const UButton = resolveComponent("UButton")

    interface Invoice {
        invoiceId: string | number
        date: string
        total: {
            formatted: string
            amount?: number
        }
        status: "paid" | "open" | string | null
        downloadUrl: string
    }

    // Composable
    const { getCustomerInvoices } = useStripePayment()

    // State
    const invoices = ref<Invoice[]>([])
    const isLoading = ref(true)

    // Format date to match existing format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    // Status styling helper (optional)
    const getStatusStyle = (status: string) => {
        return ""
    }

    // Fetch invoices using composable API
    const fetchInvoices = async () => {
        try {
            isLoading.value = true
            const response = await getCustomerInvoices()
            if (response.status == "success" && response.data) {
                invoices.value = response.data.invoices || []
            } else {
                throw new Error(response.message)
            }
        } catch (error) {
            console.error("Error fetching invoices:", error)
            invoices.value = []
        } finally {
            isLoading.value = false
        }
    }

    const statusColorConfig = {
        paid: "success",
        open: "primary",
        default: "neutral",
    }

    const tableColumns: TableColumn<Invoice>[] = [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => formatDate(row.original.date),
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => h("span", { class: "font-medium" }, row.original.total.formatted),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) =>
                h(
                    UBadge,
                    {
                        variant: "subtle",
                        color: statusColorConfig[row.original.status || "default"] || statusColorConfig.default,
                        class: "capitalize",
                    },
                    () => row.original.status
                ),
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) =>
                h("div", { class: "flex justify-center" }, [
                    h(
                        UButton,
                        {
                            variant: "outline",
                            color: "neutral",
                            size: "md",
                            onClick: () => viewInvoice(row.original),
                        },
                        () => "Download"
                    ),
                ]),
        },
    ]

    // Open invoice PDF
    const viewInvoice = (invoice: Invoice) => {
        if (invoice.downloadUrl) {
            window.open(invoice.downloadUrl, "_blank")
        }
    }

    // Load on mount
    onMounted(() => {
        fetchInvoices()
    })
</script>

<style scoped>
    /* Skeleton loader animation */
    .skeleton-loader {
        background: linear-gradient(90deg, var(--strokeColor) 25%, var(--midGrey) 50%, var(--strokeColor) 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
    }

    @keyframes skeleton-shimmer {
        0% {
            background-position: 200% 0;
        }

        100% {
            background-position: -200% 0;
        }
    }

    /* Dark mode skeleton */
    [data-theme="dark"] .skeleton-loader {
        background: linear-gradient(90deg, var(--strokeColor) 25%, var(--itemColor) 50%, var(--strokeColor) 75%);
        background-size: 200% 100%;
    }

    /* Ensure consistent button hover states */
    button {
        cursor: pointer;
    }
</style>
