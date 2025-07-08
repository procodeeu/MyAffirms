// Advanced logging system for debugging and monitoring
export const useLogger = () => {
  const logs = ref([])
  const isEnabled = ref(true)
  const maxLogs = ref(1000)
  
  // Log levels
  const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
  }
  
  const currentLogLevel = ref(LogLevel.DEBUG)
  
  // Create structured log entry
  const createLogEntry = (level, category, message, data = null) => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      levelName: Object.keys(LogLevel)[level],
      category,
      message,
      data,
      stack: level >= LogLevel.ERROR ? new Error().stack : null
    }
    
    return entry
  }
  
  // Add log to storage
  const addLog = (entry) => {
    if (!isEnabled.value || entry.level < currentLogLevel.value) return
    
    logs.value.unshift(entry)
    
    // Keep only recent logs
    if (logs.value.length > maxLogs.value) {
      logs.value = logs.value.slice(0, maxLogs.value)
    }
    
    // Also log to console with nice formatting
    logToConsole(entry)
  }
  
  // Format console output
  const logToConsole = (entry) => {
    const emoji = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.CRITICAL]: '🚨'
    }
    
    const color = {
      [LogLevel.DEBUG]: 'color: #666',
      [LogLevel.INFO]: 'color: #2196F3',
      [LogLevel.WARN]: 'color: #FF9800',
      [LogLevel.ERROR]: 'color: #F44336',
      [LogLevel.CRITICAL]: 'color: #F44336; font-weight: bold'
    }
    
    const time = new Date(entry.timestamp).toLocaleTimeString()
    const prefix = `${emoji[entry.level]} [${time}] [${entry.category}]`
    
    if (entry.data) {
      console.groupCollapsed(`%c${prefix} ${entry.message}`, color[entry.level])
      console.log('Data:', entry.data)
      if (entry.stack) console.log('Stack:', entry.stack)
      console.groupEnd()
    } else {
      console.log(`%c${prefix} ${entry.message}`, color[entry.level])
    }
  }
  
  // Logging methods
  const debug = (category, message, data) => {
    addLog(createLogEntry(LogLevel.DEBUG, category, message, data))
  }
  
  const info = (category, message, data) => {
    addLog(createLogEntry(LogLevel.INFO, category, message, data))
  }
  
  const warn = (category, message, data) => {
    addLog(createLogEntry(LogLevel.WARN, category, message, data))
  }
  
  const error = (category, message, data) => {
    addLog(createLogEntry(LogLevel.ERROR, category, message, data))
  }
  
  const critical = (category, message, data) => {
    addLog(createLogEntry(LogLevel.CRITICAL, category, message, data))
  }
  
  // Specialized loggers for different components
  const session = {
    start: (data) => info('SESSION', 'Session started', data),
    stop: (data) => info('SESSION', 'Session stopped', data),
    pause: (data) => info('SESSION', 'Session paused', data),
    resume: (data) => info('SESSION', 'Session resumed', data),
    error: (message, data) => error('SESSION', message, data),
    affirmation: (message, data) => debug('SESSION', message, data)
  }
  
  const serviceWorker = {
    register: (data) => info('SW', 'Service Worker registering', data),
    registered: (data) => info('SW', 'Service Worker registered', data),
    error: (message, data) => error('SW', message, data),
    message: (message, data) => debug('SW', message, data)
  }
  
  const audio = {
    play: (data) => debug('AUDIO', 'Playing audio', data),
    stop: (data) => debug('AUDIO', 'Stopping audio', data),
    error: (message, data) => error('AUDIO', message, data),
    preload: (message, data) => debug('AUDIO', message, data)
  }
  
  const ui = {
    click: (element, data) => debug('UI', `Clicked: ${element}`, data),
    show: (element, data) => debug('UI', `Showing: ${element}`, data),
    hide: (element, data) => debug('UI', `Hiding: ${element}`, data),
    error: (message, data) => error('UI', message, data)
  }
  
  // Export logs for analysis
  const exportLogs = (filter = null) => {
    let filteredLogs = logs.value
    
    if (filter) {
      filteredLogs = logs.value.filter(log => 
        log.category.includes(filter.toUpperCase()) ||
        log.message.toLowerCase().includes(filter.toLowerCase())
      )
    }
    
    return {
      exported: new Date().toISOString(),
      count: filteredLogs.length,
      logs: filteredLogs
    }
  }
  
  // Get logs summary
  const getSummary = () => {
    const summary = {
      total: logs.value.length,
      byLevel: {},
      byCategory: {},
      recent: logs.value.slice(0, 10)
    }
    
    logs.value.forEach(log => {
      summary.byLevel[log.levelName] = (summary.byLevel[log.levelName] || 0) + 1
      summary.byCategory[log.category] = (summary.byCategory[log.category] || 0) + 1
    })
    
    return summary
  }
  
  // Clear logs
  const clear = () => {
    logs.value = []
    console.clear()
    info('LOGGER', 'Logs cleared')
  }
  
  // Set log level
  const setLogLevel = (level) => {
    currentLogLevel.value = level
    info('LOGGER', `Log level set to ${Object.keys(LogLevel)[level]}`)
  }
  
  return {
    // State
    logs: readonly(logs),
    isEnabled: readonly(isEnabled),
    LogLevel,
    
    // Basic logging
    debug,
    info,
    warn,
    error,
    critical,
    
    // Specialized loggers
    session,
    serviceWorker,
    audio,
    ui,
    
    // Utilities
    exportLogs,
    getSummary,
    clear,
    setLogLevel,
    
    // Enable/disable
    enable: () => { isEnabled.value = true },
    disable: () => { isEnabled.value = false }
  }
}