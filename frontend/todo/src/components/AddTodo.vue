<script setup lang="ts">
import { ref } from 'vue'

import { addTodo } from '@/composables/useTodos'

const userId = "1" // hardcoded for now
const title = ref('')
const description = ref('')

async function submit() {
  if (!title.value || !description.value) {
    alert('Please fill in both title and description')
    return
  }
  addTodo(userId, title.value, description.value)
  title.value = ''
  description.value = ''
}
</script>

<template>
  <div>
    <input v-model="title" type="text" placeholder="Title" />
    <input v-model="description" type="text" placeholder="Description" />
    <button @click="submit">Add Todo</button>
  </div>
</template>
