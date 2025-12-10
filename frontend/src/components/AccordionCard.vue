<template>
  <article class="card accordion-card" :class="{ 'accordion-card--open': open }" @click="toggle" tabindex="0" @keydown.enter="toggle" @keydown.space="toggle">
    <div class="accordion-card__header" :aria-expanded="open">
      <div>
        <h2 class="card-title">{{ title }}</h2>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>
      <span class="chevron" :class="{ 'chevron--open': open }"></span>
    </div>
    <transition name="fade">
      <div v-if="open" class="accordion-card__body">
        <ul v-if="items && items.length" class="list">
          <li v-for="item in items" :key="item">
            <slot name="item" :item="item">{{ item }}</slot>
          </li>
        </ul>
        <slot />
      </div>
    </transition>
  </article>
</template>

<script setup>
import { ref } from 'vue'

// Define props with camelCase for JS props
const props = defineProps({
  title: String,
  subtitle: String,
  items: Array
})

const open = ref(false)
const toggle = () => (open.value = !open.value)
</script>

<style scoped>
.accordion-card {
  cursor: pointer;
  user-select: none;
}
.accordion-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
  background: none;
  border: none;
  text-align: left;
}
.accordion-card:focus {
  outline: 2px solid var(--green);
}
.card.accordion-card--open {
  box-shadow: var(--shadow-medium);
  border-color: var(--green);
}
.card.accordion-card:hover {
  box-shadow: var(--shadow-hover);
  background: none;
}
.chevron {
  width: 24px;
  height: 24px;
  border-right: 3px solid var(--green);
  border-bottom: 3px solid var(--green);
  margin-left: 1rem;
  transform: rotate(45deg);
  transition: transform 0.2s, border-color 0.2s;
}
.chevron--open {
  transform: rotate(225deg);
  border-color: var(--green-dark);
}
.accordion-card__body {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}
</style>
