<template>
  <div class="notes-container">
    <el-row :gutter="20">
      <!-- 左侧笔记列表 -->
      <el-col :span="8">
        <el-card class="notes-list-card">
          <template #header>
            <div class="list-header">
              <span>我的笔记</span>
              <el-button type="primary" size="small" :icon="Plus" @click="createNewNote">
                新建笔记
              </el-button>
            </div>
          </template>

          <!-- 搜索和筛选 -->
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索笔记..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </div>

          <!-- 分类筛选 -->
          <div class="category-filter">
            <el-select v-model="selectedCategory" placeholder="全部分类" clearable @change="handleFilter">
              <el-option label="全部分类" value="" />
              <el-option label="数据结构" value="数据结构" />
              <el-option label="计算机组成原理" value="计算机组成原理" />
              <el-option label="操作系统" value="操作系统" />
              <el-option label="计算机网络" value="计算机网络" />
              <el-option label="其他" value="其他" />
            </el-select>
          </div>

          <!-- 笔记列表 -->
          <div class="notes-list">
            <div
              v-for="note in filteredNotes"
              :key="note.id"
              class="note-item"
              :class="{ active: currentNote?.id === note.id }"
              @click="selectNote(note)"
            >
              <div class="note-title">{{ note.title }}</div>
              <div class="note-meta">
                <span class="note-category">
                  <el-tag size="small" :type="getCategoryTagType(note.category)">
                    {{ note.category }}
                  </el-tag>
                </span>
                <span class="note-time">{{ formatTime(note.updatedAt) }}</span>
              </div>
              <div class="note-preview">{{ getPreview(note.content) }}</div>
            </div>

            <el-empty v-if="filteredNotes.length === 0" description="暂无笔记" :image-size="80" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧笔记编辑区 -->
      <el-col :span="16">
        <el-card class="note-editor-card">
          <template #header>
            <div class="editor-header">
              <template v-if="currentNote">
                <el-input
                  v-model="currentNote.title"
                  placeholder="笔记标题"
                  size="large"
                  style="width: 300px; margin-right: 15px;"
                  @input="saveCurrentNote"
                />
                <el-select
                  v-model="currentNote.category"
                  placeholder="选择分类"
                  style="width: 150px; margin-right: 15px;"
                  @change="saveCurrentNote"
                >
                  <el-option label="数据结构" value="数据结构" />
                  <el-option label="计算机组成原理" value="计算机组成原理" />
                  <el-option label="操作系统" value="操作系统" />
                  <el-option label="计算机网络" value="计算机网络" />
                  <el-option label="其他" value="其他" />
                </el-select>
                <el-button type="success" :icon="Check" @click="manualSave">保存</el-button>
                <el-button type="danger" :icon="Delete" @click="deleteCurrentNote">删除</el-button>
              </template>
              <template v-else>
                <span>选择或创建笔记</span>
              </template>
            </div>
          </template>

          <div v-if="currentNote" class="note-editor">
            <el-input
              v-model="currentNote.content"
              type="textarea"
              placeholder="开始记录你的学习笔记..."
              :rows="20"
              @input="handleContentChange"
            />
          </div>
          <div v-else class="empty-editor">
            <el-empty description="请从左侧选择笔记或创建新笔记" :image-size="120">
              <el-button type="primary" :icon="Plus" @click="createNewNote">创建新笔记</el-button>
            </el-empty>
          </div>
        </el-card>

        <!-- 关联题目卡片 -->
        <el-card v-if="currentNote && currentNote.relatedQuestions?.length > 0" class="related-card" style="margin-top: 20px;">
          <template #header>
            <span>关联题目</span>
          </template>
          <div class="related-list">
            <div v-for="q in currentNote.relatedQuestions" :key="q.id" class="related-item">
              <span class="question-text">[{{ q.subject }}] {{ q.question }}</span>
              <el-button type="primary" size="small" @click="goToQuestion(q.id)">查看</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Delete, Check } from '@element-plus/icons-vue'

