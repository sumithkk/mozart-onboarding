<template>
    <div class="m-2 flex w-full flex-col items-start justify-start overflow-x-hidden overflow-y-scroll p-5 text-left">
        <h1 class="mb-5">Privacy Policy</h1>
        <p class="mb-2">Welcome to Mozart, an app developed by Ryan Miranda. This privacy policy will explain how our organization uses the personal data we collect from you when you use our website and app.</p>

        <h2 class="mt-5 mb-2">What data do we collect?</h2>
        <p class="mb-2">MLaw collects the following data:</p>
        <ul class="mb-4 ml-5 list-disc">
            <li>Personal identification information (Name, email address, phone number, etc.)</li>
            <li>Google Drive API data (file listings and file content)</li>
        </ul>

        <h2 class="mt-5 mb-2">How do we collect your data?</h2>
        <p class="mb-2">You directly provide MLaw with most of the data we collect. We collect data and process data when you:</p>
        <ul class="mb-4 ml-5 list-disc">
            <li>Register online or place an order for any of our products or services.</li>
            <li>Use or view our website via your browser’s cookies.</li>
            <li>Authorize our app to access your Google Drive for listing and downloading files.</li>
        </ul>

        <h2 class="mt-5 mb-2">How will we use your data?</h2>
        <p class="mb-2">MLaw collects your data so that we can:</p>
        <ul class="mb-4 ml-5 list-disc">
            <li>Process your order and manage your account.</li>
            <li>Enhance document management and enable natural language search.</li>
            <li>Provide drafting services informed by your existing document base and expertise.</li>
        </ul>

        <h2 class="mt-5 mb-2">How do we store your data?</h2>
        <p class="mb-2">MLaw securely stores your data on secure servers with encryption and other necessary security measures to prevent unauthorized access.</p>

        <h2 class="mt-5 mb-2">Marketing</h2>
        <p class="mb-2">MLaw would like to send you information about products and services of ours that we think you might like.</p>
        <p class="mb-2">If you have agreed to receive marketing, you may always opt out at a later date.</p>
        <p class="mb-2">You have the right at any time to stop MLaw from contacting you for marketing purposes or giving your data to other members of the MLaw Group.</p>

        <h2 class="mt-5 mb-2">What are your data protection rights?</h2>
        <p class="mb-2">MLaw would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
        <ul class="mb-4 ml-5 list-disc">
            <li>The right to access – You have the right to request MLaw for copies of your personal data.</li>
            <li>The right to rectification – You have the right to request that MLaw correct any information you believe is inaccurate. You also have the right to request MLaw to complete the information you believe is incomplete.</li>
            <li>The right to erasure – You have the right to request that MLaw erase your personal data, under certain conditions.</li>
            <li>The right to restrict processing – You have the right to request that MLaw restrict the processing of your personal data, under certain conditions.</li>
            <li>The right to object to processing – You have the right to object to MLaw’s processing of your personal data, under certain conditions.</li>
            <li>The right to data portability – You have the right to request that MLaw transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
        </ul>

        <h2 class="mt-5 mb-2">Privacy policies of other websites</h2>
        <p class="mb-2">The MLaw website contains links to other websites. Our privacy policy applies only to our website, so if you click on a link to another website, you should read their privacy policy.</p>

        <h2 class="mt-5 mb-2">Changes to our privacy policy</h2>
        <p class="mb-2">MLaw keeps its privacy policy under regular review and places any updates on this web page. This privacy policy was last updated on July 1, 2024.</p>

        <h2 class="mt-5 mb-2">How to contact the appropriate authority</h2>
        <p class="mb-2">Should you wish to report a complaint or if you feel that MLaw has not addressed your concern in a satisfactory manner, you may contact the Federal Trade Commission (FTC).</p>
        <p class="mb-2">Email: ftccomplaintassistant@ftc.gov</p>
        <p class="mb-2">Address: Federal Trade Commission, 600 Pennsylvania Avenue, NW, Washington, DC 20580</p>
    </div>
</template>

<script setup lang="ts">
    useHead({
        title: "Privacy Policy",
    })

    definePageMeta({
        layout: "home",
    })
</script>
