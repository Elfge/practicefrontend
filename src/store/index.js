import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    questions: [],
    filters: {
      subject: '',
      chapter: '',
      difficulty: '',
      questionType: '',
      year: ''
    }
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_QUESTIONS(state, questions) {
      state.questions = questions
    },
    UPDATE_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    },
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
    },
    updateFilters({ commit }, filters) {
      commit('UPDATE_FILTERS', filters)
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    filteredQuestions: state => {
      return state.questions.filter(question => {
        return (!state.filters.subject || question.subject === state.filters.subject) &&
               (!state.filters.chapter || question.chapter === state.filters.chapter) &&
               (!state.filters.difficulty || question.difficulty === state.filters.difficulty) &&
               (!state.filters.questionType || question.type === state.filters.questionType) &&
               (!state.filters.year || question.year === state.filters.year)
      })
    }
  }
})