export default {
  name: 'Notes',
  setup() {
    const router = useRouter()

    const notes = ref([])
    const currentNote = ref(null)
    const searchKeyword = ref('')
    const selectedCategory = ref('')
    const saveTimer = ref(null)

    // 从 localStorage 加载笔记
    const loadNotes = () => {
      const savedNotes = localStorage.getItem('userNotes')
      if (savedNotes) {
        notes.value = JSON.parse(savedNotes)
      } else {
        // 默认示例笔记
        notes.value = [
          {
            id: 1,
            title: '数据结构 - 二叉树遍历',
            category: '数据结构',
            content: '二叉树的遍历方式：\n\n1. 前序遍历：根 -> 左 -> 右\n2. 中序遍历：左 -> 根 -> 右\n3. 后序遍历：左 -> 右 -> 根\n4. 层序遍历：按层次从上到下\n\n常用代码模板：\nvoid preorder(TreeNode* root) {\n    if (!root) return;\n    visit(root);\n    preorder(root->left);\n    preorder(root->right);\n}',
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 3600000,
            relatedQuestions: []
          },
          {
            id: 2,
            title: '操作系统 - 死锁条件',
            category: '操作系统',
            content: '死锁产生的四个必要条件：\n\n1. 互斥条件：资源不能共享\n2. 占有并等待：持有资源的同时等待其他资源\n3. 不可抢占：资源不能被强制夺取\n4. 循环等待：存在进程等待链\n\n死锁预防策略：\n- 破坏互斥条件（资源共享）\n- 破坏占有并等待（一次性请求所有资源）\n- 破坏不可抢占（允许资源剥夺）\n- 破坏循环等待（资源有序分配）',
            createdAt: Date.now() - 172800000,
            updatedAt: Date.now() - 7200000,
            relatedQuestions: []
          }
        ]
        saveNotes()
      }
    }

    // 保存笔记到 localStorage
    const saveNotes = () => {
      localStorage.setItem('userNotes', JSON.stringify(notes.value))
    }

    // 筛选后的笔记列表
    const filteredNotes = computed(() => {
      let result = notes.value

      // 按分类筛选
      if (selectedCategory.value) {
        result = result.filter(note => note.category === selectedCategory.value)
      }

      // 按关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        result = result.filter(note =>
          note.title.toLowerCase().includes(keyword) ||
          note.content.toLowerCase().includes(keyword)
        )
      }

      // 按更新时间倒序排序
      return result.sort((a, b) => b.updatedAt - a.updatedAt)
    })

    // 选择笔记
    const selectNote = (note) => {
      currentNote.value = { ...note }
    }

    // 创建新笔记
    const createNewNote = () => {
      const newNote = {
        id: Date.now(),
        title: '未命名笔记',
        category: selectedCategory.value || '其他',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        relatedQuestions: []
      }
      notes.value.unshift(newNote)
      currentNote.value = { ...newNote }
      saveNotes()
      ElMessage.success('已创建新笔记')
    }

    // 保存当前笔记
    const saveCurrentNote = () => {
      if (!currentNote.value) return

      const index = notes.value.findIndex(n => n.id === currentNote.value.id)
      if (index !== -1) {
        notes.value[index] = {
          ...currentNote.value,
          updatedAt: Date.now()
        }
        saveNotes()
      }
    }

    // 手动保存笔记
    const manualSave = () => {
      if (!currentNote.value) return

      saveCurrentNote()
      ElMessage.success('笔记已保存')
    }

    // 处理内容变化（防抖保存）
    const handleContentChange = () => {
      clearTimeout(saveTimer.value)
      saveTimer.value = setTimeout(() => {
        saveCurrentNote()
      }, 1000)
    }

    // 删除当前笔记
    const deleteCurrentNote = () => {
      ElMessageBox.confirm('确定要删除这条笔记吗？删除后无法恢复。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        notes.value = notes.value.filter(n => n.id !== currentNote.value.id)
        saveNotes()
        currentNote.value = null
        ElMessage.success('笔记已删除')
      }).catch(() => {})
    }

    // 搜索处理
    const handleSearch = () => {
      // 搜索逻辑由 computed 自动处理
    }

    // 分类筛选
    const handleFilter = () => {
      // 筛选逻辑由 computed 自动处理
    }

    // 获取分类标签类型
    const getCategoryTagType = (category) => {
      const typeMap = {
        '数据结构': 'primary',
        '计算机组成原理': 'success',
        '操作系统': 'warning',
        '计算机网络': 'danger',
        '其他': 'info'
      }
      return typeMap[category] || 'info'
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      return new Date(timestamp).toLocaleDateString()
    }

    // 获取预览文本
    const getPreview = (content) => {
      if (!content) return '暂无内容'
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    }

    // 跳转到题目
    const goToQuestion = (questionId) => {
      router.push(`/question-bank?id=${questionId}`)
    }

    onMounted(() => {
      loadNotes()
      // 如果有笔记，默认选中第一个
      if (notes.value.length > 0) {
        currentNote.value = { ...notes.value[0] }
      }
    })

    return {
      notes,
      currentNote,
      searchKeyword,
      selectedCategory,
      filteredNotes,
      Plus,
      Search,
      Delete,
      Check,
      createNewNote,
      selectNote,
      saveCurrentNote,
      manualSave,
      handleContentChange,
      deleteCurrentNote,
      handleSearch,
      handleFilter,
      getCategoryTagType,
      formatTime,
      getPreview,
      goToQuestion
    }
  }
}
</script>

