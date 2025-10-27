<template>
  <footer>
    <div class="footer-item">© {{ currentYear }} Todo App</div>
    <div class="footer-item">
      Made with <span class="heart">♥</span> by
      <a href="https://github.com/PAKO25" target="_blank" rel="noopener noreferrer" class="footer-link">
        PAKO25
      </a>
    </div>
    <div class="footer-item">Built with Vue.js & Spring Boot</div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
footer {
  display: flex;
  background-color: var(--color-background-mute);
  height: 5vh;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: auto;
  box-shadow: 0 -8px 20px -10px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
}

.footer-item {
  height: 3vh;
  background-color: var(--color-background-soft);
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border-color: var(--color-border);
  font-size: 0.9rem;
}

.heart {
  color: #ff6b6b;
  animation: heartbeat 1.5s ease-in-out infinite;
  display: inline-block;
  margin: 0 0.25rem;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.footer-link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: opacity 0.3s ease;
}

.footer-link:hover {
  opacity: 0.7;
}

@media (max-width: 768px) {
  footer {
    flex-direction: column;
    height: auto;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .footer-item {
    width: 90%;
  }
}
</style>
