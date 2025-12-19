<template>
  <section class="container two-column upload-grid">
    <article class="card" style="margin-bottom:2rem;">
      <p class="page-eyebrow">{{ $t('upload.eyebrow') }}</p>
      <h1 class="section-title">{{ $t('upload.title') }}</h1>
      <p class="section-subtitle">
        {{ $t('upload.subtitle') }}
      </p>

      <div
        class="upload-zone"
        :class="{ 'upload-zone--active': isDragging || Boolean(fileName) }"
        @click="triggerFileInput"
        @dragenter.prevent="isDragging = true"
        @dragover.prevent
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        style="margin-bottom:2rem;"
      >
        <input
          ref="fileInput"
          class="visually-hidden"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          @change="handleFileChange"
        />
        <div class="upload-zone__icon" aria-hidden="true"></div>
        <div>
          <p class="card-title" style="margin-bottom: 0.35rem">
            {{
              fileName
                ? $t('upload.fileReady')
                : $t('upload.dragDrop')
            }}
          </p>
          <p class="upload-zone__hint">
            {{ fileName || $t('upload.fileHint') }}
          </p>
        </div>
        <button class="btn btn-outline" type="button" @click.stop="triggerFileInput">
          {{ $t('upload.browseFiles') }}
        </button>
      </div>

      <form class="form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="label" for="upload-type">{{ $t('upload.contractType') }}</label>
          <select
            id="upload-type"
            v-model="form.contractType"
            class="select"
            required
          >
            <option disabled value="">{{ $t('upload.contractTypePlaceholder') }}</option>
            <option v-for="type in contractTypes" :key="type">{{ type }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label" for="upload-notes">{{ $t('upload.notesLabel') }}</label>
          <textarea
            id="upload-notes"
            v-model="form.notes"
            class="textarea"
            rows="4"
            :placeholder="$t('upload.notesPlaceholder')"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="label">{{ $t('upload.notificationsLabel') }}</label>
          <div class="chip-row">
            <label class="chip" :class="{ 'chip--active': notifyByEmail }">
              <input class="visually-hidden" type="checkbox" v-model="notifyByEmail" />
              {{ $t('upload.notifyByEmail') }}
            </label>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap">
          <button class="btn btn-primary" type="submit" :disabled="isUploading">
            {{ isUploading ? $t('upload.analyzing') : $t('upload.analyzeButton') }}
          </button>
          <button
            class="btn btn-outline"
            type="button"
            :disabled="isUploading"
            @click="resetForm"
          >
            {{ $t('upload.reset') }}
          </button>
        </div>

        <p v-if="error" class="card-subtitle" style="color: var(--danger)">
          {{ error }}
        </p>
        <p v-if="status" class="card-subtitle">
          {{ status }}
        </p>
      </form>
    </article>

    <article class="card">
      <h2 class="card-title">{{ $t('upload.whatHappensNext') }}</h2>
      <ol class="doc-list doc-list--numbered">
        <li v-for="step in steps" :key="step.title">
          <strong>{{ step.title }}</strong>
          <span>{{ step.body }}</span>
        </li>
      </ol>
    </article>
  </section>

  <div
    v-if="isUploading"
    class="loader-overlay"
    aria-live="polite"
    aria-busy="true"
  >
    <div
      class="loader-spinner"
      role="status"
      :aria-label="$t('upload.loaderAria')"
    ></div>
    <span class="loader-text">
      {{ $t('upload.loaderText') }}
    </span>
  </div>
</template>


<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { uploadContract } from '../api/contracts'
import { useContractStore } from '../stores/contractStore'

const router = useRouter()
const contractStore = useContractStore()
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const status = ref('')
const error = ref('')
const notifyByEmail = ref(true)

const form = reactive({
  contractType: '',
  notes: ''
})

const contractTypes = ['Employment', 'Freelance', 'NDA', 'Lease', 'Subscription']

const steps = [
  {
    title: 'Secure upload',
    body: 'We encrypt the file in transit and convert it to clean text.'
  },
  {
    title: 'Clause analysis',
    body: 'AI highlights red flags and assigns the correct risk level.'
  },
  {
    title: 'Report ready',
    body: 'You receive a summary plus concrete next steps.'
  }
]

const recentUploads = [
  { title: 'Employment Agreement  Tech Corp', meta: 'High risk  5 min ago' },
  { title: 'NDA  Startup Inc', meta: 'Medium risk  22 min ago' }
]

const fileName = computed(() => selectedFile.value?.name ?? '')

const triggerFileInput = () => {
  fileInput.value?.click()
}

// Allowed file types for upload
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

/**
 * Set the selected file for upload, validate type and size
 * @param {File} incomingFile - The file to validate and set
 */
function setSelectedFile(incomingFile) {
  if (!incomingFile) return
  const maxFileSize = 10 * 1024 * 1024 // 10MB
  // Check file size
  if (incomingFile.size > maxFileSize) {
    error.value = 'File is larger than 10MB.'
    selectedFile.value = null
    return
  }
  // Check file type
  const isAllowedType = allowedMimeTypes.includes(incomingFile.type) || /\.(pdf|docx?|txt)$/i.test(incomingFile.name)
  if (isAllowedType) {
    selectedFile.value = incomingFile
    error.value = ''
    status.value = ''
  } else {
    error.value = 'Only PDF, DOC, DOCX or TXT files are supported.'
    selectedFile.value = null
  }
}

/**
 * Handle file input change event
 * @param {Event} event - Input change event
 */
function handleFileChange(event) {
  const selectedFileFromInput = event.target.files?.[0]
  setSelectedFile(selectedFileFromInput)
}

/**
 * Handle file drop event
 * @param {DragEvent} event - Drop event
 */
function handleDrop(event) {
  isDragging.value = false
  const selectedFileFromDrop = event.dataTransfer?.files?.[0]
  setSelectedFile(selectedFileFromDrop)
}

const handleDragLeave = (event) => {
  if (event.currentTarget.contains(event.relatedTarget)) return
  isDragging.value = false
}

const resetForm = () => {
  selectedFile.value = null
  form.contractType = ''
  form.notes = ''
  status.value = ''
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Accessibility: loader overlay is shown when isUploading is true
const handleSubmit = async () => {
  if (!selectedFile.value) {
    error.value = 'Select a contract file before continuing.'
    return
  }

  if (!form.contractType) {
    error.value = 'Choose a contract type so we can tune the analysis.'
    return
  }

  error.value = ''
  isUploading.value = true
  status.value = 'Uploading and analysing your contract...'

  try {
    const result = await uploadContract(selectedFile.value)
    status.value = 'Upload successful. Generating your AI report...'

    // Store the most recent report in the store for the detail page
    if (result && result.report) {
      contractStore.setCurrentReport({
        id: result.docId,
        ...result.report,
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 600))

    if (result && result.docId) {
      router.push({ name: 'report-detail', params: { id: result.docId } })
    } else {
      // Fallback: go to dashboard if no docId is returned
      router.push({ name: 'dashboard' })
    }
  } catch (err) {
    console.warn(err)
    error.value = 'Upload or analysis failed. Please try again.'
    status.value = ''
  } finally {
    isUploading.value = false
  }
}
</script>
