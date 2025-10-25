<script setup lang="ts">
import NavigationBar from './components/NavigationBar.vue';
import MainContent from './components/MainContent.vue';
import FooterBar from './components/FooterBar.vue';
</script>

<template>
  <div class="layout">
    <header>
      <NavigationBar />
    </header>

    <main>
      <MainContent />
    </main>

    <footer>
      <FooterBar />
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1 1 auto; /* expand to fill remaining space */
  width: 100%;
  overflow: auto; /* allow scrolling if content is tall */
}

footer {
  height: 5vh;
  width: 100%;
}
</style>