<style scoped>
.notes-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 左侧笔记列表 */
.notes-list-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.notes-list-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 15px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  margin-bottom: 10px;
}

.category-filter {
  margin-bottom: 15px;
}

.category-filter .el-select {
  width: 100%;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.note-item {
  padding: 12px;
  margin-bottom: 10px;
  background: var(--bg-color-page, #fff);
  border: 1px solid var(--border-color-light, #e4e7ed);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.note-item:hover {
  border-color: var(--primary-color, #409EFF);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.note-item.active {
  border-color: var(--primary-color, #409EFF);
  background: rgba(64, 158, 255, 0.05);
}

.note-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color-primary, #303133);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-time {
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.note-preview {
  font-size: 13px;
  color: var(--text-color-regular, #606266);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 右侧编辑区 */
.note-editor-card {
  height: calc(100vh - 120px);
}

.note-editor-card :deep(.el-card__body) {
  height: calc(100% - 60px);
}

.editor-header {
  display: flex;
  align-items: center;
}

.note-editor {
  height: 100%;
}

.note-editor :deep(.el-textarea) {
  height: 100%;
}

.note-editor :deep(.el-textarea__inner) {
  height: 100% !important;
  resize: none;
  font-size: 15px;
  line-height: 1.8;
  font-family: 'Microsoft YaHei', sans-serif;
}

.empty-editor {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 关联题目 */
.related-card {
  height: auto;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: var(--bg-color-page, #fff);
  border: 1px solid var(--border-color-light, #e4e7ed);
  border-radius: 6px;
}

.question-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-color-regular, #606266);
  margin-right: 15px;
}

/* 滚动条样式 */
.notes-list::-webkit-scrollbar {
  width: 6px;
}

.notes-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.notes-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.notes-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 护眼模式适配 */
[data-theme="eye-care"] .note-item {
  background: var(--bg-color-card, #FFFAF0);
  border-color: var(--border-color, #D4C4A8);
}

[data-theme="eye-care"] .note-item:hover,
[data-theme="eye-care"] .note-item.active {
  border-color: var(--primary-color, #CD853F);
  background: rgba(205, 133, 63, 0.08);
}

[data-theme="eye-care"] .related-item {
  background: var(--bg-color-card, #FFFAF0);
  border-color: var(--border-color, #D4C4A8);
}
</style>
