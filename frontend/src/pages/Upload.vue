// frontend/src/pages/Upload.vue

<script setup>
import { ref } from "vue";
import { uploadContract } from "../api/contracts.js";

const file = ref(null);
const result = ref(null);

async function handleUpload() {
  result.value = await uploadContract(file.value);
}
</script>

<template>
  <h2>Upload contract</h2>
  <input type="file" @change="e => file.value = e.target.files[0]" />
  <button @click="handleUpload">Upload</button>

  <pre>{{ result }}</pre>
</template>
