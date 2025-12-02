<template>
  <!-- Circular progress for risk score, color-coded -->
  <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
    <!-- Background circle -->
    <circle :cx="center" :cy="center" :r="radius" fill="#f3f4f6" />
    <!-- Progress circle -->
    <circle
      :stroke="color"
      :stroke-width="strokeWidth"
      fill="none"
      :r="radius"
      :cx="center"
      :cy="center"
      :stroke-dasharray="circleCircumference"
      :stroke-dashoffset="circleCircumference - (score / 10) * circleCircumference"
      style="transition: stroke-dashoffset 0.5s;"
    />
    <!-- Score text -->
    <text
      :x="center"
      :y="center + 7"
      text-anchor="middle"
      font-size="1.7rem"
      :fill="color"
      font-weight="bold"
    >{{ score }}</text>
  </svg>
</template>

<script setup>
// Props: score (Number, required), color (String, required)
// Optional: size (Number, default 70), strokeWidth (Number, default 6)
const props = defineProps({
  score: { type: Number, required: true },
  color: { type: String, required: true },
  size: { type: Number, default: 70 },
  strokeWidth: { type: Number, default: 6 }
})

// SVG values for circle
const center = props.size / 2
const radius = center - props.strokeWidth
const circleCircumference = 2 * Math.PI * radius // Full circumference for progress
</script>

<!--
Usage example:
<risk-score-circle :score="report.riskScore" :color="getRiskScoreColor(report.riskScore)" />
-->
