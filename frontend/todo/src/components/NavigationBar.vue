<template>
  <nav>
    <div class="navbar-title">Todo app</div>
    <div>Link 1</div>
    <div>Link 2</div>
    <div>Login</div>
    <div>Register</div>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  background-color: var(--color-background-mute);
  height: 5vh;
  width: 100%;
  align-items: center;
  gap: 1rem;

  box-shadow: 0 8px 20px -10px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
}
nav div {
  height: 3vh;
  background-color: var(--color-background-soft);
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border-color: var(--color-border);
}

nav div:nth-child(4) {
  margin-left: auto;
}

.navbar-title {
  font-weight: bold;
  font-size: 1.25rem;
  background-color: transparent;
}
</style>
