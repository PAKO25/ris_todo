import { ref } from 'vue'

const todos = ref<Array<[number, string, string]>>([])

async function fetchTodos(userId: string) {
  try {
    const res = await fetch(`/api/v1/getTodos/${userId}`)
    if (!res.ok) throw new Error(await res.text())
    todos.value = await res.json()
  } catch (err) {
    console.error('Error fetching todos:', err)
  }
}

async function deleteTodo(id: number, userId: string) {
  try {
    const res = await fetch(`/api/v1/deleteTodo/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await res.text())
    await fetchTodos(userId)
  } catch (err) {
    console.error('Error deleting todo:', err)
  }
}

async function addTodo(userId: string, title: string, description: string) {
  try {
    const res = await fetch(`/api/v1/addTodo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, title, description }),
    })
    if (!res.ok) throw new Error(await res.text())
    await fetchTodos(userId)
  } catch (err) {
    console.error('Error adding todo:', err)
  }
}

async function updateTodo(id: number, title: string, description: string, userId: string) {
  try {
    const res = await fetch(`/api/v1/updateTodo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description, userId }),
    })
    if (!res.ok) throw new Error(await res.text())
    await fetchTodos(userId)
  } catch (err) {
    console.error('Error updating todo:', err)
  }
}

export { todos, fetchTodos, deleteTodo, addTodo, updateTodo }
