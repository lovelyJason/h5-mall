<template>
  <div>
    {{ state.count }}
    {{ constants }}
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
let constants = [1,2,3]

const state = reactive({count: 1})
</script>