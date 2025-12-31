<template>
  <div class="practice-container">
    <el-card class="mode-selector">
      <template #header>
        <div class="card-header">
          <span>选择刷题模式</span>
          <el-tag type="primary">智能推荐</el-tag>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="mode-card" shadow="hover" @click="enterSingleMode">
            <div class="mode-content">
              <div class="mode-icon single">
                <el-icon><Edit /></el-icon>
              </div>
              <h3>单题模式</h3>
              <p>逐题练习，灵活掌握学习节奏</p>
              <ul class="mode-features">
                <li>支持标记疑问、收藏题目</li>
                <li>即时查看解析或做完再看</li>
                <li>适合知识点专项练习</li>
              </ul>
              <el-button type="primary">开始练习</el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="mode-card" shadow="hover" @click="enterBatchMode">
            <div class="mode-content">
              <div class="mode-icon batch">
                <el-icon><Files /></el-icon>
              </div>
              <h3>套题模式</h3>
              <p>完整套卷，还原考试体验</p>
              <ul class="mode-features">
                <li>180分钟完整考试时长</li>
                <li>自动计时，强制交卷</li>
                <li>贴合真实考试场景</li>
              </ul>
              <el-button type="success">进入套题</el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="mode-card" shadow="hover" @click="enterSpecialMode">
            <div class="mode-content">
              <div class="mode-icon special">
                <el-icon><Target /></el-icon>
              </div>
              <h3>专项模式</h3>
              <p>针对弱点，精准突破</p>
              <ul class="mode-features">
                <li>按章节精准刷题</li>
                <li>考点专项练习</li>
                <li>针对性补弱强化</li>
              </ul>
              <el-button type="warning">专项突破</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近练习记录 -->
    <el-card class="recent-practice" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>最近练习</span>
          <el-link type="primary" @click="viewAllHistory">查看全部</el-link>
        </div>
      </template>

      <el-table :data="recentPractice" style="width: 100%">
        <el-table-column prop="mode" label="练习模式" width="120">
          <template #default="scope">
            <el-tag :type="getModeTagType(scope.row.mode)">
              {{ getModeText(scope.row.mode) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="subject" label="科目" width="120" />

        <el-table-column prop="chapter" label="章节" width="180" />

        <el-table-column prop="progress" label="进度" width="200">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :color="getProgressColor(scope.row.progress)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="accuracy" label="正确率" width="100">
          <template #default="scope">
            <span :style="{ color: getAccuracyColor(scope.row.accuracy) }">
              {{ scope.row.accuracy }}%
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="time" label="练习时间" width="150">
          <template #default="scope">
            {{ formatTime(scope.row.time) }}
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="continuePractice(scope.row)"
              :disabled="scope.row.completed"
            >
              {{ scope.row.completed ? '已完成' : '继续练习' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 快速设置弹窗 -->
    <el-dialog
      v-model="showSettings"
      title="练习设置"
      width="500px"
    >
      <el-form :model="practiceSettings" label-width="120px">
        <el-form-item label="科目选择">
          <el-select v-model="practiceSettings.subject" placeholder="选择科目">
            <el-option label="数据结构" value="数据结构" />
            <el-option label="计算机组成原理" value="计算机组成原理" />
            <el-option label="操作系统" value="操作系统" />
            <el-option label="计算机网络" value="计算机网络" />
            <el-option label="全部科目" value="" />
          </el-select>
        </el-form-item>

        <el-form-item label="题目难度">
          <el-select v-model="practiceSettings.difficulty" placeholder="选择难度">
            <el-option label="基础" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
            <el-option label="全部难度" value="" />
          </el-select>
        </el-form-item>

        <el-form-item label="题目数量" v-if="selectedMode === 'single'">
          <el-input-number
            v-model="practiceSettings.count"
            :min="1"
            :max="100"
            label="题目数量"
          />
        </el-form-item>

        <el-form-item label="解析时机" v-if="selectedMode === 'single'">
          <el-radio-group v-model="practiceSettings.showAnswer">
            <el-radio label="immediate">即时查看</el-radio>
            <el-radio label="delay">做完再看</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否计时" v-if="selectedMode === 'single'">
          <el-switch v-model="practiceSettings.timer" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="startPractice">开始练习</el-button>
      </template>
    </el-dialog>

    <!-- 套题选择弹窗 -->
    <el-dialog
      v-model="showPaperSelect"
      title="选择试卷"
      width="700px"
    >
      <el-table :data="examPapers" style="width: 100%" v-loading="loadingPapers">
        <el-table-column prop="title" label="试卷名称" />
        <el-table-column prop="year" label="年份" width="80" />
        <el-table-column prop="subject" label="科目" width="100" />
        <el-table-column prop="questionCount" label="题数" width="80" />
        <el-table-column prop="duration" label="时长" width="100">
          <template #default="scope">
            {{ scope.row.duration }}分钟
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" size="small" @click="startExamPaper(scope.row)">
              开始考试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showPaperSelect = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRecentSessions, getExamPapers, startExam } from '@/api/practice'

export default {
  name: 'Practice',
  setup() {
    const router = useRouter()
    const showSettings = ref(false)
    const selectedMode = ref('')

    const practiceSettings = ref({
      subject: '',
      difficulty: '',
      count: 20,
      showAnswer: 'immediate',
      timer: true
    })

    const recentPractice = ref([])

    // 加载最近练习记录
    const loadRecentPractice = async () => {
      try {
        const res = await getRecentSessions(10)
        if (res.data) {
          recentPractice.value = res.data
        }
      } catch (error) {
        console.error('加载练习记录失败', error)
      }
    }

    onMounted(() => {
      loadRecentPractice()
    })

    const enterSingleMode = () => {
      selectedMode.value = 'single'
      showSettings.value = true
    }

    // 套题模式相关
    const showPaperSelect = ref(false)
    const examPapers = ref([])
    const loadingPapers = ref(false)

    const enterBatchMode = async () => {
      showPaperSelect.value = true
      loadingPapers.value = true
      try {
        const res = await getExamPapers()
        if (res.data) {
          examPapers.value = res.data
        }
      } catch (error) {
        ElMessage.error('加载试卷列表失败')
      } finally {
        loadingPapers.value = false
      }
    }

    const startExamPaper = async (paper) => {
      try {
        const res = await startExam(paper.id)
        if (res.data && res.data.sessionId) {
          showPaperSelect.value = false
          router.push(`/practice/batch?session=${res.data.sessionId}&paper=${paper.id}`)
        }
      } catch (error) {
        ElMessage.error('开始考试失败: ' + (error.message || '请重试'))
      }
    }

    const enterSpecialMode = () => {
      router.push('/practice/special')
    }

    const startPractice = () => {
      const params = new URLSearchParams({
        subject: practiceSettings.value.subject,
        difficulty: practiceSettings.value.difficulty,
        count: practiceSettings.value.count,
        showAnswer: practiceSettings.value.showAnswer,
        timer: practiceSettings.value.timer
      })

      router.push(`/practice/${selectedMode.value}?${params.toString()}`)
    }

    const continuePractice = (record) => {
      router.push(`/practice/${record.mode}?continue=${record.id}`)
    }

    const viewAllHistory = () => {
      router.push('/practice/history')
    }

    const getModeText = (mode) => {
      const modeMap = {
        single: '单题模式',
        batch: '套题模式',
        special: '专项模式'
      }
      return modeMap[mode] || mode
    }

    const getModeTagType = (mode) => {
      const typeMap = {
        single: 'primary',
        batch: 'success',
        special: 'warning'
      }
      return typeMap[mode] || ''
    }

    const getProgressColor = (percentage) => {
      if (percentage < 30) return '#F56C6C'
      if (percentage < 70) return '#E6A23C'
      return '#67C23A'
    }

    const getAccuracyColor = (accuracy) => {
      if (accuracy < 60) return '#F56C6C'
      if (accuracy < 80) return '#E6A23C'
      return '#67C23A'
    }

    const formatTime = (time) => {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      const hours = Math.floor(diff / (1000 * 60 * 60))

      if (hours < 1) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes}分钟前`
      } else if (hours < 24) {
        return `${hours}小时前`
      } else {
        return date.toLocaleDateString()
      }
    }

    return {
      showSettings,
      selectedMode,
      practiceSettings,
      recentPractice,
      showPaperSelect,
      examPapers,
      loadingPapers,
      enterSingleMode,
      enterBatchMode,
      enterSpecialMode,
      startPractice,
      startExamPaper,
      continuePractice,
      viewAllHistory,
      getModeText,
      getModeTagType,
      getProgressColor,
      getAccuracyColor,
      formatTime
    }
  }
}
</script>

<style scoped>
.practice-container {
  max-width: 1200px;
  margin: 0 auto;
}

.mode-selector {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mode-card {
  height: 350px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.mode-card:hover {
  transform: translateY(-5px);
}

.mode-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mode-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 36px;
  color: #fff;
}

.mode-icon.single {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.mode-icon.batch {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.mode-icon.special {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.mode-content h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.mode-content p {
  color: #606266;
  margin-bottom: 20px;
}

.mode-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  text-align: left;
}

.mode-features li {
  padding: 5px 0;
  color: #909399;
  font-size: 14px;
}

.mode-features li::before {
  content: "✓";
  color: #67C23A;
  margin-right: 8px;
}

.recent-practice {
  margin-top: 20px;
}
</style>