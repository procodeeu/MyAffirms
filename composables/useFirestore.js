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

  const groupsCollection = computed(() => 
    collection($firebase.db, 'groups')
  )

  const getUserProjects = async () => {
    if (!user.value) return []
    
    const q = query(
      projectsCollection.value,
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'asc')
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
      orderBy('createdAt', 'asc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      callback(projects)
    }, (error) => {
      console.error('Error subscribing to projects:', error)
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
    
    try {
      console.log('Starting project deletion:', projectId)
      
      // Pobierz projekt aby uzyskac afirmacje
      const projects = await getUserProjects()
      const project = projects.find(p => p.id === projectId)
      
      if (project && project.affirmations && project.affirmations.length > 0) {
        console.log(`Found ${project.affirmations.length} affirmations to clean up`)
        
        // Usun wszystkie audio zwiazane z projektem
        // Przekaz user explicite aby uniknac problemow z dostepem
        const { deleteAllProjectAudio } = useAffirmationAudio()
        await deleteAllProjectAudio(project.affirmations, user.value)
      }
      
      // Usun projekt z Firestore
      const projectRef = doc($firebase.db, 'projects', projectId)
      await deleteDoc(projectRef)
      
      console.log('Project deletion completed:', projectId)
    } catch (error) {
      console.error('Error during project deletion:', error)
      throw error
    }
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

  const getUserGroups = async () => {
    if (!user.value) {
      console.log('getUserGroups: No user')
      return []
    }
    
    console.log('getUserGroups: User ID:', user.value.uid)
    
    try {
      const q = query(
        groupsCollection.value,
        where('userId', '==', user.value.uid),
        orderBy('createdAt', 'asc')
      )
      
      console.log('getUserGroups: Trying indexed query...')
      const querySnapshot = await getDocs(q)
      const groups = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      console.log('getUserGroups: Success with indexed query:', groups)
      return groups
    } catch (error) {
      console.log('getUserGroups: Indexed query failed:', error.code, error.message)
      
      if (error.code === 'failed-precondition') {
        try {
          console.log('getUserGroups: Trying fallback query...')
          const simpleQuery = query(
            groupsCollection.value,
            where('userId', '==', user.value.uid)
          )
          
          const querySnapshot = await getDocs(simpleQuery)
          const groups = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          console.log('getUserGroups: Success with fallback query:', groups)
          return groups
        } catch (fallbackError) {
          console.error('getUserGroups: Fallback query also failed:', fallbackError)
          return []
        }
      }
      console.error('getUserGroups: Other error:', error)
      return []
    }
  }

  const subscribeToUserGroups = (callback) => {
    if (!user.value) {
      return () => {}
    }
    
    if (!$firebase?.db) {
      return () => {}
    }
    
    const q = query(
      groupsCollection.value,
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'asc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const groups = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      callback(groups)
    }, (error) => {
      console.error('Error subscribing to groups:', error)
      if (error.code === 'failed-precondition') {
        const simpleQuery = query(
          groupsCollection.value,
          where('userId', '==', user.value.uid)
        )
        
        return onSnapshot(simpleQuery, (querySnapshot) => {
          const groups = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          
          callback(groups)
        }, (fallbackError) => {
          console.error('Fallback query also failed:', fallbackError)
          callback([])
        })
      } else {
        callback([])
      }
    })
  }

  const createGroup = async (groupData) => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }
    
    if (!$firebase?.db) {
      throw new Error('Firestore not initialized')
    }
    
    try {
      const projectOrder = (groupData.projectIds || []).reduce((order, projectId, index) => {
        order[projectId] = index
        return order
      }, {})
      
      const docRef = await addDoc(groupsCollection.value, {
        ...groupData,
        userId: user.value.uid,
        projectIds: groupData.projectIds || [],
        projectOrder: projectOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      return docRef.id
    } catch (error) {
      throw error
    }
  }

  const updateGroup = async (groupId, updates) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const groupRef = doc($firebase.db, 'groups', groupId)
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  }

  const deleteGroup = async (groupId) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const groupRef = doc($firebase.db, 'groups', groupId)
    await deleteDoc(groupRef)
  }

  const addProjectToGroup = async (groupId, projectId) => {
    if (!user.value) throw new Error('User not authenticated')

    const groups = await getUserGroups()
    const group = groups.find(g => g.id === groupId)
    
    if (!group) throw new Error('Group not found')
    
    const projectIds = [...(group.projectIds || []), projectId]
    await updateGroup(groupId, { projectIds })
  }

  const removeProjectFromGroup = async (groupId, projectId) => {
    if (!user.value) throw new Error('User not authenticated')

    const groups = await getUserGroups()
    const group = groups.find(g => g.id === groupId)
    
    if (!group) throw new Error('Group not found')
    
    const projectIds = (group.projectIds || []).filter(id => id !== projectId)
    
    const newProjectOrder = {}
    projectIds.forEach((id, index) => {
      newProjectOrder[id] = index
    })
    
    await updateGroup(groupId, { 
      projectIds,
      projectOrder: newProjectOrder
    })
  }

  const moveProjectInGroup = async (groupId, projectId, direction) => {
    if (!user.value) throw new Error('User not authenticated')

    const groups = await getUserGroups()
    const group = groups.find(g => g.id === groupId)
    
    if (!group) throw new Error('Group not found')
    
    const projectIds = [...(group.projectIds || [])]
    const currentIndex = projectIds.indexOf(projectId)
    
    if (currentIndex === -1) return
    
    let newIndex
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1
    } else if (direction === 'down' && currentIndex < projectIds.length - 1) {
      newIndex = currentIndex + 1
    } else {
      return
    }
    
    [projectIds[currentIndex], projectIds[newIndex]] = [projectIds[newIndex], projectIds[currentIndex]]
    
    const newProjectOrder = {}
    projectIds.forEach((id, index) => {
      newProjectOrder[id] = index
    })
    
    await updateGroup(groupId, {
      projectIds,
      projectOrder: newProjectOrder
    })
  }

  return {
    getUserProjects,
    subscribeToUserProjects,
    createProject,
    updateProject,
    deleteProject,
    addAffirmationToProject,
    updateAffirmationInProject,
    deleteAffirmationFromProject,
    getUserGroups,
    subscribeToUserGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addProjectToGroup,
    removeProjectFromGroup,
    moveProjectInGroup
  }
}