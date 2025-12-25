# 前端项目分析报告

> 生成日期：2025-12-24
> 项目：practicefrontend
> 分析目标：检查未开发部分及增删改查未完全普及的功能

---

## 目录

1. [项目概览](#一项目概览)
2. [已完整实现的功能模块](#二已完整实现的功能模块)
3. [需要补充的前端功能](#三需要补充的前端功能)
4. [后端接口建议](#四后端接口建议)
5. [数据模型建议](#五数据模型建议)
6. [优先级建议](#六优先级建议)

---

## 一、项目概览

### 1.1 项目结构

```
practicefrontend/
├── src/
│   ├── api/                # API接口定义
│   │   ├── auth.js         # 用户认证相关
│   │   ├── practice.js     # 练习题目相关
│   │   ├── mistake.js      # 错题本相关
│   │   ├── notes.js        # 笔记相关
│   │   ├── statistics.js   # 统计数据相关
│   │   ├── collection.js    # 收藏相关
│   │   ├── answer.js        # 答题相关
│   │   └── import.js       # 导入相关
│   ├── components/         # 组件
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   ├── utils/              # 工具函数
│   └── views/              # 页面组件
│       ├── Home.vue
│       ├── Login.vue
│       ├── Register.vue
│       ├── Profile.vue
│       ├── QuestionBank.vue
│       ├── Practice.vue
│       ├── PracticeMode.vue
│       ├── Mistakes.vue
│       ├── Notes.vue
│       ├── Knowledge.vue
│       ├── Exam.vue
│       └── ExamDetail.vue
```

### 1.2 路由配置

| 路由 | 页面 | 功能 |
|------|------|------|
| `/login` | Login.vue | 登录页面 |
| `/register` | Register.vue | 注册页面 |
| `/home` | Home.vue | 首页 |
| `/profile` | Profile.vue | 个人资料页 |
| `/question-bank` | QuestionBank.vue | 题库页 |
| `/practice` | Practice.vue | 练习选择页 |
| `/practice/:mode` | PracticeMode.vue | 练习模式页 |
| `/mistakes` | Mistakes.vue | 错题本页 |
| `/knowledge` | Knowledge.vue | 知识点页 |
| `/notes` | Notes.vue | 笔记页 |
| `/exam` | Exam.vue | 考试页 |
| `/exam/:type/:id` | ExamDetail.vue | 考试详情页 |

---

## 二、已完整实现的功能模块

| 模块 | 页面 | 增删改查状态 | 说明 |
|------|------|-------------|------|
| **用户认证** | Login.vue, Register.vue | ✅ 完整 | 登录、注册功能完整 |
| **个人资料** | Profile.vue | ✅ 完整 | 资料编辑、密码修改 |
| **题库管理** | QuestionBank.vue | ✅ 完整 | 列表、新增、编辑、删除、导入 |
| **笔记管理** | Notes.vue | ✅ 完整 | 增删改查、搜索、分类 |
| **练习模式** | Practice.vue, PracticeMode.vue | ✅ 完整 | 单题、套题、专项三种模式 |
| **考试模块** | Exam.vue, ExamDetail.vue | ✅ 完整 | 考试流程、计时、交卷 |
| **错题本** | Mistakes.vue | ⚠️ 部分缺失 | 缺少单题删除、导出功能 |
| **知识点** | Knowledge.vue | ⚠️ 部分缺失 | 缺少增删改功能 |

### 2.1 题库管理 (QuestionBank.vue)

**位置**: `src/views/QuestionBank.vue`

**功能清单**:
- ✅ 题目列表展示（列表/卡片双视图）
- ✅ 题目筛选（科目、章节、题型、难度、年份）
- ✅ 题目搜索
- ✅ 新增题目（弹窗表单）
- ✅ 编辑题目（弹窗表单）
- ✅ 删除题目（带确认）
- ✅ 查看题目详情
- ✅ 批量导入题目（文件上传）
- ⚠️ 导出题目（未实现）

**关键代码位置**:
- 列表展示: `QuestionBank.vue:99-151`
- 新增表单: `QuestionBank.vue:204-312`
- 详情弹窗: `QuestionBank.vue:315-370`
- 导入功能: `QuestionBank.vue:372-445`

### 2.2 笔记管理 (Notes.vue)

**功能清单**:
- ✅ 笔记列表展示
- ✅ 创建笔记
- ✅ 编辑笔记
- ✅ 删除笔记
- ✅ 搜索笔记
- ✅ 笔记分类管理
- ✅ 关联题目到笔记

### 2.3 练习模式 (PracticeMode.vue)

**功能清单**:
- ✅ 单题模式（逐题练习）
- ✅ 套题模式（整套试卷）
- ✅ 专项模式（按知识点）
- ✅ 答题提交
- ✅ 答案解析
- ✅ 收藏题目
- ✅ 标记疑问
- ✅ 计时功能
- ✅ 题目列表导航

---

## 三、需要补充的前端功能

### 3.1 错题本缺失功能

**位置**: `src/views/Mistakes.vue:562-564`

**当前代码**:
```javascript
// 导出功能未实现
const exportMistakes = () => {
  ElMessage.info('导出功能开发中...')
}
```

**需要补充**:

1. **错题导出功能**
   - 支持 Excel 格式导出
   - 支持按筛选条件导出
   - 支持选中题目导出

2. **单题删除功能**
   - 当前只有批量清除已复习
   - 需要添加单题删除按钮

3. **错题统计图表**
   - 错题原因分布
   - 科目错题占比
   - 复习进度可视化

### 3.2 题库导出功能缺失

**位置**: `src/views/QuestionBank.vue:824-826`

**当前代码**:
```javascript
// 导出功能未实现
const exportQuestions = () => {
  ElMessage.info('导出功能开发中...')
}
```

**需要补充**:

1. **题目批量导出**
   - Excel 格式导出
   - PDF 格式导出
   - 导出选项：选中题目/按筛选条件

### 3.3 任务管理功能不完整

**位置**: `src/views/Home.vue:190-204`

**当前代码**:
```javascript
// 仅使用本地存储，没有后端交互
const loadTasks = () => {
  const savedTasks = localStorage.getItem('todayTasks')
  if (savedTasks) {
    todoList.value = JSON.parse(savedTasks)
  } else {
    todoList.value = [
      { id: 1, text: '完成数据结构章节练习', completed: false },
      { id: 2, text: '复习计算机网络知识点', completed: false },
      { id: 3, text: '做一套模拟试卷', completed: false },
      { id: 4, text: '整理错题本', completed: true }
    ]
  }
}
```

**需要补充**:

1. **任务CRUD API调用**
2. **任务提醒功能**
3. **任务完成统计**
4. **任务分类管理**
5. **任务进度追踪**

### 3.4 收藏题目列表页面缺失

**当前状态**: 只有收藏/取消收藏的API和按钮，但没有查看已收藏题目的页面

**需要新增**:

1. **新增路由**: `/collections`
2. **新增页面**: `Collections.vue`
3. **功能需求**:
   - 已收藏题目列表
   - 收藏分类管理
   - 批量取消收藏
   - 收藏统计

### 3.5 知识点管理功能缺失

**位置**: `src/views/Knowledge.vue`

**当前状态**: 只有查看功能，没有增删改功能

**需要补充**:

1. **新增知识点**（管理员）
2. **编辑知识点**（管理员）
3. **删除知识点**（管理员）
4. **知识点关联题目**
5. **知识点学习进度**

---

## 四、后端接口建议

### 4.1 用户认证模块

```javascript
// src/api/auth.js
POST   /api/auth/register          # 用户注册
       body: { username, email, password, examDate }

POST   /api/auth/login             # 用户登录
       body: { username/email, password }
       response: { token, userInfo }

GET    /api/auth/info              # 获取用户信息
       header: Authorization: Bearer {token}

PUT    /api/auth/info              # 更新用户资料
       body: { username, email, examDate, ... }

PUT    /api/auth/password          # 修改密码
       body: { oldPassword, newPassword }
```

### 4.2 题目管理模块

```javascript
// src/api/practice.js
GET    /api/question/list          # 获取题目列表（分页+筛选）
       params: { current, size, subject, difficulty, type, chapter, year }
       response: { records, total }

GET    /api/question/{id}          # 获取单个题目详情
       response: { id, topic, options, answer, analysis, ... }

GET    /api/question/random        # 获取随机题目
       params: { subject, difficulty, chapter }

GET    /api/question/chapters      # 获取章节列表
       params: { subject }
       response: ["第一章", "第二章", ...]

POST   /api/question               # 新增题目（管理员）
       body: { subject, type, difficulty, topic, options, answer, analysis, tags }

PUT    /api/question               # 更新题目（管理员）
       body: { id, ... }

DELETE /api/question/{id}          # 删除题目（管理员）

# 题目导出接口（需新增）
GET    /api/question/export        # 导出题目
       params: { format: 'excel'|'pdf', ids: '1,2,3', subject, difficulty }
       response: File (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
```

### 4.3 错题本模块

```javascript
// src/api/mistake.js
GET    /api/wrong-question/list    # 获取错题列表（分页+筛选）
       params: { current, size, subject, reason, reviewMode }
       response: { records, total }

POST   /api/wrong-question/{id}/note   # 添加笔记
       body: { note }

PUT    /api/wrong-question/{id}/master # 标记已掌握

# 错题管理接口（需新增）
DELETE /api/wrong-question/{id}    # 删除单个错题

GET    /api/wrong-question/export  # 导出错题
       params: { format: 'excel'|'pdf', ids, subject }
       response: File

GET    /api/wrong-question/review  # 获取待复习错题（艾宾浩斯）
       params: { reviewMode: 'ebbinghaus'|'today'|'unreviewed' }

GET    /api/wrong-question/statistics # 错题统计
       response: { total, reviewed, today, needReview, reasonDistribution }
```

### 4.4 笔记管理模块

```javascript
// src/api/notes.js
GET    /api/notes                  # 获取笔记列表
       params: { current, size, category, keyword }

GET    /api/notes/{id}             # 获取单个笔记详情

POST   /api/notes                  # 创建笔记
       body: { title, content, category, relatedQuestions }

PUT    /api/notes/{id}             # 更新笔记
       body: { title, content, category }

DELETE /api/notes/{id}             # 删除笔记

GET    /api/notes/search           # 搜索笔记
       params: { keyword }

POST   /api/notes/{id}/questions   # 关联题目到笔记
       body: { questionId }

DELETE /api/notes/{id}/questions/{questionId}  # 取消关联

GET    /api/notes/stats            # 获取分类统计
       response: { categories: [{ name, count }] }
```

### 4.5 知识点模块

```javascript
// src/api/practice.js
GET    /api/knowledge/list         # 获取知识点列表
       params: { subject }
       response: [{ id, name, subject, chapter, description, frequency, difficulty }]

GET    /api/knowledge/{id}         # 获取知识点详情（需新增）
       response: { id, name, description, formulas, points, relatedPoints, questionCount }

# 知识点管理接口（需新增）
POST   /api/knowledge              # 创建知识点（管理员）
       body: { name, subject, chapter, description, formulas, points }

PUT    /api/knowledge/{id}         # 更新知识点（管理员）
       body: { ... }

DELETE /api/knowledge/{id}         # 删除知识点（管理员）

GET    /api/knowledge/tree         # 获取知识点树状结构
       params: { subject }

GET    /api/knowledge/related/{id} # 获取相关知识点
```

### 4.6 收藏管理模块

```javascript
// src/api/collection.js
POST   /api/collection/{questionId}    # 收藏题目

DELETE /api/collection/{questionId}    # 取消收藏

GET    /api/collection/check/{questionId}  # 检查是否已收藏
       response: { isCollected: true/false }

# 收藏列表接口（需新增）
GET    /api/collection             # 获取收藏列表（分页）
       params: { current, size, folder, subject }
       response: { records, total }

POST   /api/collection/folder      # 创建收藏分类
       body: { name, description }

PUT    /api/collection/folder/{id} # 更新收藏分类
       body: { name, description }

DELETE /api/collection/folder/{id} # 删除收藏分类

PUT    /api/collection/{questionId}/folder  # 移动到分类
       body: { folderId }
```

### 4.7 统计数据模块

```javascript
// src/api/statistics.js
GET    /api/statistics/user        # 获取用户统计数据
       response: { totalAnswered, totalCorrect, correctRate, studyDays }

GET    /api/statistics/subject     # 获取各科目统计
       response: [{ subjectName, total, correct, subject }]

GET    /api/statistics/trend       # 获取正确率趋势
       params: { days }
       response: [{ date, correctRate }]

GET    /api/statistics/weak-chapters # 获取薄弱章节
       response: [{ chapter, subject, errorRate }]

# 扩展统计接口（建议新增）
GET    /api/statistics/heat-map    # 获取学习热力图数据
       params: { year, month }
       response: [{ date, studyTime, questionCount }]

GET    /api/statistics/daily       # 获取每日学习详情
       params: { date }
       response: { studyTime, questionCount, correctRate, subjects }

GET    /api/statistics/report      # 生成学习报告
       params: { startDate, endDate }
       response: { summary, trends, weakPoints, recommendations }
```

### 4.8 任务管理模块

```javascript
# 需要新增的接口
GET    /api/tasks                  # 获取任务列表
       params: { status: 'pending'|'completed', category }
       response: [{ id, title, completed, targetDate }]

POST   /api/tasks                  # 创建任务
       body: { title, description, category, priority, targetDate }

PUT    /api/tasks/{id}             # 更新任务
       body: { title, description, targetDate }

DELETE /api/tasks/{id}             # 删除任务

PUT    /api/tasks/{id}/complete    # 标记任务完成
       body: { completed: true }

GET    /api/tasks/statistics       # 获取任务统计
       response: { total, completed, pending, completionRate }
```

### 4.9 导入导出模块

```javascript
// src/api/import.js
POST   /api/import/upload          # 上传文件解析
       body: FormData { file, subject }
       response: { importId, previewQuestions }

POST   /api/import/text            # 文本内容解析
       body: { text, subject }
       response: { importId, previewQuestions }

GET    /api/import/preview/{id}    # 获取导入预览
       response: { previewQuestions }

PUT    /api/import/preview/{id}    # 更新预览题目
       body: { index, question }

POST   /api/import/confirm/{id}    # 确认导入
       response: { successCount, failedCount }

DELETE /api/import/cancel/{id}     # 取消导入

# 导出接口（建议统一）
GET    /api/export/questions       # 导出题目
       params: { format: 'excel'|'pdf', ids, subject, difficulty }

GET    /api/export/wrong-questions # 导出错题
       params: { format: 'excel'|'pdf', ids, subject }

GET    /api/export/notes           # 导出笔记
       params: { format: 'pdf'|'markdown', ids }

GET    /api/export/statistics      # 导出学习报告
       params: { startDate, endDate, format: 'pdf' }
```

### 4.10 答题提交模块

```javascript
// src/api/answer.js
POST   /api/answer                 # 提交答案
       body: { questionId, userAnswer }
       response: { isCorrect, correctAnswer, explanation }

# 扩展答题接口（建议新增）
POST   /api/answer/batch           # 批量提交答案（套题模式）
       body: { answers: [{ questionId, userAnswer }] }
       response: { correctCount, totalCount, details }

GET    /api/answer/history         # 获取答题历史
       params: { questionId, startDate, endDate }

GET    /api/answer/analysis/{id}   # 获取答题分析
       response: { answerHistory, trend, weakPoints }
```

---

## 六、优先级建议

### 6.1 高优先级 (建议立即补充)

| 功能 | 页面/文件 | 工作量 | 说明 |
|------|----------|--------|------|
| 收藏题目列表页面 | 新增 Collections.vue | 中 | 用户高频使用功能 |
| 错题单题删除 | Mistakes.vue | 低 | 基础CRUD操作 |
| 题目导出功能 | QuestionBank.vue | 中 | 管理员需求 |
| 任务管理后端化 | Home.vue + API | 中 | 用户体验提升 |

### 6.2 中优先级 (建议近期补充)

| 功能 | 页面/文件 | 工作量 | 说明 |
|------|----------|--------|------|
| 错题导出功能 | Mistakes.vue | 中 | 学习复盘需求 |
| 知识点管理 | Knowledge.vue | 中 | 管理员需求 |
| 学习报告生成 | 新增 Statistics.vue | 高 | 数据价值挖掘 |
| 笔记导出 | Notes.vue | 低 | 个性化需求 |

### 6.3 低优先级 (可选功能)

| 功能 | 页面/文件 | 工作量 | 说明 |
|------|----------|--------|------|
| 概念对比功能 | Knowledge.vue | 中 | 学习辅助 |
| 思维导图编辑 | Knowledge.vue | 高 | 可视化增强 |
| 题目审核流程 | QuestionBank.vue | 高 | 团队协作 |
| 学习计划制定 | 新增 Plan.vue | 高 | 学习管理 |

### 6.4 实施路线图

**第一阶段 (1-2周)**:
1. 实现收藏题目列表页面
2. 完善错题本删除功能
3. 任务管理对接后端

**第二阶段 (2-3周)**:
1. 题目/错题导出功能
2. 知识点管理功能
3. 学习统计增强

**第三阶段 (3-4周)**:
1. 学习报告生成
2. 思维导图增强
3. 高级分析功能

---

## 附录

### A. 技术栈

- **前端框架**: Vue 3 + Composition API
- **UI组件库**: Element Plus
- **图表库**: ECharts (vue-echarts)
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **状态管理**: Pinia/Vuex

### B. 代码规范

- 使用 `<script setup>` 或 Composition API
- 组件命名使用 PascalCase
- API接口统一放在 `src/api/` 目录
- 工具函数统一放在 `src/utils/` 目录

### C. 注意事项

1. **权限控制**: 题目管理、知识点管理等需要管理员权限
2. **数据校验**: 前端表单需要配合后端校验
3. **错误处理**: 统一的错误处理和用户提示
4. **性能优化**: 大列表需要虚拟滚动或分页
5. **移动端适配**: 部分页面需要响应式设计

