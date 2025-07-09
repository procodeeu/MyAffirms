export const useAffirmationsStore = defineStore('affirmations', () => {
  const defaultAffirmations = [
    {
      id: '1',
      text: 'Jestem spokojny i pewny siebie',
      isActive: true
    },
    {
      id: '2', 
      text: 'Mam w sobie siłę do działania',
      isActive: true
    },
    {
      id: '3',
      text: 'Jestem wdzięczny za wszystko co mam',
      isActive: true
    }
  ]

  const affirmations = ref([])

  const loadFromStorage = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('affirmations')
      if (stored) {
        affirmations.value = JSON.parse(stored)
      } else {
        affirmations.value = [...defaultAffirmations]
        saveToStorage()
      }
    } else {
      affirmations.value = [...defaultAffirmations]
    }
  }

  const saveToStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('affirmations', JSON.stringify(affirmations.value))
    }
  }

  const addAffirmation = (text) => {
    affirmations.value.push({
      id: Date.now().toString(),
      text,
      isActive: true
    })
    saveToStorage()
  }

  const deleteAffirmation = (id) => {
    const index = affirmations.value.findIndex(a => a.id === id)
    if (index > -1) {
      affirmations.value.splice(index, 1)
    }
  }

  const toggleAffirmation = (id) => {
    const affirmation = affirmations.value.find(a => a.id === id)
    if (affirmation) {
      affirmation.isActive = !affirmation.isActive
    }
  }

  const updateAffirmation = (id, text) => {
    const affirmation = affirmations.value.find(a => a.id === id)
    if (affirmation) {
      affirmation.text = text
    }
  }

  return {
    affirmations: readonly(affirmations),
    addAffirmation,
    deleteAffirmation,
    updateAffirmation,
    toggleAffirmation
  }
})