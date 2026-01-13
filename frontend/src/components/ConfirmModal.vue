<template>
  <div v-if="visible" class="modal-overlay" @click.self="onCancel">
    <div class="modal-card">
      <h2 class="modal-title">{{ title }}</h2>
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <button class="btn btn-danger" @click="onConfirm">{{ confirmText }}</button>
        <button class="btn btn-outline" @click="onCancel">{{ cancelText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
const props = defineProps({
  visible: Boolean,
  title: { type: String, default: 'Bevestigen' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Verwijderen' },
  cancelText: { type: String, default: 'Annuleren' }
})
const emit = defineEmits(['confirm', 'cancel'])
function onConfirm() { emit('confirm') }
function onCancel() { emit('cancel') }
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2rem 2.5rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}
.modal-title {
  font-size: 1.35rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.modal-message {
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
