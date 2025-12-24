<template>
  <div class="theme-switcher">
    <el-tooltip content="切换主题" placement="bottom">
      <el-button
        :icon="isEyeCareMode ? Sunny : Moon"
        circle
        @click="toggleTheme"
      />
    </el-tooltip>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Sunny, Moon } from '@element-plus/icons-vue'

export default {
  name: 'ThemeSwitcher',
  setup() {
    const store = useStore()

    const isEyeCareMode = computed(() => store.state.theme === 'eye-care')

    const toggleTheme = () => {
      const newTheme = isEyeCareMode.value ? 'default' : 'eye-care'
      store.dispatch('setTheme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
    }

    return {
      isEyeCareMode,
      toggleTheme,
      Sunny,
      Moon
    }
  }
}
</script>

<style scoped>
.theme-switcher {
  display: inline-block;
}
</style>
