import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore'

export const useFirestore = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()

  const projectsCollection = computed(() => 
    collection($firebase.db, 'projects')
  )

  const getUserProjects = async () => {
    if (!user.value) return []
    
    const q = query(
      projectsCollection.value,
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  const subscribeToUserProjects = (callback) => {
    if (!user.value) {
      return () => {}
    }
    
    if (!$firebase?.db) {
      return () => {}
    }
    
    const q = query(
      projectsCollection.value,
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      ))
      
      callback(projects)
    }, (error) => {
      })
  }

  const createProject = async (projectData) => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }
    
    if (!$firebase?.db) {
      throw new Error('Firestore not initialized')
    }
    
    try {
      const docRef = await addDoc(projectsCollection.value, {
        ...projectData,
        userId: user.value.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      return docRef.id
    } catch (error) {
      throw error
    }
  }

  const updateProject = async (projectId, updates) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const projectRef = doc($firebase.db, 'projects', projectId)
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  }

  const deleteProject = async (projectId) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const projectRef = doc($firebase.db, 'projects', projectId)
    await deleteDoc(projectRef)
  }

  const addAffirmationToProject = async (projectId, affirmation) => {
    if (!user.value) throw new Error('User not authenticated')

    const projects = await getUserProjects()
    const project = projects.find(p => p.id === projectId)
    
    if (!project) throw new Error('Project not found')
    
    const updatedAffirmations = [
      ...(project.affirmations || []),
      {
        id: Date.now().toString(),
        text: affirmation,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]
    
    await updateProject(projectId, { affirmations: updatedAffirmations })
  }

  const updateAffirmationInProject = async (projectId, affirmationId, updates) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const projects = await getUserProjects()
    const project = projects.find(p => p.id === projectId)
    
    if (!project) throw new Error('Project not found')
    
    const updatedAffirmations = project.affirmations.map(affirmation =>
      affirmation.id === affirmationId
        ? { ...affirmation, ...updates }
        : affirmation
    )
    
    await updateProject(projectId, { affirmations: updatedAffirmations })
  }

  const deleteAffirmationFromProject = async (projectId, affirmationId) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const projects = await getUserProjects()
    const project = projects.find(p => p.id === projectId)
    
    if (!project) throw new Error('Project not found')
    
    const updatedAffirmations = project.affirmations.filter(
      affirmation => affirmation.id !== affirmationId
    )
    
    await updateProject(projectId, { affirmations: updatedAffirmations })
  }

  return {
    getUserProjects,
    subscribeToUserProjects,
    createProject,
    updateProject,
    deleteProject,
    addAffirmationToProject,
    updateAffirmationInProject,
    deleteAffirmationFromProject
  }
}