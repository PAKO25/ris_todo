<script setup lang="ts">
import { onMounted, ref } from 'vue'

const userId = "1" // hardcoded for now
import { fetchTodos, deleteTodo, todos, updateTodo } from '@/composables/useTodos'

onMounted(() => fetchTodos(userId))

const editingTodoId = ref<number>(0)
const title = ref('')
const description = ref('')

async function updateTodoSubmit(id: number) {
  updateTodo(id, title.value, description.value, userId)
  editingTodoId.value = 0
}

function changeEditingTodo(id: number, todoTitle: string, todoDescription: string) {
  editingTodoId.value = id
  title.value = todoTitle
  description.value = todoDescription
}
</script>


<template>
  <ul v-if="todos.length > 0">
    <li v-for="todo in todos" :key="todo[0]" class="todo-item">
      <strong>{{ todo[1] }}</strong>
      <p>{{ todo[2] }}</p>
      <button @click="deleteTodo(todo[0], userId)">Delete</button> <button @click="changeEditingTodo(todo[0], todo[1], todo[2])">Edit</button>
      <div v-if="editingTodoId === todo[0]">
        <input v-model="title" type="text" />
        <input v-model="description" type="text" />
        <button @click="() => updateTodoSubmit(todo[0])">Save</button>
      </div>
    </li>
  </ul>
  <p v-else>No todos found</p>
</template>
