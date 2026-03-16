<template>
    <div class="absolute top-0 right-0 flex h-screen w-screen items-center justify-center bg-[rgba(20,20,20,0.589)]">
        <div class="border-strokeColor2 bg-sideBarBackgroundColor text-textColor flex h-[40%] w-[60%] flex-col gap-2 rounded-[10px] border p-5">
            <h2 class="font-medium">Choose Document</h2>

            <div class="flex w-fit gap-2 pb-1">
                <div class="option border-textColor border-b-2 pb-1 font-semibold">Workbench Documents</div>
                <div class="option pb-1 font-semibold">Upload</div>
                <div class="option pb-1 font-semibold">Take a picture</div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
